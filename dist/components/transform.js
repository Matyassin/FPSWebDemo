// @ts-ignore
import { mat4 } from "https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/esm/index.js";
import { Vector3 } from "../utils.js";
import { Component } from "../component.js";
export class TransformComponent extends Component {
    position;
    rotation; // euler angles (maybe Quaternion later)
    scale;
    constructor(pos = new Vector3(0, 0, 0), rot = new Vector3(0, 0, 0), scale = new Vector3(1, 1, 1)) {
        super();
        this.position = pos;
        this.rotation = rot;
        this.scale = scale;
    }
    get forward() {
        return new Vector3(Math.cos(this.rotation.x) * Math.sin(this.rotation.y), Math.sin(this.rotation.x), Math.cos(this.rotation.x) * Math.cos(this.rotation.y));
    }
    get right() {
        return new Vector3(Math.cos(this.rotation.y), 0, -Math.sin(this.rotation.y));
    }
    asMatrix() {
        const m = mat4.create();
        mat4.translate(m, m, this.position.toArray());
        mat4.rotateY(m, m, this.rotation.y);
        mat4.rotateX(m, m, this.rotation.x);
        mat4.rotateZ(m, m, this.rotation.z);
        mat4.scale(m, m, this.scale.toArray());
        return m;
    }
}
