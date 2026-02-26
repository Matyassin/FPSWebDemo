// Next time implement proj matrix for 3d and start implementing .obj file reading for vertex, index buffers and uvs

async function test() : Promise<void> {
    const canvas: HTMLCanvasElement | null = document.querySelector('canvas');
    const context: GPUCanvasContext | null | undefined = canvas?.getContext('webgpu');
    const textureFormat: GPUTextureFormat = navigator.gpu.getPreferredCanvasFormat();
    const adapter: GPUAdapter | null = await navigator.gpu?.requestAdapter();
    const device: GPUDevice | undefined | null = await adapter?.requestDevice();

    if (!canvas || !context || !device) {
        alert("Szopás");
        return;
    }

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    context?.configure({
        device: device!,
        format: textureFormat
    });

    const shaderModule: GPUShaderModule = device.createShaderModule({
        label: 'red triangle shader',
        code: await fetch('../../assets/shaders/test.wgsl').then(r => r.text()),
    });

    const pipeline: GPURenderPipeline = device.createRenderPipeline({
        label: 'red triangle pipeline',
        layout: 'auto',
        vertex: {
            entryPoint: 'vs',
            module: shaderModule,
            buffers: [{
                arrayStride: 4 * 4, // 4 floats: x, y, u, v
                attributes: [
                    { shaderLocation: 0, offset: 0,   format: 'float32x2' },  // position
                    { shaderLocation: 1, offset: 2*4, format: 'float32x2' }   // uv
                ],
            }],
        },
        fragment: {
            entryPoint: 'fs',
            module: shaderModule,
            targets: [{ format: textureFormat }]
        }
    });

    const renderPassDescriptor: GPURenderPassDescriptor = {
        label: '',
        colorAttachments: [{
            view: context!.getCurrentTexture().createView(),
            clearValue: { r: 0.3, g: 0.3, b: 0.3, a: 1 },
            loadOp: 'clear',
            storeOp: 'store'
        }] as GPURenderPassColorAttachment[]
    };


    // Vertex, Index, Textures
    const aspect = canvas.width / canvas.height;
    const vertices = new Float32Array([
    //       x,           y,       u,v
       -0.5*aspect,  0.5*aspect,   0,0,  // top-left
        0.5*aspect,  0.5*aspect,   1,0,  // top-right
        0.5*aspect, -0.5*aspect,   1,1,  // bottom-right
       -0.5*aspect, -0.5*aspect,   0,1,  // bottom-left
    ]);

    const indices = new Uint16Array([
        0, 1, 2,  // first triangle
        0, 2, 3   // second triangle
    ]);

    const vertexBuffer: GPUBuffer = device.createBuffer({
        size: vertices.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    const indexBuffer: GPUBuffer = device.createBuffer({
        size: indices.byteLength,
        usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    });

    // Textures
    const img = new Image();
    img.src = "../../assets/common_textures/test.png";
    await img.decode();

    const imageBitmap: ImageBitmap = await createImageBitmap(img);

    const texture: GPUTexture = device.createTexture({
        size: [imageBitmap.width, imageBitmap.height, 1],
        format: 'rgba8unorm',
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    });

    device.queue.copyExternalImageToTexture(
        { source: imageBitmap },
        { texture: texture },
        [imageBitmap.width, imageBitmap.height]
    );

    const sampler: GPUSampler = device.createSampler({
        magFilter: 'linear',
        minFilter: 'linear',
    });

    const bindGroup: GPUBindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: sampler },
            { binding: 1, resource: texture.createView() },
        ],
    });

    device.queue.writeBuffer(vertexBuffer, 0, vertices);
    device.queue.writeBuffer(indexBuffer, 0, indices);



    const colorAttachments: GPURenderPassColorAttachment[] = renderPassDescriptor.colorAttachments as GPURenderPassColorAttachment[];
    colorAttachments[0].view = context!.getCurrentTexture().createView();

    const encoder: GPUCommandEncoder = device!.createCommandEncoder();
    const pass: GPURenderPassEncoder = encoder.beginRenderPass(renderPassDescriptor);

    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.setVertexBuffer(0, vertexBuffer);
    pass.setIndexBuffer(indexBuffer, "uint16");
    pass.drawIndexed(indices.length);
    pass.end();

    const commandBuffer: GPUCommandBuffer = encoder.finish();
    device!.queue.submit([commandBuffer]);
}

test();
