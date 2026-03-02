import { Entity } from "./entity.js";

export class Scene {
    private entities: Entity[] = [];

    public getEntites(): Entity[] {
        return this.entities;
    }

    public add(entity: Entity): Entity {
        this.entities.push(entity);
        return entity;
    }

    public remove(entity: Entity): void {
        this.entities = this.entities.filter(e => e.id !== entity.id);
    }

    public start(): void {
        for (const entity of this.entities) {
            entity.callScriptsStart();
        }
    }

    public update(): void {
        for (const entity of this.entities) {
            entity.callScriptsUpdate();
        }
    }
}
