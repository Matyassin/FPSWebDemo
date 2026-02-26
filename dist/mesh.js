import { Component } from "./entity.js";
export class MeshComponent extends Component {
    material;
    bindGroup;
    vertexBuffer;
    indexBuffer;
    uniformBuffer;
    indexCount;
    constructor(device, mat, verts, idxs) {
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
    updateMVP(device, mvpData) {
        device.queue.writeBuffer(this.uniformBuffer, 0, mvpData.buffer);
    }
    draw(pass) {
        pass.setPipeline(this.material.pipeline);
        pass.setBindGroup(0, this.bindGroup);
        pass.setVertexBuffer(0, this.vertexBuffer);
        pass.setIndexBuffer(this.indexBuffer, 'uint16');
        pass.drawIndexed(this.indexCount);
    }
    destroy() {
        this.vertexBuffer.destroy();
        this.indexBuffer.destroy();
        this.uniformBuffer.destroy();
    }
}
