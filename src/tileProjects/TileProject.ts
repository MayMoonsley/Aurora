import GridCoordinates from "../world/GridCoordinates";
import Game from "../Game";
import Cost from "../resources/Cost";
import { NamedTileType } from "../world/Tile";
import { GameWindow } from "../UI/GameWindow";
import EndingWorldScreen from "../UI/endingWorldScreen/EndingWorldScreen";
import DescribedTileQuery from "../queries/DescribedTileQuery";
import { TileQuery, queryTile } from "../queries/Queries.js";

/* A project that can be performed by on tile
 * e.g., turning a wasteland tile into a habitat, or researching a technology
 */
export default class TileProject {

    constructor(
        readonly title: string,
        readonly projectDescription: string,
        protected action: ((position: GridCoordinates, run: Game) => void),
        readonly costs: Cost[],
        readonly completionRequirements: DescribedTileQuery[],
        readonly visibilityRequirements: TileQuery[],
    ) {}

    canDo(position: GridCoordinates, run: Game): boolean {
        return run.inventory.canAfford(this.costs)
            && this.isVisible(position, run)
            && this.completionRequirements.every(requirement => requirement.evaluate(run, position));
    }

    isVisible(position: GridCoordinates, run: Game): boolean {
        return this.visibilityRequirements.every(query => queryTile(query)(run, position));
    }

    doAction(position: GridCoordinates, run: Game): void {
        if (!this.canDo(position, run)) {
            throw `tried to do project ${this.title} without meeting requirements`;
        }
        run.inventory.payCost(this.costs);
        this.action(position, run);
    }
}

export function constructionProject(
    tile: NamedTileType, costs: Cost[], completionRequirements: DescribedTileQuery[], visibilityRequirements: TileQuery[]
): TileProject {
    return new TileProject(
        `Construct ${tile.tileName}`, tile.tileDescription,
        (position: GridCoordinates, game: Game) => game.world.placeTile(new tile(position)),
        costs, completionRequirements, visibilityRequirements
    );
}

export class MonolithCompletionProject extends TileProject {
    constructor(
        readonly title: string,
        readonly projectDescription: string,
        private readonly activeMonolithTile: NamedTileType,
        private readonly circuitsTile: NamedTileType,
        readonly costs: Cost[],
        readonly completionRequirements: DescribedTileQuery[],
        readonly visibilityRequirements: TileQuery[],
    ) {
        super(
            title,
            projectDescription,
            (position: GridCoordinates, game: Game) => { game.world.placeTile(new activeMonolithTile(position)); },
            costs,
            completionRequirements,
            visibilityRequirements);
    }

    doAction(position: GridCoordinates, run: Game): void {
        if (!this.canDo(position, run)) {
            throw `tried to do project ${this.title} without meeting requirements`;
        }
        run.inventory.payCost(this.costs);
        this.action(position, run);

        const endingWorldScreen = new EndingWorldScreen(run, position, this.circuitsTile);
        GameWindow.show(endingWorldScreen);
        endingWorldScreen.expandCircuits(1);
    }
}
