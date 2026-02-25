export class Shader {
    private label: string;
    private shaderCode: string;

    public constructor(label: string, code: string) {
        this.label = label;
        this.shaderCode = code;
    }

    public create(device: GPUDevice): GPUShaderModule {
        return device.createShaderModule({
            label: this.label,
            code: this.shaderCode
        });
    }
}