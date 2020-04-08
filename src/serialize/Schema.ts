// The definition of the core 'Schema' type, as well as a set of data-oriented
// combinators for building up complex schemas.

/**
 * A 'Schema<T, S>' encapsulates the behavior to:
 * - Encode values from domain type 'T' into representation type 'S'
 * - Decode values from representation type 'S' into domain type 'T'
 * - Validate that a given 'unknown' value is of type 'S'
 *
 * For example, if we have a class 'Person' with data fields 'name: string' and
 * 'age: number', we cannot encode/decode directly to/from JSON, since instances
 * of the class also contain methods that can't be serialized. We only want the
 * type of the JSON representation to contain the data, so we would define a
 * 'Schema<Person, { name: string; age: number; }' to handle this for us.
 */
export interface Schema<T, S> {
    encode(val: T): S;
    decode(data: S): T;
    validate(data: unknown): data is S;
}

/**
 * An extension of a 'Schema' used for dependency injection, allowing us to
 * asymmetrically decode the representation type. An 'InjectSchema<T, D, B, S>'
 * represents a base 'Schema<B, S>' between a base domain type and its
 * serialized representation, with a way to inject a context/dependency 'D' to
 * recover the true domain type 'T'.
 *
 * Assume we have a domain type that contains some context that should not be
 * serialized, but we need this context to make an instance of the domain type.
 * For example, this can happen if we inject a reference through the
 * constructor. Let's call this the "true" domain type.
 *
 * To get around the asymmetry of decoding with context injection, we create a
 * "base" domain type by forgetting the context/dependency from the true domain
 * type. We first create a regular schema to convert between the base domain
 * type and the serialized representation. We then extend this with the ability
 * to "project" from the true domain type into the base domain type ('T => B'),
 * by discarding the context. We also add a way to "inject" the context, which
 * yields a function that can instantiate the true domain type from the base
 * domain type ('B => T').
 */
export interface InjectSchema<T, D, B, S> extends Schema<B, S> {
    project(val: T): B;
    inject(context: D): (base: B) => T;
}

// The possible types of the keys of an object
type PrimKey = string | number | symbol;

/**
 * Extract the domain type from the type of a schema.
 */
export type DomainOf<T extends Schema<unknown, unknown>> = T extends Schema<infer S, unknown> ? S : never;

/**
 * Extract the representation type from the type of a schema. This is useful in
 * making schemas that are derived from other nontrivial schemas. For example:
 *
 * <pre><code>
 * const person: Schema<Person, { name: string, age: number } =
 *     recordOf({ name: aString, age: aNumber });
 * const people: Schema<Person[], ReprOf<typeof personSchema>[]> =
 *     arrayOf(personSchema);
 * </code></pre>
 *
 * This can also be used to automatically reflect domain types from some
 * combinators:
 *
 * <pre><code>
 * const person = recordOf({ name: aString, age: aNumber });
 * type Person = ReprOf<typeof person>; // { name: string; age: number; }
 * </code></pre>
 */
export type ReprOf<T extends Schema<unknown, unknown>> = T extends Schema<unknown, infer S> ? S : never;

// Ugly helper types for object- or tuple-based schemas
// Replace the schemas in an object/array with the domains of the schemas
type RecordDomains<R extends Record<string, Schema<unknown, unknown>> | Schema<unknown, unknown>[]> = {
    [K in keyof R]: R[K] extends Schema<infer A, unknown> ? A : never;
} & {};
// Replace the schemas in an object/array with the representations of the schemas
type RecordReprs<R extends Record<string, Schema<unknown, unknown>> | Schema<unknown, unknown>[]> = {
    [K in keyof R]: R[K] extends Schema<unknown, infer B> ? B : never;
} & {};

// Function to use when the compiler needs a path to be present, even when it's
// technically unreachable
function impossible(x: never): never {
    throw Error("This code should be unreachable");
}

// The identity function, for trivial schemas
const id = <T>(x: T): T => x;

type NonEmptyArray<T> = [T, ...T[]];

export namespace Schemas {
    /**
     * Basic schema constructor function. It is also possible to just make the
     * object containing the functions directly, but this may be considered more
     * declarative.
     */
    export function schema<T, S>(args: {
        encode: (val: T) => S;
        decode: (data: S) => T;
        validate: (data: unknown) => data is S;
    }): Schema<T, S> {
        return args;
    }

    /**
     * Function to construct trivial schemas for representable primitive types.
     */
    export function primitive<T>(validate: (data: unknown) => data is T): Schema<T, T> {
        return { encode: id, decode: id, validate };
    }

    /**
     * Function to convert a literal value into a schema that validates that
     * value.
     */
    export function literal<T>(value: T): Schema<T, T> {
        return { encode: id, decode: id, validate: (x: unknown): x is T => x === value };
    }

    /**
     * Transform a schema in the contravariant position to serialization; given
     * a way to encode and decode from a new domain type to the old domain type,
     * produce a new schema that has the new domain type.
     */
    export function contra<U, T, S>(
        schema: Schema<T, S>,
        encode: (val: U) => T,
        decode: (data: T) => U,
    ): Schema<U, S> {
        return {
            encode: (x: U): S => schema.encode(encode(x)),
            decode: (x: S): U => decode(schema.decode(x)),
            validate: (data: unknown): data is S => schema.validate(data),
        };
    }

    /**
     * Transform a schema in the covariant position to serialization; given a
     * way to encode and decode from a new representation type to the old
     * representation type, and a new validator, produce a new schema that has
     * the new representation type.
     */
    export function co<T, S, U>(
        schema: Schema<T, S>,
        encode: (val: S) => U,
        decode: (data: U) => S,
        validate: (data: unknown) => data is U,
    ): Schema<T, U> {
        return {
            encode: (x: T): U => encode(schema.encode(x)),
            decode: (x: U): T => schema.decode(decode(x)),
            validate
        };
    }

    /**
     * Pushes the evaluation of a schema into its individual functions, for use
     * with recursive structures. Note that if the 'schema' computation is very
     * expensive, this may be inefficient for aggregate schemas, such as
     * 'arrayOf'; in this case, use the lazy aggregate schemas provided in
     * 'LazySchemas' to prevent recomputation. However, if it's simply being
     * used as 'lazy(() => s)' to define a recursive structure, there is not
     * much of a difference.
     */
    export function lazy<T, S>(schema: () => Schema<T, S>): Schema<T, S> {
        return {
            encode: (val: T): S => schema().encode(val),
            decode: (data: S): T => schema().decode(data),
            validate: (data: unknown): data is S => schema().validate(data),
        };
    }

    /**
     * Construct an 'InjectSchema' from its base schema, a function to project
     * the true domain type into the base domain type, and a function to inject
     * some context to make a way to instantiate the true domain type from the
     * base domain type.
     *
     * Somewhat similar to 'contra', but with asymmetrical decoding for context
     * injection.
     */
    export function injecting<T, D, B, S>(
        baseSchema: Schema<B, S>,
        project: (val: T) => B,
        inject: (context: D) => (base: B) => T,
    ): InjectSchema<T, D, B, S> {
        return {
            encode: val => baseSchema.encode(val),
            decode: data => baseSchema.decode(data),
            validate: (data: unknown): data is S => baseSchema.validate(data),
            project,
            inject,
        };
    }

    /**
     * The most basic schema, which accepts anything and validates everything
     */
    export const anAny: Schema<any, any> = primitive((_data: unknown): _data is any => true);

    /**
     * Trivial 'Schema' for 'string'.
     */
    export const aString: Schema<string, string> = primitive((data: unknown): data is string => {
        return typeof data === "string" || data instanceof String;
    });

    /**
     * Trivial 'Schema' for 'number'.
     */
    export const aNumber: Schema<number, number> = primitive((data: unknown): data is number => {
        return typeof data === "number";
    });

    /**
     * Trivial 'Schema' for 'boolean'.
     */
    export const aBoolean: Schema<boolean, boolean> = primitive((data: unknown): data is boolean => {
        return typeof data === "boolean";
    });

    /**
     * Trivial 'Schema' for 'null'.
     */
    export const aNull: Schema<null, null> = primitive((data: unknown): data is null => {
        return data === null;
    });

    /**
     * Trivial 'Schema' for 'undefined'.
     */
    export const anUndefined: Schema<undefined, undefined> = primitive((data: unknown): data is undefined => {
        return typeof data === "undefined";
    });

    /**
     * Construct a schema for arrays, given a schema for their elements.
     */
    export function arrayOf<T, S>(elementsSchema: Schema<T, S>): Schema<T[], S[]> {
        return {
            encode: (arr: T[]) => arr.map(x => elementsSchema.encode(x)),
            decode: (arr: S[]) => arr.map(x => elementsSchema.decode(x)),
            validate: (data: unknown): data is S[] => {
                if (!Array.isArray(data)) {
                    return false;
                }
                return data.every(x => elementsSchema.validate(x));
            },
        };
    }

    export function nonEmptyArrayOf<T, S>(elementsSchema: Schema<T, S>): Schema<NonEmptyArray<T>, NonEmptyArray<S>> {
        const { encode, decode, validate } = arrayOf(elementsSchema);
        return {
            encode: encode as (value: NonEmptyArray<T>) => NonEmptyArray<S>,
            decode: decode as (data: NonEmptyArray<S>) => NonEmptyArray<T>,
            validate: (data: unknown): data is NonEmptyArray<S> => {
                return Array.isArray(data) && data.length >= 1 && validate(data);
            },
        };
    }

    export function tupleOf<
        // The structure of the serialized tuple
        R extends Schema<unknown, unknown>[],
    >(...elementSchemas: R): Schema<RecordDomains<R>, RecordReprs<R>> {
        return {
            encode: (tup: RecordDomains<R>) => {
                return tup.map((x, i) => elementSchemas[i].encode(x)) as RecordReprs<R>;
            },
            decode: (tup: RecordReprs<R>) => {
                return tup.map((x, i) => elementSchemas[i].decode(x)) as RecordDomains<R>;
            },
            validate: (data: unknown): data is RecordReprs<R> => {
                if (!Array.isArray(data) || data.length !== elementSchemas.length) {
                    return false;
                }
                return elementSchemas.every((schema, i) => schema.validate(data[i]));
            }
        };
    }

    /**
     * Trivial serializer for empty array/tuple, the identity under tuple/array
     * concatenation.
     */
    export const anEmptyArray: Schema<[], []> = tupleOf();

    /**
     * Serializes a raw object by serializing its keys.
     */
    export function object<V, R>(values: Schema<V, R>): Schema<Record<PrimKey, V>, Record<PrimKey, R>> {
        return {
            encode: (val: Record<PrimKey, V>): Record<PrimKey, R> => {
                const acc: Record<PrimKey, R> = {};
                for (const k in val) {
                    acc[k] = values.encode(val[k]);
                }
                return acc;
            },
            decode: (data: Record<PrimKey, R>): Record<PrimKey, V> => {
                const acc: Record<PrimKey, V> = {};
                for (const k in data) {
                    acc[k] = values.decode(data[k]);
                }
                return acc;
            },
            validate: (data: unknown): data is Record<PrimKey, R> => {
                if (typeof data !== "object" || data === null) {
                    return false;
                }
                const obj = data as Record<PrimKey, unknown>;
                for (const k in obj) {
                    if (!values.validate(obj[k])) {
                        return false;
                    }
                }
                return true;
            },
        };
    }

    /**
     * Serializes an ES6 'Map'. We unfortunately cannot serialize it as an
     * object, since a 'Map' is strictly more flexible; for example, `0` and
     * `"0"` are considered different keys in a 'Map', but the same key in an
     * object.
     *
     * When deserializing, if the same key is present multiple times, the last
     * occurrence's value will be kept.
     */
    export function map<K, V, KR, VR>(keys: Schema<K, KR>, values: Schema<V, VR>): Schema<Map<K, V>, [KR, VR][]> {
        return {
            encode: (val: Map<K, V>): [KR, VR][] => {
                const acc: [KR, VR][] = [];
                for (const entry of val.entries()) {
                    acc.push([keys.encode(entry[0]), values.encode(entry[1])]);
                }
                return acc;
            },
            decode: (data: [KR, VR][]): Map<K, V> => {
                const acc: Map<K, V> = new Map();
                for (const entry of data) {
                    acc.set(keys.decode(entry[0]), values.decode(entry[1]));
                }
                return acc;
            },
            validate: (data: unknown): data is [KR, VR][] => {
                return arrayOf(tupleOf(keys, values)).validate(data);
            },
        };
    }

    /**
     * Construct a schema for a given record type, given the structure of the
     * record. For example:
     *
     * <pre><code>
     * type Person = { name: string; age: number; };
     *
     * const personSchema: Schema<Person, { name: string; age: number; }> =
     *     recordOf({
     *         name: aString,
     *         age: aNumber,
     *     });
     * </code></pre>
     */
    export function recordOf<
        // The structure of the record
        R extends Record<string, Schema<unknown, unknown>>,
    >(structure: R): Schema<RecordDomains<R>, RecordReprs<R>> {
        return {
            encode: (x: RecordDomains<R>) => {
                const obj: Partial<RecordReprs<R>> = {};
                for (const key in structure) {
                    obj[key] = structure[key].encode(x[key]) as ReprOf<R[keyof R]>;
                }
                return obj as RecordReprs<R>;
            },
            decode: (obj: RecordReprs<R>) => {
                const res: Partial<RecordDomains<R>> = {};
                for (const key in structure) {
                    res[key] = structure[key].decode(obj[key]) as DomainOf<R[keyof R]>;
                }
                return res as RecordDomains<R>;
            },
            validate: (data: unknown): data is RecordReprs<R> => {
                if (typeof data !== "object" || data === null) {
                    return false;
                }
                // Assume that data can be properly indexed, though we don't
                // know if the keys exist, or what type the values are. The
                // validator will handle 'undefined' keys. The 'Partial' here is
                // technically redundant, as the 'unknown' already handles the
                // 'undefined' case.
                const obj = data as Partial<Record<keyof R, unknown>>;
                for (const key in structure) {
                    const validator = structure[key];
                    if (!validator.validate(obj[key])) {
                        return false;
                    }
                }
                return true;
            },
        };
    }

    /**
     * Trivial serializer for empty object, the identity under object unions.
     */
    export const anEmptyObject: Schema<{}, {}> = recordOf({});

    /**
     * Serializes classes into records, like 'recordOf', but with custom
     * reconstruction for class instances, such as using a constructor. When
     * decoding a representation, the values of the representation will first be
     * recursively decoded, and then 'reconstruct' will be applied to the result to
     * make the new instance. For example:
     *
     * <pre><code>
     * class Person {
     *     constructor(
     *         private name: string,
     *         private age: number,
     *     ) {}
     * }
     *
     * const personSchema: Schema<Person, { name: string; age: number; }> =
     *     classOf({
     *         name: aString,
     *         age: aNumber,
     *     }, ({ name, age }) => new Person(name, age));
     * </code></pre>
     */
    export function classOf<
        // The structure of the serialized record
        R extends Record<string, Schema<unknown, unknown>>,
        T extends RecordDomains<R>
    >(structure: R, reconstruct: (data: RecordDomains<R>) => T): Schema<T, RecordReprs<R>> {
        return contra(recordOf(structure), id, reconstruct);
    }

    /**
     * Construct a schema for a type union, given schemas of either type.
     * Additionally requires type predicates in order to be able to determine
     * which schema to use when encoding. If the two types are trivially
     * serializable (they have a 'Schema<T, T>'), consider using 'union'
     * instead. Note that this is left-biased; if both types are the same, for
     * example, the schema on the left will be tried first.
     */
    export function unionOf<TL, SL, TR, SR>(
        isLeft: (x: TL | TR) => x is TL,
        isRight: (x: TL | TR) => x is TR,
        left: Schema<TL, SL>,
        right: Schema<TR, SR>,
    ): Schema<TL | TR, SL | SR> {
        return {
            encode: (x: TL | TR) => {
                if (isLeft(x)) {
                    return left.encode(x);
                } else if (isRight(x)) {
                    return right.encode(x);
                } else {
                    return impossible(x);
                }
            },
            decode: (data: SL | SR) => {
                if (left.validate(data)) {
                    return left.decode(data);
                } else if (right.validate(data)) {
                    return right.decode(data);
                } else {
                    return impossible(data);
                }
            },
            validate: (data: unknown): data is SL | SR => {
                return left.validate(data) || right.validate(data);
            },
        };
    }

    /**
     * Like 'unionOf', but for schemas in which at least one of the types in
     * the union trivially encodes to the same type, since they already have
     * built-in validation. If only one of the types is trivial, it must go on
     * the left. For example:
     *
     * <pre><code>
     * const numberOrStringSchema: Schema<number | string, number | string> =
     *     union(aNumber, aString);
     * </code></pre>
     *
     * Like 'unionOf', this is left-biased; the left schema will apply in the
     * case where both schemas would validate a value.
     */
    export function union<TL, TR, SR>(left: Schema<TL, TL>, right: Schema<TR, SR>): Schema<TL | TR, TL | SR> {
        return unionOf(
            (x: TL | TR): x is TL => left.validate(x),
            (x: TL | TR): x is TR => !left.validate(x),
            left,
            right,
        );
    }

    /**
     * Allows the schema to be undefined. In 'recordOf', this can be used to
     * make a field optional:
     *
     * <pre><code>
     * const schema = recordOf({ x: optional(aNumber) });
     * schema.validate({ x: 1 });         // true
     * schema.validate({ x: "hello" });   // false
     * schema.validate({ x: undefined }); // true
     * schema.validate({});               // true
     * </code></pre>
     */
    export function optional<T, S>(schema: Schema<T, S>): Schema<undefined | T, undefined | S> {
        return union(anUndefined, schema);
    }

    /**
     * Extends a schema's validation to apply additional restrictions to the
     * representation type after initial validation. For example:
     *
     * <pre><code>
     * const positive: Schema<number, number> = constrain(aNumber, x => x > 0);
     * </code></pre>
     */
    export function constrain<T, S>(schema: Schema<T, S>, predicate: (x: S) => boolean): Schema<T, S> {
        return {
            encode: x => schema.encode(x),
            decode: x => schema.decode(x),
            validate: (x): x is S => schema.validate(x) && predicate(x),
        };
    }

    /**
     * Like 'constrain', but uses a type predicate to narrow the
     * representational type. For example, this can be used to narrow the
     * representational type of a string schema that is more specifically a set
     * of keys of another type, by 'in' to make a type predicate.
     */
    export function asserting<T, R, S extends R>(schema: Schema<T, R>, predicate: (x: R) => x is S): Schema<T, S> {
        // We can decay type predicates to boolean constraints
        return constrain(schema, predicate) as Schema<T, S>;
    }

    /**
     * Restrict a string schema to only strings matching a regular expression.
     * The match is conducted via 'RegExp.prototype.test'. To ensure that the
     * entire string matches the regex, use <code>/^regex$/</code>.
     */
    export function matching(regex: RegExp): Schema<string, string> {
        return constrain(aString, s => regex.test(s));
    }

    /**
     * Construct a schema that serializes a value by its index in an array of
     * possible values. This is a somewhat unsafe combinator, since any
     * unrecognized value will throw an error. Furthermore, serialization
     * requires an O(n) lookup via an 'indexOf', which is not performance
     * optimal. This is also brittle, since changing the order of array elements
     * can break the deserialization if your data is persistent. Only use this
     * when you know what you're doing.
     */
    export function indexing<T>(values: T[]): Schema<T, number> {
        return contra(
            constrain(aNumber, x => x >= 0 && x < values.length),
            (x: T): number => {
                const ix = values.indexOf(x);
                if (ix < 0) {
                    throw new Error(`Serialization error: attempted to serialize ${x} by index in ${values}`);
                }
                return ix;
            },
            (x: number): T => values[x],
        );
    }

    // TODO: restrict the keys to a 'K extends string' set; figure out a good
    // way to do a 'K extends S => Schema<S, S> -> Schema<K, K>', since
    // 'asserting' can only map the representational type
    /**
     * Like 'indexing', except use an object mapping string values instead of an
     * array with indices. All of the same restrictions and warnings apply.
     */
    export function mapping<T>(values: Record<string, T>): Schema<T, string> {
        return contra(
            constrain(aString, s => s in values),
            (val: T): string => {
                for (const k in values) {
                    if (values[k] === val) {
                        return k;
                    }
                }
                throw new Error(`Serialization error: attempted to serialize ${val} by key in ${values}`);
            },
            (key: string): T => values[key],
        );
    }

}

// Ugly helper types for object- or tuple-based schemas
// Replace the schemas in an object/array with the domains of the schemas
type RecordDomainsLazy<R extends Record<string, () => Schema<unknown, unknown>>> = {
    [K in keyof R]: ReturnType<R[K]> extends Schema<infer A, unknown> ? A : never;
} & {};
// Replace the schemas in an object/array with the representations of the schemas
type RecordReprsLazy<R extends Record<string, () => Schema<unknown, unknown>>> = {
    [K in keyof R]: ReturnType<R[K]> extends Schema<unknown, infer B> ? B : never;
} & {};

export namespace LazySchemas {
    /**
     * Like 'Schemas.arrayOf', but allows for a lazy schema for recursive types.
     */
    export function arrayOf<T, S>(elementsSchema: () => Schema<T, S>): Schema<T[], S[]> {
        return {
            encode: (arr: T[]) => {
                const schema = elementsSchema();
                return arr.map(x => schema.encode(x));
            },
            decode: (arr: S[]) => {
                const schema = elementsSchema();
                return arr.map(x => schema.decode(x));
            },
            validate: (data: unknown): data is S[] => {
                const schema = elementsSchema();
                if (!Array.isArray(data)) {
                    return false;
                }
                return data.every(x => schema.validate(x));
            },
        };
    }

    /**
     * Like 'Schemas.nonEmptyArrayOf', but allows for a lazy schema for
     * recursive types.
     */
    export function nonEmptyArrayOf<T, S>(elementsSchema: () => Schema<T, S>): Schema<NonEmptyArray<T>, NonEmptyArray<S>> {
        const { encode, decode, validate } = arrayOf(elementsSchema);
        return {
            encode: encode as (value: NonEmptyArray<T>) => NonEmptyArray<S>,
            decode: decode as (data: NonEmptyArray<S>) => NonEmptyArray<T>,
            validate: (data: unknown): data is NonEmptyArray<S> => {
                return Array.isArray(data) && data.length >= 1 && validate(data);
            },
        };
    }

    /**
     * Like 'Schemas.recordOf', but lazy in its schema values for recursive
     * types. This doesn't lessen recomputation over just using 'Schemas.lazy'
     * with 'Schemas.recordOf', but it can be used for syntactic convenience in
     * highly recursive types.
     */
    export function recordOf<
        R extends Record<string, () => Schema<unknown, unknown>>,
    >(structure: R): Schema<RecordDomainsLazy<R>, RecordReprsLazy<R>> {
        return {
            encode: (x: RecordDomainsLazy<R>) => {
                const obj: Partial<RecordReprsLazy<R>> = {};
                for (const key in structure) {
                    obj[key] = structure[key]().encode(x[key]) as ReprOf<ReturnType<R[keyof R]>>;
                }
                return obj as RecordReprsLazy<R>;
            },
            decode: (obj: RecordReprsLazy<R>) => {
                const res: Partial<RecordDomainsLazy<R>> = {};
                for (const key in structure) {
                    res[key] = structure[key]().decode(obj[key]) as DomainOf<ReturnType<R[keyof R]>>;
                }
                return res as RecordDomainsLazy<R>;
            },
            validate: (data: unknown): data is RecordReprsLazy<R> => {
                if (typeof data !== "object" || data === null) {
                    return false;
                }
                const obj = data as Partial<Record<keyof R, unknown>>;
                for (const key in structure) {
                    const validator = structure[key]();
                    if (!validator.validate(obj[key])) {
                        return false;
                    }
                }
                return true;
            },
        };
    }

    /**
     * Like 'Schemas.classOf', but lazy in its schema values for recursive
     * types. This doesn't lessen recomputation over just using 'Schemas.lazy'
     * with 'Schemas.classOf', but it can be used for syntactic convenience in
     * highly recursive types.
     */
    export function classOf<
        R extends Record<string, () => Schema<unknown, unknown>>,
        T extends RecordDomainsLazy<R>
    >(structure: R, reconstruct: (data: RecordDomainsLazy<R>) => T): Schema<T, RecordReprsLazy<R>> {
        return Schemas.contra(recordOf(structure), id, reconstruct);
    }
}
