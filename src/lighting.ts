import { LightComponent } from "./components/light";
import { Entity } from "./entity";

const MAX_LIGHTS: number = 10;
const FLOATS_PER_LIGHT: number = 12;

export class Lighting {
    public buffer: GPUBuffer;
    private data: Float32Array;

    public constructor(device: GPUDevice) {
        // 1 float for lightCount + 3 floats padding + (lights * 12 floats)
        const size = (4 + MAX_LIGHTS * FLOATS_PER_LIGHT) * 4;
        this.buffer = device.createBuffer({
            size: size,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this.data = new Float32Array(4 + MAX_LIGHTS * FLOATS_PER_LIGHT);
    }

    public update(device: GPUDevice, entities: Entity[]): void {
        this.data.fill(0);

        // 1. Find all lights in the scene
        const lightEntities = entities.filter(e => e.getComponent(LightComponent) !== undefined);
        const count = Math.min(lightEntities.length, MAX_LIGHTS);

        // 2. Pack Header (Light Count) data[1,2,3] are padding
        this.data[0] = count; 

        for (let i = 0; i < count; ++i) {
            const entity = lightEntities[i];
            const light = entity.getComponent(LightComponent)!;
            const pos = entity.transform.position;
            const dir = entity.transform.forward; // For directional/spot lights
            const offset = 4 + (i * FLOATS_PER_LIGHT);

            // Group 1: Pos + Type
            this.data[offset + 0] = pos.x;
            this.data[offset + 1] = pos.y;
            this.data[offset + 2] = pos.z;
            this.data[offset + 3] = light.lightType;

            // Group 2: Color + Intensity
            this.data[offset + 4] = light.color.r;
            this.data[offset + 5] = light.color.g;
            this.data[offset + 6] = light.color.b;
            this.data[offset + 7] = light.intensity;

            // Group 3: Direction + Range
            this.data[offset + 8] = dir.x;
            this.data[offset + 9] = dir.y;
            this.data[offset + 10] = dir.z;
            this.data[offset + 11] = light.range;
        }

        device.queue.writeBuffer(this.buffer, 0, this.data);
    }
}
