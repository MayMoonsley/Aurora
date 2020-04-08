import Tile, { tileTypes } from "../Tile.js";
import GridCoordinates from "../GridCoordinates.js";
import Conversion from "../../resources/Conversion.js";
import Resource from "../../resources/Resource.js";
import Cost from "../../resources/Cost.js";
import Species from "../../resources/Species.js";
import { GreenhouseTexture } from "../../UI/Images.js";
import { Schemas as S } from "../../serialize/Schema.js";

export default class Greenhouse extends Tile {
    protected texture: HTMLImageElement = GreenhouseTexture;

    constructor(position: GridCoordinates) {
        super(position);
    }

    resourceConversions = [
        Conversion.newConversion(
            [new Cost(Resource.Energy, 10)], [new Cost(Resource.Food, 200)], 30
        ),
    ];

    static readonly tileName: string = "Greenhouse";
    static readonly tileDescription: string = `Produces ${Resource.Food.name} for ${Species.Human.name}`;
    getTileName(): string {
        return Greenhouse.tileName;
    }
    getTileDescription(): string {
        return Greenhouse.tileDescription;
    }

    static schema = S.classOf({
        position: GridCoordinates.schema,
        resourceConversions: S.arrayOf(Conversion.schema),
    }, ({ position, resourceConversions }) => {
        const s = new Greenhouse(position);
        s.resourceConversions = resourceConversions;
        return s;
    });
}

tileTypes[Greenhouse.name] = Greenhouse;
