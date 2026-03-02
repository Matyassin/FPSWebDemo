import { ScriptComponent } from "../components/script.js";
import { Input, KeyCode } from "../input.js";
import { Time } from "../time.js";
import { clamp, Vector3 } from "../utils.js";

export class FPSController extends ScriptComponent {
    private lookSensitivity: number = 0.001;
    private movementSpeed: number = 10;
    private sprintSpeedMultiplier: number = 2;
    private maxPitch: number = 85;

    
    public override update(): void {
        this.handleLook();
        this.handleMovement();
    }


    private handleMovement(): void {
        const forward = new Vector3(
            Math.sin(this.entity.transform.rotation.y),
            0,
            Math.cos(this.entity.transform.rotation.y)
        );

        const right = this.entity.transform.right;

        if (Input.getKeyDown(KeyCode.W)) {
            const speed: number = Input.getKeyDown(KeyCode.LeftShift) ? this.movementSpeed * this.sprintSpeedMultiplier : this.movementSpeed;

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

    private handleLook(): void {
        const maxPitch: number = this.maxPitch * (Math.PI / 180);

        this.entity.transform.rotation.y -= Input.mouseDelta.x * this.lookSensitivity;
        this.entity.transform.rotation.x -= Input.mouseDelta.y * this.lookSensitivity;
        this.entity.transform.rotation.x = clamp(this.entity.transform.rotation.x, -maxPitch, maxPitch);
    }
}
