import { ScriptComponent } from "../components/script";
import { FPSController } from "./fps_controller";

export class Skybox extends ScriptComponent {
    public override update() {
        this.entity.transform.position = FPSController.instance.entity.transform.position;
    }
}
