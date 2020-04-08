import Tile, { tileTypes } from "../Tile.js";
import GridCoordinates from "../GridCoordinates.js";
import Conversion from "../../resources/Conversion.js";
import Cost from "../../resources/Cost.js";
import Resource from "../../resources/Resource.js";
import { SolarPanelsTexture } from "../../UI/Images.js";
import { Schemas as S } from "../../serialize/Schema.js";

export default class SolarPanels extends Tile {
    protected texture: HTMLImageElement = SolarPanelsTexture;

    constructor(position: GridCoordinates) {
        super(position);
    }

    resourceConversions = [
        Conversion.newConversion(
            [], [new Cost(Resource.Energy, 100)]
        ),
    ];

    static readonly tileName: string = "Photovoltaic Array";
    static readonly tileDescription: string = "Converts light from this planet's sun into electrical energy";
    getTileName(): string {
        return SolarPanels.tileName;
    }
    getTileDescription(): string {
        return SolarPanels.tileDescription;
    }

    static schema = S.classOf({
        position: GridCoordinates.schema,
        resourceConversions: S.arrayOf(Conversion.schema),
    }, ({ position, resourceConversions }) => {
        const s = new SolarPanels(position);
        s.resourceConversions = resourceConversions;
        return s;
    });
}

tileTypes[SolarPanels.name] = SolarPanels;
