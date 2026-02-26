export class ObjLoader {
    public static async load(path: string): Promise<[Float32Array<ArrayBuffer>, Uint16Array<ArrayBuffer>]> {
        const text = await fetch(path).then(r => r.text());
        
        const verts = new Float32Array(0) as Float32Array<ArrayBuffer>;
        const idxs = new Uint16Array(0)  as Uint16Array<ArrayBuffer>;

        

        return [verts, idxs];
    }
}
