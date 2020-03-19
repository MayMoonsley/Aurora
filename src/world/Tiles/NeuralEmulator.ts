import Tile from "../Tile.js";
import GridCoordinates from "../GridCoordinates.js";
import { NanotechFoundryTexture, NeuralEmulatorTexture } from "../../UI/Images.js";

export default class NeuralEmulator extends Tile {
    protected texture: HTMLImageElement = NeuralEmulatorTexture;

    constructor(position: GridCoordinates) {
        super(position);
    }

    static readonly tileName: string = "Neural Emulation Platform";
    static readonly tileDescription: string = `A machine capable of interfacing with the alien monolith's hypercomputers and accessing the stored alien connectomes`;
    getTileName(): string {
        return NeuralEmulator.tileName;
    }
    getTileDescription(): string {
        return NeuralEmulator.tileDescription;
    }
}