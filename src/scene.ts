import { Color, Mathf, Vector2, Vector3 } from "./utils.js";
import { Shader } from "./shader.js";
import { Texture } from "./texture.js";
import { ObjLoader } from "./obj_loader.js";
import { Entity } from "./entity.js";
import { LitMaterial, UnlitMaterial } from "./material.js";
import { CameraComponent } from "./components/camera.js";
import { MeshComponent } from "./components/mesh.js";
import { LightComponent, LightType } from "./components/light.js";
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
        // ASSETS (maybe assets shouldn't be tied to a given scene?)
        // Shaders
        const [opaqueShader, litShader] = await Promise.all([
            Shader.load(device, '../../assets/shaders/opaque.wgsl'),
            Shader.load(device, '../../assets/shaders/lit.wgsl'),
        ]);


        // Textures
        const skyboxAlbedo = await
            Texture.load(device, '../../assets/models/skybox/textures/stars.png', 'rgba8unorm-srgb');

        const [ceilingAlbedo, ceilingNormal, ceilingMetallic, ceilingRoughnessm, ceilingAo] = await Promise.all([
            Texture.load(device, '../../assets/models/ceiling/textures/albedo.png', 'rgba8unorm-srgb'),
            Texture.load(device, '../../assets/models/ceiling/textures/normal.png'),
            Texture.load(device, '../../assets/models/ceiling/textures/metallic.png'),
            Texture.load(device, '../../assets/models/ceiling/textures/roughness.png'),
            Texture.load(device, '../../assets/models/ceiling/textures/ao.png'),
        ]);

        const [wallAAlbedo, wallANormal, wallAMetallic, wallARoughness, wallAAo] = await Promise.all([
            Texture.load(device, '../../assets/models/walls/wallA/textures/albedo.png', 'rgba8unorm-srgb'),
            Texture.load(device, '../../assets/models/walls/wallA/textures/normal.png'),
            Texture.load(device, '../../assets/models/walls/wallA/textures/metallic.png'),
            Texture.load(device, '../../assets/models/walls/wallA/textures/roughness.png'),
            Texture.load(device, '../../assets/models/walls/wallA/textures/ao.png'),
        ]);
        
        const [wallBAlbedo, wallBNormal, wallBMetallic, wallBRoughness, wallBAo] = await Promise.all([
            Texture.load(device, '../../assets/models/walls/wallB/textures/albedo.png'),
            Texture.load(device, '../../assets/models/walls/wallB/textures/normal.png'),
            Texture.load(device, '../../assets/models/walls/wallB/textures/metallic.png'),
            Texture.load(device, '../../assets/models/walls/wallB/textures/roughness.png'),
            Texture.load(device, '../../assets/models/walls/wallB/textures/ao.png'),
        ]);
        
        const [windowAlbedo, windowNormal, windowMetallic, windowRoughness, windowAo] = await Promise.all([
            Texture.load(device, '../../assets/models/window/textures/albedo.png'),
            Texture.load(device, '../../assets/models/window/textures/normal.png'),
            Texture.load(device, '../../assets/models/window/textures/metallic.png'),
            Texture.load(device, '../../assets/models/window/textures/roughness.png'),
            Texture.load(device, '../../assets/models/window/textures/ao.png'),
        ]);
        
        const [doorFrameAlbedo, doorFrameNormal, doorFrameMetallic, doorFrameRoughness, doorFrameAo] = await Promise.all([
            Texture.load(device, '../../assets/models/door_frame/textures/albedo.png'),
            Texture.load(device, '../../assets/models/door_frame/textures/normal.png'),
            Texture.load(device, '../../assets/models/door_frame/textures/metallic.png'),
            Texture.load(device, '../../assets/models/door_frame/textures/roughness.png'),
            Texture.load(device, '../../assets/models/door_frame/textures/ao.png'),
        ]);
        
        const [doorAlbedo, doorNormal, doorMetallic, doorRoughness, doorAo] = await Promise.all([
            Texture.load(device, '../../assets/models/door/textures/albedo.png'),
            Texture.load(device, '../../assets/models/door/textures/normal.png'),
            Texture.load(device, '../../assets/models/door/textures/metallic.png'),
            Texture.load(device, '../../assets/models/door/textures/roughness.png'),
            Texture.load(device, '../../assets/models/door/textures/ao.png'),
        ]);
        
        const [groundAlbedo, groundNormal, groundMetallic, groundRoughness, groundAo] = await Promise.all([
            Texture.load(device, '../../assets/models/ground/textures/albedo.png', 'rgba8unorm-srgb'),
            Texture.load(device, '../../assets/models/ground/textures/normal.png'),
            Texture.load(device, '../../assets/models/ground/textures/metallic.png'),
            Texture.load(device, '../../assets/models/ground/textures/roughness.png'),
            Texture.load(device, '../../assets/models/ground/textures/ao.png'),
        ]);

        const [bucketAlbedo, bucketNormal, bucketMetallic, bucketRoughness, bucketAo] = await Promise.all([
            Texture.load(device, '../../assets/models/bucket/textures/albedo.png', 'rgba8unorm-srgb'),
            Texture.load(device, '../../assets/models/bucket/textures/normal.png'),
            Texture.load(device, '../../assets/models/bucket/textures/metallic.png'),
            Texture.load(device, '../../assets/models/bucket/textures/roughness.png'),
            Texture.load(device, '../../assets/models/bucket/textures/ao.png'),
        ]);

        const [tableAlbedo, tableNormal, tableMetallic, tableRoughness] = await Promise.all([
            Texture.load(device, '../../assets/models/table/textures/albedo.png', 'rgba8unorm-srgb'),
            Texture.load(device, '../../assets/models/table/textures/normal.png'),
            Texture.load(device, '../../assets/models/table/textures/metallic.png'),
            Texture.load(device, '../../assets/models/table/textures/roughness.png'),
        ]);

        const [chairAlbedo, chairNormal, chairMetallic, chairRoughness, chairAo] = await Promise.all([
            Texture.load(device, '../../assets/models/chair/textures/albedo.png', 'rgba8unorm-srgb'),
            Texture.load(device, '../../assets/models/chair/textures/normal.png'),
            Texture.load(device, '../../assets/models/chair/textures/metallic.png'),
            Texture.load(device, '../../assets/models/chair/textures/roughness.png'),
            Texture.load(device, '../../assets/models/chair/textures/ao.png'),
        ]);

        const [bookAAlbedo, bookANormal, bookAMetallic, bookARoughness, bookAAo] = await Promise.all([
            Texture.load(device, '../../assets/models/books/bookA/textures/albedo.png', 'rgba8unorm-srgb'),
            Texture.load(device, '../../assets/models/books/bookA/textures/normal.png'),
            Texture.load(device, '../../assets/models/books/bookA/textures/metallic.png'),
            Texture.load(device, '../../assets/models/books/bookA/textures/roughness.png'),
            Texture.load(device, '../../assets/models/books/bookA/textures/ao.png'),
        ]);

        const [bookBAlbedo, bookBNormal, bookBMetallic, bookBRoughness, bookBAo] = await Promise.all([
            Texture.load(device, '../../assets/models/books/bookB/textures/albedo.png', 'rgba8unorm-srgb'),
            Texture.load(device, '../../assets/models/books/bookB/textures/normal.png'),
            Texture.load(device, '../../assets/models/books/bookB/textures/metallic.png'),
            Texture.load(device, '../../assets/models/books/bookB/textures/roughness.png'),
            Texture.load(device, '../../assets/models/books/bookB/textures/ao.png'),
        ]);

        const [paintingAlbedo, paintingNormal, paintingMetallic] = await Promise.all([
            Texture.load(device, '../../assets/models/painting/textures/albedo.png', 'rgba8unorm-srgb'),
            Texture.load(device, '../../assets/models/painting/textures/normal.png'),
            Texture.load(device, '../../assets/models/painting/textures/metallic.png'),
        ]);

        const [lampAlbedo, lampNormal, lampMetallic, lampRoughness, lampAo] = await Promise.all([
            Texture.load(device, '../../assets/models/lamp/textures/albedo.png', 'rgba8unorm-srgb'),
            Texture.load(device, '../../assets/models/lamp/textures/normal.png'),
            Texture.load(device, '../../assets/models/lamp/textures/metallic.png'),
            Texture.load(device, '../../assets/models/lamp/textures/roughness.png'),
            Texture.load(device, '../../assets/models/lamp/textures/ao.png'),
        ]);


        // Meshes
        const [skyboxVerts, skyboxIdxs]       = await ObjLoader.load('../../assets/models/skybox/source/skybox_sphere.obj');
        const [ceilingVerts, ceilingIdxs]     = await ObjLoader.load('../../assets/models/ceiling/source/ceiling.obj');
        const [wallVerts, wallIdxs]           = await ObjLoader.load('../../assets/models/walls/source/wallA.obj');
        const [windowVerts, windowIdxs]       = await ObjLoader.load('../../assets/models/window/source/window.obj');
        const [doorFrameVerts, doorFrameIdxs] = await ObjLoader.load('../../assets/models/door_frame/source/door_frame.obj');
        const [doorVerts, doorIdxs]           = await ObjLoader.load('../../assets/models/door/source/door.obj');
        const [groundVerts, groundIdxs]       = await ObjLoader.load('../../assets/models/ground/source/plane.obj');
        const [bucketVerts, bucketIdxs]       = await ObjLoader.load('../../assets/models/bucket/source/bucket.obj');
        const [tableVerts, tableIdxs]         = await ObjLoader.load('../../assets/models/table/source/table.obj');
        const [chairVerts, chairIdxs]         = await ObjLoader.load('../../assets/models/chair/source/chair.obj');
        const [bookVerts, bookIdxs]           = await ObjLoader.load('../../assets/models/books/source/book.obj');
        const [paintingVerts, paintingIdxs]   = await ObjLoader.load('../../assets/models/painting/source/painting.obj');
        const [lampVerts, lampIdxs]           = await ObjLoader.load('../../assets/models/lamp/source/lamp.obj');


        // Materials
        const skyboxMaterial    = new UnlitMaterial(device, opaqueShader, [skyboxAlbedo], texFormat, { blend: 'opaque', cullMode: 'back', depthWrite: false });
        const wallMaterialA     = new LitMaterial(device, litShader, [wallAAlbedo, wallANormal], texFormat);
        const wallMaterialB     = new LitMaterial(device, litShader, [wallBAlbedo, wallBNormal], texFormat);
        const windowMaterial    = new LitMaterial(device, litShader, [windowAlbedo, windowNormal], texFormat);
        const doorFrameMaterial = new LitMaterial(device, litShader, [doorFrameAlbedo, doorFrameNormal], texFormat);
        const doorMaterial      = new LitMaterial(device, litShader, [doorAlbedo, doorNormal], texFormat);
        const ceilingMaterial   = new LitMaterial(device, litShader, [ceilingAlbedo, ceilingNormal], texFormat);
        const groundMaterial    = new LitMaterial(device, litShader, [groundAlbedo, groundNormal], texFormat, { blend: 'opaque', uvTiling: new Vector2(5, 5) });
        const bucketMaterial    = new LitMaterial(device, litShader, [bucketAlbedo, bucketNormal], texFormat);
        const tableMaterial     = new LitMaterial(device, litShader, [tableAlbedo, tableNormal], texFormat);
        const chairMaterial     = new LitMaterial(device, litShader, [chairAlbedo, chairNormal], texFormat);
        const bookAMaterial     = new LitMaterial(device, litShader, [bookAAlbedo, bookANormal], texFormat);
        const bookBMaterial     = new LitMaterial(device, litShader, [bookBAlbedo, bookBNormal], texFormat);
        const paintingMaterial  = new LitMaterial(device, litShader, [paintingAlbedo, paintingNormal], texFormat);
        const lampMaterial      = new LitMaterial(device, litShader, [lampAlbedo, lampNormal], texFormat);


        // --------- HIERARCHY --------- (this is gross, needs a GUI)
        this.mainCamera = super.add(new Entity())
            .withComponent(new FPSController())
            .addComponent(new CameraComponent(canvas, Mathf.degToRad(60), 0.1, 1000));

        const skybox = super.add(new Entity())
            .withComponent(new MeshComponent(device, skyboxMaterial, skyboxVerts, skyboxIdxs))
            .withComponent(new Skybox());


        // ----LIGHTING----
        const lampLight1 = super.add(new Entity(new Vector3(-3.7, 1.25, 2)))
            .withComponent(new LightComponent(LightType.Point, 2, 10, Color.fromHex("#FFCEAF")));

        const lampLight2 = super.add(new Entity(new Vector3(3.3, 1.25, 3.3)))
            .withComponent(new LightComponent(LightType.Point, 2, 10, Color.fromHex("#FFCEAF")));

        const windowLight = super.add(new Entity(new Vector3(4.8, 1.5, 0)))
            .withComponent(new LightComponent(LightType.Point, 1, 10, Color.fromHex("#FFCEAF")));


        // ---ENVIRONMENT---
        // Ceiling
        const ceiling1 = super.add(new Entity(new Vector3(3.9, 0.2, 0)))
            .withComponent(new MeshComponent(device, ceilingMaterial, ceilingVerts, ceilingIdxs));
        const ceiling2 = super.add(new Entity(new Vector3(0, 0.2, 0)))
            .withComponent(new MeshComponent(device, ceilingMaterial, ceilingVerts, ceilingIdxs));
        const ceiling3 = super.add(new Entity(new Vector3(-3.9, 0.2, 0)))
            .withComponent(new MeshComponent(device, ceilingMaterial, ceilingVerts, ceilingIdxs));


        // Walls
        const wallA1 = super.add(new Entity(new Vector3(-2.957, 0, 4), Mathf.eulerDeg(0, 180, 0)))
            .withComponent(new MeshComponent(device, wallMaterialA, wallVerts, wallIdxs));

        const doorFrame = super.add(new Entity(new Vector3(0, 0, 4), Mathf.eulerDeg(0, 180, 0)))
            .withComponent(new MeshComponent(device, doorFrameMaterial, doorFrameVerts, doorFrameIdxs));    

        const wallA3 = super.add(new Entity(new Vector3(2.957, 0, 4), Mathf.eulerDeg(0, 180, 0)))
            .withComponent(new MeshComponent(device, wallMaterialA, wallVerts, wallIdxs));
        const wallA4 = super.add(new Entity(new Vector3(-2.97, 0, -4)))
            .withComponent(new MeshComponent(device, wallMaterialA, wallVerts, wallIdxs));
        const wallA5 = super.add(new Entity(new Vector3(0, 0, -4)))
            .withComponent(new MeshComponent(device, wallMaterialA, wallVerts, wallIdxs));
        const wallA6 = super.add(new Entity(new Vector3(2.97, 0, -4)))
            .withComponent(new MeshComponent(device, wallMaterialA, wallVerts, wallIdxs));
        const wallA7 = super.add(new Entity(new Vector3(4.44, 0, 2.97), Mathf.eulerDeg(0, 270, 0)))
            .withComponent(new MeshComponent(device, wallMaterialA, wallVerts, wallIdxs));

        const window = super.add(new Entity(new Vector3(4.44, 0, 0), Mathf.eulerDeg(0, 270, 0)))
            .withComponent(new MeshComponent(device, windowMaterial, windowVerts, windowIdxs));

        const wallA9 = super.add(new Entity(new Vector3(4.44, 0, -2.97), Mathf.eulerDeg(0, 270, 0)))
            .withComponent(new MeshComponent(device, wallMaterialA, wallVerts, wallIdxs));
        const wallA10 = super.add(new Entity(new Vector3(-4.44, 0, -2.97), Mathf.eulerDeg(0, 90, 0)))
            .withComponent(new MeshComponent(device, wallMaterialA, wallVerts, wallIdxs));
        const wallA11 = super.add(new Entity(new Vector3(-4.44, 0, 0), Mathf.eulerDeg(0, 90, 0)))
            .withComponent(new MeshComponent(device, wallMaterialA, wallVerts, wallIdxs));
        const wallA12 = super.add(new Entity(new Vector3(-4.44, 0, 2.97), Mathf.eulerDeg(0, 90, 0)))
            .withComponent(new MeshComponent(device, wallMaterialA, wallVerts, wallIdxs));

        const wallB1 = super.add(new Entity(new Vector3(-2.97, 3, 4), Mathf.eulerDeg(45, 180, 0)))
            .withComponent(new MeshComponent(device, wallMaterialB, wallVerts, wallIdxs));
        const wallB2 = super.add(new Entity(new Vector3(0, 3, 4), Mathf.eulerDeg(45, 180, 0)))
            .withComponent(new MeshComponent(device, wallMaterialB, wallVerts, wallIdxs));
        const wallB3 = super.add(new Entity(new Vector3(2.97, 3, 4), Mathf.eulerDeg(45, 180, 0)))
            .withComponent(new MeshComponent(device, wallMaterialB, wallVerts, wallIdxs));
        const wallB4 = super.add(new Entity(new Vector3(-2.97, 3, -4), Mathf.eulerDeg(45, 0, 0)))
            .withComponent(new MeshComponent(device, wallMaterialB, wallVerts, wallIdxs));
        const wallB5 = super.add(new Entity(new Vector3(0, 3, -4), Mathf.eulerDeg(45, 0, 0)))
            .withComponent(new MeshComponent(device, wallMaterialB, wallVerts, wallIdxs));
        const wallB6 = super.add(new Entity(new Vector3(2.97, 3, -4), Mathf.eulerDeg(45, 0, 0)))
            .withComponent(new MeshComponent(device, wallMaterialB, wallVerts, wallIdxs));
        const wallB7 = super.add(new Entity(new Vector3(4.44, 2.95, 2.97), Mathf.eulerDeg(0, 270, 0)))
            .withComponent(new MeshComponent(device, wallMaterialB, wallVerts, wallIdxs));
        const wallB8 = super.add(new Entity(new Vector3(4.44, 2.95, 0), Mathf.eulerDeg(0, 270, 0)))
            .withComponent(new MeshComponent(device, wallMaterialB, wallVerts, wallIdxs));
        const wallB9 = super.add(new Entity(new Vector3(4.44, 2.95, -2.97), Mathf.eulerDeg(0, 270, 0)))
            .withComponent(new MeshComponent(device, wallMaterialB, wallVerts, wallIdxs));
        const wallB10 = super.add(new Entity(new Vector3(-4.44, 2.95, -2.97), Mathf.eulerDeg(0, 90, 0)))
            .withComponent(new MeshComponent(device, wallMaterialB, wallVerts, wallIdxs));
        const wallB11 = super.add(new Entity(new Vector3(-4.44, 2.95, 0), Mathf.eulerDeg(0, 90, 0)))
            .withComponent(new MeshComponent(device, wallMaterialB, wallVerts, wallIdxs));
        const wallB12 = super.add(new Entity(new Vector3(-4.44, 2.95, 2.97), Mathf.eulerDeg(0, 90, 0)))
            .withComponent(new MeshComponent(device, wallMaterialB, wallVerts, wallIdxs));

        // Door
        const door = super.add(new Entity(new Vector3(0, 0, 4)))
            .withComponent(new MeshComponent(device, doorMaterial, doorVerts, doorIdxs));

        // Ground
        const groundPlane = super.add(new Entity())
            .withComponent(new MeshComponent(device, groundMaterial, groundVerts, groundIdxs));

        // Props
        const table1 = super.add(new Entity(new Vector3(3.3, 0, 3.3)))
            .withComponent(new MeshComponent(device, tableMaterial, tableVerts, tableIdxs));

        const table2 = super.add(new Entity(new Vector3(-3.7, 0, 2.7), Mathf.eulerDeg(0, 90, 0)))
            .withComponent(new MeshComponent(device, tableMaterial, tableVerts, tableIdxs));

        const chair = super.add(new Entity(new Vector3(3.3, 0, 2.8), Mathf.eulerDeg(0, 180, 0)))
            .withComponent(new MeshComponent(device, chairMaterial, chairVerts, chairIdxs));

        const bookA = super.add(new Entity(new Vector3(3, 1.04, 3.3), Mathf.eulerDeg(0, 290, 0)))
            .withComponent(new MeshComponent(device, bookAMaterial, bookVerts, bookIdxs));
        const bookB = super.add(new Entity(new Vector3(3, 1.08, 3.3), Mathf.eulerDeg(0, 300, 0)))
            .withComponent(new MeshComponent(device, bookBMaterial, bookVerts, bookIdxs));
        
        const bucket = super.add(new Entity(new Vector3(2, 0, 3.3)))
            .withComponent(new MeshComponent(device, bucketMaterial, bucketVerts, bucketIdxs));

        const painting = super.add(new Entity(new Vector3(0, 2, -3.98), Mathf.eulerDeg(0, 180, 0)))
            .withComponent(new MeshComponent(device, paintingMaterial, paintingVerts, paintingIdxs));

        const lamp1 = super.add(new Entity(new Vector3(-3.7, 1, 2)))
            .withComponent(new MeshComponent(device, lampMaterial, lampVerts, lampIdxs));

        const lamp2 = super.add(new Entity(new Vector3(3.3, 1, 3.3)))
            .withComponent(new MeshComponent(device, lampMaterial, lampVerts, lampIdxs));
    }
}
