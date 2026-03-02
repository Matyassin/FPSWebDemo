import { ScriptComponent } from "../components/script.js";
import { Time } from "../time.js";
export class RotatingCube extends ScriptComponent {
    update() {
        this.entity.transform.rotation.x = Time.time * 0.3;
        this.entity.transform.rotation.y = Time.time * 0.8;
    }
}
