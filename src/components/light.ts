import { Component } from "../component.js";
import { Color } from "../utils.js";

export enum LightType {
    Point       = 0,
    Spot        = 1,
    Directional = 2
}

export class LightComponent extends Component {
    public readonly lightType: LightType;
    public intensity: number;
    public range: number;
    public color: Color;
    public innerSpotAngle: number;
    public outerSpotAngle: number;

    public constructor(type: LightType, intensity: number = 1, range: number = 10, color: Color = Color.white, innerSpotAngle: number = 15, outerSpotAngle: number = 25) {
        super();

        this.lightType = type;
        this.intensity = intensity;
        this.range = range;
        this.color = color;
        this.innerSpotAngle = innerSpotAngle;
        this.outerSpotAngle = outerSpotAngle;
    }
}
