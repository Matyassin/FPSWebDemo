import { Vector2, Vector3 } from "./utils.js";

export class ObjLoader {
    public static async load(path: string): Promise<[Float32Array<ArrayBuffer>, Uint16Array<ArrayBuffer>]> {
        const text = await fetch(path).then(r => r.text());

        const verts: number[] = [];
        const idxs: number[] = [];

        const tempVerts: Vector3[] = [];
        const tempUvs: Vector2[] = [];
        const tempNormals: Vector3[] = [];

        let currentIdx = 0;

        for (const line of text.split('\n')) {
            if (['#', 'o', 's'].includes(line.charAt(0)))
                continue;

            const parts: string[] = line.trim().split(' ');
            const keyword: string = parts[0];

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
                const tri: string[] = [parts[1], parts[2], parts[3]];
                const positions: Vector3[] = [];
                const uvs:       Vector2[] = [];
                const normals:   Vector3[] = [];

                for (const v of tri) {
                    const [vIdx, vtIdx, vnIdx] = v.split('/').map(n => parseInt(n) - 1);
                    positions.push(tempVerts[vIdx]);
                    uvs.push(tempUvs[vtIdx]);
                    normals.push(tempNormals[vnIdx]);
                }

                // calculate tangent for this triangle
                const edge1 = new Vector3(
                    positions[1].x - positions[0].x,
                    positions[1].y - positions[0].y,
                    positions[1].z - positions[0].z,
                );
                const edge2 = new Vector3(
                    positions[2].x - positions[0].x,
                    positions[2].y - positions[0].y,
                    positions[2].z - positions[0].z,
                );
                const dUV1 = new Vector2(uvs[1].x - uvs[0].x, uvs[1].y - uvs[0].y);
                const dUV2 = new Vector2(uvs[2].x - uvs[0].x, uvs[2].y - uvs[0].y);

                const f = 1.0 / (dUV1.x * dUV2.y - dUV2.x * dUV1.y);

                const tangent = new Vector3(
                    f * (dUV2.y * edge1.x - dUV1.y * edge2.x),
                    f * (dUV2.y * edge1.y - dUV1.y * edge2.y),
                    f * (dUV2.y * edge1.z - dUV1.y * edge2.z),
                ).normalized;

                // bitangent sign
                const bitangent = new Vector3(
                    f * (-dUV2.x * edge1.x + dUV1.x * edge2.x),
                    f * (-dUV2.x * edge1.y + dUV1.x * edge2.y),
                    f * (-dUV2.x * edge1.z + dUV1.x * edge2.z),
                ).normalized;

                const cross = new Vector3(
                    normals[0].y * tangent.z - normals[0].z * tangent.y,
                    normals[0].z * tangent.x - normals[0].x * tangent.z,
                    normals[0].x * tangent.y - normals[0].y * tangent.x,
                );
                const w = (cross.x * bitangent.x + cross.y * bitangent.y + cross.z * bitangent.z) < 0 ? -1 : 1;

                // push all 3 vertices: x y z u v nx ny nz tx ty tz tw
                for (let i = 0; i < 3; i++) {
                    verts.push(
                        positions[i].x, positions[i].y, positions[i].z,
                        uvs[i].x, uvs[i].y,
                        normals[i].x, normals[i].y, normals[i].z,
                        tangent.x, tangent.y, tangent.z, w,
                    );
                    idxs.push(currentIdx++);
                }
            }
        }

        return [
            new Float32Array(verts) as Float32Array<ArrayBuffer>,
            new Uint16Array(idxs)   as Uint16Array<ArrayBuffer>,
        ];
    }
}
