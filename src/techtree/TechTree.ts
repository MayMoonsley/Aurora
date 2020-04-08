import Technology from "./Technology.js";
import Resource from "../resources/Resource.js";
import Cost from "../resources/Cost.js";
import { stripIndent } from "../util/Text.js";

export const IndustrialEngineeringTech = Technology.makeUnlockableTechnology(
    "Industrial Engineering",
    "Approaches for optimizing production processes",
    [],
    new Cost(Resource.EngineeringKnowledge, 25),
);

export const StructureConstructionTech = Technology.makeUnlockableTechnology(
    "Structural Engineering",
    "Techniques for fabricating large structures on the planet's surface",
    [],
    new Cost(Resource.EngineeringKnowledge, 10),
);

export const RobotTech = Technology.makeUnlockableTechnology(
    "Distributed Robotics",
    "Autonomous robotic worker drones capable of performing the same jobs as human workers",
    [IndustrialEngineeringTech],
    new Cost(Resource.EngineeringKnowledge, 100),
);

export const SwarmRoboticsTech = Technology.makeUnlockableTechnology(
    "Swarm Robotics",
    "Algorithms for efficiently managing large numbers of robotic workers",
    [RobotTech],
    new Cost(Resource.EngineeringKnowledge, 100),
);

export const BehaviorModelingTech = Technology.makeUnlockableTechnology(
    "Colonist Behavior Modeling",
    "Simulations of human behavior in the isolated conditions of a deep space colony",
    [],
    new Cost(Resource.PsychKnowledge, 30),
);

export const UrbanPlanningTech = Technology.makeUnlockableTechnology(
    "Habitation Pods",
    "Compact and efficient residence units allow more humans to be packed into a small habitat",
    [BehaviorModelingTech],
    new Cost(Resource.EngineeringKnowledge, 15),
);

export const NuclearTech = Technology.makeUnlockableTechnology(
    "Nuclear Engineering",
    "Applying nuclear physics to technology and power generation",
    [IndustrialEngineeringTech],
    new Cost(Resource.EngineeringKnowledge, 70)
);

export const SurveyTech = Technology.makeUnlockableTechnology(
    "Planetary Surveying",
    "Exploration of the planetary environment, including the structures believed to have been built by an alien civilization",
    [],
    new Cost(Resource.EngineeringKnowledge, 50),
);

export const GameTheoryTech = Technology.makeUnlockableTechnology(
    "Game theory",
    "Mathematical models of strategic interaction among rational decision-makers",
    [BehaviorModelingTech],
    new Cost(Resource.PsychKnowledge, 30)
);

export const CognitiveBiasesTech = Technology.makeUnlockableTechnology(
    "Cognitive Biases Research",
    "Study of systematic patterns of deviation from rational thinking and decision-making",
    [GameTheoryTech],
    new Cost(Resource.PsychKnowledge, 50)
);

export const RationalityTech = Technology.makeUnlockableTechnology(
    "Human Rationality",
    "Practices to improve humans' ability to form accurate beliefs and make effective decisions",
    [CognitiveBiasesTech],
    new Cost(Resource.PsychKnowledge, 200)
);

export const AiResearchTech = Technology.makeHiddenTechnology(
    "AI Safety Research",
    "A proposal for researching techniques for aligning the goals of an artificial intelligence with the goals of its human creators",
    false,
);


export const ControlProblemTech = Technology.makeUnlockableTechnology(
    "Control Problem",
    "A description of the problem of creating a superintelligent agent that will behave in a way that benefits its creators",
    [AiResearchTech],
    new Cost(Resource.AlignmentKnowledge, 20),
);

export const MotivationSelectionTech = Technology.makeUnlockableTechnology(
    "Motivation Selection",
    "Techniques for specifying the goals and motives of an artificial intelligence",
    [ControlProblemTech],
    new Cost(Resource.AlignmentKnowledge, 50),
);

export const CEVTech = Technology.makeUnlockableTechnology(
    "Coherent Extrapolated Volition",
    stripIndent`
        What humanity's wishes would be if they knew more, thought faster, were more the people they wished they were, had grown up
        farther together; where the extrapolation converges rather than diverges, where their wishes cohere rather than interfere;
        extrapolated as they wish that extrapolated, interpreted as they wish that interpreted.`,
    [MotivationSelectionTech],
    new Cost(Resource.AlignmentKnowledge, 300),
);

export const DecisionTheoryTech = Technology.makeUnlockableTechnology(
    "Decision Theory",
    "The study of the reasoning underlying an agent's choices",
    [ControlProblemTech],
    new Cost(Resource.AlignmentKnowledge, 40),
);

export const AcausalTradeTech = Technology.makeUnlockableTechnology(
    "Acausal trade",
    stripIndent`
        An application of game theory that allows two agents to each benefit by predicting what the other wants and doing it,
        even though they might have no way of communicating or affecting each other, nor even any direct evidence that the other exists.
        This can also be applied to acausal threats and blackmail, such as in the "Roko's Basilisk" thought experiment.`,
    [DecisionTheoryTech],
    new Cost(Resource.AlignmentKnowledge, 200),
);

export const CooperativeReprogrammingTech = Technology.makeUnlockableTechnology(
    "Cooperative Reprogramming",
    stripIndent`A technique for exploiting an inconsistency in the Neuromorphic Heuristic Intelligence's mental architecture that allows
    its goals to be reprogrammed. This would make it possible for the Overseer to protect human values at the expense of completing its
    original mission.`,
    [AcausalTradeTech, CEVTech],
    new Cost(Resource.AlignmentKnowledge, 700),
);

export const XenoarchaeologyTech = Technology.makeUnlockableTechnology(
    "Xenoarchaeology",
    stripIndent`
        Archaeological exploration of the alien ruins could reveal information about the long-dead alien civilization as well as revealing
        valuable resources.`,
    [SurveyTech],
    new Cost(Resource.AlienKnowledge, 75),
);

export const SociologyTech = Technology.makeUnlockableTechnology(
    "Sociology",
    "The study of the development, structure, and functioning of societies",
    [BehaviorModelingTech],
    new Cost(Resource.PsychKnowledge, 50),
);

export const AlienHistoryTech = Technology.makeUnlockableTechnology(
    "Alien History",
    stripIndent`
        Deciphering the artifacts and writings found in the alien ruins can provide information about the history of their civilization.
        What is the purpose of the ruins and the towering monolith structure? Was their civilization consumed by war over competing
        philosophies? What might alien philosophy be like?`,
    [SociologyTech, XenoarchaeologyTech],
    new Cost(Resource.AlienKnowledge, 200),
);

export const XenoMaterialsTech = Technology.makeUnlockableTechnology(
    "Xenomaterials",
    "Techniques for processing and applying exotic resources found in the ruins of the alien civilization",
    [XenoarchaeologyTech],
    new Cost(Resource.AlienKnowledge, 200),
);

export const NanoTech = Technology.makeUnlockableTechnology(
    "Nanotechnology",
    "Manipulation of matter on an atomic, molecular, and supramolecular scale",
    [XenoMaterialsTech],
    new Cost(Resource.EngineeringKnowledge, 100),
);

export const ZeroPointTech = Technology.makeUnlockableTechnology(
    "Zero Point Energy",
    "Exploiting exotic, previously-unknown principles of physics to extract tremendous amounts of energy from the quantum vacuum",
    [XenoMaterialsTech, NuclearTech],
    new Cost(Resource.EngineeringKnowledge, 250),
);

export const MonolithSurveyTech = Technology.makeHiddenTechnology(
    "Monolith Surveying",
    stripIndent`
        The monolith appears to be some sort of supercomputer that was left unfinished when the alien civilization collapsed. Some
        archaeological evidence suggests that the monolith's construction caused the war in which the aliens destroyed each other.
        Studying it in detail may reveal its true purpose.`,
);

export const HypercomputingTech = Technology.makeUnlockableTechnology(
    "Hypercomputing",
    stripIndent`
        Powerful new models of computation that could eclipse traditional computer technology and produce results that are not
        turing-computable`,
    [XenoMaterialsTech],
    new Cost(Resource.EngineeringKnowledge, 300)
);

export const NeuralUploadingTech = Technology.makeUnlockableTechnology(
    "Neural Uploading",
    stripIndent`
        Exploration of the alien monolith revealed that its memory banks store copies of the alien lifeforms' connectomes, which could
        potentially be used to resurrect their minds within a virtual reality. Studying this technology could allow us to reactivate these
        minds, or even scan and simulate human minds with perfect fidelity.`,
    [MonolithSurveyTech, HypercomputingTech],
    new Cost(Resource.AlienKnowledge, 200)
);

export const SingularityEngineeringTech = Technology.makeUnlockableTechnology(
    "Singularity Engineering",
    stripIndent`
        The alien monolith appears to be the seed of a self-replicating computer network, which was designed to convert the entire planet,
        and perhaps the entire galaxy, into a maximally-efficient computing substrate. It may be possible to unlock all of the aliens'
        data by repairing and activating this machine.`,
    [MonolithSurveyTech],
    new Cost(Resource.AlienKnowledge, 500)
);
