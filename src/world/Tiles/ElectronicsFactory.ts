import Tile, { tileTypes } from "../Tile.js";
import GridCoordinates from "../GridCoordinates.js";
import Resource from "../../resources/Resource.js";
import Conversion from "../../resources/Conversion.js";
import Cost from "../../resources/Cost.js";
import { ElectronicsFactoryTexture } from "../../UI/Images.js";
import { Schemas as S } from "../../serialize/Schema.js";

export default class ElectronicsFactory extends Tile {
    protected texture: HTMLImageElement = ElectronicsFactoryTexture;

    constructor(position: GridCoordinates) {
        super(position);
    }

    resourceConversions = [
        Conversion.newConversion(
            [new Cost(Resource.Metal, 500)],
            [new Cost(Resource.Electronics, 500)],
            100,
        )
    ];

    static readonly tileName: string = "Electronics Factory";
    static readonly tileDescription: string = `A facility for producing ${Resource.Electronics.name}`;
    getTileName(): string {
        return ElectronicsFactory.tileName;
    }
    getTileDescription(): string {
        return ElectronicsFactory.tileDescription;
    }

    static schema = S.classOf({
        position: GridCoordinates.schema,
        resourceConversions: S.arrayOf(Conversion.schema),
    }, ({ position, resourceConversions }) => {
        const s = new ElectronicsFactory(position);
        s.resourceConversions = resourceConversions;
        return s;
    });
}

tileTypes[ElectronicsFactory.name] = ElectronicsFactory;
