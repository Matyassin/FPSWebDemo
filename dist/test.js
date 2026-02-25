"use strict";
async function test() {
    const canvas = document.querySelector('canvas');
    const context = canvas?.getContext('webgpu');
    const textureFormat = navigator.gpu.getPreferredCanvasFormat();
    const adapter = await navigator.gpu?.requestAdapter();
    const device = await adapter?.requestDevice();
    if (!canvas || !context || !device) {
        alert("Szopás");
        return;
    }
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    context?.configure({
        device: device,
        format: textureFormat
    });
    const shaderCode = await fetch('../../assets/shaders/test.wgsl').then(r => r.text());
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
        },
        primitive: {
            topology: 'triangle-list' // <--- THIS IS THE CRITICAL LINE
        }
    });
    const renderPassDescriptor = {
        label: '',
        colorAttachments: [{
                view: context.getCurrentTexture().createView(),
                clearValue: { r: 0.3, g: 0.3, b: 0.3, a: 1 },
                loadOp: 'clear',
                storeOp: 'store'
            }]
    };
    function render() {
        const colorAttachments = renderPassDescriptor.colorAttachments;
        colorAttachments[0].view = context.getCurrentTexture().createView();
        const encoder = device.createCommandEncoder();
        const pass = encoder.beginRenderPass(renderPassDescriptor);
        pass.setPipeline(pipeline);
        pass.draw(3); // call our vertex shader 3 times.
        pass.end();
        const commandBuffer = encoder.finish();
        device.queue.submit([commandBuffer]);
    }
    render();
}
test();
