import { Entity } from "./entity.js";
import { Texture } from "./texture.js";
import { CameraComponent } from "./components/camera.js";
import { MeshComponent } from "./components/mesh.js";
import { Lighting } from "./lighting.js";
import { Material } from "./material.js";

export class Renderer {
    private device: GPUDevice;
    private canvas: HTMLCanvasElement;
    private context: GPUCanvasContext;
    private depthTexture!: GPUTexture;

    private lighting: Lighting;
    private cameraBuffer: GPUBuffer;
    private cameraData = new Float32Array(4);
    private lightingBindGroups = new Map<Material, GPUBindGroup>();

    public constructor(device: GPUDevice, canvas: HTMLCanvasElement, ctx: GPUCanvasContext, texFormat: GPUTextureFormat) {
        this.device = device;
        this.context = ctx;
        this.canvas = canvas;

        this.context.configure({ device: device, format: texFormat });
        this.lighting = new Lighting(device);
        this.cameraBuffer = device.createBuffer({
            size: 16,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this.resize();
        new ResizeObserver(() => this.resize()).observe(canvas);
    }

    private resize(): void {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        this.depthTexture?.destroy();
        this.depthTexture = Texture.createDepthTexture(this.device, this.canvas.width, this.canvas.height);
    }

    public drawFrame(camera: CameraComponent, entities: Entity[]): void {
        this.lighting.update(this.device, entities);
        const cameraPosition = camera.entity.transform.position;
        this.cameraData[0] = cameraPosition.x;
        this.cameraData[1] = cameraPosition.y;
        this.cameraData[2] = cameraPosition.z;
        this.cameraData[3] = 0.0;
        this.device.queue.writeBuffer(this.cameraBuffer, 0, this.cameraData);

        const encoder = this.device.createCommandEncoder();

        const pass = encoder.beginRenderPass({
            colorAttachments: [{
                view: this.context.getCurrentTexture().createView(),
                clearValue: { r: 0.1, g: 0.1, b: 0.15, a: 1 },
                loadOp: 'clear',
                storeOp: 'store',
            }],
            depthStencilAttachment: {
                view: this.depthTexture.createView(),
                depthClearValue: 1.0,
                depthLoadOp: 'clear',
                depthStoreOp: 'store',
            },
        });

        for (const entity of entities) {
            const mesh = entity.getComponent(MeshComponent);
            if (!mesh)
                continue;

            camera.update(entity.transform);
            mesh.updatePerObject(this.device, camera.mvpData, entity.transform.asMatrix());

            let lightingBindGroup: GPUBindGroup | undefined;
            if (mesh.material.isLit) {
                lightingBindGroup = this.lightingBindGroups.get(mesh.material);
                if (!lightingBindGroup) {
                    lightingBindGroup = mesh.material.createLightingBindGroup(this.device, this.lighting.buffer, this.cameraBuffer);
                    if (lightingBindGroup)
                        this.lightingBindGroups.set(mesh.material, lightingBindGroup);
                }
            }

            mesh.draw(pass, lightingBindGroup);
        }

        pass.end();
        this.device.queue.submit([encoder.finish()]);
    }
}
