import Tile, { tileTypes } from "../Tile.js";
import GridCoordinates from "../GridCoordinates.js";
import { RuinsTexture1, RuinsTexture2 } from "../../UI/Images.js";
import { Random } from "../../util/Random.js";
import TileProject from "../../tileProjects/TileProject.js";
import Game from "../../Game.js";
import Recycler from "./Recycler.js";
import { SurveyTech, XenoarchaeologyTech } from "../../techtree/TechTree.js";
import Cost from "../../resources/Cost.js";
import Resource from "../../resources/Resource.js";
import { roadRequirement, techRequirement } from "../../queries/DescribedTileQuery.js";
import { hasTech } from "../../queries/Queries.js";
import { Schemas as S } from "../../serialize/Schema.js";

export default class Ruins extends Tile {

    private textureVariant: 1 | 2 = Random.bool() ? 1 : 2;
    protected texture: HTMLImageElement = RuinsTexture1;

    constructor(position: GridCoordinates) {
        super(position);
    }

    possibleProjects = [
        new TileProject("Excavate", "Construct a facility to harvest exotic alien resources from the ruins",
            (position: GridCoordinates, game: Game) => game.world.placeTile(new Recycler(position, this.textureVariant)),
            [new Cost(Resource.BuildingMaterials, 200), new Cost(Resource.Energy, 100)],
            [roadRequirement, techRequirement(XenoarchaeologyTech)],
            [hasTech(SurveyTech)],
        )
    ];


    static readonly tileName: string = "Alien Ruins";
    static readonly tileDescription: string = "Abandoned structure built by a long-dead alien civilization";
    getTileName(): string {
        return Ruins.tileName;
    }
    getTileDescription(): string {
        return Ruins.tileDescription;
    }

    getTexture(): HTMLImageElement {
        switch (this.textureVariant) {
        case 1:
            return RuinsTexture1;
        case 2:
            return RuinsTexture2;
        }
    }

    static schema = S.contra(
        S.recordOf({
            position: GridCoordinates.schema,
            textureVariant: S.union(S.literal(1 as const), S.literal(2 as const)),
        }), (ruins: Ruins) => ({
            position: ruins.position,
            textureVariant: ruins.textureVariant
        }), ({ position, textureVariant }) => {
            const r = new Ruins(position);
            r.textureVariant = textureVariant;
            return r;
        }
    );
}

tileTypes[Ruins.name] = Ruins;
