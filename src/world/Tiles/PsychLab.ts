import Tile, { tileTypes } from "../Tile.js";
import GridCoordinates from "../GridCoordinates.js";
import Resource from "../../resources/Resource.js";
import Conversion from "../../resources/Conversion.js";
import Cost from "../../resources/Cost.js";
import { PsychLabTexture } from "../../UI/Images.js";
import { Schemas as S } from "../../serialize/Schema.js";


export default class PsychLab extends Tile {
    protected texture: HTMLImageElement = PsychLabTexture;

    constructor(position: GridCoordinates) {
        super(position);
    }

    resourceConversions = [
        Conversion.newConversion(
            [],
            [new Cost(Resource.PsychKnowledge, 10)],
            25,
        ),
    ];

    static readonly tileName: string = "Psychology Lab";
    static readonly tileDescription: string = "A laboratory for studying how humans behave in the isolated conditions of a remote colony";
    getTileName(): string {
        return PsychLab.tileName;
    }
    getTileDescription(): string {
        return PsychLab.tileDescription;
    }

    static schema = S.classOf({
        position: GridCoordinates.schema,
        resourceConversions: S.arrayOf(Conversion.schema),
    }, ({ position, resourceConversions }) => {
        const s = new PsychLab(position);
        s.resourceConversions = resourceConversions;
        return s;
    });
}

tileTypes[PsychLab.name] = PsychLab;
