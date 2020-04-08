import { Objects } from "../util/Objects.js";
import { Schemas as S } from "../serialize/Schema.js";

export default class Resource {
    // all resource instances are defined here
    static readonly Energy = new Resource("⚡ Energy");
    static readonly Food = new Resource("🌯 Food");
    static readonly Metal = new Resource("⛏ Metal Ore");
    static readonly BuildingMaterials = new Resource("🔩 Construction Parts");
    static readonly Electronics = new Resource("💡 Electronics");

    static readonly Cavorite = new Resource("💎 Cavorite");
    static readonly Orichalcum = new Resource("🧪 Orichalcum");
    static readonly Superconductor = new Resource("🧵 Superconductor");
    static readonly SmartMatter = new Resource("💠 SmartMatter");

    // knowledge types used to research technologies are also resources
    static readonly EngineeringKnowledge = new Resource("⚙️ Engineering Data");
    static readonly PsychKnowledge = new Resource("🧠 Psychological Data");
    static readonly AlienKnowledge = new Resource("🛸 Alien Data");
    static readonly AlignmentKnowledge = new Resource("📎 AI Alignment Data");


    // the constructor is private because the resources defined as static members above should be the only possible instances
    private constructor(
        public readonly name: string,
    ) {}

    // returns a list of all resource instances
    static values(): Resource[] {
        return Objects.safeKeys(Resource)
            .map(k => Resource[k])
            .filter((v): v is Resource => v instanceof Resource);
    }

    static entries(): Record<string, Resource> {
        const acc: Record<string, Resource> = {};
        Objects.safeEntries(Resource)
            .filter((t): t is [keyof typeof Resource, Resource] => t[1] instanceof Resource)
            .forEach(([k, v]) => { acc[k] = v; });
        return acc;
    }

    static schema = S.mapping(Resource.entries());
}
