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

    const shaderCode: string = await fetch('../../assets/shaders/test.wgsl').then(r => r.text());
    const shaderModule = device.createShaderModule({
        label: 'red triangle shader',
        code: shaderCode
    });

    const pipeline = device.createRenderPipeline({
        label: 'red triangle pipeline',
        layout: 'auto',
        vertex: {
            entryPoint: 'vs',
            module: shaderModule
        },
        fragment: {
            entryPoint: 'fs',
            module: shaderModule,
            targets: [{
                format: textureFormat
            }]
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

    function render() : void {
        const colorAttachments: GPURenderPassColorAttachment[] = renderPassDescriptor.colorAttachments as GPURenderPassColorAttachment[];
        colorAttachments[0].view = context!.getCurrentTexture().createView();

        const encoder: GPUCommandEncoder = device!.createCommandEncoder();
        const pass: GPURenderPassEncoder = encoder.beginRenderPass(renderPassDescriptor);

        pass.setPipeline(pipeline);
        pass.draw(3); // call our vertex shader 3 times.
        pass.end();

        const commandBuffer: GPUCommandBuffer = encoder.finish();
        device!.queue.submit([commandBuffer]);
    }

    render();
}

test();
