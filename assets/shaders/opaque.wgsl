// Simple Albedo
struct VertexIn {
    @location(0) position: vec2f,
    @location(1) uv: vec2f
};

struct VertexOut {
    @builtin(position) position: vec4f,
    @location(1) uv: vec2f
};

@group(0) @binding(0) var textureSampler: sampler;
@group(0) @binding(1) var albedo: texture_2d<f32>;

@vertex
fn vs(in: VertexIn) -> VertexOut {
    return VertexOut(
        vec4f(in.position, 0, 1),
        in.uv
    );
}

@fragment
fn fs(in: VertexOut) -> @location(0) vec4f {
    let texColor = textureSample(albedo, textureSampler, in.uv);
    return texColor;
}
