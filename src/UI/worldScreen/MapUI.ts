import World from "../../world/World.js";
import { UI } from "../UI.js";
import Tile from "../../world/Tile.js";
import { clamp } from "../../util/Util.js";
import GridCoordinates from "../../world/GridCoordinates.js";
import WorldScreen from "./WorldScreen.js";
import { HighlightSelectionImage } from "../Images.js";
import { Page } from "../GameWindow.js";

// class to manage the UI canvas that shows the map
export default class MapUI implements Page {

    private static readonly pixelsPerTile: number = 100;

    private static readonly highlightImage: HTMLImageElement = HighlightSelectionImage;

    private world: World;

    readonly html: HTMLCanvasElement; // the html for this component is an html canvas that we draw tiles onto
    private parentScreen: WorldScreen; // the WorldScreen instance that contains this MapUI

    private viewWidth: number = 12; // width of viewable area in tiles
    private viewHeight: number = 8; // height of viewable area in tiles

    private viewPosition: GridCoordinates = new GridCoordinates(0, 0); // coordinates of the current view area's top-left tile
    private highlightedCoordinates: GridCoordinates | null = null; // coordinates of current selected tile, null if no tile is selected

    constructor(parent: WorldScreen, world: World) {
        this.world = world;
        this.parentScreen = parent;

        this.html = UI.makeCanvas(this.viewWidth * MapUI.pixelsPerTile, this.viewHeight * MapUI.pixelsPerTile, ["map-canvas"]);

        // attach click listener for tile selection
        this.html.addEventListener("click", ev => this.handleClick(ev));

        // render the starting area
        this.refresh();
    }

    // re-draws all tiles in the viewable area
    public refresh(): void {
        const tilesInViewableArea = this.world.getTilesInRectangle(this.viewPosition.x, this.viewPosition.y, this.viewWidth, this.viewHeight);
        for (const tile of tilesInViewableArea)  {
            this.drawSquareAtCoordinates(tile.texture, tile.position);
        }
        // render the highlight reticle thing
        if (this.highlightedCoordinates !== null) {
            this.drawSquareAtCoordinates(MapUI.highlightImage, this.highlightedCoordinates);
        }
    }

    private drawSquareAtCoordinates(image: HTMLImageElement, coordinates: GridCoordinates): void {
        const context = this.html.getContext("2d")!;
        context.imageSmoothingEnabled = false; // disable antialiasing to allow crispy pixel art

        const x = coordinates.x - this.viewPosition.x;
        const y = coordinates.y - this.viewPosition.y;

        if ((x < 0) || (y<0) || (x >= this.viewWidth) || (y >= this.viewHeight)) {
            return; // don't attempt to draw tiles outside the viewable area
        }

        const ratio = MapUI.pixelsPerTile / image.width;

        const screenWidth = MapUI.pixelsPerTile;
        const screenHeight = image.height * ratio; // necessary scaling for non 100xN images

        const screenX = x * MapUI.pixelsPerTile;
        const screenY = y * MapUI.pixelsPerTile - screenHeight + MapUI.pixelsPerTile; // make sure tall images line up properly

        context.drawImage(image, screenX, screenY, screenWidth, screenHeight);
    }

    private selectTile(tile: Tile | null): void {
        this.highlightedCoordinates = tile ? tile.position : null;
        this.refresh();
        this.parentScreen.changeSidebarTile(this.highlightedCoordinates);
    }

    private moveViewArea(right: number, down: number): void {
        const newX = clamp(0, this.viewPosition.x + right, this.world.width - this.viewWidth);
        const newY = clamp(0, this.viewPosition.y + down, this.world.height - this.viewHeight);
        this.viewPosition = new GridCoordinates(newX, newY);

        this.refresh();
    }

    handleClick(ev: MouseEvent): void {
        const x = Math.floor((ev.pageX - this.html.offsetLeft) * (this.viewWidth / this.html.clientWidth)) + this.viewPosition.x;
        const y = Math.floor((ev.pageY - this.html.offsetTop) * (this.viewHeight / this.html.clientHeight)) + this.viewPosition.y;

        const targetTile = this.world.getTileAtCoordinates(new GridCoordinates(x, y));
        this.selectTile(targetTile);
    }

    handleKeyDown(ev: KeyboardEvent): void {
        const code = ev.code;
        if (code === "ArrowUp" || code === "KeyW") {
            ev.preventDefault();
            this.moveViewArea(0, -1);
        }
        if (code === "ArrowLeft" || code === "KeyA") {
            ev.preventDefault();
            this.moveViewArea(-1, 0);
        }
        if (code === "ArrowDown" || code === "KeyS") {
            ev.preventDefault();
            this.moveViewArea(0, 1);
        }
        if (code === "ArrowRight" || code === "KeyD") {
            ev.preventDefault();
            this.moveViewArea(1, 0);
        }
    }
}
