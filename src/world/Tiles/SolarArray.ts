import Tile from "../Tile.js";
import TileProject from "../../tileProjects/TileProject.js";
import GridCoordinates from "../GridCoordinates.js";
import Conversion from "../../resources/Conversion.js";
import Cost from "../../resources/Cost.js";
import Resource from "../../resources/Resource.js";

export default class SolarPanels extends Tile {

    constructor(position: GridCoordinates) {
        super(position);
    }

    resourceConversions = [
        new Conversion(
            [], [new Cost(Resource.Energy, 100)]
        ),
    ];

    getImgSrc(): string {
        return "assets/tiles/solar_panels.png";
    }

    static readonly tileName: string = "Photovoltaic Array"
    getTileName(): string {
        return SolarPanels.tileName;
    }
}
