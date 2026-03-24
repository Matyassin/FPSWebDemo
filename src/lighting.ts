import { Entity } from "./entity";
import { Color, Vector3 } from "./utils";
import { LightComponent } from "./components/light";

// Each Light in the buffer (48 bytes / 12 floats):
// position  vec3f + kind u32    = 16 bytes
// color     vec3f + intensity f32 = 16 bytes  
// direction vec3f + range f32   = 16 bytes

const MAX_LIGHTS: number = 8;
const LIGHT_FLOATS = 12; // floats per light
const HEADER_FLOATS = 8; // ambientColor(3) + ambientIntensity(1) + lightCount(1) + pad(3)
const BUFFER_SIZE  = (HEADER_FLOATS + MAX_LIGHTS * LIGHT_FLOATS) * 4; // bytes

export class Lighting {
    public ambientColor: Color;
    public ambientIntensity: number;

    private device: GPUDevice;
    private _lightsBuffer: GPUBuffer;
    private _cameraBuffer: GPUBuffer;

    public constructor(device: GPUDevice, ambientCol: Color = Color.white, ambientIntens: number = 0.03) {
        this.ambientColor = ambientCol;
        this.ambientIntensity = ambientIntens;
        this.device = device;

        this._lightsBuffer = device.createBuffer({
            size: BUFFER_SIZE,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        this._cameraBuffer = device.createBuffer({
            size: 16,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
    }

    public get lightsBuffer(): GPUBuffer { return this._lightsBuffer; }
    public get cameraBuffer(): GPUBuffer { return this._cameraBuffer; }

    public update(entities: Entity[], cameraPos: Vector3): void {
        const data = new Float32Array(HEADER_FLOATS + MAX_LIGHTS * LIGHT_FLOATS);
        const camData = new Float32Array([cameraPos.x, cameraPos.y, cameraPos.z, 0]);
        
        let offset: number = 0;

        // ambient color + intensity
        data[offset++] = this.ambientColor.r;
        data[offset++] = this.ambientColor.g;
        data[offset++] = this.ambientColor.b;
        data[offset++] = this.ambientIntensity;

        // lightCount placeholder — fill after
        const lightCountOffset: number = offset++;
        data[offset++] = 0; // padding
        data[offset++] = 0; // padding
        data[offset++] = 0; // padding

        // collect lights
        let lightCount: number = 0;
        for (const entity of entities) {
            if (lightCount >= MAX_LIGHTS)
                break;

            const light = entity.getComponent(LightComponent);
            if (!light)
                continue;

            const pos: Vector3 = entity.transform.position;
            const dir: Vector3 = entity.transform.forward;

            // position + kind
            data[offset++] = pos.x;
            data[offset++] = pos.y;
            data[offset++] = pos.z;
            data[offset++] = light.lightType;

            // color + intensity
            data[offset++] = light.color.r;
            data[offset++] = light.color.g;
            data[offset++] = light.color.b;
            data[offset++] = light.intensity;

            // dir + range
            data[offset++] = dir.x;
            data[offset++] = dir.y;
            data[offset++] = dir.z;
            data[offset++] = light.range;

            lightCount++;
        }

        data[lightCountOffset] = lightCount;

        this.device.queue.writeBuffer(this._cameraBuffer, 0, camData.buffer);
        this.device.queue.writeBuffer(this._lightsBuffer, 0, data.buffer);
    }
}
