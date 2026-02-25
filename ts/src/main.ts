import { Renderer } from "./renderer.js";

async function main() : Promise<void> {
    const canvas: HTMLCanvasElement | null = document.querySelector('canvas');
    const context: GPUCanvasContext | null | undefined = canvas?.getContext('webgpu');
    const textureFormat: GPUTextureFormat = navigator.gpu.getPreferredCanvasFormat();
    const adapter: GPUAdapter | null = await navigator.gpu?.requestAdapter();
    const device: GPUDevice | undefined | null = await adapter?.requestDevice();

    if (!canvas || !context || !device) {
        alert("Szopás");
        return;
    }

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const renderer = new Renderer(device, context, textureFormat);
    await renderer.setup();
    renderer.render();
}

//main();
