import { Component } from "../component.js";

export abstract class ScriptComponent extends Component {
    public awake?(): void;
    public start?(): void;
    public update?(): void;
}
