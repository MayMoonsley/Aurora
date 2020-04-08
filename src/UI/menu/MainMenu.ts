import { UI } from "../UI.js";
import { GameWindow, Page } from "../GameWindow.js";
import CreditsScreen from "./CreditsScreen.js";
import SettingsScreen from "./SettingsScreen.js";
import { enableCheats } from "../../util/Cheats.js";
import WorldScreen from "../worldScreen/WorldScreen.js";
import Game from "../../Game.js";
import { MusicManager } from "../../music/MusicManager.js";

export default class MainMenu implements Page {

    readonly html: HTMLElement;

    constructor() {
        this.html = UI.makeDiv(["main-menu"]);
        this.refresh();
    }

    static makeAudioButton(menuPage: Page): HTMLButtonElement {
        const musicPlaying = MusicManager.isPlaying();
        if (!musicPlaying) {
            return UI.makeButton("enable_audio", () => {
                MusicManager.initialize();
                menuPage.refresh();
            });
        } else {
            return UI.makeButton("disable_audio", async (button: HTMLButtonElement) => {
                button.disabled = true;
                button.innerText = "please_wait";
                await MusicManager.stop();
                menuPage.refresh();
            });
        }
    }

    refresh(): void {
        UI.fillHTML(this.html, [
            UI.makeHeader("Aurora", 1),
            UI.makeDivContaining([
                UI.makeButton("start_game", () => {
                    const newGame = Game.newGame();
                    enableCheats(newGame);
                    GameWindow.show(new WorldScreen(newGame));
                }),
                MainMenu.makeAudioButton(this),
                UI.makeButton("change_settings", () => GameWindow.show(new SettingsScreen(this))),
                UI.makeButton("view_credits", () => GameWindow.show(new CreditsScreen())),
            ], ["main-menu-options"]),
        ]);
    }
}
