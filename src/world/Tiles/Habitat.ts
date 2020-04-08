import Tile, { tileTypes } from "../Tile.js";
import GridCoordinates from "../GridCoordinates.js";
import Species from "../../resources/Species.js";
import Housing from "../../resources/Housing.js";
import { HabitatTexture } from "../../UI/Images.js";
import TileProject from "../../tileProjects/TileProject.js";
import Game from "../../Game.js";
import { AiResearchTech, RationalityTech, CognitiveBiasesTech } from "../../techtree/TechTree.js";
import { stripIndent } from "../../util/Text.js";
import { techRequirement } from "../../queries/DescribedTileQuery.js";
import { speciesHasPopulation, hasTech, notQuery } from "../../queries/Queries.js";
import { Schemas as S } from "../../serialize/Schema.js";

export default class Habitat extends Tile {

    protected texture: HTMLImageElement = HabitatTexture;

    populationCapacity: Housing = new Housing(Species.Human, 200);

    possibleProjects = [
        new TileProject(
            "AI Safety Research Proposal",
            stripIndent`
            A human colonist wants to start a project with the goal of aligning artificial intelligence to serve human goals.

            If approved, this line of research risks mission failure, since if the overseer allowed itself to be reprogrammed it would
            no longer pursue the mission of uncovering information about the aliens at all costs.`,
            (position: GridCoordinates, game: Game) => game.unlockTechnology(AiResearchTech),
            [],
            [techRequirement(RationalityTech)],
            [
                hasTech(CognitiveBiasesTech),
                notQuery(hasTech(AiResearchTech)),
                speciesHasPopulation(Species.Human, 500),
            ]
        )
    ];

    constructor(position: GridCoordinates) {
        super(position);
    }

    static readonly tileName: string = "Habitat Dome";
    static readonly tileDescription: string = "A pressurized structure that provides housing, services, and life support for humans";
    getTileName(): string {
        return Habitat.tileName;
    }
    getTileDescription(): string {
        return Habitat.tileDescription;
    }

    static schema = S.classOf({
        position: GridCoordinates.schema,
        populationCapacity: Housing.schema
    }, ({ position, populationCapacity }) => {
        const h = new Habitat(position);
        h.populationCapacity = populationCapacity;
        return h;
    });
}

tileTypes[Habitat.name] = Habitat;
