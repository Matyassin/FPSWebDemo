export class Time {
    static _time = 0;
    static _deltaTime = 0;
    static lastTimeStamp = 0;
    static get time() { return this._time; }
    static get deltaTime() { return this._deltaTime; }
    static update(timeStamp) {
        const t = timeStamp / 1000; // ms to s
        this._deltaTime = t - this.lastTimeStamp;
        this._time = t;
        this.lastTimeStamp = t;
    }
}
