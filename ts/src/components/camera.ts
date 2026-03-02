// @ts-ignore
import { mat4 } from "https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/esm/index.js";
import { Component } from "../component.js";
import { TransformComponent } from "./transform.js";

export class CameraComponet extends Component {
    public mvpData = new Float32Array(16) as Float32Array<ArrayBuffer>;
    private projection = mat4.create();
    private view = mat4.create();
    private mvp = mat4.create();

    public fov: number = Math.PI / 4;   // 45°
    public nearClipPlane: number = 0.1;
    public farClipPlane: number = 100;

    private canvas: HTMLCanvasElement;

    public constructor(canvas: HTMLCanvasElement, fov: number, near: number, far: number) {
        super();
        this.canvas = canvas;
    }

    public lookAt(eye: [number, number, number], target: [number, number, number], up: [number, number, number]): void {
        mat4.lookAt(this.view, eye, target, up);
    }

    public update(modelTransform: TransformComponent): void {
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
