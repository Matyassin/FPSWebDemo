import { Transform } from "./transform.js";
export class Component {
    entity;
}
export class Entity {
    id;
    transform;
    components = new Array(1);
    static nextId = 0;
    constructor() {
        this.id = Entity.nextId++;
        this.transform = new Transform();
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
