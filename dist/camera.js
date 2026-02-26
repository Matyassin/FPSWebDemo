// @ts-ignore
import { mat4 } from "https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/esm/index.js";
export class Camera {
    mvpData = new Float32Array(16);
    projection = mat4.create();
    view = mat4.create();
    mvp = mat4.create();
    canvas;
    constructor(canvas) {
        this.canvas = canvas;
    }
    lookAt(eye, target, up) {
        mat4.lookAt(this.view, eye, target, up);
    }
    update(transform) {
        mat4.perspectiveZO(this.projection, Math.PI / 4, this.canvas.width / this.canvas.height, 0.1, 100);
        mat4.multiply(this.mvp, this.projection, this.view);
        mat4.multiply(this.mvp, this.mvp, transform.asMatrix());
        this.mvpData.set(this.mvp);
    }
}
