import { Vector2, Vector3 } from "./utils.js";
export class ObjLoader {
    static async load(path) {
        const text = await fetch(path).then(r => r.text());
        const verts = [];
        const idxs = [];
        const tempVerts = [];
        const tempUvs = [];
        const tempNormals = [];
        let currentIdx = 0;
        for (const line of text.split('\n')) {
            if (['#', 'o', 's'].includes(line.charAt(0)))
                continue;
            const parts = line.trim().split(' ');
            const keyword = parts[0];
            if (keyword === 'v') {
                tempVerts.push(new Vector3(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])));
            }
            else if (keyword === 'vn') {
                tempNormals.push(new Vector3(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])));
            }
            else if (keyword === 'vt') {
                tempUvs.push(new Vector2(parseFloat(parts[1]), parseFloat(parts[2])));
            }
            else if (keyword === 'f') {
                const isQuad = parts.length === 5;
                const triIndices = isQuad ? [0, 1, 2, 0, 2, 3] : [0, 1, 2];
                const quad = isQuad ? [parts[1], parts[2], parts[3], parts[4]] : [parts[1], parts[2], parts[3]];
                for (const i of triIndices) {
                    const [vIdx, vtIdx, vnIdx] = quad[i].split('/').map(n => parseInt(n) - 1); // stupid obj starts indexing from 1
                    const pos = tempVerts[vIdx];
                    const uv = tempUvs[vtIdx];
                    const normal = tempNormals[vnIdx];
                    verts.push(pos.x, pos.y, pos.z, uv.x, uv.y, normal.x, normal.y, normal.z);
                    idxs.push(currentIdx++);
                }
            }
        }
        return [
            new Float32Array(verts),
            new Uint16Array(idxs),
        ];
    }
}
