import Tile, { tileTypes } from "../Tile.js";
import GridCoordinates from "../GridCoordinates.js";
import { RoadTextureCross, RoadTextureVertical, RoadTextureHorizontal, RoadTextureTSouth, RoadTextureTNorth, RoadTextureTEast,
    RoadTextureTWest, RoadTextureCornerTopRight, RoadTextureCornerBottomRight, RoadTextureCornerTopLeft,
    RoadTextureCornerBottomLeft, } from "../../UI/Images.js";
import World from "../World.js";
import { Schemas as S } from "../../serialize/Schema.js";


export default class Road extends Tile {
    protected texture: HTMLImageElement = RoadTextureCross;

    constructor(position: GridCoordinates) {
        super(position);
    }

    static readonly tileName: string = "Road";
    static readonly tileDescription: string = "Allows transportation of workers and supplies";
    getTileName(): string {
        return Road.tileName;
    }
    getTileDescription(): string {
        return Road.tileDescription;
    }

    getTexture(world: World): HTMLImageElement {
        const x = this.position.x;
        const y = this.position.y;

        const above = world.getTileAtCoordinates(new GridCoordinates(x, y - 1)) instanceof Road;
        const below = world.getTileAtCoordinates(new GridCoordinates(x, y + 1)) instanceof Road;
        const right = world.getTileAtCoordinates(new GridCoordinates(x + 1, y)) instanceof Road;
        const left = world.getTileAtCoordinates(new GridCoordinates(x - 1, y)) instanceof Road;


        // 4 neighbors
        if (left && right && above && below) {
            return RoadTextureCross;
        }

        // 3 neighbors
        if (left && right && above) {
            return RoadTextureTNorth;
        }
        if (left && above && below) {
            return RoadTextureTWest;
        }
        if (left && right && below) {
            return RoadTextureTSouth;
        }
        if (right && above && below) {
            return RoadTextureTEast;
        }

        // 2 neighbors
        if (left && right) {
            return RoadTextureHorizontal;
        }
        if (above && below) {
            return RoadTextureVertical;
        }
        if (left && above) {
            return RoadTextureCornerTopLeft;
        }
        if (right && above) {
            return RoadTextureCornerTopRight;
        }
        if (left && below) {
            return RoadTextureCornerBottomLeft;
        }
        if (right && below) {
            return RoadTextureCornerBottomRight;
        }

        // 1 neighbor
        if (left || right) {
            return RoadTextureHorizontal;
        }
        if (above || below) {
            return RoadTextureVertical;
        }

        // 0 neighbors
        return RoadTextureVertical;
    }

    static schema = S.classOf({ position: GridCoordinates.schema }, ({ position }) => new Road(position));
}

tileTypes[Road.name] = Road;
