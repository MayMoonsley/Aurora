import Tile, { tileTypes } from "../Tile.js";
import GridCoordinates from "../GridCoordinates.js";
import Conversion from "../../resources/Conversion.js";
import Resource from "../../resources/Resource.js";
import Cost from "../../resources/Cost.js";
import Species from "../../resources/Species.js";
import { HydroponicsTexture } from "../../UI/Images.js";
import { Schemas as S } from "../../serialize/Schema.js";

export default class Hydroponics extends Tile {
    protected texture: HTMLImageElement = HydroponicsTexture;

    constructor(position: GridCoordinates) {
        super(position);
    }

    resourceConversions = [
        Conversion.newConversion(
            [new Cost(Resource.Energy, 150)], [new Cost(Resource.Food, 2000)], 50
        ),
    ];

    static readonly tileName: string = "Hydroponics Greenhouse";
    static readonly tileDescription: string =
        `Produces ${Resource.Food.name} for ${Species.Human.name} more efficiently than a standard greenhouse`;
    getTileName(): string {
        return Hydroponics.tileName;
    }
    getTileDescription(): string {
        return Hydroponics.tileDescription;
    }

    static schema = S.classOf({
        position: GridCoordinates.schema,
        resourceConversions: S.arrayOf(Conversion.schema),
    }, ({ position, resourceConversions }) => {
        const s = new Hydroponics(position);
        s.resourceConversions = resourceConversions;
        return s;
    });
}

tileTypes[Hydroponics.name] = Hydroponics;
