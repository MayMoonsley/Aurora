import Tile, { tileTypes } from "../Tile.js";
import GridCoordinates from "../GridCoordinates.js";
import { MonolithTexture } from "../../UI/Images.js";
import TileProject, { MonolithCompletionProject } from "../../tileProjects/TileProject.js";
import { stripIndent } from "../../util/Text.js";
import AlienSeedCore from "./AlienSeedCore.js";
import AlienCircuits from "./AlienCircuits.js";
import { MonolithSurveyTech, SingularityEngineeringTech,
    CooperativeReprogrammingTech, NeuralUploadingTech } from "../../techtree/TechTree.js";
import NeuralEmulator from "./NeuralEmulator.js";
import NanotechFoundry from "./NanotechFoundry.js";
import Resource from "../../resources/Resource.js";
import Cost from "../../resources/Cost.js";
import Game from "../../Game.js";
import HumanMonolith from "./HumanMonolith.js";
import { tileWithinDistanceRequirement, techRequirement } from "../../queries/DescribedTileQuery.js";
import { hasTech } from "../../queries/Queries.js";
import { Schemas as S } from "../../serialize/Schema.js";

export default class Monolith extends Tile {
    protected texture: HTMLImageElement = MonolithTexture;

    constructor(position: GridCoordinates) {
        super(position);
    }

    possibleProjects: TileProject[] = [
        new TileProject(
            "Upload human neural data",
            stripIndent`
            In the process of repairing the monolith, it would be possible to delete the alien neural scans contained within,
            and replace them with the connectomes of human colonists. However, this would result in the permanent loss of the
            monolith's vast stores of alien data, which would be considered mission failure.
            `,
            (position: GridCoordinates, game: Game) => { game.world.placeTile(new HumanMonolith(position)); },
            [new Cost(Resource.Energy, 1000), new Cost(Resource.SmartMatter, 500)],
            [
                tileWithinDistanceRequirement(NeuralEmulator, 2),
                techRequirement(NeuralUploadingTech),
            ],
            [hasTech(CooperativeReprogrammingTech), hasTech(MonolithSurveyTech)]
        ),

        new MonolithCompletionProject(
            "Activate Seed Core",
            stripIndent`
            The alien faction that built the monolith was destroyed by their ideological opponents before they could
            activate the hypercomputing nanotechnology matrix at the heart of the structure. The vast amounts of stored
            information about the aliens, including the digitized connectome scans of the Monolith's creators, can only
            be released by repairing and activating the device.


            Evidence suggests that, once activated, the hypercomputing matrix will expand to absorb all available
            matter in order to provide as much computing power as possible to sustain a virtual world for its
            alien inhabitants.`,
            AlienSeedCore,
            AlienCircuits,
            [
                new Cost(Resource.Energy, 100000)
            ],
            [
                tileWithinDistanceRequirement(NanotechFoundry, 3),
                tileWithinDistanceRequirement(NeuralEmulator, 2),
                techRequirement(SingularityEngineeringTech),
            ],
            [
                hasTech(MonolithSurveyTech)
            ]

        )
    ];

    static readonly tileName: string = "Monolith";
    static readonly tileDescription: string = "A towering alien structure";
    getTileName(): string {
        return Monolith.tileName;
    }
    getTileDescription(): string {
        return Monolith.tileDescription;
    }

    static schema = S.classOf({ position: GridCoordinates.schema }, ({ position }) => new Monolith(position));
}

tileTypes[Monolith.name] = Monolith;
