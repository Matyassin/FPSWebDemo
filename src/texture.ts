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
        const mipLevelCount = Texture.getMipLevelCount(bitmap.width, bitmap.height);

        const gpuTexture: GPUTexture = device.createTexture({
            size: [bitmap.width, bitmap.height, 1],
            mipLevelCount,
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        });

        Texture.uploadMipChain(device, gpuTexture, bitmap);

        const sampler: GPUSampler = device.createSampler({
            addressModeU: 'repeat',
            addressModeV: 'repeat',
            magFilter: 'linear',
            minFilter: 'linear',
            mipmapFilter: 'linear',
            maxAnisotropy: 8
        });

        return new Texture(gpuTexture, sampler);
    }

    private static getMipLevelCount(width: number, height: number): number {
        return 1 + Math.floor(Math.log2(Math.max(width, height)));
    }

    private static uploadMipChain(device: GPUDevice, texture: GPUTexture, sourceBitmap: ImageBitmap): void {
        let source: ImageBitmap | HTMLCanvasElement = sourceBitmap;
        let width = sourceBitmap.width;
        let height = sourceBitmap.height;

        for (let mipLevel = 0; mipLevel < texture.mipLevelCount; mipLevel++) {
            device.queue.copyExternalImageToTexture(
                { source },
                { texture, mipLevel },
                [width, height]
            );

            if (width === 1 && height === 1)
                break;

            const nextWidth = Math.max(1, Math.floor(width / 2));
            const nextHeight = Math.max(1, Math.floor(height / 2));
            const canvas = document.createElement('canvas');
            canvas.width = nextWidth;
            canvas.height = nextHeight;
            const ctx = canvas.getContext('2d');
            
            if (!ctx)
                throw new Error("Failed to create 2D context for texture mip generation.");

            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(source, 0, 0, width, height, 0, 0, nextWidth, nextHeight);

            source = canvas;
            width = nextWidth;
            height = nextHeight;
        }
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
