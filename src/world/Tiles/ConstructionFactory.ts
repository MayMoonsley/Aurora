import Tile, { tileTypes } from "../Tile.js";
import GridCoordinates from "../GridCoordinates.js";
import Resource from "../../resources/Resource.js";
import Conversion from "../../resources/Conversion.js";
import Cost from "../../resources/Cost.js";
import { ConstructionFactoryTexture } from "../../UI/Images.js";
import { Schemas as S } from "../../serialize/Schema.js";

export default class ConstructionFactory extends Tile {
    protected texture: HTMLImageElement = ConstructionFactoryTexture;

    constructor(position: GridCoordinates) {
        super(position);
    }

    resourceConversions = [
        Conversion.newConversion(
            [new Cost(Resource.Metal, 1000)],
            [new Cost(Resource.BuildingMaterials, 1000)],
            250,
        ),
    ];

    static readonly tileName: string = "Construction Materials Factory";
    static readonly tileDescription: string = `A facility for producing ${Resource.BuildingMaterials.name}`;
    getTileName(): string {
        return ConstructionFactory.tileName;
    }
    getTileDescription(): string {
        return ConstructionFactory.tileDescription;
    }

    static schema = S.classOf({
        position: GridCoordinates.schema,
        resourceConversions: S.arrayOf(Conversion.schema),
    }, ({ position, resourceConversions }) => {
        const s = new ConstructionFactory(position);
        s.resourceConversions = resourceConversions;
        return s;
    });
}

tileTypes[ConstructionFactory.name] = ConstructionFactory;
