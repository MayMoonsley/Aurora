import { UI } from "../UI.js";
import { GameWindow, Page } from "../GameWindow.js";
import MainMenu from "./MainMenu.js";


class CreditsEntry {
    constructor(readonly header: string, readonly text: string[], readonly largeText?: boolean) {}
}

const credits: CreditsEntry[] = [
    new CreditsEntry("Grace Rarer", ["Team Lead, Game Designer, Programmer"], true),
    new CreditsEntry("Prindle", ["Programmer, DevOps"], true), // <3
    new CreditsEntry("May Lawver", ["Music Generation Programmer"], true),
    new CreditsEntry("Seong Ryoo", ["Environment Artist"], true),
    new CreditsEntry("Code Contributors", ["Mitchell Philipp", "Brad Baker", "Will Cooper"]),
    new CreditsEntry("Third Party Assets", [
        "Twemoji (MIT License for code, CC-BY for graphics)",
        "IBM Plex Mono (Open Font License)",
        "NASA Images (public domain)",
    ]),
    new CreditsEntry("Aurora is released under the MIT License", [
        "Source code is available at github.com/GRarer/Aurora"
    ]),
];

// this may need to become a real class in the future
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class CreditsScreen implements Page {

    readonly html: HTMLElement;
    constructor() {
        this.html = UI.makeDiv(["credits"]);
        this.refresh();
    }

    refresh(): void {
        UI.fillHTML(this.html, [
            ...credits.map(entry => this.renderCreditsEntry(entry)),
            UI.makeButton("Back", () => GameWindow.show(new MainMenu())),
        ]);
    }

    private renderCreditsEntry(entry: CreditsEntry): HTMLElement {
        return UI.makeDivContaining([
            UI.makeHeader(entry.header),
            ...entry.text.map(text => UI.makePara(text)),
        ], entry.largeText ? ["credits-entry-large"] : ["credits-entry-small"]);
    }
}
