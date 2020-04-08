import Cost from "./Cost.js";
import { NonEmptyArray } from "../util/Arrays.js";
import { Schemas as S } from "../serialize/Schema.js";

/* a conversion from input resources to output resources that a tile can perform between turns if the conversion's
 * input resources are available
 */
export default class Conversion {

    private static nextNumber = 0; // the initial priority of the next non-free conversion that will be created

    public enabled: boolean = true; // conversion will be skipped when disabled

    constructor(
        public readonly inputs: Cost[],
        public readonly outputs: NonEmptyArray<Cost>,
        public readonly requiredWorkers: number,
        // Conversions are sorted by priority to determine the order in which
        // conversions are applied. Lower numbered conversions are applied first
        public priority: number,
    ) {}

    static newConversion(inputs: Cost[], outputs: NonEmptyArray<Cost>, requiredWorkers: number = 0): Conversion {
        const c = new Conversion(inputs, outputs, requiredWorkers, Conversion.nextNumber);
        Conversion.nextNumber++;
        return c;
    }

    toString(): string {
        const outputDescription = this.outputs.map((output: Cost) => output.toString()).join(", ");
        const inputStrings = this.inputs.map(cost => cost.toString());
        if (this.requiredWorkers !== 0) {
            inputStrings.push(`${this.requiredWorkers} workers`);
        }
        const inputDescription = inputStrings.join(", ");

        if (inputStrings.length === 0) {
            return `Produce ${outputDescription}`;
        } else {
            return `Produce ${outputDescription} using ${inputDescription}`;
        }
    }

    /**
     * Do not use this function. This exists purely for serialization of the
     * game state. Depending on this value will lead to bad conversion behavior.
     */
    static unsafeGetNextPriority(): number {
        return Conversion.nextNumber;
    }

    /**
     * Do not use this function. This exists purely for deserialization of the
     * game state, and setting this at runtime will lead to bad conversion
     * behavior.
     */
    static unsafeSetNextPriority(priority: number): void {
        Conversion.nextNumber = priority;
    }

    static schema = S.classOf({
        priority: S.aNumber,
        enabled: S.aBoolean,
        inputs: S.arrayOf(Cost.schema),
        outputs: S.nonEmptyArrayOf(Cost.schema),
        requiredWorkers: S.aNumber,
    }, ({ priority, enabled, inputs, outputs, requiredWorkers }) => {
        const c = new Conversion(inputs, outputs, requiredWorkers, priority);
        c.enabled = enabled;
        return c;
    });
}
