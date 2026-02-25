// Simple gradient
struct VertexOut {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f
};

@vertex
fn vs(@builtin(vertex_index) vertexIndex : u32) -> VertexOut {
    let pos = array(
        vec2f( 0.0f,  0.5f),
        vec2f(-0.5f, -0.5f),
        vec2f( 0.5f, -0.5f)
    );

    let col = array(
        vec4f(1f, 0f, 0f, 1f),
        vec4f(0f, 1f, 0f, 1f),
        vec4f(0f, 0f, 1f, 1f),
    );

    return VertexOut(
        vec4f(pos[vertexIndex], 0f, 1f),
        col[vertexIndex]
    );
}

@fragment
fn fs(fsInput: VertexOut) -> @location(0) vec4f {
    return fsInput.color;
}
