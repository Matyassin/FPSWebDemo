import { Shader } from "./shader.js";
import { Texture } from "./texture.js";
import { Vector2 } from "./utils.js";

export type MaterialOptions = {
    blend: 'opaque' | 'transparent';
    cullMode?: GPUCullMode;
    depthWrite?: boolean,
    isLit?: boolean,
    uvTiling?: Vector2,
    vertexLayout?: GPUVertexBufferLayout[]
}

export class Material {
    public readonly pipeline: GPURenderPipeline;
    public readonly shader: Shader;
    public readonly textures: Texture[];
    public readonly isLit: boolean;
    public readonly uvTiling: Vector2;
    private bindGroupLayout: GPUBindGroupLayout;

    public constructor(device: GPUDevice, shader: Shader, textures: Texture[], textureFormat: GPUTextureFormat, options: MaterialOptions) {
        this.shader = shader;
        this.textures = textures;

        this.isLit = options.isLit != null
            ? options.isLit
            : false;

        this.uvTiling = options.uvTiling != null
            ? options.uvTiling
            : new Vector2(1, 1);

        const blendState: GPUBlendState | undefined = options.blend === 'transparent'
            ? {
                color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' },
                alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' },
            }
            : undefined;

        const defaultLayout: GPUVertexBufferLayout[] = [{
            arrayStride: 4 * 12, // x, y, z, u, v, nx, ny, nz, tx, ty, tz, tw
            attributes: [
                { shaderLocation: 0, offset: 0, format: 'float32x3' }, // pos
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
                cullMode: options.cullMode != null ? options.cullMode : 'back',
            },
            depthStencil: {
                format: 'depth24plus',
                depthWriteEnabled: options.depthWrite != null ? options.depthWrite : true,
                depthCompare: 'less'
            }
        });

        this.bindGroupLayout = this.pipeline.getBindGroupLayout(0);
    }

    public createBindGroup(device: GPUDevice, uniformBuffer: GPUBuffer): GPUBindGroup {
        const entries: GPUBindGroupEntry[] = [{ binding: 0, resource: this.textures[0].sampler }];

        for (let i = 0; i < this.textures.length; i++) {
            entries.push({
                binding: i + 1,
                resource: this.textures[i].gpuTexture.createView(),
            });
        }

        entries.push({
            binding: this.textures.length + 1,
            resource: { buffer: uniformBuffer },
        });

        return device.createBindGroup({ layout: this.bindGroupLayout, entries });
    }

    public createLightingBindGroup(device: GPUDevice, lightingBuffer: GPUBuffer, cameraBuffer: GPUBuffer): GPUBindGroup | undefined {
        if (!this.isLit)
            return undefined;

        return device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(1),
            entries: [
                { binding: 0, resource: { buffer: lightingBuffer } },
                { binding: 1, resource: { buffer: cameraBuffer } },
            ],
        });
    }
}

export class LitMaterial extends Material {
    public constructor(device: GPUDevice, shader: Shader, textures: Texture[], textureFormat: GPUTextureFormat, options: MaterialOptions = { blend: 'opaque', cullMode: 'back', depthWrite: true }) {
        super(device, shader, textures, textureFormat, { ...options, isLit: true });
    }
}

export class UnlitMaterial extends Material {
    public constructor(device: GPUDevice, shader: Shader, textures: Texture[], textureFormat: GPUTextureFormat, options: MaterialOptions) {
        super(device, shader, textures, textureFormat, { ...options, isLit: false });
    }
}
