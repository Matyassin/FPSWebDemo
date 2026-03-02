import { Vector2 } from "./utils.js";
export var KeyCode;
(function (KeyCode) {
    KeyCode["W"] = "KeyW";
    KeyCode["A"] = "KeyA";
    KeyCode["S"] = "KeyS";
    KeyCode["D"] = "KeyD";
    KeyCode["LeftShift"] = "ShiftLeft";
})(KeyCode || (KeyCode = {}));
export class Input {
    static keys = new Set();
    static _mouseDelta = new Vector2(0, 0);
    static get mouseDelta() { return this._mouseDelta; }
    static init() {
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
    static getKeyDown(keyCode) {
        return this.keys.has(keyCode);
    }
    static endFrame() {
        this._mouseDelta.x = 0;
        this._mouseDelta.y = 0;
    }
}
