import { Vector2 } from "./utils.js";

export enum KeyCode {
    W         = "KeyW",
    A         = "KeyA",
    S         = "KeyS",
    D         = "KeyD",
    Space     = "Space",
    LeftShift = "ShiftLeft",
    LeftCtr   = "ControlLeft",
}

export class Input {
    private static keys = new Set<string>();
    private static _mouseDelta: Vector2 = Vector2.zero;

    public static get mouseDelta() { return this._mouseDelta; }
    
    public static init(): void {
        window.addEventListener('keydown', (e) => {
            this.keys.add(e.code);
        });

        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
        });

        window.addEventListener('mousemove', (e) => {
            this._mouseDelta.x += e.movementX;
            this._mouseDelta.y += e.movementY;
        });

        document.addEventListener('click', () => {
            document.body.requestPointerLock();
        });
    }

    public static getKeyDown(keyCode: KeyCode): boolean {
        return this.keys.has(keyCode);
    }

    public static endFrame(): void {
        this._mouseDelta.x = 0;
        this._mouseDelta.y = 0;
    }
}
