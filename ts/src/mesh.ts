import { Component } from "./entity.js";
import { Material } from "./material.js";

export class MeshComponent extends Component {
    public readonly material: Material;
    public readonly bindGroup: GPUBindGroup;
    private vertexBuffer: GPUBuffer;
    private indexBuffer: GPUBuffer;
    private uniformBuffer: GPUBuffer;
    private indexCount: number;

    public constructor(device: GPUDevice, mat: Material , verts: Float32Array<ArrayBuffer>, idxs: Uint16Array<ArrayBuffer>) {
        super();

        this.material = mat;
        this.indexCount = idxs.length;
        this.vertexBuffer = device.createBuffer({
            size: verts.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });

        device.queue.writeBuffer(this.vertexBuffer, 0, verts);

        this.indexBuffer = device.createBuffer({
            size: idxs.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
        });

        device.queue.writeBuffer(this.indexBuffer, 0, idxs);

        this.uniformBuffer = device.createBuffer({
            size: 64, // mat4x4
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        this.bindGroup = mat.createBindGroup(device, this.uniformBuffer);
    }

    public updateMVP(device: GPUDevice, mvpData: Float32Array<ArrayBuffer>): void {
        device.queue.writeBuffer(this.uniformBuffer, 0, mvpData.buffer);
    }

    public draw(pass: GPURenderPassEncoder): void {
        pass.setPipeline(this.material.pipeline);
        pass.setBindGroup(0, this.bindGroup);
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
