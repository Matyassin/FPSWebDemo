// Simple Albedo — 3D with MVP
struct VertexIn {
    @location(0) position: vec3f,
    @location(1) uv:       vec2f,
};

struct VertexOut {
    @builtin(position) position: vec4f,
    @location(0)       uv:       vec2f,
};

@group(0) @binding(0) var textureSampler: sampler;
@group(0) @binding(1) var albedo:         texture_2d<f32>;
@group(0) @binding(2) var<uniform>  mvp:  mat4x4f;

@vertex
fn vert(in: VertexIn) -> VertexOut {
    return VertexOut(
        mvp * vec4f(in.position, 1.0),
        in.uv,
    );
}

@fragment
fn frag(in: VertexOut) -> @location(0) vec4f {
    return textureSample(albedo, textureSampler, in.uv);
}
