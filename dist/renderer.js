import { Shader } from "./shader.js";
import { PipelineAsset } from "./pipeline_asset.js";
export class Renderer {
    device;
    context;
    textureFormat;
    renderPassDescriptor;
    pipeline;
    constructor(device, context, texFormat) {
        this.device = device;
        this.context = context;
        this.textureFormat = texFormat;
    }
    async setup() {
        this.context.configure({
            device: this.device,
            format: this.textureFormat
        });
        const shader = new Shader('red triangle shader', await fetch('../../assets/shaders/test.wgsl').then(r => r.text()));
        const pipeline = new PipelineAsset('red triangle pipeline');
        this.pipeline = pipeline.create(this.device, shader.create(this.device), this.textureFormat);
        this.renderPassDescriptor = {
            label: '',
            colorAttachments: [{
                    view: this.context.getCurrentTexture().createView(),
                    clearValue: { r: 0.3, g: 0.3, b: 0.3, a: 1 },
                    loadOp: 'clear',
                    storeOp: 'store'
                }]
        };
    }
    render() {
        const colorAttachments = this.renderPassDescriptor.colorAttachments;
        colorAttachments[0].view = this.context.getCurrentTexture().createView();
        const encoder = this.device.createCommandEncoder();
        const pass = encoder.beginRenderPass(this.renderPassDescriptor);
        pass.setPipeline(this.pipeline);
        pass.draw(3); // call our vertex shader 3 times.
        pass.end();
        const commandBuffer = encoder.finish();
        this.device.queue.submit([commandBuffer]);
    }
}
