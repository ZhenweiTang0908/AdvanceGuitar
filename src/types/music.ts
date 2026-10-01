export type NoteName = "C" | "D" | "E" | "G" | "A";
export type ScaleDegree = 1 | 2 | 3 | 5 | 6;
export type Timbre = "piano" | "guitar" | "pure";
export type SkillDomain = "ear" | "phrase" | "fretboard" | "chord";

export interface AudioSequence {
  midis: readonly number[];
  durations: readonly number[];
  timbre: Timbre;
  reference: "none" | "cadence" | "tonic";
}

export interface PitchNote {
  name: NoteName;
  degree: ScaleDegree;
  midi: number;
  secondStringFret: number;
}

export const PITCH_NOTES: readonly PitchNote[] = [
  { name: "C", degree: 1, midi: 60, secondStringFret: 1 },
  { name: "D", degree: 2, midi: 62, secondStringFret: 3 },
  { name: "E", degree: 3, midi: 64, secondStringFret: 5 },
  { name: "G", degree: 5, midi: 67, secondStringFret: 8 },
  { name: "A", degree: 6, midi: 69, secondStringFret: 10 },
] as const;

export function noteByName(name: NoteName): PitchNote {
  const note = PITCH_NOTES.find((candidate) => candidate.name === name);
  if (!note) throw new Error(`Unsupported note: ${name}`);
  return note;
}

export function frequencyForMidi(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

export function frequencyForName(name: NoteName): number {
  return frequencyForMidi(noteByName(name).midi);
}

export function midpointNote(first: NoteName, second: NoteName): number {
  return (noteByName(first).midi + noteByName(second).midi) / 2;
}

const CHROMATIC: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

export function midiForRootName(root: string, octave = 3): number {
  const semitone = CHROMATIC[root];
  if (semitone === undefined) throw new Error(`Unsupported root note: ${root}`);
  return 12 * (octave + 1) + semitone;
}
