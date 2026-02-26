export class ObjLoader {
    static async load(path) {
        const text = await fetch(path).then(r => r.text());
        const verts = new Float32Array(0);
        const idxs = new Uint16Array(0);
        return [verts, idxs];
    }
}
