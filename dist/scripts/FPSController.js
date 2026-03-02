import { ScriptComponent } from "../components/script.js";
import { Input, KeyCode } from "../input.js";
import { Time } from "../time.js";
export class FPSController extends ScriptComponent {
    // Settings
    sensitivity = 0.001;
    movementSpeed = 10;
    sprintSpeedMultiplier = 2;
    // TODO: fix this
    forwardX = Math.sin(this.entity.transform.rotation.y);
    forwardZ = Math.cos(this.entity.transform.rotation.y);
    rightX = Math.cos(this.entity.transform.rotation.y);
    rightZ = -Math.sin(this.entity.transform.rotation.y);
    start() {
    }
    update() {
        this.handleLook();
        this.handleMovement();
    }
    handleMovement() {
        if (Input.getKeyDown(KeyCode.W)) {
            if (Input.getKeyDown(KeyCode.LeftShift)) {
                this.entity.transform.position.x += this.forwardX * this.movementSpeed * this.sprintSpeedMultiplier * Time.deltaTime;
                this.entity.transform.position.z += this.forwardZ * this.movementSpeed * this.sprintSpeedMultiplier * Time.deltaTime;
            }
            else {
                this.entity.transform.position.x += this.forwardX * this.movementSpeed * Time.deltaTime;
                this.entity.transform.position.z += this.forwardZ * this.movementSpeed * Time.deltaTime;
            }
        }
        if (Input.getKeyDown(KeyCode.S)) {
            this.entity.transform.position.x -= this.forwardX * this.movementSpeed * Time.deltaTime;
            this.entity.transform.position.z -= this.forwardZ * this.movementSpeed * Time.deltaTime;
        }
        if (Input.getKeyDown(KeyCode.A)) {
            this.entity.transform.position.x += this.rightX * this.movementSpeed * Time.deltaTime;
            this.entity.transform.position.z += this.rightZ * this.movementSpeed * Time.deltaTime;
        }
        if (Input.getKeyDown(KeyCode.D)) {
            this.entity.transform.position.x -= this.rightX * this.movementSpeed * Time.deltaTime;
            this.entity.transform.position.z -= this.rightZ * this.movementSpeed * Time.deltaTime;
        }
    }
    handleLook() {
        this.entity.transform.rotation.y -= Input.mouseDelta.x * this.sensitivity;
        this.entity.transform.rotation.x -= Input.mouseDelta.y * this.sensitivity;
    }
}
