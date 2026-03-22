// @ts-ignore
import { mat4 } from "https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/esm/index.js";
import { Vector3 } from "../utils.js";
import { Component } from "../component.js";

export class TransformComponent extends Component {
    public position: Vector3;
    public rotation: Vector3; // euler angles (maybe Quaternion later)
    public scale: Vector3;

    public constructor(pos: Vector3 = Vector3.zero, rot: Vector3 = Vector3.zero, scale: Vector3 = Vector3.one) {
        super();
        
        this.position = pos;
        this.rotation = rot;
        this.scale = scale;
    }

    public get forward(): Vector3 {
        return new Vector3(
            Math.cos(this.rotation.x) * Math.sin(this.rotation.y),
            Math.sin(this.rotation.x),
            Math.cos(this.rotation.x) * Math.cos(this.rotation.y)
        );
    }

    public get right(): Vector3 {
        return new Vector3(
            Math.cos(this.rotation.y),
            0,
            -Math.sin(this.rotation.y)
        );
    }

    public asMatrix(): Float32Array<ArrayBuffer> {
        const m = mat4.create();
        
        mat4.translate(m, m, this.position.toArray());
        mat4.  rotateY(m, m, this.rotation.y);
        mat4.  rotateX(m, m, this.rotation.x);
        mat4.  rotateZ(m, m, this.rotation.z);
        mat4.    scale(m, m, this.scale.toArray());

        return m as Float32Array<ArrayBuffer>;
    }
}
