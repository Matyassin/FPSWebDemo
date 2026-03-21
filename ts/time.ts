export class Time {
    private static _time: number = 0;
    private static _deltaTime: number = 0;
    private static lastTimeStamp: number = 0;

    public static get time(): number { return this._time; }
    public static get deltaTime(): number { return this._deltaTime; }

    public static update(timeStamp: number): void {
        const t = timeStamp / 1000 // ms to s
        this._deltaTime = t - this.lastTimeStamp;
        this._time = t;
        this.lastTimeStamp = t;
    }
}
