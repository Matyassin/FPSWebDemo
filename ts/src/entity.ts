import { Transform } from "./transform.js";

export abstract class Component {
    entity!: Entity;
}

export class Entity {
    public readonly id: number;
    public transform: Transform;
    private components: Component[] = new Array(1);

    private static nextId: number = 0;

    public constructor() {
        this.id = Entity.nextId++;
        this.transform = new Transform();
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
