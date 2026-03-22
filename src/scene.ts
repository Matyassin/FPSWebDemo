import { Entity } from "./entity.js";

export class Scene {
    private _entities: Entity[] = [];

    public get entites(): Entity[] { return this._entities; }

    public add(entity: Entity): Entity {
        this._entities.push(entity);
        return entity;
    }

    public remove(entity: Entity): void {
        this._entities = this._entities.filter(e => e.id !== entity.id);
    }

    public awake(): void {
        for (const entity of this._entities) {
            entity.callScriptsAwake();
        }
    }

    public start(): void {
        for (const entity of this._entities) {
            entity.callScriptsStart();
        }
    }

    public update(): void {
        for (const entity of this._entities) {
            entity.callScriptsUpdate();
        }
    }
}
