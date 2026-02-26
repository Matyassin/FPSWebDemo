export class Texture {
    gpuTexture;
    sampler;
    constructor(gpuTex, sampler) {
        this.gpuTexture = gpuTex;
        this.sampler = sampler;
    }
    static async load(device, path) {
        const img = new Image();
        img.src = path;
        await img.decode();
        const bitmap = await createImageBitmap(img);
        const gpuTexture = device.createTexture({
            size: [bitmap.width, bitmap.height, 1],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        });
        device.queue.copyExternalImageToTexture({ source: bitmap }, { texture: gpuTexture }, [bitmap.width, bitmap.height]);
        const sampler = device.createSampler({
            magFilter: 'linear',
            minFilter: 'linear'
        });
        return new Texture(gpuTexture, sampler);
    }
    static createDepthTexture(device, width, height) {
        return device.createTexture({
            size: [width, height],
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });
    }
    destroy() {
        this.gpuTexture.destroy();
    }
}
