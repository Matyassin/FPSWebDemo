import { Shader } from "./shader.js";
import { Texture } from "./texture.js";

export interface MaterialOptions {
    blend:        'opaque' | 'transparent';
    cullMode:      GPUCullMode;
    depthWrite:    boolean,
    vertexLayout?: GPUVertexBufferLayout[]
}

export class Material {
    public readonly pipeline: GPURenderPipeline;
    public readonly shader: Shader;
    public readonly textures: Texture[];
    private bindGroupLayout: GPUBindGroupLayout;

    public constructor(device: GPUDevice, shader: Shader, textures: Texture[], textureFormat: GPUTextureFormat, options: MaterialOptions) {
        this.shader = shader;
        this.textures = textures;

        const blendState: GPUBlendState | undefined = options.blend === 'transparent' ? {
            color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' },
            alpha: { srcFactor: 'one',       dstFactor: 'one-minus-src-alpha', operation: 'add' },
        } : undefined;

        const defaultLayout: GPUVertexBufferLayout[] = [{
            arrayStride: 4 * 12, // x, y, z, u, v, nx, ny, nz, tx, ty, tz, tw
            attributes: [
                { shaderLocation: 0, offset: 0,     format: 'float32x3' }, // pos
                { shaderLocation: 1, offset: 3 * 4, format: 'float32x2' }, // uv
                { shaderLocation: 2, offset: 5 * 4, format: 'float32x3' }, // normal
                { shaderLocation: 3, offset: 8 * 4, format: 'float32x4' }, // tangent
            ],
        }];

        this.pipeline = device.createRenderPipeline({
            layout: 'auto',
            vertex: {
                entryPoint: shader.vertEntry,
                module: shader.module,
                buffers: options.vertexLayout ?? defaultLayout,
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
        const entries: GPUBindGroupEntry[] = [
            { binding: 0, resource: this.textures[0].sampler },
            ...this.textures.map((t, i) => ({
                binding: i + 1,
                resource: t.gpuTexture.createView(),
            })),
            { binding: this.textures.length + 1, resource: { buffer: uniformBuffer,  } },
        ];

        return device.createBindGroup({ layout: this.bindGroupLayout, entries });
    }
}
