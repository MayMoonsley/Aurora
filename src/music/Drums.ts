import { SampleInstrument } from "./Instruments.js";
import { SampleNames, SampleData } from "./Samples.js";
import { MidiNumber } from "./Notes.js";
import { impossible } from "../util/Util.js";

export enum Drums {
    KICK, SNARE, CLOSED_HI_HAT, OPEN_HI_HAT
}

export class Drumkit {

    // Dependency inject the available samples
    constructor(
        private readonly samples: Record<SampleNames, Promise<SampleData>>
    ) {}

    private readonly closedHiHat: Promise<SampleInstrument> = SampleInstrument.fromSample(
        this.samples.white_noise,
        { attack: 0.01, decay: 0.05 },
        0.5
    );

    private readonly openHiHat: Promise<SampleInstrument> = SampleInstrument.fromSample(
        this.samples.white_noise,
        { attack: 0.01, decay: 0.2 },
        0.5
    );

    private readonly snare: Promise<SampleInstrument> = SampleInstrument.fromSample(
        this.samples.snare,
        { sustain: 1 },
        1.5
    );

    private readonly kick: Promise<SampleInstrument> = SampleInstrument.fromSample(
        this.samples.kick,
        { sustain: 1 },
        1.5
    );

    // TODO: make these sound good
    async scheduleHit(context: AudioContext, start: number, drum: Drums): Promise<AudioNode> {
        switch (drum) {
        case Drums.KICK:
            return (await this.kick).scheduleNote(context, {
                midiNumber: MidiNumber(69),
                start: start,
                duration: 1
            });
        case Drums.SNARE:
            return (await this.snare).scheduleNote(context, {
                midiNumber: MidiNumber(69),
                start: start,
                duration: 1
            });
        case Drums.CLOSED_HI_HAT:
            return (await this.closedHiHat).scheduleNote(context, {
                midiNumber: MidiNumber(70),
                start: start,
                duration: 0.05
            });
        case Drums.OPEN_HI_HAT:
            return (await this.openHiHat).scheduleNote(context, {
                midiNumber: MidiNumber(70),
                start: start,
                duration: 0.2
            });
        default: impossible(drum);
        }
    }

}
