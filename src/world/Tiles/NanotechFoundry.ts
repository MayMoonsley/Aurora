import Tile, { tileTypes } from "../Tile.js";
import GridCoordinates from "../GridCoordinates.js";
import { NanotechFoundryTexture } from "../../UI/Images.js";
import { Schemas as S } from "../../serialize/Schema.js";

export default class NanotechFoundry extends Tile {
    protected texture: HTMLImageElement = NanotechFoundryTexture;

    constructor(position: GridCoordinates) {
        super(position);
    }

    static readonly tileName: string = "Nanotech Foundry";
    static readonly tileDescription: string =
        `A nanotechnology manufacturing facility capable of completing the unfinished alien Monolith device`;
    getTileName(): string {
        return NanotechFoundry.tileName;
    }
    getTileDescription(): string {
        return NanotechFoundry.tileDescription;
    }

    static schema = S.classOf({ position: GridCoordinates.schema }, ({ position }) => new NanotechFoundry(position));
}

tileTypes[NanotechFoundry.name] = NanotechFoundry;
