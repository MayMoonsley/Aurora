import MainMenuUI from "./MainMenuUI.js";
import UI from "./UI.js";
import WorldScreen from "./WorldScreen.js";


export default class GameWindow {

    private static rootDiv: HTMLElement = document.getElementById('rootdiv')!; // find the div that holds all graphical UI (see index.html)
    private static worldScreen: WorldScreen = new WorldScreen();


    public static showMainMenu() {
        UI.fillHTML(this.rootDiv, [MainMenuUI.renderMainMenu()]);
    }

    public static showWorldScreen() {
        UI.fillHTML(this.rootDiv, [this.worldScreen.rerenderWorldScreen()]);
    }
}