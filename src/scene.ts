import { Entity } from "./entity.js";
import { Mathf, Vector3 } from "./utils.js";
import { Shader } from "./shader.js";
import { Texture } from "./texture.js";
import { ObjLoader } from "./obj_loader.js";
import { Material } from "./material.js";
import { CameraComponent } from "./components/camera.js";
import { MeshComponent } from "./components/mesh.js";
import { LightComponent } from "./components/light.js";
import { FPSController } from "./scripts/fps_controller.js";
import { Skybox } from "./scripts/skybox.js";

export abstract class Scene {
    public mainCamera: CameraComponent | null = null;
    private _entities: Entity[] = [];

    public get entites(): Entity[] { return this._entities; }

    public abstract load(device: GPUDevice, canvas: HTMLCanvasElement, texFormat: GPUTextureFormat): Promise<void>;

    public add(entity: Entity): Entity {
        this._entities.push(entity);
        return entity;
    }

    public remove(entity: Entity): void {
        this._entities = this._entities.filter(e => e.id !== entity.id);
    }

    public awake(): void {
        for (const entity of this._entities) {
            entity.callScriptsAwake();
        }
    }

    public start(): void {
        for (const entity of this._entities) {
            entity.callScriptsStart();
        }
    }

    public update(): void {
        for (const entity of this._entities) {
            entity.callScriptsUpdate();
        }
    }
}

export class TestScene extends Scene {
    public override async load(device: GPUDevice, canvas: HTMLCanvasElement, texFormat: GPUTextureFormat): Promise<void> {        
        // ASSETS ?? - this needs more work (an asset should load all it's things before rendering)
        // Textures
        const [opaqueShader, groundAlbedo, skyboxAlbedo] = await Promise.all([
            Shader.load(device, '../../assets/shaders/opaque.wgsl'),
            Texture.load(device, '../../assets/models/ground/textures/albedo.png'),
            Texture.load(device, '../../assets/models/skybox/textures/albedo.png'),
        ]);

        // Meshes
        const [groundVerts, groundIdxs] = await ObjLoader.load('../../assets/models/ground/source/plane.obj');
        const [skyboxVerts, skyboxIdxs] = await ObjLoader.load('../../assets/models/skybox/source/skybox.obj');

        // Materials
        const groundMaterial = new Material(device, opaqueShader, [groundAlbedo], texFormat, { blend: 'opaque', cullMode: 'back', depthWrite: true });
        const skyboxMaterial = new Material(device, opaqueShader, [skyboxAlbedo], texFormat, { blend: 'opaque', cullMode: 'back', depthWrite: false });

        // HIERARCHY ??
        const mainCamera = super.add(new Entity());
        const groundPlane = super.add(new Entity());
        const skybox = super.add(new Entity());
        const light = super.add(new Entity(new Vector3(0, 1, 0)));

        this.mainCamera = mainCamera.addComponent(new CameraComponent(canvas, Mathf.degToRad(60), 0.1, 1000));
        mainCamera.addComponent(new FPSController());
        skybox.addComponent(new MeshComponent(device, skyboxMaterial, skyboxVerts, skyboxIdxs));
        skybox.addComponent(new Skybox());
        groundPlane.addComponent(new MeshComponent(device, groundMaterial, groundVerts, groundIdxs));
        light.addComponent(new LightComponent());
    }
}
