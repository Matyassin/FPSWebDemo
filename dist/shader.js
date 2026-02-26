export class Shader {
    module;
    vertEntry;
    fragEntry;
    constructor(module, vertEntry = 'vert', fragEntry = 'frag') {
        this.module = module;
        this.vertEntry = vertEntry;
        this.fragEntry = fragEntry;
    }
    static async load(device, path) {
        const code = await fetch(path).then(r => r.text());
        const module = device.createShaderModule({
            label: path,
            code: code
        });
        return new Shader(module);
    }
}
