import { Renderer } from "./renderer.js";
import { Time } from "./time.js";
import { Entity } from "./entity.js";
import { Camera } from "./camera.js";
import { Shader } from "./shader.js";
import { Texture } from "./texture.js";
import { Material } from "./material.js";
import { MeshComponent } from "./mesh.js";
import { Vector2 } from "./utils.js";
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
    const cubeVerts = new Float32Array([
        // front
        -0.5, -0.5, 0.5, 0, 1,
        0.5, -0.5, 0.5, 1, 1,
        0.5, 0.5, 0.5, 1, 0,
        -0.5, 0.5, 0.5, 0, 0,
        // back
        0.5, -0.5, -0.5, 0, 1,
        -0.5, -0.5, -0.5, 1, 1,
        -0.5, 0.5, -0.5, 1, 0,
        0.5, 0.5, -0.5, 0, 0,
        // left
        -0.5, -0.5, -0.5, 0, 1,
        -0.5, -0.5, 0.5, 1, 1,
        -0.5, 0.5, 0.5, 1, 0,
        -0.5, 0.5, -0.5, 0, 0,
        // right
        0.5, -0.5, 0.5, 0, 1,
        0.5, -0.5, -0.5, 1, 1,
        0.5, 0.5, -0.5, 1, 0,
        0.5, 0.5, 0.5, 0, 0,
        // top
        -0.5, 0.5, 0.5, 0, 1,
        0.5, 0.5, 0.5, 1, 1,
        0.5, 0.5, -0.5, 1, 0,
        -0.5, 0.5, -0.5, 0, 0,
        // bottom
        -0.5, -0.5, -0.5, 0, 1,
        0.5, -0.5, -0.5, 1, 1,
        0.5, -0.5, 0.5, 1, 0,
        -0.5, -0.5, 0.5, 0, 0,
    ]);
    // 6 faces × 2 triangles × 3 indices = 36
    const cubeIdxs = new Uint16Array([
        0, 1, 2, 0, 2, 3, // front
        4, 5, 6, 4, 6, 7, // back
        8, 9, 10, 8, 10, 11, // left
        12, 13, 14, 12, 14, 15, // right
        16, 17, 18, 16, 18, 19, // top
        20, 21, 22, 20, 22, 23, // bottom
    ]);
    //const [cubeVerts, cubeIdxs] = await ObjLoader.load('../../assets/models/cube/source/cube.obj');
    rotatingCube.addComponent(new MeshComponent(device, material, cubeVerts, cubeIdxs));
    camera.lookAt([0, 1.5, 3], [0, 0, 0], [0, 1, 0]); // pos[x=0, y=1.5up, z=3back], target[looking at pos[0,0,0]], up[no tilt]
    function render(timestamp) {
        Time.update(timestamp);
        const rotSpeed = new Vector2(0.3, 0.8);
        rotatingCube.transform.rotation.x = Time.time * rotSpeed.x;
        rotatingCube.transform.rotation.y = Time.time * rotSpeed.y;
        renderer.drawFrame(camera, [rotatingCube]);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}
main();
