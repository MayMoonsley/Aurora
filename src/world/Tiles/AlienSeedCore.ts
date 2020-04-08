import Tile, { tileTypes } from "../Tile.js";
import GridCoordinates from "../GridCoordinates.js";
import { AlienSeedCoreTexture } from "../../UI/Images.js";
import { stripIndent } from "../../util/Text.js";
import { Schemas as S } from "../../serialize/Schema.js";

export default class AlienSeedCore extends Tile {
    protected texture: HTMLImageElement = AlienSeedCoreTexture;

    constructor(position: GridCoordinates) {
        super(position);
    }

    static readonly tileName: string = "Seed Core";
    static readonly tileDescription: string = stripIndent`
        The first element of a self-replicating computer system containing the digitized minds of its alien designers.
        As it spreads, the hypercomputing network will convert all matter into the substrate for a virtual reality in
        which the awakened alien minds will live in perfect fulfillment of their ideals.`;

    getTileName(): string {
        return AlienSeedCore.tileName;
    }
    getTileDescription(): string {
        return AlienSeedCore.tileDescription;
    }

    static schema = S.classOf({ position: GridCoordinates.schema }, ({ position }) => new AlienSeedCore(position));
}

tileTypes[AlienSeedCore.name] = AlienSeedCore;
