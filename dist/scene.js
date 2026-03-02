export class Scene {
    entities = [];
    getEntites() {
        return this.entities;
    }
    add(entity) {
        this.entities.push(entity);
        return entity;
    }
    remove(entity) {
        this.entities = this.entities.filter(e => e.id !== entity.id);
    }
    start() {
        for (const entity of this.entities) {
            entity.callScriptsStart();
        }
    }
    update() {
        for (const entity of this.entities) {
            entity.callScriptsUpdate();
        }
    }
}
