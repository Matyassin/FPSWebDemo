import { Shader } from "./shader.js";
import { Texture } from "./texture.js";

export interface MaterialOptions {
    blend:     'opaque' | 'transparent';
    cullMode:   GPUCullMode;
    depthWrite: boolean
}

export class Material {
    public readonly pipeline: GPURenderPipeline;
    public readonly shader: Shader;
    public readonly texture: Texture;
    private bindGroupLayout: GPUBindGroupLayout;

    public constructor(device: GPUDevice, shader: Shader, texture: Texture, textureFormat: GPUTextureFormat, options: MaterialOptions) {
        this.shader = shader;
        this.texture = texture;

        const blendState: GPUBlendState | undefined = options.blend === 'transparent' ? {
            color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' },
            alpha: { srcFactor: 'one',       dstFactor: 'one-minus-src-alpha', operation: 'add' },
        } : undefined;

        this.pipeline = device.createRenderPipeline({
            layout: 'auto',
            vertex: {
                entryPoint: shader.vertEntry,
                module: shader.module,
                buffers: [{
                    arrayStride: 4*8, // x, y, z, u, v, nx, ny, nz
                    attributes: [
                        { shaderLocation: 0, offset: 0,   format: 'float32x3' },
                        { shaderLocation: 1, offset: 3*4, format: 'float32x2' },
                        { shaderLocation: 2, offset: 5*4, format: 'float32x3' },
                    ]
                }],
            },
            fragment: {
                entryPoint: shader.fragEntry,
                module: shader.module,
                targets: [{ format: textureFormat, blend: blendState }]
            },
            primitive: {
                topology: 'triangle-list',
                cullMode: options.cullMode
            },
            depthStencil: {
                format: 'depth24plus',
                depthWriteEnabled: options.depthWrite,
                depthCompare: 'less'
            }
        });

        this.bindGroupLayout = this.pipeline.getBindGroupLayout(0);
    }

    // bind group is per-mesh since each mesh has its own uniform buffer
    // use createBindGroup() after constructing the material
    public createBindGroup(device: GPUDevice, uniformBuffer: GPUBuffer): GPUBindGroup {
        return device.createBindGroup({
            layout: this.bindGroupLayout,
            entries: [
                { binding: 0, resource: this.texture.sampler },
                { binding: 1, resource: this.texture.gpuTexture.createView() },
                { binding: 2, resource: { buffer: uniformBuffer } },
            ],
        });
    }
}
