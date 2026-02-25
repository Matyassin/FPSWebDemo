import { Renderer } from "./renderer.js";
async function main() {
    const canvas = document.querySelector('canvas');
    const context = canvas?.getContext('webgpu');
    const textureFormat = navigator.gpu.getPreferredCanvasFormat();
    const adapter = await navigator.gpu?.requestAdapter();
    const device = await adapter?.requestDevice();
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
