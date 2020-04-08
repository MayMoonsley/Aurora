import Species from "./Species";
import { Schemas as S } from "../serialize/Schema.js";

// a single tile's population capacity for a specific species of worker
export default class Housing {
    constructor(
        public readonly species: Species,
        public readonly capacity: number,
    ) {}

    static schema = S.classOf({
        species: Species.schema,
        capacity: S.aNumber,
    }, ({ species, capacity }) => new Housing(species, capacity));
}
