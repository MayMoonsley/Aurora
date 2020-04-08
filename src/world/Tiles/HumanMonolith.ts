import Tile, { tileTypes } from "../Tile.js";
import GridCoordinates from "../GridCoordinates.js";
import { HumanMonolithTexture } from "../../UI/Images.js";
import TileProject, { MonolithCompletionProject } from "../../tileProjects/TileProject.js";
import { stripIndent } from "../../util/Text.js";
import Resource from "../../resources/Resource.js";
import Cost from "../../resources/Cost.js";
import HumanCircuits from "./HumanCircuits.js";
import HumanSeedCore from "./HumanSeedCore.js";
import { SingularityEngineeringTech } from "../../techtree/TechTree.js";
import NeuralEmulator from "./NeuralEmulator.js";
import NanotechFoundry from "./NanotechFoundry.js";
import { techRequirement, tileWithinDistanceRequirement } from "../../queries/DescribedTileQuery.js";
import { Schemas as S } from "../../serialize/Schema.js";

export default class HumanMonolith extends Tile {
    protected texture: HTMLImageElement = HumanMonolithTexture;

    constructor(position: GridCoordinates) {
        super(position);
    }

    possibleProjects: TileProject[] = [
        new MonolithCompletionProject(
            "Activate Seed Core",
            stripIndent`
            Evidence suggests that, once activated, the hypercomputing matrix will expand to absorb all available
            matter in order to provide as much computing power as possible to sustain a virtual world for its
            inhabitants. It once contained the uploaded minds of its alien designers, but now that it has been reprogrammed
            with the connectomes of human colonists, it should produce a virtual reality utopia optimized for the flourishing
            of humans rather than aliens.`,
            HumanSeedCore,
            HumanCircuits,
            [
                new Cost(Resource.Energy, 100000)
            ],
            [
                tileWithinDistanceRequirement(NanotechFoundry, 3),
                tileWithinDistanceRequirement(NeuralEmulator, 2),
                techRequirement(SingularityEngineeringTech),
            ],
            []
        )
    ];

    static readonly tileName: string = "Reprogrammed Monolith";
    static readonly tileDescription: string = stripIndent`
    A towering alien structure; the hypercomputing matrix contained with in it has been reprogrammed, and the alien data it
    once held has been replaced with the scanned connectomes of human colonists.
    `;
    getTileName(): string {
        return HumanMonolith.tileName;
    }
    getTileDescription(): string {
        return HumanMonolith.tileDescription;
    }

    static schema = S.classOf({ position: GridCoordinates.schema }, ({ position }) => new HumanMonolith(position));
}

tileTypes[HumanMonolith.name] = HumanMonolith;
