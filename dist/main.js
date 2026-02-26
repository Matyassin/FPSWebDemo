import { Renderer } from "./renderer.js";
import { Time } from "./time.js";
import { Entity } from "./entity.js";
import { Camera } from "./camera.js";
import { Shader } from "./shader.js";
import { Texture } from "./texture.js";
import { Material } from "./material.js";
import { MeshComponent } from "./mesh.js";
import { ObjLoader } from "./obj_loader.js";
async function main() {
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
    //----"ASSET LOADING"----- (something better for global assets in the future like shaders, textures, materials, meshes...)
    const [opaqueShader, cubeAlbedo] = await Promise.all([
        Shader.load(device, '../../assets/shaders/opaque.wgsl'),
        Texture.load(device, '../../assets/models/cube/textures/albedo.png'),
    ]);
    const material = new Material(device, opaqueShader, cubeAlbedo, textureFormat, { blend: 'opaque', cullMode: 'back', depthWrite: true });
    //----"SCENE"-----
    const renderer = new Renderer(device, canvas, context, textureFormat);
    const camera = new Camera(canvas);
    const rotatingCube = new Entity();
    const [cubeVerts, cubeIdxs] = await ObjLoader.load('../../assets/models/cube/source/cube.obj');
    rotatingCube.addComponent(new MeshComponent(device, material, cubeVerts, cubeIdxs));
    camera.lookAt([0, 1.5, 3], [0, 0, 0], [0, 1, 0]); // pos[x=0, y=1.5up, z=3back], target[looking at pos[0,0,0]], up[no tilt]
    function renderLoop(timestamp) {
        Time.update(timestamp);
        fpsDisplay.textContent = `FPS: ${Math.round(1 / Time.deltaTime)}`;
        rotatingCube.transform.rotation.x = Time.time * 0.3;
        rotatingCube.transform.rotation.y = Time.time * 0.8;
        renderer.drawFrame(camera, [rotatingCube]);
        requestAnimationFrame(renderLoop);
    }
    requestAnimationFrame(renderLoop);
}
main();
