import World from "./world/World.js";
import Inventory from "./resources/Inventory.js";
import Conversion from "./resources/Conversion.js";
import { QuestStage } from "./quests/QuestStage.js";
import { TutorialQuestUnpackLander } from "./quests/Quests.js";
import Technology, { ResearchableTechnologies } from "./techtree/Technology.js";
import { Arrays } from "./util/Arrays.js";
import Ending from "./quests/Ending.js";
import { Schemas as S } from "./serialize/Schema.js";

// Holds the state of one run of the game, including the game world, inventory, and run statistics
export default class Game {
    private endState: Ending | undefined = undefined;

    private prevQuestDescription = "";
    public questCompletionShown: boolean = true;

    private completedTechs: Technology[] = [];

    private constructor(
        readonly world: World,
        readonly inventory: Inventory,
        private questStage: QuestStage,
    ) {}

    static newGame(): Game {
        const world = World.generateWorld();
        const inventory = new Inventory(world);
        const questStage = TutorialQuestUnpackLander;
        return new Game(world, inventory, questStage);
    }

    getCurrentQuestDescription(): string {
        return this.questStage.description;
    }

    getCurrentQuestHint(): string | undefined {
        return this.questStage.hint;
    }

    getQuestEndState(): Ending | undefined {
        return this.endState;
    }

    updateQuestState(): void {
        const next = this.questStage.nextState(this);
        if (next instanceof Ending) {
            this.endState = next;
            this.questCompletionShown = false;
        } else if (next !== this.questStage) {
            const prevDescription = this.questStage.description;
            this.questStage = next;
            // repeat to skip over the next quest if it's requirements are already completed
            this.updateQuestState();
            this.questCompletionShown = false;
            this.prevQuestDescription = prevDescription;
        }
    }

    getPreviousQuestDescription(): string {
        return this.prevQuestDescription;
    }

    // Returns all resource conversions in the order in which they will be applied
    getResourceConversions(): Conversion[] {
        const allConversions = Arrays.flatten(this.world.getTiles().map(tile => tile.resourceConversions));
        // sort by priority number
        allConversions.sort((a, b) => a.priority - b.priority);
        return allConversions;
    }

    hasUnlockedTechnology(tech: Technology): boolean {
        return this.completedTechs.some(t => t.equals(tech));
    }

    unlockTechnology(tech: Technology): void {
        if (!this.hasUnlockedTechnology(tech)) {
            this.completedTechs.push(tech);
        }
    }

    getUnlockedTechnologies(): Technology[] {
        return this.completedTechs;
    }

    getResearchOptions(): Technology[] {
        return ResearchableTechnologies
            .filter(tech => tech.visible)
            .filter(tech => tech.requiredTechs.every(prerequisite => {
                return this.completedTechs.some(t => t.equals(prerequisite));
            }))
            .filter(tech => !this.hasUnlockedTechnology(tech));
    }

    // this is called at the end of each turn
    completeTurn(): void {
        // calculate resource production
        this.inventory.applyConversions(this.getResourceConversions());

        this.inventory.releaseWorkers();
        this.inventory.doPopulationGrowth();

        this.updateQuestState();
    }

    // Moves a conversion to a different point in the order of priorities
    shiftConversionPriority(fromIndex: number, toIndex: number): void {
        if (fromIndex === toIndex || fromIndex < 0) {
            return;
        }

        const conversions = this.getResourceConversions();
        if (toIndex >= conversions.length) {
            return;
        }

        // The priority of toIndex after shifting intermediate priorities
        const priority = conversions[toIndex].priority;
        if (fromIndex < toIndex) {
            // Shift intermediate priorities up
            for (let i = toIndex; i > fromIndex; i--) {
                conversions[i].priority = conversions[i - 1].priority;
            }
        } else {
            // Shift intermediate priorities down
            for (let i = toIndex; i < fromIndex; i++) {
                conversions[i].priority = conversions[i + 1].priority;
            }
        }
        conversions[fromIndex].priority = priority;
    }

    static schema = S.contra(
        S.recordOf({
            world: World.schema,
            inventory: Inventory.schema,
            questStage: QuestStage.schema(),
            endState: S.optional(Ending.schema),
            prevQuestDescription: S.aString,
            questCompletionShown: S.aBoolean,
            completedTechs: S.arrayOf(Technology.schema()),
        }),
        (game: Game) => ({
            world: game.world,
            inventory: Inventory.schema.project(game.inventory),
            questStage: game.questStage,
            endState: game.endState,
            prevQuestDescription: game.prevQuestDescription,
            questCompletionShown: game.questCompletionShown,
            completedTechs: game.completedTechs,
        }),
        ({ world, inventory, questStage, endState, prevQuestDescription, questCompletionShown, completedTechs }) => {
            const inv = Inventory.schema.inject(world)(inventory);
            const game = new Game(world, inv, questStage);
            game.endState = endState;
            game.prevQuestDescription = prevQuestDescription;
            game.questCompletionShown = questCompletionShown;
            game.completedTechs = completedTechs;
            return game;
        },
    );
}

