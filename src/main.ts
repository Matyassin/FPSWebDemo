import { Renderer } from "./renderer.js";
import { Input } from "./input.js";
import { Time } from "./time.js";
import { Shader } from "./shader.js";
import { Texture } from "./texture.js";
import { Material } from "./material.js";
import { ObjLoader } from "./obj_loader.js";
import { Scene } from "./scene.js";
import { Entity } from "./entity.js";
import { CameraComponet } from "./components/camera.js";
import { MeshComponent } from "./components/mesh.js";
import { FPSController } from "./scripts/fps_controller.js";
import { Skybox } from "./scripts/skybox.js";

async function main(): Promise<void> {
    //-----SETUP-----
    const canvas = document.querySelector('canvas');
    if (!canvas) {
        alert("No canvas element found.");
        return;
    }

    if (!navigator.gpu) {
        alert("WebGPU is not supported in this browser.");
        return;
    }

    const context = canvas.getContext('webgpu');
    if (!context) {
        alert("Failed to get WebGPU context.");
        return;
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        alert("No GPU adapter found. Your GPU may not support WebGPU.");
        return;
    }

    const device = await adapter.requestDevice();
    if (!device) {
        alert("Failed to create GPU device.");
        return;
    }
    const textureFormat = navigator.gpu.getPreferredCanvasFormat();
    const fpsDisplay = document.getElementById('fps');

    //----- RENDERER ----- (maybe it stays here maybe scenes should have their own renderes)
    const renderer = new Renderer(device, canvas, context, textureFormat);

    //---- ASSET LOADING ----- (something better for global assets in the future like shaders, textures, materials, meshes...)
    const [opaqueShader, groundAlbedo, skyboxAlbedo] = await Promise.all([
        Shader.load(device, '../../assets/shaders/opaque.wgsl'),
        Texture.load(device, '../../assets/models/ground/textures/albedo.png'),
        Texture.load(device, '../../assets/models/skybox/textures/albedo.png'),
    ]);

    const [groundVerts, groundIdxs] = await ObjLoader.load('../../assets/models/ground/source/ground_plane.obj');
    const [skyboxVerts, skyboxIdxs] = await ObjLoader.load('../../assets/models/skybox/source/skybox_cube.obj');

    const groundMaterial = new Material(device, opaqueShader, [groundAlbedo], textureFormat, { blend: 'opaque', cullMode: 'back', depthWrite: true });
    const skyboxMaterial = new Material(device, opaqueShader, [skyboxAlbedo], textureFormat, { blend: 'opaque', cullMode: 'back', depthWrite: false });

    //----- SCENE ------
    const testScene = new Scene();
    const mainCamera = testScene.add(new Entity());
    const groundPlane = testScene.add(new Entity());
    const skybox = testScene.add(new Entity());

    mainCamera.addComponent(new CameraComponet(canvas, Math.PI / 3, 0.1, 1000));
    mainCamera.addComponent(new FPSController());
    skybox.addComponent(new MeshComponent(device, skyboxMaterial, skyboxVerts, skyboxIdxs));
    skybox.addComponent(new Skybox());
    groundPlane.addComponent(new MeshComponent(device, groundMaterial, groundVerts, groundIdxs));
    
    Input.init();

    testScene.awake();
    testScene.start();

    function gameLoop(timestamp: number): void {
        Time.update(timestamp);
        fpsDisplay!.textContent = `FPS: ${Math.round(1 / Time.deltaTime)}`;

        testScene.update();

        renderer.drawFrame(mainCamera.getComponent(CameraComponet)!, testScene.entites);
        Input.endFrame();

        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);
}

main();
