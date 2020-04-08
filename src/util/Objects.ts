export namespace Objects {
    export function safeKeys<T>(x: T): (keyof T)[] {
        return Object.keys(x) as (keyof T)[];
    }

    export function safeEntries<T>(x: T): [keyof T, T[keyof T]][] {
        return Object.entries(x) as [keyof T, T[keyof T]][];
    }
}
