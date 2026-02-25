export class PipelineAsset {
    private label: string;
    private layout: GPUPipelineLayout | 'auto';
    private vertexEntry: string;
    private fragmentEntry: string;

    public constructor(label: string, layout: GPUPipelineLayout | 'auto' = 'auto', vertex: string = 'vs', fragment: string = 'fs') {
        this.label = label;
        this.layout = layout;
        this.vertexEntry = vertex;
        this.fragmentEntry = fragment;
    }

    public create(gpuDevice: GPUDevice, shaderModule: GPUShaderModule, textureFormat: GPUTextureFormat): GPURenderPipeline {
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
