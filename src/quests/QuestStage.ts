import Game from "../Game.js";
import Ending from "./Ending.js";
import { WorldQuery, queryWorld, worldQuerySchema } from "../queries/Queries.js";
import { Schema, Schemas as S, LazySchemas as LS } from "../serialize/Schema.js";

// These are mutually recursive classes, so the serialization them to refer to
// each other. This only happens in functions, so this is safe in this instance.
/* eslint-disable @typescript-eslint/no-use-before-define */

export class QuestPath {
    constructor(
        readonly requirement: WorldQuery,
        readonly next: QuestStage | Ending,
    ) { }

    // Since these two classes are mutually recursive, we just use 'any' to
    // avoid the potentially infinite recursive representation types, and use a
    // function instead of a value. The recursion is handled using lazy schemas.
    static schema(): Schema<QuestPath, any> {
        return S.classOf({
            requirement: worldQuerySchema,
            next: S.unionOf(
                (x: QuestStage | Ending): x is QuestStage => x instanceof QuestStage,
                (x: QuestStage | Ending): x is Ending => x instanceof Ending,
                S.lazy(() => QuestStage.schema()),
                Ending.schema,
            ),
        }, ({ requirement, next }) => new QuestPath(requirement, next));
    }
}

export class QuestStage {
    constructor(
        readonly description: string,
        readonly paths: QuestPath[],
        readonly hint?: string
    ) { }

    // returns the next quest-stage or ending if an advancement path requirement is met, otherwise returns this stage
    nextState(game: Game): QuestStage | Ending {
        for (const path of this.paths) {
            if (queryWorld(path.requirement)(game)) {
                return path.next;
            }
        }
        return this;
    }

    // Since these two classes are mutually recursive, we just use 'any' to
    // avoid the potentially infinite recursive representation types, and use a
    // function instead of a value. The recursion is handled using lazy schemas.
    static schema(): Schema<QuestStage, any> {
        return S.contra(
            S.recordOf({
                description: S.aString,
                paths: LS.arrayOf(() => QuestPath.schema()),
                hint: S.optional(S.aString),
            }), qs => ({
                description: qs.description,
                paths: qs.paths,
                hint: qs.hint,
            }), ({ description, paths, hint }) => new QuestStage(description, paths, hint),
        );
    }
}
