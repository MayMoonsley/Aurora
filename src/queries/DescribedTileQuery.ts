import GridCoordinates from "../world/GridCoordinates";
import Game from "../Game";
import {
    hasTech, adjacentToRoad, tileWithinDistance, anyTileWithinDistance, speciesHasPopulation, availableHousing,
    TileQuery, queryTile, orQuery, tileQuerySchema
} from "./Queries.js";
import Technology from "../techtree/Technology";
import { NamedTileType } from "../world/Tile";
import Monolith from "../world/Tiles/Monolith";
import HumanMonolith from "../world/Tiles/HumanMonolith";
import Species from "../resources/Species";
import Ruins from "../world/Tiles/Ruins";
import Recycler from "../world/Tiles/Recycler";
import { Schemas as S } from "../serialize/Schema.js";

// a requirement for completing a tileproject
export default class DescribedTileQuery {
    constructor(
        // user-readable label describing the requirement
        readonly description: string,
        // query describing predicate that returns true when the requirement is met
        private readonly query: TileQuery,
    ) { }

    evaluate(game: Game, position: GridCoordinates): boolean {
        return queryTile(this.query)(game, position);
    }

    toString(): string {
        return this.description;
    }

    static schema = S.contra(
        S.recordOf({
            description: S.aString,
            query: tileQuerySchema(),
        }),
        (x: DescribedTileQuery) => ({ description: x.description, query: x.query }),
        ({ description, query }) => new DescribedTileQuery(description, query),
    );
}

export function techRequirement(technology: Technology): DescribedTileQuery {
    return new DescribedTileQuery(`have the ${technology.name} technology`, hasTech(technology));
}

export const roadRequirement = new DescribedTileQuery("adjacent to a road", adjacentToRoad);

export function tileWithinDistanceRequirement(tileType: NamedTileType, radius: number): DescribedTileQuery {
    return new DescribedTileQuery(
        radius === 1 ? `adjacent to a ${tileType.tileName}` : `within ${radius} units of ${tileType.tileName}`,
        tileWithinDistance(tileType, radius),
    );
}

export function nearMonolithRequirement(radius: number): DescribedTileQuery {
    return new DescribedTileQuery(
        radius === 1 ? `adjacent to a Monolith` : `within ${radius} units of a Monolith`,
        orQuery(tileWithinDistance(Monolith, radius), tileWithinDistance(HumanMonolith, radius))
    );
}

export function nearRuinsOrMonolith(radius: number): DescribedTileQuery {
    return new DescribedTileQuery(
        radius === 1 ? `adjacent to ${Ruins.tileName} or ${Monolith.tileName}`
            : `within ${radius} units of ${Ruins.tileName} or ${Monolith.tileName}`,
        anyTileWithinDistance([Ruins, Recycler, Monolith, HumanMonolith], radius),
    );
}

export function speciesPopulationRequirement(species: Species, minPopulation: number): DescribedTileQuery {
    return new DescribedTileQuery(
        `have at least ${minPopulation} ${species.name}`,
        speciesHasPopulation(species, minPopulation),
    );
}

export function availableHousingRequirement(species: Species, minAvailableCapacity: number): DescribedTileQuery {
    return new DescribedTileQuery(
        `available housing capacity for ${minAvailableCapacity} ${species.name}`,
        availableHousing(species, minAvailableCapacity)
    );
}
