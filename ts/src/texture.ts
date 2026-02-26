export class Texture {
    public readonly gpuTexture: GPUTexture;
    public readonly sampler: GPUSampler;

    public constructor(gpuTex: GPUTexture, sampler: GPUSampler) {
        this.gpuTexture = gpuTex;
        this.sampler = sampler;
    }

    public static async load(device: GPUDevice, path: string): Promise<Texture> {
        const img = new Image();
        img.src = path;
        await img.decode();

        const bitmap: ImageBitmap = await createImageBitmap(img);

        const gpuTexture: GPUTexture = device.createTexture({
            size: [bitmap.width, bitmap.height, 1],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        });

        device.queue.copyExternalImageToTexture(
            { source: bitmap },
            { texture: gpuTexture },
            [ bitmap.width, bitmap.height ]
        );

        const sampler: GPUSampler = device.createSampler({
            magFilter: 'linear',
            minFilter: 'linear'
        });

        return new Texture(gpuTexture, sampler);
    }

    public static createDepthTexture(device: GPUDevice, width: number, height: number): GPUTexture {
        return device.createTexture({
            size: [width, height],
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });
    }

    public destroy(): void {
        this.gpuTexture.destroy();
    }
}
