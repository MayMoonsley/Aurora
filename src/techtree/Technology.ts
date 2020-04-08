import Cost from "../resources/Cost.js";
import Resource from "../resources/Resource.js";
import { Schema, Schemas as S, LazySchemas as LS } from "../serialize/Schema.js";

export const ResearchableTechnologies: Technology[] = [];

export default class Technology {
    private constructor(
        public readonly name: string,
        public readonly description: string,
        public readonly requiredTechs: Technology[],
        public readonly researchCost: Cost,
        public readonly visible: boolean = true,
    ) {}

    static makeUnlockableTechnology(name: string, description: string, requiredTechs: Technology[], researchCost: Cost): Technology {
        const newTech = new Technology(name, description, requiredTechs, researchCost, true);
        ResearchableTechnologies.push(newTech);
        return newTech;
    }

    // hidden technologies cannot be unlocked through the tech tree, but can be used for scripted actions
    static makeHiddenTechnology(name: string, description: string, visible: boolean = false): Technology {
        return new Technology(name, description, [], new Cost(Resource.EngineeringKnowledge, 0), visible);
    }

    equals(other: Technology): boolean {
        // Names uniquely identify technology
        return this.name === other.name;
    }

    static schema(): Schema<Technology, any> {
        const s: Schema<Technology, any> = S.classOf({
            name: S.aString,
            description: S.aString,
            requiredTechs: LS.arrayOf(() => s),
            researchCost: Cost.schema,
            visible: S.aBoolean,
        }, (args: any) => {
            return new Technology(args.name, args.description, args.requiredTechs, args.researchCost, args.visible);
        });
        return s;
    }
}
