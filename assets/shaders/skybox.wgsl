struct VertexOut {
    @builtin(position) position: vec4f,
    @location(0)       localPos: vec3f,
};

@group(0) @binding(0) var texSampler:  sampler;
@group(0) @binding(1) var sidesAlbedo: texture_2d<f32>;
@group(0) @binding(2) var topAlbedo:   texture_2d<f32>;
@group(0) @binding(3) var<uniform>     mvp: mat4x4f;

@vertex
fn vert(@location(0) position: vec3f) -> VertexOut {
    var out: VertexOut;
    let clip = mvp * vec4f(position, 1.0);
    out.position = clip.xyww; // force depth to 1.0 so skybox is always behind everything
    out.localPos = position;
    return out;
}

@fragment
fn frag(in: VertexOut) -> @location(0) vec4f {
    let absY = abs(in.localPos.y);
    if (absY > 0.7) {
        let uv = in.localPos.xz * 0.5 + 0.5;
        return textureSample(topAlbedo, texSampler, uv);
    }
    let u = atan2(in.localPos.x, in.localPos.z) / (2.0 * 3.14159) + 0.5;
    let v = 1.0 - (in.localPos.y * 0.5 + 0.5);

    return textureSample(sidesAlbedo, texSampler, vec2f(u, v));
}
