import Tile, { tileTypes, wastelandVariantSchema } from "../Tile.js";
import TileProject from "../../tileProjects/TileProject.js";
import GridCoordinates from "../GridCoordinates.js";
import Game from "../../Game.js";
import Cost from "../../resources/Cost.js";
import Resource from "../../resources/Resource.js";
import { Random } from "../../util/Random.js";
import { WastelandTexture1, WastelandTexture2, WastelandTexture3, WastelandTexture4, WastelandTexture5 } from "../../UI/Images.js";
import Road from "./Road.js";
import ConstructionHabitat from "./ConstructionHabitat.js";
import ConstructionLaboratory from "./ConstructionLaboratory.js";
import ConstructionIndustry from "./ConstructionIndustry.js";
import { MonolithSurveyTech } from "../../techtree/TechTree.js";
import ConstructionVictory from "./ConstructionVictory.js";
import NeuralEmulator from "./NeuralEmulator.js";
import NanotechFoundry from "./NanotechFoundry.js";
import { hasTech, tileExists, orQuery, notQuery } from "../../queries/Queries.js";
import { roadRequirement } from "../../queries/DescribedTileQuery.js";
import { Schemas as S } from "../../serialize/Schema.js";

export default class Wasteland extends Tile {

    protected texture: HTMLImageElement = WastelandTexture5;
    private textureVariant: 1 | 2 | 3 | 4 |5;


    constructor(position: GridCoordinates, textureVariant?: 1 | 2 | 3 | 4 | 5) {
        super(position);
        if (textureVariant) {
            this.textureVariant = textureVariant;
        } else {
            this.textureVariant = Random.fromWeightedArray([
                [1 / 8, 1],
                [1 / 8, 2],
                [1 / 8, 3],
                [1 / 8, 4],
                [4 / 8, 5],
            ]);
        }
    }

    possibleProjects: TileProject[] = [

        new TileProject(
            "Create habitat construction site",
            "Designate this location for construction of habitation and life support facilities",
            (position: GridCoordinates, run: Game) => {
                run.world.placeTile(new ConstructionHabitat(position, this.textureVariant));
            }, [], [], [],
        ),

        new TileProject(
            "Create industry construction site",
            "Designate this location for construction of industrial facilities and infrastructure",
            (position: GridCoordinates, run: Game) => {
                run.world.placeTile(new ConstructionIndustry(position, this.textureVariant));
            }, [], [], [],
        ),

        new TileProject("Create laboratory construction site", "Designate this location for construction of research laboratories",
            (position: GridCoordinates, run: Game) => {
                run.world.placeTile(new ConstructionLaboratory(position, this.textureVariant));
            }, [], [], [],
        ),

        new TileProject("Create xenoengineering construction site", "Designate this location for construction of advanced technologies",
            (position: GridCoordinates, run: Game) => {
                run.world.placeTile(new ConstructionVictory(position, this.textureVariant));
            },
            [],
            [],
            [
                hasTech(MonolithSurveyTech),
                orQuery(notQuery(tileExists(NeuralEmulator)), notQuery(tileExists(NanotechFoundry)))
            ]
        ),

        new TileProject("Construct Road", "Construct roads to extend the reach of the colony's logistics",
            (position: GridCoordinates, run: Game) => {
                run.world.placeTile(new Road(position));
            },
            [new Cost(Resource.BuildingMaterials, 10)],
            [roadRequirement],
            [],
        ),
    ];

    static readonly tileName: string = "Wasteland";
    static readonly tileDescription: string = "Nothing of note here";
    getTileName(): string {
        return Wasteland.tileName;
    }
    getTileDescription(): string {
        return Wasteland.tileDescription;
    }

    // we overload this to avoid having different wasteland textures in the same place in the same run
    getTexture(): HTMLImageElement {
        switch (this.textureVariant) {
        case 1:
            return WastelandTexture1;
        case 2:
            return WastelandTexture2;
        case 3:
            return WastelandTexture3;
        case 4:
            return WastelandTexture4;
        case 5:
            return WastelandTexture5;
        }
    }

    static schema = S.contra(
        S.recordOf({
            position: GridCoordinates.schema,
            textureVariant: wastelandVariantSchema,
        }),
        (w: Wasteland) => ({ position: w.position, textureVariant: w.textureVariant }),
        ({ position, textureVariant }) => new Wasteland(position, textureVariant),
    );
}

tileTypes[Wasteland.name] = Wasteland;
