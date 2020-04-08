import Tile, { tileTypes, wastelandVariantSchema } from "../Tile.js";
import TileProject from "../../tileProjects/TileProject.js";
import GridCoordinates from "../GridCoordinates.js";
import { XenoEngineeringConstructionTexture } from "../../UI/Images.js";
import Game from "../../Game.js";
import Resource from "../../resources/Resource.js";
import Cost from "../../resources/Cost.js";
import Wasteland from "./Wasteland.js";
import { MonolithSurveyTech, NanoTech, NeuralUploadingTech } from "../../techtree/TechTree.js";
import { constructionProject } from "../../tileProjects/TileProject.js";
import NanotechFoundry from "./NanotechFoundry.js";
import Monolith from "./Monolith.js";
import NeuralEmulator from "./NeuralEmulator.js";
import {
    roadRequirement, techRequirement, tileWithinDistanceRequirement, nearMonolithRequirement
} from "../../queries/DescribedTileQuery.js";
import { hasTech, tileExists, notQuery } from "../../queries/Queries.js";
import { Schemas as S } from "../../serialize/Schema.js";

export default class ConstructionVictory extends Tile {

    protected texture: HTMLImageElement = XenoEngineeringConstructionTexture;

    constructor(position: GridCoordinates, private wastelandVariant?: 1 | 2 | 3 | 4 | 5) {
        super(position);
    }

    possibleProjects: TileProject[] = [
        new TileProject("Break down construction site", "Revert this location to wasteland",
            (position: GridCoordinates, run: Game) => {
                run.world.placeTile(new Wasteland(position, this.wastelandVariant));
            }, [], [], [],
        ),

        constructionProject(NanotechFoundry,
            [new Cost(Resource.SmartMatter, 1000), new Cost(Resource.BuildingMaterials, 500), new Cost(Resource.Electronics, 200)],
            [
                roadRequirement,
                nearMonolithRequirement(3),
                techRequirement(NanoTech)
            ],
            [hasTech(MonolithSurveyTech), notQuery(tileExists(NanotechFoundry))],
        ),

        constructionProject(NeuralEmulator,
            [
                new Cost(Resource.BuildingMaterials, 300),
                new Cost(Resource.Electronics, 1000),
                new Cost(Resource.Superconductor, 1000),
                new Cost(Resource.SmartMatter, 500)
            ],
            [
                roadRequirement,
                tileWithinDistanceRequirement(Monolith, 2),
                techRequirement(NeuralUploadingTech)
            ],
            [hasTech(MonolithSurveyTech), notQuery(tileExists(NeuralEmulator))],
        ),
    ];

    static readonly tileName: string = "Construction Site - Hyperengineering";
    static readonly tileDescription: string =
    "An area designated for construction of advanced technologies necessary for completing the mission";

    getTileName(): string {
        return ConstructionVictory.tileName;
    }
    getTileDescription(): string {
        return ConstructionVictory.tileDescription;
    }

    static schema = S.contra(
        S.recordOf({
            position: GridCoordinates.schema,
            wastelandVariant: wastelandVariantSchema,
        }),
        (x: ConstructionVictory) => ({ position: x.position, wastelandVariant: x.wastelandVariant }),
        ({ position, wastelandVariant }) => new ConstructionVictory(position, wastelandVariant),
    );
}

tileTypes[ConstructionVictory.name] = ConstructionVictory;
