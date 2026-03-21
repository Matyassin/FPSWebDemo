export class Shader {
    public readonly module: GPUShaderModule;
    public readonly vertEntry: string;
    public readonly fragEntry: string;
    
    public constructor(module: GPUShaderModule, vertEntry: string = 'vert', fragEntry: string = 'frag') {
        this.module = module;
        this.vertEntry = vertEntry;
        this.fragEntry = fragEntry;
    }

    public static async load(device: GPUDevice, path: string): Promise<Shader> {
        const code = await fetch(path).then(r => r.text());
        const module = device.createShaderModule({
            label: path,
            code: code
        });

        return new Shader(module);
    }
}
