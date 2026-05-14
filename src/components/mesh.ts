import { Component } from "../component.js";
import { Material } from "../material.js";

export class MeshComponent extends Component {
    public readonly material: Material;
    public readonly bindGroup: GPUBindGroup;
    private vertexBuffer: GPUBuffer;
    private indexBuffer: GPUBuffer;
    private uniformBuffer: GPUBuffer;
    private uniformData = new Float32Array(36);
    private indexCount: number;

    public constructor(device: GPUDevice, mat: Material , verts: Float32Array<ArrayBuffer>, idxs: Uint16Array<ArrayBuffer>) {
        super();

        this.material = mat;
        this.indexCount = idxs.length;

        this.vertexBuffer = device.createBuffer({
            size: verts.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });

        this.indexBuffer = device.createBuffer({
            size: idxs.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
        });

        this.uniformBuffer = device.createBuffer({
            size: 144, // mvp + model + uv tiling + padding
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        device.queue.writeBuffer(this.vertexBuffer, 0, verts);
        device.queue.writeBuffer(this.indexBuffer, 0, idxs);
        this.bindGroup = mat.createBindGroup(device, this.uniformBuffer);
    }

    public updatePerObject(device: GPUDevice, mvpData: Float32Array<ArrayBuffer>, modelData: Float32Array<ArrayBuffer>): void {
        this.uniformData.set(mvpData, 0);
        this.uniformData.set(modelData, 16);
        this.uniformData[32] = this.material.uvTiling.x;
        this.uniformData[33] = this.material.uvTiling.y;
        this.uniformData[34] = 0;
        this.uniformData[35] = 0;
        device.queue.writeBuffer(this.uniformBuffer, 0, this.uniformData);
    }

    public draw(pass: GPURenderPassEncoder, lightingBindGroup?: GPUBindGroup): void {
        pass.setPipeline(this.material.pipeline);
        pass.setBindGroup(0, this.bindGroup);

        if (lightingBindGroup)
            pass.setBindGroup(1, lightingBindGroup);
        
        pass.setVertexBuffer(0, this.vertexBuffer);
        pass.setIndexBuffer(this.indexBuffer, 'uint16');
        pass.drawIndexed(this.indexCount);
    }

    public destroy(): void {
        this.vertexBuffer.destroy();
        this.indexBuffer.destroy();
        this.uniformBuffer.destroy();
    }
}
