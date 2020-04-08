import Tile, { tileTypes } from "../Tile.js";
import TileProject from "../../tileProjects/TileProject.js";
import GridCoordinates from "../GridCoordinates.js";
import Game from "../../Game.js";
import Resource from "../../resources/Resource.js";
import Wasteland from "./Wasteland.js";
import Cost from "../../resources/Cost.js";
import { MountainTexture } from "../../UI/Images.js";
import Mineshaft from "./Mineshaft.js";
import { StructureConstructionTech } from "../../techtree/TechTree.js";
import { techRequirement, tileWithinDistanceRequirement, roadRequirement } from "../../queries/DescribedTileQuery.js";
import MiningFacility from "./MiningFacility.js";
import { Schemas as S } from "../../serialize/Schema.js";

export default class Mountain extends Tile {
    protected texture: HTMLImageElement = MountainTexture;

    constructor(position: GridCoordinates) {
        super(position);
    }

    possibleProjects: TileProject[] = [
        new TileProject("Construct Mineshaft", "Create a mineshaft to allow long-term ore extraction",
            (position: GridCoordinates, run: Game) => {
                run.world.placeTile(new Mineshaft(position));
            },
            [new Cost(Resource.Energy, 500), new Cost(Resource.BuildingMaterials, 250)],
            [techRequirement(StructureConstructionTech), roadRequirement, tileWithinDistanceRequirement(MiningFacility, 5)],
            [],
        ),

        new TileProject("Strip Mining", `Destroy the mountain to produce ${Resource.Metal.name}`,
            (position: GridCoordinates, run: Game) => {
                run.inventory.addResource(Resource.Metal, 500);
                run.world.placeTile(new Wasteland(position, 5));
            },
            [new Cost(Resource.Energy, 25)],
            [tileWithinDistanceRequirement(MiningFacility, 5)],
            [],
        ),
    ];

    static readonly tileName: string = "Mountain";
    static readonly tileDescription: string = "A large geological formation containing useful mineral resources";
    getTileName(): string {
        return Mountain.tileName;
    }
    getTileDescription(): string {
        return Mountain.tileDescription;
    }

    static schema = S.classOf({ position: GridCoordinates.schema }, ({ position }) => new Mountain(position));
}

tileTypes[Mountain.name] = Mountain;
