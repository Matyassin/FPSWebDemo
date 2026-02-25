export class PipelineAsset {
    label;
    layout;
    vertexEntry;
    fragmentEntry;
    constructor(label, layout = 'auto', vertex = 'vs', fragment = 'fs') {
        this.label = label;
        this.layout = layout;
        this.vertexEntry = vertex;
        this.fragmentEntry = fragment;
    }
    create(gpuDevice, shaderModule, textureFormat) {
        return gpuDevice.createRenderPipeline({
            label: this.label,
            layout: this.layout,
            vertex: {
                entryPoint: this.vertexEntry,
                module: shaderModule
            },
            fragment: {
                entryPoint: this.fragmentEntry,
                module: shaderModule,
                targets: [{
                        format: textureFormat
                    }]
            }
        });
    }
}
