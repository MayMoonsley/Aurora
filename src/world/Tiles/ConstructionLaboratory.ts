import Tile from "../Tile.js";
import TileProject from "../../tileProjects/TileProject.js";
import GridCoordinates from "../GridCoordinates.js";
import { LabConstructionTexture } from "../../UI/Images.js";
import Game from "../../Game.js";
import EngineeringLab from "./EngineeringLab.js";
import Resource from "../../resources/Resource.js";
import Cost from "../../resources/Cost.js";
import PsychLab from "./PsychLab.js";
import XenoLab from "./XenoLab.js";
import AlignmentLab from "./AlignmentLab.js";
import Wasteland from "./Wasteland.js";
import { SurveyTech, AiResearchTech } from "../../techtree/TechTree.js";
import Species from "../../resources/Species.js";
import { constructionProject } from "../../tileProjects/TileProject.js";
import { roadRequirement, techRequirement, speciesPopulationRequirement,
    nearRuinsOrMonolith } from "../../predicates/DescribedTilePredicate.js";
import { hasTech } from "../../predicates/predicates.js";

export default class ConstructionLaboratory extends Tile {

    protected texture: HTMLImageElement = LabConstructionTexture;

    constructor(position: GridCoordinates, private wastelandVariant: 1 | 2 | 3 | 4 | 5) {
        super(position);
    }

    possibleProjects: TileProject[] = [
        new TileProject("Break down construction site", "Revert this location to wasteland",
            (position: GridCoordinates, run: Game) => {
                run.world.placeTile(new Wasteland(position, this.wastelandVariant));
            }, [], [], [],
        ),

        constructionProject(EngineeringLab,
            [new Cost(Resource.BuildingMaterials, 20), new Cost(Resource.Electronics, 20)],
            [roadRequirement],
            [],
        ),

        constructionProject(PsychLab,
            [new Cost(Resource.BuildingMaterials, 30)],
            [roadRequirement],
            [],
        ),

        constructionProject(XenoLab,
            [new Cost(Resource.BuildingMaterials, 40)],
            [
                nearRuinsOrMonolith(3),
                roadRequirement,
                techRequirement(SurveyTech)
            ],
            [],
        ),

        constructionProject(AlignmentLab,
            [new Cost(Resource.BuildingMaterials, 20), new Cost(Resource.Electronics, 40)],
            [speciesPopulationRequirement(Species.Human, 200), roadRequirement],
            [hasTech(AiResearchTech)],
        ),
    ];

    static readonly tileName: string = "Construction Site - Laboratories";
    static readonly tileDescription: string = "An area designated for construction of research laboratories";
    getTileName(): string {
        return ConstructionLaboratory.tileName;
    }
    getTileDescription(): string {
        return ConstructionLaboratory.tileDescription;
    }
}
