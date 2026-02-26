export class Vector2 {
    public x: number;
    public y: number;

    public constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    public toArray(): [number, number] {
        return [this.x, this.y];
    }
}

export class Vector3 {
    public x: number;
    public y: number;
    public z: number;

    public constructor(x: number = 0, y: number = 0, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public toArray(): [number, number, number] {
        return [this.x, this.y, this.z];
    }
}
