import Tile, { tileTypes } from "../Tile.js";
import TileProject from "../../tileProjects/TileProject.js";
import GridCoordinates from "../GridCoordinates.js";
import Species from "../../resources/Species.js";
import Game from "../../Game.js";
import Habitat from "./Habitat.js";
import MiningFacility from "./MiningFacility.js";
import SolarPanels from "./SolarArray.js";
import { LanderTexture } from "../../UI/Images.js";
import Resource from "../../resources/Resource.js";
import Greenhouse from "./Greenhouse.js";
import Road from "./Road.js";
import { stripIndent } from "../../util/Text.js";
import { Schemas as S } from "../../serialize/Schema.js";

export default class Lander extends Tile {
    protected texture: HTMLImageElement = LanderTexture;

    possibleProjects: TileProject[] = [
        new TileProject(
            "Unpack Lander", "Unload colonists and deploy prefabricated colonial buildings",
            (position: GridCoordinates, run: Game) => {
                const world = run.world;

                // place colony buildings
                world.placeTile(new Habitat(new GridCoordinates(position.x + 1, position.y)));
                world.placeTile(new SolarPanels(new GridCoordinates(position.x + 1, position.y - 1)));
                world.placeTile(new Greenhouse(new GridCoordinates(position.x - 1, position.y)));
                world.placeTile(new MiningFacility(new GridCoordinates(position.x - 1, position.y - 1)));
                world.placeTile(new Road(new GridCoordinates(position.x, position.y - 1)));
                world.placeTile(new Road(position));
                world.placeTile(new Road(new GridCoordinates(position.x, position.y + 1)));

                // provide initial supplies
                run.inventory.addResource(Resource.Food, 1000);

                // create initial population
                run.inventory.addWorkers(Species.Human, 100);
                // make workers available on first turn
                run.inventory.releaseWorkers();
            },
            [],
            [],
            [],
        ),
    ];

    constructor(position: GridCoordinates) {
        super(position);
    }

    static readonly tileName: string = "Landing Pod";
    static readonly tileDescription: string = stripIndent`
        A spacecraft responsible for the final entry-descent-landing phase of the interstellar journey;
        not equipped to ascend back to space`;
    getTileName(): string {
        return Lander.tileName;
    }
    getTileDescription(): string {
        return Lander.tileDescription;
    }

    static schema = S.classOf({ position: GridCoordinates.schema }, ({ position }) => new Lander(position));
}

tileTypes[Lander.name] = Lander;
