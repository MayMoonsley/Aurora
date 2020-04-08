import Cost from "./Cost";
import Resource from "./Resource";
import { Objects } from "../util/Objects.js";
import { Schemas as S } from "../serialize/Schema.js";

export default class Species {
    // all species instances are defined here
    static readonly Human = new Species("👩🏻‍🚀 Human Colonists", 0.1, new Cost(Resource.Food, 1));
    static readonly Robot = new Species("🦾 Robots", 0, new Cost(Resource.Energy, 0.5));

    // the constructor is private because the resources defined as static members above should be the only possible instances
    private constructor(
        public readonly name: string,
        public readonly growthMultiplier: number, // % increase in population per turn
        public readonly survivalCost: Cost, // resources required per worker to keep workers of this species alive
    ) {}

    // returns a list of all species instances
    static values(): Species[] {
        return Objects.safeKeys(Species)
            .map(k => Species[k])
            .filter((v): v is Species => v instanceof Species);
    }

    static entries(): Record<string, Species> {
        const acc: Record<string, Species> = {};
        Objects.safeEntries(Species)
            .filter((t): t is [keyof typeof Species, Species] => t[1] instanceof Species)
            .forEach(([k, v]) => { acc[k] = v; });
        return acc;
    }

    static schema = S.mapping(Species.entries());
}
