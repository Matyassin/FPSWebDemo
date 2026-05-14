struct VertexIn {
    @location(0) position: vec3f,
    @location(1) uv: vec2f,
    @location(2) normal: vec3f,
    @location(3) tangent: vec4f,
};

struct VertexOut {
    @builtin(position) position: vec4f,
    @location(0)       uv: vec2f,
    @location(1)       normal: vec3f,
    @location(2)       worldPos: vec3f,
};

struct Light {
    position: vec3f,
    kind: u32,
    color: vec3f,
    intensity: f32,
    direction: vec3f,
    range: f32,
};

struct LightBuffer {
    header: vec4f,
    lights: array<Light, 10>,
};

@group(0) @binding(0) var textureSampler: sampler;
@group(0) @binding(1) var albedo: texture_2d<f32>;
@group(0) @binding(2) var<uniform> mvp: mat4x4f;

@group(1) @binding(0) var<uniform> lightBuffer: LightBuffer;

@vertex
fn vert(in: VertexIn) -> VertexOut {
    var out: VertexOut;
    out.position = mvp * vec4f(in.position, 1.0);
    out.uv = in.uv;
    out.normal = in.normal;
    out.worldPos = in.position;
    
    return out;
}

@fragment
fn frag(in: VertexOut) -> @location(0) vec4f {
    let baseColor = textureSample(
        albedo,
        textureSampler,
        vec2f(in.uv.x, 1.0 - in.uv.y)
    );

    let N = normalize(in.normal);
    var totalLighting = vec3f(0.0);
    let lightCount = u32(lightBuffer.header.x);

    for (var i = 0u; i < lightCount; i = i + 1u) {
        let light = lightBuffer.lights[i];

        // Point
        if (light.kind == 0) {
            // later
        }
        // Spot
        else if (light.kind == 1) {
            // later
        }
        // Directional
        else if (light.kind == 2) {
            let L = normalize(-light.direction);
            let diffuseStrength = max(dot(N, L), 0.0);
            let diffuse = diffuseStrength * light.color * light.intensity;
            totalLighting += diffuse;
        } 
    }

    let ambient = vec3f(0.15, 0.15, 0.15);
    let finalColor = baseColor.rgb * (ambient + totalLighting);

    return vec4f(finalColor, baseColor.a);
}
