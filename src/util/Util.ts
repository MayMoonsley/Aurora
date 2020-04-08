export function clamp(min: number, value: number, max: number): number {
    return Math.max(Math.min(value, max), min);
}

export function lerp(min: number, max: number, t: number): number {
    return (max - min) * t + min;
}

// Computes `a mod b`, since `%` is actually a remainder operation. Behavior is
// different between the two operations when the operands have opposite signs.
export function mod(a: number, b: number): number {
    return a - (b * Math.floor(a / b));
}

export function impossible(x: never): never {
    throw new Error("unreachable");
}
