import Tile, { tileTypes } from "../Tile.js";
import GridCoordinates from "../GridCoordinates.js";
import Resource from "../../resources/Resource.js";
import Conversion from "../../resources/Conversion.js";
import Cost from "../../resources/Cost.js";
import { MiningFacilityTexture } from "../../UI/Images.js";
import { Schemas as S } from "../../serialize/Schema.js";

export default class MiningFacility extends Tile {
    protected texture: HTMLImageElement = MiningFacilityTexture;

    constructor(position: GridCoordinates) {
        super(position);
    }

    resourceConversions = [
        Conversion.newConversion(
            [new Cost(Resource.Metal, 50)],
            [new Cost(Resource.BuildingMaterials, 50)],
            25,
        ),
        Conversion.newConversion(
            [new Cost(Resource.Metal, 50)],
            [new Cost(Resource.Electronics, 50)],
            25,
        )
    ];

    static readonly tileName: string = "Ore Processing Center";
    static readonly tileDescription: string = "A facility used to process ore into useful materials";
    getTileName(): string {
        return MiningFacility.tileName;
    }
    getTileDescription(): string {
        return MiningFacility.tileDescription;
    }

    static schema = S.classOf({
        position: GridCoordinates.schema,
        resourceConversions: S.arrayOf(Conversion.schema),
    }, ({ position, resourceConversions }) => {
        const s = new MiningFacility(position);
        s.resourceConversions = resourceConversions;
        return s;
    });
}

tileTypes[MiningFacility.name] = MiningFacility;
