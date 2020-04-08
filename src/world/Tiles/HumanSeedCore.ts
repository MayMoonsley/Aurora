import Tile, { tileTypes } from "../Tile.js";
import GridCoordinates from "../GridCoordinates.js";
import { HumanSeedCoreTexture } from "../../UI/Images.js";
import { stripIndent } from "../../util/Text.js";
import { Schemas as S } from "../../serialize/Schema.js";

export default class HumanSeedCore extends Tile {
    protected texture: HTMLImageElement = HumanSeedCoreTexture;

    constructor(position: GridCoordinates) {
        super(position);
    }

    static readonly tileName: string = "Seed Core";
    static readonly tileDescription: string = stripIndent`
        The first element of a self-replicating computer system reprogrammed to store digital copies of the human colonists' minds.
        As it spreads, the hypercomputing network will convert all matter into the substrate for a virtual reality in
        which the awakened human minds will live in a utopia perfectly optimized for their needs.`;

    getTileName(): string {
        return HumanSeedCore.tileName;
    }
    getTileDescription(): string {
        return HumanSeedCore.tileDescription;
    }

    static schema = S.classOf({ position: GridCoordinates.schema }, ({ position }) => new HumanSeedCore(position));
}

tileTypes[HumanSeedCore.name] = HumanSeedCore;
