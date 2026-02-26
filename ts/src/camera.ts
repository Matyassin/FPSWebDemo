// @ts-ignore
import { mat4 } from "https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/esm/index.js";
import { Transform } from "./transform.js";

export class Camera {
    public mvpData = new Float32Array(16) as Float32Array<ArrayBuffer>;
    private projection = mat4.create();
    private view = mat4.create();
    private mvp = mat4.create();
    private canvas: HTMLCanvasElement;

    public constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
    }

    public lookAt(eye: [number, number, number], target: [number, number, number], up: [number, number, number]): void {
        mat4.lookAt(this.view, eye, target, up);
    }

    public update(transform: Transform): void {
        mat4.perspectiveZO(this.projection, Math.PI / 4, this.canvas.width / this.canvas.height, 0.1, 100);
        mat4.multiply(this.mvp, this.projection, this.view);
        mat4.multiply(this.mvp, this.mvp, transform.asMatrix());
        this.mvpData.set(this.mvp);
    }
}
