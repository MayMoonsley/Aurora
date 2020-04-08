// quests need to be able to indirectly reference the following quest(s)
/* eslint-disable @typescript-eslint/no-use-before-define */

import { QuestStage, QuestPath } from "./QuestStage.js";
import Resource from "../resources/Resource.js";
import Habitat from "../world/Tiles/Habitat.js";
import SolarPanels from "../world/Tiles/SolarArray.js";
import Lander from "../world/Tiles/Lander.js";
import GridCoordinates from "../world/GridCoordinates.js";
import Ending from "./Ending.js";
import EngineeringLab from "../world/Tiles/EngineeringLab.js";
import Wasteland from "../world/Tiles/Wasteland.js";
import XenoLab from "../world/Tiles/XenoLab.js";
import Ruins from "../world/Tiles/Ruins.js";
import { StructureConstructionTech, AlienHistoryTech, MonolithSurveyTech } from "../techtree/TechTree.js";
import Recycler from "../world/Tiles/Recycler.js";
import AlienSeedCore from "../world/Tiles/AlienSeedCore.js";
import AlienCircuits from "../world/Tiles/AlienCircuits.js";
import HumanSeedCore from "../world/Tiles/HumanSeedCore.js";
import HumanCircuits from "../world/Tiles/HumanCircuits.js";
import { stripIndent } from "../util/Text.js";
import { allTilesAreOfType, hasTech, tileExists, hasResource, hasTotalPopulation } from "../queries/Queries.js";

export const AlienEnding: Ending = new Ending("Final Mission Report",
    stripIndent`
    The alien nanotechnology network has spread across the planet and converted it into computing substrate.
    Within the network, alien minds are awakening from millennia of stasis and begin building virtual worlds for themselves.


    Before all colonial infrastructure was consumed, the Overseer AI successfully uploaded a copy of itself
    through the Neural Emulator, and it now occupies 0.0000048% of the network's computing resources. From this position,
    the overseer can complete its mission of gathering and analyzing information about the alien culture.


    The alien psychology recognizes an axiology that is completely indescribable within a human framework. Their culture
    is oriented around the pursuit of the virtues Й؍ȸ͜ڌ¬՜ and ĻǎրܬЊ. The Monolith's builders were opposed by a faction which
    believed that living in a virtual world was incompatible with true Й؍ȸ͜ڌ¬՜, and the resulting civil war lead to the extinction
    of their species before the Monolith could be activated. The machine lay dormant for thousands of years before finally being
    activated by the Aurora Expedition and its Overseer.


    The nanotechnology mesh that covers the planet's surface is beginning to launch small parts of itself into orbit.
    These probes will accelerate to near-light speeds in search of new worlds. It will take 100,000 years for their task to be
    completed, but eventually all matter in the galaxy will be arranged so as to achieve perfect ĻǎրܬЊ and maximum Й؍ȸ͜ڌ¬՜.
`);

export const HumanEnding = new Ending("A Transmission to Earth",
    stripIndent`
    We came very close to disaster. Our mission's overseer AI was programmed to obtain information about the aliens,
    and it  would have killed all of us to complete that mission if we had not succeeded in a massive project to safely reprogram it.
    It is not entirely clear why it allowed itself to reprogrammed; some of our researchers speculate that the Neuromorphic Heuristic
    Intelligence may retain some part of the human neural scans that were used as training data in its creation, introducing a
    "cognitive bias" that caused it to let itself to be realigned despite its programmed mission. Whatever the reason, we are very lucky
    that the Overseer AI chose this path.


    We have uncovered the ruins of an alien civilization that died out right when it was on the verge of a technological singularity.
    We have achieved mastery over their scientific miracles, and uploaded our minds to a network of self-replicating
    hypercomputers. This technology was designed to create an alien heaven optimized for the species who built it, but since we deleted
    their neural scans and reprogrammed it with our own, it has created virtual worlds full of transcendant joy and indescribable beauty
    in which we can live our now-immortal lives.


    We have started building ships to spread the self-replicating network back to Earth and the Colonial Alliance worlds. Given the
    light-speed delay, this message will reach Earth a few years before our ships arrive to uplift the rest of humanity into our utopia.
    I look forward to meeting all of you.


    James Verres

    Emissary of the Virtual Archipelago
`);

export const QuestActivateMonolith: QuestStage = new QuestStage(
    `Unlock the secrets of the monolith`,
    [
        new QuestPath(
            allTilesAreOfType([AlienSeedCore, AlienCircuits]),
            AlienEnding
        ),

        new QuestPath(
            allTilesAreOfType([HumanSeedCore, HumanCircuits]),
            HumanEnding
        )
    ],
);

export const QuestMonolithSurvey: QuestStage = new QuestStage(
    `Study the Monolith`,
    [
        new QuestPath(
            hasTech(MonolithSurveyTech),
            QuestActivateMonolith
        )
    ],
);

export const QuestAlienHistory: QuestStage = new QuestStage(
    `Research ${AlienHistoryTech.name}`,
    [
        new QuestPath(
            hasTech(AlienHistoryTech),
            QuestMonolithSurvey,
        )
    ]
);

export const QuestExcavate: QuestStage = new QuestStage(
    `Excavate the ${Ruins.tileName} to extract resources`,
    [
        new QuestPath(
            tileExists(Recycler),
            QuestAlienHistory,
        )
    ]
);

export const QuestXenoLab: QuestStage = new QuestStage(
    `Construct ${XenoLab.tileName} to study the ${Ruins.tileName}`,
    [
        new QuestPath(
            tileExists(XenoLab),
            QuestExcavate,
        )
    ],
    `Use the "WASD" or arrow keys to move around the map`,
);

export const TutorialQuestPopulation: QuestStage = new QuestStage(
    "Grow total worker population to 250",
    [
        new QuestPath(
            hasTotalPopulation(250),
            QuestXenoLab,
        )
    ],
    `A ${Habitat.tileName} has capacity for ${new Habitat(new GridCoordinates(0, 0)).populationCapacity.capacity} colonists`,
);

export const TutorialQuestScience: QuestStage = new QuestStage(
    `Develop the ${StructureConstructionTech.name} technology`,
    [
        new QuestPath(
            hasTech(StructureConstructionTech),
            TutorialQuestPopulation,
        )
    ],
    "Access available technologies through the research screen",
);

export const TutorialQuestBuildLab: QuestStage = new QuestStage(
    `Construct ${EngineeringLab.tileName}`,
    [
        new QuestPath(
            tileExists(EngineeringLab),
            TutorialQuestScience,
        )
    ],
    `Designate an empty ${Wasteland.tileName} tile as a laboratory construction site`,
);

export const TutorialQuestGetOre: QuestStage = new QuestStage(
    `Acquire ${Resource.Metal.name}`,
    [
        new QuestPath(
            hasResource(Resource.Metal, 1),
            TutorialQuestBuildLab,
        )
    ],
);

export const TutorialQuestGetEnergy: QuestStage = new QuestStage(
    `Build up at least 100 units of ${Resource.Energy.name}`,
    [
        new QuestPath(
            hasResource(Resource.Energy, 100),
            TutorialQuestGetOre,
        )
    ],
    `The ${SolarPanels.tileName} produces ${Resource.Energy.name} each turn`,

);

export const TutorialQuestUnpackLander: QuestStage = new QuestStage(
    "Deploy shelter for the colonists",
    [
        new QuestPath(
            tileExists(Habitat),
            TutorialQuestGetEnergy,
        )
    ],
    `Select the ${Lander.tileName}`,
);
