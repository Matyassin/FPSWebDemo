import { ScriptComponent } from "../components/script.js";
import { Input, KeyCode } from "../input.js";
import { Physics } from "../physics.js";
import { Time } from "../time.js";
import { Mathf, Vector3 } from "../utils.js";

export class FPSController extends ScriptComponent {
    // --- CONTROLLER PROPERITES ---
    private readonly height: number = 2;

    // ----- LOOK -----
    private lookSensitivity: number = 0.001;
    private maxPitch: number = 85;

    // ----- MOVEMENT -----
    private walkSpeed: number = 5;
    private sprintSpeedMultiplier: number = 2;
    private acceleration: number = 15;
    private currentVelocity: Vector3 = Vector3.zero;

    // ----- CROUCH -----
    private timeToCrouch: number = 6;
    private crouchHeightOffset: number = 0;
    private isCrouched: boolean = false;
    private isCrouching: boolean = false;

    // ----- JUMP -----
    private jumpForce: number = 7;
    private velocityY: number = 0;
    private mass: number = 2;
    private isGrounded: boolean = false;

    public static instance: FPSController;


    public override awake(): void {
        FPSController.instance = this;
    }

    public override start(): void {
        this.entity.transform.position = new Vector3(0, this.height * 0.75, 0);
        this.crouchHeightOffset = this.height;
    }
    
    public override update(): void {
        this.handleLook();
        this.handleMovement();
        this.handleJump();
        this.handleCrouch();
    }
    

    private handleMovement(): void {
        let targetVelocity = Vector3.zero;
        let moveSpeed = this.isCrouched ? this.walkSpeed / 2 : this.walkSpeed;

        if (Input.getKeyDown(KeyCode.W)) {
            if (Input.getKeyDown(KeyCode.LeftShift) && !this.isCrouched) {
                moveSpeed *= this.sprintSpeedMultiplier;
            }

            targetVelocity.x += this.entity.transform.forward.x;
            targetVelocity.z += this.entity.transform.forward.z;
        }

        if (Input.getKeyDown(KeyCode.S)) {
            targetVelocity.x -= this.entity.transform.forward.x;
            targetVelocity.z -= this.entity.transform.forward.z;
        }

        if (Input.getKeyDown(KeyCode.A)) {
            targetVelocity.x += this.entity.transform.right.x;
            targetVelocity.z += this.entity.transform.right.z;
        }

        if (Input.getKeyDown(KeyCode.D)) {
            targetVelocity.x -= this.entity.transform.right.x;
            targetVelocity.z -= this.entity.transform.right.z;
        }

        targetVelocity = targetVelocity.normalized;
        targetVelocity.x *= moveSpeed;
        targetVelocity.z *= moveSpeed;

        this.currentVelocity = Vector3.lerp(
            this.currentVelocity,
            targetVelocity,
            this.acceleration * Time.deltaTime
        );

        this.entity.transform.position.x += this.currentVelocity.x * Time.deltaTime;
        this.entity.transform.position.z += this.currentVelocity.z * Time.deltaTime;
    }

    private handleLook(): void {
        const maxPitch: number = this.maxPitch * (Math.PI / 180);

        this.entity.transform.rotation.y -= Input.mouseDelta.x * this.lookSensitivity;
        this.entity.transform.rotation.x -= Input.mouseDelta.y * this.lookSensitivity;
        this.entity.transform.rotation.x = Mathf.clamp(this.entity.transform.rotation.x, -maxPitch, maxPitch);
    }

    private handleCrouch(): void {
        this.isCrouching = Math.abs(this.entity.transform.position.y - this.crouchHeightOffset) > 0.01;

        if (Input.getKeyDown(KeyCode.LeftCtr) && !this.isCrouching) {
            this.isCrouched = !this.isCrouched;
            this.crouchHeightOffset = this.isCrouched ? this.height / 2 : this.height;
        }

        this.entity.transform.position.y = Mathf.lerp(
            this.entity.transform.position.y,
            this.crouchHeightOffset,
            Time.deltaTime * this.timeToCrouch
        );
    }

    private handleJump(): void {
        // Very early hacky method only works on planes :)
        
    }
}
