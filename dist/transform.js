// @ts-ignore
import { mat4 } from "https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/esm/index.js";
import { Vector3 } from "./utils.js";
export class Transform {
    position = new Vector3(0, 0, 0);
    rotation = new Vector3(0, 0, 0); // euler angles (maybe Quaternion later)
    scale = new Vector3(1, 1, 1);
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
