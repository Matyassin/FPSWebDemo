export const Debug = {
    enableLogs: true,
    enableFps: false,
};

export function log(message: string, ...args: any[]): void {
    if (!Debug.enableLogs)
        return;

    console.log(`[Debug] ${message}`, ...args);
}

export function warn(message: string, ...args: any[]): void {
    if (!Debug.enableLogs)
        return;

    console.warn(`[Warn] ${message}`, ...args);
}

export function error(message: string, ...args: any[]): void {
    if (!Debug.enableLogs)
        return;
    
    console.error(`[Error] ${message}`, ...args);
}
