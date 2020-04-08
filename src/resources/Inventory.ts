import Resource from "./Resource.js";
import Cost from "./Cost.js";
import Conversion from "./Conversion.js";
import Quantities from "../util/Quantities.js";
import Species from "./Species.js";
import World from "../world/World.js";
import { clamp } from "../util/Util.js";

export default class Inventory {

    private resourceQuantities: Quantities<Resource> = new Quantities<Resource>();
    private populationQuantities: Quantities<Species> = new Quantities<Species>(); // all workers (available + occupied)
    private availableWorkers: number = 0; // workers that have not been occupied for this turn yet

    constructor(
        private world: World, // used to determine population size limits
    ) {}

    addResource(resource: Resource, quantity: number): void {
        this.resourceQuantities.add(resource, quantity);
    }

    removeResource(resource: Resource, quantity: number): void {
        this.resourceQuantities.remove(resource, quantity);
    }

    getResourceQuantity(resource: Resource): number {
        return this.resourceQuantities.get(resource) || 0;
    }

    addWorkers(species: Species, quantity: number): void {
        this.populationQuantities.add(species, quantity);
        this.populationQuantities.set(species, clamp(0, this.populationQuantities.get(species), this.world.getPopulationCapacity(species)));
    }

    // makes a quantity of the population available as workers
    releaseWorkers(quantity: number = Number.POSITIVE_INFINITY): void {
        this.availableWorkers = Math.min(this.availableWorkers + quantity, this.populationQuantities.getSum());
    }

    occupyWorkers(quantity: number): void {
        if (this.availableWorkers < quantity) {
            throw "insufficient workers";
        }
        if (quantity < 0) {
            throw "tried to occupy a negative number of workers";
        }
        this.availableWorkers = this.availableWorkers - quantity;
    }

    getSpeciesList(): Species[] {
        return this.populationQuantities.positiveQuantityKeys();
    }

    getPopulation(species: Species): number {
        return this.populationQuantities.get(species);
    }

    // the total resources needed for this species to prevent worker deaths
    getRequiredWorkerConsumption(species: Species): Cost {
        const totalQuantity = species.survivalCost.quantity * this.populationQuantities.get(species);
        return new Cost(species.survivalCost.resource, totalQuantity);
    }

    // the upkeep resources that will actually be provided for this species
    // if there are not enough resources, this will be less than what is required, resulting in worker deaths
    getProvidedWorkerConsumption(species: Species): Cost {
        const required = this.getRequiredWorkerConsumption(species).quantity;
        const available = this.getResourceQuantity(species.survivalCost.resource);
        const quantity = Math.min(required, available);
        return new Cost(species.survivalCost.resource, quantity);
    }

    doPopulationGrowth(): void {
        for (const species of this.getSpeciesList()) {
            const providedUpkeepCost = this.getProvidedWorkerConsumption(species);
            this.payCost([providedUpkeepCost]);

            const survivingPopulation = Math.floor(providedUpkeepCost.quantity / species.survivalCost.quantity);
            // we don't need to do a housing-capacity check here because it's impossible for the population to increase in this step
            this.populationQuantities.set(species, survivingPopulation);

            // exponential population growth
            const growth = Math.floor(species.growthMultiplier * this.populationQuantities.get(species));
            this.addWorkers(species, growth);
        }
    }

    // reduces population of any species that has inadequate housing capacity
    applyPopulationCaps(): void {
        for (const species of this.getSpeciesList()) {
            this.populationQuantities.set(species,
                clamp(0, this.populationQuantities.get(species), this.world.getPopulationCapacity(species)));
        }
        this.availableWorkers = clamp(0, this.availableWorkers, this.getTotalPopulation());
    }

    getTotalPopulation(): number {
        return this.populationQuantities.getSum();
    }

    getAvailableWorkers(): number {
        return this.availableWorkers;
    }

    canAfford(costs: Cost[]): boolean {
        /* since it's possible that the cost list contains more than one cost of the same resource type, we need to aggregate the costs
         * together to make sure that the entire set of costs can be afforded together
         */
        const costMap = new Map<Resource, number>();
        for (const cost of costs) {
            costMap.set(cost.resource, cost.quantity + (costMap.get(cost.resource) || 0));
        }

        return Array.from(costMap.keys()).every((resource: Resource) => {
            const costQuantity = costMap.get(resource)!;
            const availableQuantity = this.getResourceQuantity(resource);
            return costQuantity <= availableQuantity;
        });
    }

    hasEnoughWorkers(requiredWorkers: number): boolean {
        return this.availableWorkers >= requiredWorkers;
    }

    payCost(costs: Cost[]): void {
        if (this.canAfford(costs)) {
            for (const cost of costs) {
                this.removeResource(cost.resource, cost.quantity);
            }
        } else {
            throw "Cannot afford to pay cost";
        }
    }

    getResourceList(): Resource[] {
        return Resource.values().filter(resource => this.resourceQuantities.get(resource) !== 0);
    }

    // returns strings showing the resource type and amount for each resource in the inventory
    getInventoryStrings(): string[] {
        return this.getResourceList().map((resource: Resource) => `${resource.name}: ${this.getResourceQuantity(resource)}`);
    }

    // returns strings showing the amounts of each population type
    getPopulationStrings(): string[] {
        return this.populationQuantities.positiveQuantityKeys().map(species => `${this.populationQuantities.get(species)} ${species.name}`);
    }

    // Attempts to apply each resource conversion in sequence, skipping those for which the inputs are unavailable
    applyConversions(conversions: Conversion[]): void {
        for (const conversion of conversions) {
            if (this.canAfford(conversion.inputs) && this.hasEnoughWorkers(conversion.requiredWorkers) && conversion.enabled) {
                this.payCost(conversion.inputs);
                this.occupyWorkers(conversion.requiredWorkers);
                for (const output of conversion.outputs) {
                    this.addResource(output.resource, output.quantity);
                }
            }
        }
    }

    clone(): Inventory {
        const clone = new Inventory(this.world);
        clone.resourceQuantities = this.resourceQuantities.clone();
        clone.populationQuantities = this.populationQuantities.clone();
        clone.availableWorkers = this.availableWorkers;
        return clone;
    }
}
