import { Renderer } from "./renderer.js";
import { Input } from "./input.js";
import { Time } from "./time.js";
import { Vector3 } from "./utils.js";
import { Shader } from "./shader.js";
import { Texture } from "./texture.js";
import { Material } from "./material.js";
import { ObjLoader } from "./obj_loader.js";
import { Scene } from "./scene.js";
import { Entity } from "./entity.js";
import { CameraComponet } from "./components/camera.js";
import { MeshComponent } from "./components/mesh.js";
import { FPSController } from "./scripts/fps_controller.js";
import { RotatingCube } from "./scripts/rotating_cube.js";

async function main() : Promise<void> {
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
    const [opaqueShader, cubeAlbedo] = await Promise.all([
        Shader.load(device, '../../assets/shaders/opaque.wgsl'),
        Texture.load(device, '../../assets/models/cube/textures/albedo.png'),
    ]);

    const [cubeVerts, cubeIdxs] = await ObjLoader.load('../../assets/models/cube/source/cube.obj');
    const material = new Material(device, opaqueShader, cubeAlbedo, textureFormat, { blend: 'opaque', cullMode: 'back', depthWrite: true });

    //----- SCENE ------
    const testScene = new Scene();
    const mainCamera = testScene.add(new Entity());
    const rotatingCube = testScene.add(new Entity());

    mainCamera.transform.position = new Vector3(0, 1.5, 0);
    rotatingCube.transform.position = new Vector3(0, 0, 3);

    rotatingCube.addComponent(new MeshComponent(device, material, cubeVerts, cubeIdxs));
    rotatingCube.addComponent(new RotatingCube());
    mainCamera.addComponent(new CameraComponet(canvas, Math.PI / 3, 0.1, 100));
    mainCamera.addComponent(new FPSController());
    
    Input.init();

    testScene.start();

    function gameLoop(timestamp: number): void {
        Time.update(timestamp);
        fpsDisplay!.textContent = `FPS: ${Math.round(1 / Time.deltaTime)}`;

        testScene.update();

        renderer.drawFrame(mainCamera.getComponent(CameraComponet)!, testScene.getEntites());
        Input.endFrame();

        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);
}

main();
