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

// Generate a normal random variable using one half of the Box-Muller method.
export function gaussian(): number {
    let u, v;
    // These are bounded to (0, 1), exclusive on 0
    do {
        u = Math.random();
    } while (u === 0);
    do {
        v = Math.random();
    } while (v === 0);
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function impossible(x: never): never {
    throw new Error("unreachable");
}
