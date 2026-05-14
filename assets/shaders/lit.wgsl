struct VertexIn {
    @location(0) position: vec3f,
    @location(1) uv: vec2f,
    @location(2) normal: vec3f,
    @location(3) tangent: vec4f,
};

struct VertexOut {
    @builtin(position) position: vec4f,
    @location(0)       uv: vec2f,
    @location(1)       worldPos: vec3f,
    @location(2)       worldNormal: vec3f,
    @location(3)       worldTangent: vec3f,
    @location(4)       worldBitangent: vec3f,
};

struct PerObjectUniforms {
    mvp: mat4x4f,
    model: mat4x4f,
    uvTiling: vec2f,
    _pad: vec2f,
};

struct Light {
    position: vec3f,
    kind: u32,
    color: vec3f,
    intensity: f32,
    direction: vec3f,
    range: f32,
    spotCutoffs: vec2f,
    _pad: vec2f,
};

struct CameraUniforms {
    position: vec3f,
    _pad: f32,
};

struct LightBuffer {
    header: vec4f,
    lights: array<Light, 10>,
};


@group(0) @binding(0) var textureSampler: sampler;
@group(0) @binding(1) var albedo: texture_2d<f32>;
@group(0) @binding(2) var normalMap: texture_2d<f32>;
@group(0) @binding(3) var<uniform> perObject: PerObjectUniforms;

@group(1) @binding(0) var<uniform> lightBuffer: LightBuffer;
@group(1) @binding(1) var<uniform> camera: CameraUniforms;

fn calculatePhongBlinn(N: vec3f, L: vec3f, V: vec3f, lightColor: vec3f, intensity: f32, factor: f32) -> vec3f {
    let diffuseStrength = max(dot(N, L), 0.0);
    let diffuse = diffuseStrength * lightColor * intensity * factor;
    let H = normalize(L + V);
    let specularStrength = pow(max(dot(N, H), 0.0), 32.0);
    let specular = specularStrength * lightColor * intensity * factor * 0.35;

    return diffuse + specular;
}

@vertex
fn vert(in: VertexIn) -> VertexOut {
    var out: VertexOut;
    let worldPos = perObject.model * vec4f(in.position, 1.0);
    let worldNormal = perObject.model * vec4f(in.normal, 0.0);
    let worldTangent = perObject.model * vec4f(in.tangent.xyz, 0.0);
    let N = normalize(worldNormal.xyz);
    let T = normalize(worldTangent.xyz - N * dot(worldTangent.xyz, N));
    let B = normalize(cross(N, T) * in.tangent.w);

    out.position = perObject.mvp * vec4f(in.position, 1.0);
    out.uv = in.uv;
    out.worldPos = worldPos.xyz;
    out.worldNormal = N;
    out.worldTangent = T;
    out.worldBitangent = B;
    
    return out;
}

@fragment
fn frag(in: VertexOut) -> @location(0) vec4f {
    let uv = in.uv * perObject.uvTiling;

    let baseColor = textureSample(
        albedo,
        textureSampler,
        vec2f(uv.x, 1.0 - uv.y)
    );

    let normalSample = textureSample(
        normalMap,
        textureSampler,
        vec2f(uv.x, 1.0 - uv.y)
    ).xyz * 2.0 - 1.0;

    let normalTS = normalize(vec3f(normalSample.x * 0.5, -normalSample.y * 0.5, normalSample.z));

    let TBN = mat3x3f(
        normalize(in.worldTangent),
        normalize(in.worldBitangent),
        normalize(in.worldNormal)
    );

    let N = normalize(TBN * normalTS);
    let V = normalize(camera.position - in.worldPos);
    var totalLighting = vec3f(0.0);
    let lightCount = u32(lightBuffer.header.x);

    for (var i = 0u; i < lightCount; i = i + 1u) {
        let light = lightBuffer.lights[i];

        // Point
        if (light.kind == 0) {
            let toLight = light.position - in.worldPos;
            let dist = length(toLight);
            let L = normalize(toLight);
            let attenuation = max(0.0, 1.0 - dist / light.range);
            totalLighting += calculatePhongBlinn(N, L, V, light.color, light.intensity, attenuation);
        }
        // Spot
        else if (light.kind == 1) {
            let toLight = light.position - in.worldPos;
            let dist = length(toLight);
            let L = normalize(toLight);
            let attenuation = max(0.0, 1.0 - dist / light.range);

            let spotDir = normalize(light.direction);
            let fragDir = normalize(-L);
            let theta = dot(fragDir, spotDir);
            let epsilon = max(light.spotCutoffs.x - light.spotCutoffs.y, 0.0001);
            let spotFactor = clamp((theta - light.spotCutoffs.y) / epsilon, 0.0, 1.0);
            totalLighting += calculatePhongBlinn(N, L, V, light.color, light.intensity, attenuation * spotFactor);
        }
        // Directional
        else if (light.kind == 2) {
            let L = normalize(-light.direction);
            totalLighting += calculatePhongBlinn(N, L, V, light.color, light.intensity, 1.0);
        } 
    }

    let ambient = vec3f(0.05);
    let finalColor = baseColor.rgb * (ambient + totalLighting);

    return vec4f(finalColor, baseColor.a);
}
