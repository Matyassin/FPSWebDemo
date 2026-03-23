import { Renderer } from "./renderer.js";
import { Input } from "./input.js";
import { Time } from "./time.js";
import { TestScene } from "./scene.js";

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

    const textureFormat= navigator.gpu.getPreferredCanvasFormat();
    const fpsDisplay = document.getElementById('fps');

    const renderer = new Renderer(device, canvas, context, textureFormat);
    const testScene = new TestScene();

    await testScene.load(device, canvas, textureFormat);

    Input.init();

    testScene.awake();
    testScene.start();

    function gameLoop(timestamp: number): void {
        fpsDisplay!.textContent = `FPS: ${Math.round(1 / Time.deltaTime)}`;

        testScene.update();
        renderer.drawFrame(testScene.mainCamera!, testScene.entites);
        
        Input.endFrame();
        Time.update(timestamp);

        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);
}

main();
