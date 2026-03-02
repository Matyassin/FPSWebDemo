import { Component } from "../component.js";

export abstract class ScriptComponent extends Component {
    public start?(): void;
    public update?(): void;
}
