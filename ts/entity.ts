import { Component } from "./component.js";
import { ScriptComponent } from "./components/script.js";
import { TransformComponent } from "./components/transform.js";

export class Entity {
    public readonly id: number;
    public transform: TransformComponent;
    private components: Component[] = new Array(1);

    private static nextId: number = 0;

    public constructor() {
        this.id = Entity.nextId++;
        this.transform = new TransformComponent();
    }

    public callScriptsStart(): void {
        for (const component of this.components) {
            if (component instanceof ScriptComponent) {
                component.start?.();
            }
        }
    }

    public callScriptsUpdate(): void {
        for (const component of this.components) {
            if (component instanceof ScriptComponent) {
                component.update?.();
            }
        }
    }

    public addComponent<T extends Component>(component: T): T {
        component.entity = this;
        this.components.push(component);
        return component;
    }

    public getComponent<T extends Component>(type: new (...args: any[]) => T): T | undefined {
        return this.components.find(c => c instanceof type) as T | undefined;
    }

    public removeComponent<T extends Component>(type: new (...args: any[]) => T): void {
        this.components = this.components.filter(c => !(c instanceof type));
    }
}
