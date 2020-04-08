import Game from "../Game.js";
import { DomainOf, Schemas as S } from "../serialize/Schema.js";
import { Storage } from "./Storage.js";

/**
 * The schema of everything that needs to be serialized about the current game
 * state in a save.
 */
const gameStateSchema = S.recordOf({
    game: Game.schema,
    nextConversionPriority: S.aNumber,
});

type GameState = DomainOf<typeof gameStateSchema>;

export namespace GameSave {
    // The key to use in local storage
    const lsKey = "save" as const;

    /**
     * Save the current state of the game in local storage. Returns 'true' if
     * saving succeeded and false otherwise.
     */
    export function saveProgress(gameState: GameState): boolean {
        return Storage.saveItem(lsKey, gameState, gameStateSchema);
    }

    /**
     * Load the previous state of the game from local storage.
     */
    export function loadProgress(): GameState | undefined {
        const stored = Storage.loadItem(lsKey, gameStateSchema);
        if (stored?.resultType === "success") {
            return stored.result;
        } else {
            return undefined;
        }
    }

    /**
     * Check whether or not there is a stored save state. Does not guarantee
     * that the save state is valid.
     */
    export function saveExists(): boolean {
        return Storage.hasItem(lsKey);
    }

    /**
     * Clear the save state from local storage.
     */
    export function clearProgress(): void {
        Storage.removeItem(lsKey);
    }
}
