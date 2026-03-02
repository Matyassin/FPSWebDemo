import { ScriptComponent } from "../components/script.js";
import { Input, KeyCode } from "../input.js";
import { Time } from "../time.js";
import { clamp, Vector3 } from "../utils.js";
export class FPSController extends ScriptComponent {
    lookSensitivity = 0.001;
    movementSpeed = 10;
    sprintSpeedMultiplier = 2;
    maxPitch = 85;
    update() {
        this.handleLook();
        this.handleMovement();
    }
    handleMovement() {
        const forward = new Vector3(Math.sin(this.entity.transform.rotation.y), 0, Math.cos(this.entity.transform.rotation.y));
        const right = this.entity.transform.right;
        if (Input.getKeyDown(KeyCode.W)) {
            const speed = Input.getKeyDown(KeyCode.LeftShift) ? this.movementSpeed * this.sprintSpeedMultiplier : this.movementSpeed;
            this.entity.transform.position.x += forward.x * speed * Time.deltaTime;
            this.entity.transform.position.z += forward.z * speed * Time.deltaTime;
        }
        if (Input.getKeyDown(KeyCode.S)) {
            this.entity.transform.position.x -= forward.x * this.movementSpeed * Time.deltaTime;
            this.entity.transform.position.z -= forward.z * this.movementSpeed * Time.deltaTime;
        }
        if (Input.getKeyDown(KeyCode.A)) {
            this.entity.transform.position.x += right.x * this.movementSpeed * Time.deltaTime;
            this.entity.transform.position.z += right.z * this.movementSpeed * Time.deltaTime;
        }
        if (Input.getKeyDown(KeyCode.D)) {
            this.entity.transform.position.x -= right.x * this.movementSpeed * Time.deltaTime;
            this.entity.transform.position.z -= right.z * this.movementSpeed * Time.deltaTime;
        }
    }
    handleLook() {
        const maxPitch = this.maxPitch * (Math.PI / 180);
        this.entity.transform.rotation.y -= Input.mouseDelta.x * this.lookSensitivity;
        this.entity.transform.rotation.x -= Input.mouseDelta.y * this.lookSensitivity;
        this.entity.transform.rotation.x = clamp(this.entity.transform.rotation.x, -maxPitch, maxPitch);
    }
}
