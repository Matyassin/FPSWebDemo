import { Component } from "../component.js";
import { Color } from "../utils.js";

export enum LightType {
    Point       = 0,
    Spot        = 1,
    Directional = 2
}

export class LightComponent extends Component {
    public lightType: LightType;
    public intensity: number;
    public range: number;
    public color: Color;

    public constructor(type: LightType = LightType.Point, intensity: number = 1, range: number = 10, color: Color = Color.white) {
        super();

        this.lightType = type;
        this.intensity = intensity;
        this.range = range;
        this.color = color;
    }
}
