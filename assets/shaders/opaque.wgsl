struct PerObjectUniforms {
    mvp: mat4x4f,
    model: mat4x4f,
    uvTiling: vec2f,
    _pad: vec2f,
};

struct VertexIn {
    @location(0) position: vec3f,
    @location(1) uv:       vec2f,
    @location(2) normal:   vec3f,
};

struct VertexOut {
    @builtin(position) position: vec4f,
    @location(0)       uv:       vec2f,
};

@group(0) @binding(0) var textureSampler: sampler;
@group(0) @binding(1) var albedo:         texture_2d<f32>;
@group(0) @binding(2) var<uniform> perObject: PerObjectUniforms;

@vertex
fn vert(in: VertexIn) -> VertexOut {
    return VertexOut(
        perObject.mvp * vec4f(in.position, 1.0),
        in.uv * perObject.uvTiling,
    );
}

@fragment
fn frag(in: VertexOut) -> @location(0) vec4f {
    return textureSample(
        albedo,
        textureSampler,
        vec2f(in.uv.x, 1.0 - in.uv.y)
    );
}
