import Tile, { tileTypes } from "../Tile.js";
import GridCoordinates from "../GridCoordinates.js";
import Resource from "../../resources/Resource.js";
import Conversion from "../../resources/Conversion.js";
import Cost from "../../resources/Cost.js";
import { MineshaftTexture } from "../../UI/Images.js";
import { Schemas as S } from "../../serialize/Schema.js";

export default class Mineshaft extends Tile {
    protected texture: HTMLImageElement = MineshaftTexture;

    constructor(position: GridCoordinates) {
        super(position);
    }

    resourceConversions = [
        Conversion.newConversion(
            [new Cost(Resource.Energy, 75)],
            [new Cost(Resource.Metal, 50)],
            100,
        ),
    ];

    static readonly tileName: string = "Mineshaft";
    static readonly tileDescription: string = "A mineshaft built into a mountain to allow long-term ore extraction";
    getTileName(): string {
        return Mineshaft.tileName;
    }
    getTileDescription(): string {
        return Mineshaft.tileDescription;
    }

    static schema = S.classOf({
        position: GridCoordinates.schema,
        resourceConversions: S.arrayOf(Conversion.schema),
    }, ({ position, resourceConversions }) => {
        const s = new Mineshaft(position);
        s.resourceConversions = resourceConversions;
        return s;
    });
}

tileTypes[Mineshaft.name] = Mineshaft;
