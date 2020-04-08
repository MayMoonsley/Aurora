import Tile from "../Tile.js";
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
import { roadRequirement, techRequirement, tileWithinDistanceRequirement,
    nearMonolithRequirement } from "../../predicates/DescribedTilePredicate.js";
import { hasTech, tileExists } from "../../predicates/predicates.js";

export default class ConstructionVictory extends Tile {

    protected texture: HTMLImageElement = XenoEngineeringConstructionTexture;

    constructor(position: GridCoordinates, private wastelandVariant: 1 | 2 | 3 | 4 | 5) {
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
            [hasTech(MonolithSurveyTech), (game: Game) => !tileExists(NanotechFoundry)(game)],
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
            [hasTech(MonolithSurveyTech), (game: Game) => !tileExists(NeuralEmulator)(game)],
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
}
