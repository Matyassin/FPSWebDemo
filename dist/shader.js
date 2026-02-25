export class Shader {
    label;
    shaderCode;
    constructor(label, code) {
        this.label = label;
        this.shaderCode = code;
    }
    create(device) {
        return device.createShaderModule({
            label: this.label,
            code: this.shaderCode
        });
    }
}
