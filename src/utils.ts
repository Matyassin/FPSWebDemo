export class Vector2 {
    public x: number;
    public y: number;

    public constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    public static get zero(): Vector2 { return new Vector2(0, 0); }
    public static get one(): Vector2 { return new Vector2(1, 1); }

    public get normalized(): Vector2 {
        const len = Math.sqrt(this.x * this.x + this.y * this.y);
        if (len === 0)
            return Vector2.zero;
        
        return new Vector2(this.x / len, this.y / len);
    }

    public static normalize(v: Vector2): Vector2 {
        return v.normalized;
    }
    
    public static lerp(a: Vector2, b: Vector2, t: number): Vector2 {
        return new Vector2(
            Mathf.lerp(a.x, b.x, t),
            Mathf.lerp(a.y, b.y, t)
        );
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

    public static get zero(): Vector3 { return new Vector3(0, 0, 0); }
    public static get one(): Vector3 { return new Vector3(1, 1, 1); }

    public get normalized(): Vector3 {
        const len = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        if (len === 0)
            return Vector3.zero;
        
        return new Vector3(this.x / len, this.y / len, this.z / len);
    }

    public static normalize(v: Vector3): Vector3 {
        return v.normalized;
    }

    public static lerp(a: Vector3, b: Vector3, t: number): Vector3 {
        return new Vector3(
            Mathf.lerp(a.x, b.x, t),
            Mathf.lerp(a.y, b.y, t),
            Mathf.lerp(a.z, b.z, t)
        );
    }

    public toArray(): [number, number, number] {
        return [this.x, this.y, this.z];
    }
}

export class Vector4 {
    public x: number;
    public y: number;
    public z: number;
    public w: number;

    public constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    public static get zero(): Vector4 { return new Vector4(0, 0, 0, 0); }
    public static get one(): Vector4 { return new Vector4(1, 1, 1, 1); }

    public get normalized(): Vector4 {
        const len = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
        if (len === 0)
            return Vector4.zero;
        
        return new Vector4(this.x / len, this.y / len, this.z / len, this.w / len);
    }

    public static normalize(v: Vector4): Vector4 {
        return v.normalized;
    }

    public static lerp(a: Vector4, b: Vector4, t: number): Vector4 {
        return new Vector4(
            Mathf.lerp(a.x, b.x, t),
            Mathf.lerp(a.y, b.y, t),
            Mathf.lerp(a.z, b.z, t),
            Mathf.lerp(a.w, b.w, t)
        );
    }

    public toArray(): [number, number, number, number] {
        return [this.x, this.y, this.z, this.w];
    }
}

export class Color {
    public r: number;
    public g: number;
    public b: number;
    public a: number;

    public constructor(r: number = 1, g: number = 1, b: number = 1, a: number = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    public static readonly white   = new Color(1, 1, 1, 1);
    public static readonly black   = new Color(0, 0, 0, 1);
    public static readonly red     = new Color(1, 0, 0, 1);
    public static readonly green   = new Color(0, 1, 0, 1);
    public static readonly blue    = new Color(0, 0, 1, 1);
    public static readonly yellow  = new Color(1, 1, 0, 1);

    public static fromHex(hex: string): Color {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;

        return new Color(r, g, b, 1);
    }

    public toArray(): [number, number, number, number] {
        return [this.r, this.g, this.b, this.a];
    }
}

export class Mathf {
    public static clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }

    public static lerp(a: number, b: number, t: number) {
        return a + (b - a) * t;
    }

    public static degToRad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    public static radToDeg(rad: number): number {
        return rad * (180 / Math.PI);
    }
}
