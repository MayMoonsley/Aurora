import GridCoordinates from "./GridCoordinates.js";
import TileProject from "../tileProjects/TileProject.js";
import Conversion from "../resources/Conversion.js";
import Housing from "../resources/Housing.js";
import World from "./World.js";
import { Schema, Schemas as S } from "../serialize/Schema.js";

/**
 * Serializer for the type of wasteland tile texture variants. The
 * implementation is slightly unsafe, but faster than the alternative union
 * of literals. This needs to be here, since many Tiles use it, and it would
 * throw a ReferenceError at runtime otherwise.
 */
export const wastelandVariantSchema: Schema<1 | 2 | 3 | 4 | 5, 1 | 2 | 3 | 4 | 5> =
    S.constrain(S.aNumber, x => 1 <= x && x <= 5) as Schema<1 | 2 | 3 | 4 | 5, 1 | 2 | 3 | 4 | 5>;

/**
 * A tile is an object in the world that occupies a map square
 * they can be natural formations (wasteland, mountains, etc),
 * or artificial constructions (habitat, factory, highway, etc)
 */

export default abstract class Tile {

    // projects that can be completed on tiles of this type
    readonly possibleProjects: TileProject[] = [];

    // conversion from input resources to output resources that the tile can perform at the end of each turn
    resourceConversions: Conversion[] = [];

    readonly populationCapacity: Housing | undefined = undefined;

    // this provides a key into the ImageCache, which preloads all of the images so that we can synchronously draw them to the map canvas
    protected abstract readonly texture: HTMLImageElement;

    constructor(
        public position: GridCoordinates
    ) {}

    abstract getTileName(): string; // returns the name of the tile type
    abstract getTileDescription(): string; // return the tile type's description

    // by default this just returns the tile's texture, but it can be overridden to allow the texture to be changed
    // including changing the texture based on the position of other tiles in the world (e.g. for aligning roads)
    getTexture(world: World): HTMLImageElement {
        return this.texture;
    }
}

/* used by predicates to allow statically accessing the name of a Tile subclass
 * Tile subclasses that are used by predicates in this way
 * will need to declare a static readonly tileName string
 */
export type NamedTileType = typeof Tile & {
    readonly tileName: string;
    readonly tileDescription: string;
};

/**
 * A global map of names of subtypes of Tile to their constructor
 * TODO: do this with decorator metadata instead
 */
export const tileTypes: Record<string, typeof Tile & { schema: Schema<Tile, any>; }> = {};

export const typeofTileSchema: Schema<typeof Tile, keyof typeof tileTypes> = S.schema({
    encode: (x: typeof Tile): keyof typeof tileTypes => {
        return x.name;
    },
    decode: (x: keyof typeof tileTypes): typeof Tile => {
        return tileTypes[x];
    },
    validate: (x: unknown): x is keyof typeof tileTypes => {
        return S.aString.validate(x) && x in tileTypes;
    },
});

export const tileSchema: Schema<Tile, { type: string; value: any; }> = S.schema({
    encode: (x: Tile): { type: string; value: any; } => {
        const name: string = x.constructor.name;
        return {
            type: name,
            value: tileTypes[name].schema.encode(x),
        };
    }, decode: (x: { type: string; value: any; }): Tile => {
        const con = tileTypes[x.type];
        return con.schema.decode(x.value);
    }, validate: (data: unknown): data is { type: string; value: any; } => {
        if (S.recordOf({ type: S.aString, value: S.anAny }).validate(data)) {
            const schema = tileTypes[data.type].schema;
            return schema.validate(data.value);
        } else {
            return false;
        }
    }
});

