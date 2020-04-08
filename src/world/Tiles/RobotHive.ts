import Tile from "../Tile.js";
import GridCoordinates from "../GridCoordinates.js";
import Species from "../../resources/Species.js";
import Housing from "../../resources/Housing.js";
import { RobotHiveTexture } from "../../UI/Images.js";
import TileProject from "../../tileProjects/TileProject.js";
import Cost from "../../resources/Cost.js";
import Resource from "../../resources/Resource.js";
import Game from "../../Game.js";
import { availableHousingRequirement } from "../../predicates/DescribedTilePredicate.js";
import { hasTech } from "../../predicates/predicates.js";
import { SwarmRoboticsTech } from "../../techtree/TechTree.js";

export default class RobotHive extends Tile {

    protected texture: HTMLImageElement = RobotHiveTexture;

    populationCapacity: Housing = new Housing(Species.Robot, 5000);

    possibleProjects: TileProject[] = [
        new TileProject("Construct robot group", "Create 100 robotic worker drones",
            (position: GridCoordinates, game: Game) => {
                game.inventory.addWorkers(Species.Robot, 100);
                game.inventory.releaseWorkers(100);
            },
            [new Cost(Resource.Electronics, 50), new Cost(Resource.Energy, 100)],
            [availableHousingRequirement(Species.Robot, 100)],
            []
        ),

        new TileProject("Construct robot swarm", "Create 1000 robotic worker drones",
            (position: GridCoordinates, game: Game) => {
                game.inventory.addWorkers(Species.Robot, 1000);
                game.inventory.releaseWorkers(1000);
            },
            [new Cost(Resource.Electronics, 250), new Cost(Resource.Energy, 1000)],
            [availableHousingRequirement(Species.Robot, 1000)],
            [hasTech(SwarmRoboticsTech)]
        ),
    ];

    constructor(position: GridCoordinates) {
        super(position);
    }

    static readonly tileName: string = "Drone Hive";
    static readonly tileDescription: string = "A facility for manufacturing, storing, and maintaining mobile robotic worker drones";
    getTileName(): string {
        return RobotHive.tileName;
    }
    getTileDescription(): string {
        return RobotHive.tileDescription;
    }
}
