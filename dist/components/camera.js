// @ts-ignore
import { mat4 } from "https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/esm/index.js";
import { Component } from "../component.js";
export class CameraComponet extends Component {
    mvpData = new Float32Array(16);
    projection = mat4.create();
    view = mat4.create();
    mvp = mat4.create();
    fov = Math.PI / 4; // 45°
    nearClipPlane = 0.1;
    farClipPlane = 100;
    canvas;
    constructor(canvas, fov, near, far) {
        super();
        this.canvas = canvas;
    }
    lookAt(eye, target, up) {
        mat4.lookAt(this.view, eye, target, up);
    }
    update(modelTransform) {
        const transform = this.entity.transform;
        const yaw = transform.rotation.y;
        const pitch = transform.rotation.x;
        const forward = [
            Math.cos(pitch) * Math.sin(yaw),
            Math.sin(pitch),
            Math.cos(pitch) * Math.cos(yaw)
        ];
        const target = [
            transform.position.x + forward[0],
            transform.position.y + forward[1],
            transform.position.z + forward[2],
        ];
        mat4.lookAt(this.view, transform.position.toArray(), target, [0, 1, 0]);
        mat4.perspectiveZO(this.projection, this.fov, this.canvas.width / this.canvas.height, this.nearClipPlane, this.farClipPlane);
        mat4.multiply(this.mvp, this.projection, this.view);
        mat4.multiply(this.mvp, this.mvp, modelTransform.asMatrix());
        this.mvpData.set(this.mvp);
    }
}
