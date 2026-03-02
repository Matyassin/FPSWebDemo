import { ScriptComponent } from "./components/script.js";
import { TransformComponent } from "./components/transform.js";
export class Entity {
    id;
    transform;
    components = new Array(1);
    static nextId = 0;
    constructor() {
        this.id = Entity.nextId++;
        this.transform = new TransformComponent();
    }
    callScriptsStart() {
        for (const component of this.components) {
            if (component instanceof ScriptComponent) {
                component.start?.();
            }
        }
    }
    callScriptsUpdate() {
        for (const component of this.components) {
            if (component instanceof ScriptComponent) {
                component.update?.();
            }
        }
    }
    addComponent(component) {
        component.entity = this;
        this.components.push(component);
        return component;
    }
    getComponent(type) {
        return this.components.find(c => c instanceof type);
    }
    removeComponent(type) {
        this.components = this.components.filter(c => !(c instanceof type));
    }
}
