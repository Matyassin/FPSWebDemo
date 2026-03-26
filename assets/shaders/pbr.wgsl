struct VertexIn {
    @location(0) position: vec3f,
    @location(1) uv: vec2f,
    @location(2) normal: vec3f,
    @location(3) tangent: vec4f
};

struct VertexOut {
    @builtin(position) clipPos: vec4f,
    @location(0) worldPos: vec3f,
    @location(1) uv: vec2f,
    @location(2) normal: vec3f,
    @location(3) tangent: vec3f,
    @location(4) bitangent: vec3f
};

struct Light {
    position: vec3f,
    kind: u32,
    color: vec3f,
    intensity: f32,
    direction: vec3f,
    range: f32
};

struct LightBuffer {
    ambientColor: vec3f,
    ambientIntensity: f32,
    lightCount: u32,
    _pad: vec3u,
    lights: array<Light, 8>
};

struct PerObjectUniforms {
    mvp:   mat4x4f,
    model: mat4x4f,
};

struct PerFrameUniforms {
    cameraPos: vec3f,
    _pad: f32
};

@group(0) @binding(0) var texSampler:   sampler;
@group(0) @binding(1) var albedoMap:    texture_2d<f32>;
@group(0) @binding(2) var normalMap:    texture_2d<f32>;
@group(0) @binding(3) var metallicMap:  texture_2d<f32>;
@group(0) @binding(4) var roughnessMap: texture_2d<f32>;
@group(0) @binding(5) var aoMap:        texture_2d<f32>;
@group(0) @binding(6) var<uniform> perObject: PerObjectUniforms;

@group(1) @binding(0) var<uniform> perFrame: PerFrameUniforms;
@group(1) @binding(1) var<uniform> lights:   LightBuffer;

@vertex
fn vert(in: VertexIn) -> VertexOut {
    var out: VertexOut;

    let worldPos = perObject.model * vec4f(in.position, 1.0);
    out.clipPos = perObject.mvp * vec4f(in.position, 1.0);
    out.worldPos = worldPos.xyz;
    out.uv = in.uv;

    let N = normalize((perObject.model * vec4f(in.normal, 0)).xyz);
    let T = normalize((perObject.model * vec4f(in.tangent.xyz, 0)).xyz);
    let B = cross(N, T) * in.tangent.w;

    out.normal = N;
    out.tangent = T;
    out.bitangent = B;

    return out;
}

fn distributionGGX(N: vec3f, H: vec3f, roughness: f32) -> f32 {
    let a      = roughness * roughness;
    let a2     = a * a;
    let NdotH  = max(dot(N, H), 0.0);
    let NdotH2 = NdotH * NdotH;
    let denom  = NdotH2 * (a2 - 1.0) + 1.0;

    return a2 / (3.14159265 * denom * denom);
}

fn geometrySchlickGGX(NdotV: f32, roughness: f32) -> f32 {
    let r = roughness + 1.0;
    let k = (r * r) / 8.0;
    return NdotV / (NdotV * (1.0 - k) + k);
}

fn geometrySmith(N: vec3f, V: vec3f, L: vec3f, roughness: f32) -> f32 {
    let NdotV = max(dot(N, V), 0.0);
    let NdotL = max(dot(N, L), 0.0);
    return geometrySchlickGGX(NdotV, roughness) * geometrySchlickGGX(NdotL, roughness);
}

fn fresnelSchlick(cosTheta: f32, F0: vec3f) -> vec3f {
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

fn calcLight(light: Light, N: vec3f, V: vec3f, worldPos: vec3f, albedo: vec3f, metallic: f32, roughness: f32, F0: vec3f) -> vec3f {
    var L: vec3f;
    var attenuation: f32 = 1.0;

    if (light.kind == 0u) {
        // point light
        let toLight = light.position - worldPos;
        L = normalize(toLight);
        let dist = length(toLight);
        attenuation = 1.0 / (1.0 + (dist * dist) / (light.range * light.range));
    }
    else {
        // directional light
        L = normalize(-light.direction);
    }

    let H = normalize(V + L);
    let NdotL = max(dot(N, L), 0.0);
    let radiance = light.color * light.intensity * attenuation;

    let NDF = distributionGGX(N, H, roughness);
    let G = geometrySmith(N, V, L, roughness);
    let F = fresnelSchlick(max(dot(H, V), 0.0), F0);

    let numerator = NDF * G * F;
    let denominator = 4.0 * max(dot(N, V), 0.0) * NdotL + 0.0001;
    let specular = numerator / denominator;

    let kS = F;
    let kD = (1.0 - kS) * (1.0 - metallic);

    return (kD * albedo / 3.14159265 + specular) * radiance * NdotL;
}

@fragment
fn frag(in: VertexOut) -> @location(0) vec4f {
    let albedo = pow(textureSample(albedoMap, texSampler, in.uv).rgb, vec3f(2.2));
    let metallic = textureSample(metallicMap,texSampler, in.uv).r;
    let roughness = textureSample(roughnessMap, texSampler, in.uv).r;
    let ao = textureSample(aoMap, texSampler, in.uv).r;

    let TBN = mat3x3f(in.tangent, in.bitangent, in.normal);
    let normalSamp = textureSample(normalMap, texSampler, in.uv).rgb * 2.0 - 1.0;
    let N = normalize(TBN * normalSamp);

    let V = normalize(perFrame.cameraPos - in.worldPos);
    let F0 = mix(vec3f(0.04), albedo, metallic);

    var Lo = vec3f(0.0);
    for (var i = 0u; i < lights.lightCount; i++) {
        Lo += calcLight(lights.lights[i], N, V, in.worldPos, albedo, metallic, roughness, F0);
    }

    let ambient = lights.ambientColor * lights.ambientIntensity * albedo * ao;
    var color   = ambient + Lo;

    // Reinhard tone mapping
    color = color / (color + vec3f(1.0));
    // gamma correction
    color = pow(color, vec3f(1.0 / 2.2));

    return vec4f(color, 1.0);
}
