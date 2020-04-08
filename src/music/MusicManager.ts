import { Note, MidiNumber } from "./Notes.js";
import Instrument from "./Instrument.js";
import { OscillatorInstrument } from "./Instruments.js";
import { Random } from "../util/Random.js";
import { Scales, Scale, Chord, Pitch, offsetPitch, Degree, ScaleQuery } from "./Scales.js";
import Rhythm from "./Rhythm.js";
import { Drumkit, Drums } from "./Drums.js";
import { Arrays, NonEmptyArray } from "../util/Arrays.js";
import { Settings } from "../persistence/Settings.js";
import { clamp, mod, impossible } from "../util/Util.js";
import { unwrap } from "@nprindle/minewt";
import { makeSamples, SampleNames, SampleData } from "./Samples.js";

enum MeasureContents {
    DRUMS, CHORDS
}

interface MusicState {
    beatsPerMinute: number;
    rhythm: Rhythm;
    root: Pitch; // the root of the current key. (0 is C, 1 is C#, ..., 11 is B)
    scale: Scale;
    progression: Pitch[][]; // current chord progression
    drumLoop: Drums[];
    chordIndex: number; // index of current chord
    queue: MeasureContents[][];
}

enum ChordFunction {
    TONIC = "tonic",
    SUBDOMINANT = "subdominant",
    DOMINANT = "dominant",
    AMBIGUOUS = "ambiguous"
}

export namespace MusicManager {

    // Whether or not the music is playing. Setting this to false will kill the
    // music. Ideally, we would keep track of a cancellable Promise instead, but
    // JS doesn't have cancellation, async exceptions, masking, etc.
    let shouldBePlaying: boolean = false;

    // The current music computation. We track this so we can propertly wait for
    // the music to stop playing after stopping it.
    let currentMusic: Promise<void> | undefined = undefined;

    // Get an AudioContext, in a browser-compatible way
    export const context: AudioContext = (() => {
        const theWindow: any = window;
        const ctor = theWindow.AudioContext ?? theWindow.webkitAudioContext;
        if (ctor) {
            return new ctor();
        } else {
            throw new Error("AudioContext is not supported");
        }
    })();

    export const samples: Record<SampleNames, Promise<SampleData>> = makeSamples(context);

    export const drumkit: Drumkit = new Drumkit(samples);

    export const instruments = {
        arp: new OscillatorInstrument(
            { type: "sawtooth", detune: 3 },
            { attack: 0.01, decay: 0.05, sustain: 0.0, release: 0.1 }
        ),
        bass: new OscillatorInstrument(
            { type: "triangle", detune: 2 },
            { attack: 0.01, decay: 0.01, sustain: 1.0, release: 0.1 }
        ),
        pad: new OscillatorInstrument(
            { type: "triangle", detune: 4 },
            { attack: 1.0, decay: 0.1, sustain: 0.5, release: 0.5 }
        )
    };

    export const masterGain: GainNode = context.createGain();

    const state: MusicState = {
        beatsPerMinute: 220,
        rhythm: new Rhythm(),
        root: Pitch(0), // middle C
        scale: Scale(0x741), // major
        progression: [],
        chordIndex: 0,
        drumLoop: [],
        queue: []
    };

    // All chord progressions we generate here start with the tonic and end with one of these patterns.
    const backHalves: NonEmptyArray<ChordFunction[]> = [
        [ChordFunction.TONIC, ChordFunction.SUBDOMINANT, ChordFunction.DOMINANT],
        [ChordFunction.SUBDOMINANT, ChordFunction.SUBDOMINANT, ChordFunction.DOMINANT],
        [ChordFunction.SUBDOMINANT, ChordFunction.DOMINANT, ChordFunction.DOMINANT],
        [ChordFunction.AMBIGUOUS, ChordFunction.SUBDOMINANT, ChordFunction.DOMINANT],
        [ChordFunction.SUBDOMINANT, ChordFunction.DOMINANT, ChordFunction.AMBIGUOUS]
    ];

    const functionDegrees: Record<ChordFunction, NonEmptyArray<Degree>> = {
        "tonic": [Degree(0), Degree(5)], // I and VI
        "subdominant": [Degree(1), Degree(3)], // II and IV
        "dominant": [Degree(4), Degree(6)], // V and VII
        "ambiguous": [Degree(2)] // III
    };

    function generateChordProgression(scale: Scale, root: Pitch, extensions: number = 4): Pitch[][] {
        const pitchClass = Scales.getPitchClass(scale);
        const chordDegrees = Random.fromArray(backHalves) // take one of the valid chord patterns
            // replace functions like "dominant" "subdominant" etc with degrees
            .map(f => Random.fromArray(functionDegrees[f]));
        chordDegrees.unshift(Degree(0)); // make sure it starts with the tonic
        // convert degrees to full diatonic chords
        return chordDegrees.map(degree => Arrays.generate(extensions, i => {
            const pitchOffset = Scales.indexIntoPitchClass(pitchClass, unwrap(degree) + 2 * i);
            return offsetPitch(root, pitchOffset);
        }));
    }

    function generateDrumLoop(): Drums[] {
        const subdivision: number[] = state.rhythm.subdivision;
        return Arrays.flatten(subdivision.map((beats: number, index: number) => {
            // start on kick on the strong beats and snare on the weak beats
            const arr: Drums[] = [(index % 2 === 0) ? Drums.KICK : Drums.SNARE];
            // follow with hi-hats
            for (let i = 0; i < beats - 1; i++) {
                if (index === subdivision.length - 1 && i === beats - 2) {
                    arr.push(Drums.OPEN_HI_HAT); // end the measure on an open hi-hat
                } else {
                    arr.push(Drums.CLOSED_HI_HAT);
                }
            }
            return arr;
        }));
    }

    async function scheduleDrum(start: number, drum: Drums): Promise<void> {
        const drumOut: AudioNode = await drumkit.scheduleHit(context, start, drum);
        drumOut.connect(masterGain);
    }

    async function scheduleNote(note: Note, inst: Instrument): Promise<void> {
        const instOut: AudioNode = await inst.scheduleNote(context, note);
        instOut.connect(masterGain);
    }

    function octave(root: Pitch, octave: number): MidiNumber {
        return MidiNumber(mod(unwrap(root), 12) + octave * 12);
    }

    // Change key, time signature, etc. and fill state.queue with music to schedule.
    function fillQueue(): void {
        // Allowed time signatures, as n/8
        const timeSignatures: NonEmptyArray<number> = [5, 6, 7, 8, 9, 11, 13];
        state.rhythm.generateNewSubdivision(Random.fromArray(timeSignatures));
        // Query all greek modes (only one imperfection) with a perfect fifth
        // above the tonic
        const query: ScaleQuery = {
            chord: Chord(1 << 7),
            imperfections: [1, 1]
        };
        const matchingScales = Scales.getAllScalesMatchingQuery(query);
        if (Arrays.isNonEmpty(matchingScales)) {
            state.scale = Random.fromArray(matchingScales);
        }
        state.drumLoop = generateDrumLoop();
        state.progression = generateChordProgression(state.scale, state.root);
        state.queue = [
            [MeasureContents.CHORDS, MeasureContents.DRUMS],
            [MeasureContents.CHORDS, MeasureContents.DRUMS],
            [MeasureContents.CHORDS, MeasureContents.DRUMS],
            [MeasureContents.CHORDS, MeasureContents.DRUMS],
            [MeasureContents.CHORDS, MeasureContents.DRUMS],
            [MeasureContents.CHORDS, MeasureContents.DRUMS],
            [MeasureContents.CHORDS, MeasureContents.DRUMS],
            [MeasureContents.CHORDS, MeasureContents.DRUMS],
            [MeasureContents.DRUMS]
        ];
    }

    async function queueChord(startingTime: number): Promise<void> {
        const curChord = state.progression[mod(state.chordIndex, state.progression.length)];
        const beatLength: number = 60 / state.beatsPerMinute;
        for (const val of curChord) {
            await scheduleNote({
                midiNumber: octave(val, 5),
                start: startingTime,
                duration: beatLength * state.rhythm.beats
            }, instruments.pad);
        }
        state.chordIndex++;
    }

    async function queueDrumLoop(startingTime: number): Promise<void> {
        const beatLength: number = 60 / state.beatsPerMinute;
        let offsetTime = 0;
        for (const drum of state.drumLoop) {
            await scheduleDrum(startingTime + offsetTime, drum);
            offsetTime += beatLength;
        }
    }

    async function queueNextMeasure(startingTime: number): Promise<void> {
        if (!shouldBePlaying) {
            return;
        }
        const beatLength: number = 60 / state.beatsPerMinute;
        if (state.queue.length === 0) {
            fillQueue();
        }
        const measureLength: number = beatLength * state.rhythm.beats;
        const currentContents = state.queue.shift();
        if (currentContents) {
            for (const k of currentContents) {
                switch (k) {
                case MeasureContents.DRUMS:
                    await queueDrumLoop(startingTime);
                    break;
                case MeasureContents.CHORDS:
                    await queueChord(startingTime);
                    break;
                default: impossible(k);
                }
            }
        }
        const nextMeasureStartTime: number = startingTime + measureLength;
        // compute next measure 100ms (0.1s) before it needs to start
        await new Promise(resolve => {
            window.setTimeout(resolve, (nextMeasureStartTime - context.currentTime - 0.1) * 1000);
        });
        return queueNextMeasure(nextMeasureStartTime); // schedule next measure for after this one
    }

    export function initialize(): void {
        // Don't initialize if already running
        if (!shouldBePlaying) {
            shouldBePlaying = true;
            masterGain.gain.value = Settings.currentOptions.volume;
            masterGain.connect(context.destination);
            currentMusic = queueNextMeasure(context.currentTime);
            currentMusic.catch((e: any) => {
                console.error("Music initialization failed:");
                console.error(e);
            });
        }
    }

    export async function stop(): Promise<void> {
        if (shouldBePlaying && currentMusic !== undefined) {
            shouldBePlaying = false;
            await currentMusic;
            currentMusic = undefined;
        }
    }

    export function isPlaying(): boolean {
        return shouldBePlaying;
    }

    /**
     * Sets the music volume, with range [0, 1].
     */
    export function setVolume(volume: number): void {
        masterGain.gain.value = clamp(0, volume, 1);
    }

}
