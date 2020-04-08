import Tile from "../Tile.js";
import TileProject from "../../tileProjects/TileProject.js";
import GridCoordinates from "../GridCoordinates.js";
import { HabConstructionTexture, } from "../../UI/Images.js";
import Game from "../../Game.js";
import Habitat from "./Habitat.js";
import Resource from "../../resources/Resource.js";
import Cost from "../../resources/Cost.js";
import { StructureConstructionTech, UrbanPlanningTech, IndustrialEngineeringTech, RobotTech, } from "../../techtree/TechTree.js";
import Greenhouse from "./Greenhouse.js";
import Arcology from "./Arcology.js";
import Wasteland from "./Wasteland.js";
import { constructionProject } from "../../tileProjects/TileProject.js";
import Hydroponics from "./Hydroponics.js";
import { techRequirement, roadRequirement } from "../../predicates/DescribedTilePredicate.js";
import { hasTech } from "../../predicates/predicates.js";
import RobotHive from "./RobotHive.js";

export default class ConstructionHabitat extends Tile {

    protected texture: HTMLImageElement = HabConstructionTexture;

    constructor(position: GridCoordinates, private wastelandVariant: 1 | 2 | 3 | 4 | 5) {
        super(position);
    }

    possibleProjects: TileProject[] = [

        new TileProject("Break down construction site", "Revert this location to wasteland",
            (position: GridCoordinates, run: Game) => {
                run.world.placeTile(new Wasteland(position, this.wastelandVariant));
            }, [], [], [],
        ),

        constructionProject(RobotHive,
            [new Cost(Resource.BuildingMaterials, 250), new Cost(Resource.Electronics, 500)],
            [
                techRequirement(StructureConstructionTech),
                techRequirement(RobotTech),
                roadRequirement,
            ],
            [hasTech(IndustrialEngineeringTech)],
        ),

        constructionProject(Habitat,
            [new Cost(Resource.BuildingMaterials, 200)],
            [
                techRequirement(StructureConstructionTech),
                roadRequirement,
            ],
            [],
        ),

        constructionProject(Arcology,
            [new Cost(Resource.BuildingMaterials, 500)],
            [techRequirement(UrbanPlanningTech), roadRequirement],
            [hasTech(StructureConstructionTech)],
        ),

        constructionProject(Greenhouse,
            [new Cost(Resource.BuildingMaterials, 25)],
            [roadRequirement],
            [hasTech(StructureConstructionTech)],
        ),

        constructionProject(Hydroponics,
            [new Cost(Resource.BuildingMaterials, 25), new Cost(Resource.Electronics, 30)],
            [roadRequirement, techRequirement(IndustrialEngineeringTech)],
            [hasTech(StructureConstructionTech)]
        ),
    ];

    static readonly tileName: string = "Construction Site - Habitat";
    static readonly tileDescription: string = "An area designated for construction of habitation and life support facilities";
    getTileName(): string {
        return ConstructionHabitat.tileName;
    }
    getTileDescription(): string {
        return ConstructionHabitat.tileDescription;
    }
}
