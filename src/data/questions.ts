import { PITCH_NOTES, noteByName, type NoteName, type Timbre } from "../types/music";
import type { ExerciseDefinition } from "../types/curriculum";
import { pickSeeded, seededRandom, shuffleSeeded } from "./random";

export interface NoteQuestion {
  id: string;
  target: NoteName;
  timbre: Timbre;
  choices: readonly NoteName[];
}

export interface PhraseQuestion {
  id: string;
  target: readonly NoteName[];
  timbre: Timbre;
}

export interface FretboardQuestion {
  id: string;
  prompt: string;
  answer: string;
  choices: readonly string[];
}

export interface ChordQuestion {
  id: string;
  prompt: string;
  answer: string;
  choices: readonly string[];
}

function pickTimbre(timbres: readonly Timbre[], random: () => number): Timbre {
  return pickSeeded(timbres, random);
}

export function buildNoteQuestions(exercise: ExerciseDefinition): NoteQuestion[] {
  const random = seededRandom(`${exercise.id}:notes`);
  return Array.from({ length: exercise.rounds }, (_, index) => {
    const target = pickSeeded(exercise.notePool, random);
    return {
      id: `${exercise.id}-note-${index + 1}`,
      target,
      timbre: pickTimbre(exercise.timbres, random),
      choices: shuffleSeeded(exercise.notePool, `${exercise.id}-choices-${index}`),
    };
  });
}

export function buildPhraseQuestions(exercise: ExerciseDefinition): PhraseQuestion[] {
  const random = seededRandom(`${exercise.id}:phrases`);
  return Array.from({ length: exercise.rounds }, (_, index) => {
    const target = Array.from({ length: exercise.phraseLength }, () => pickSeeded(exercise.notePool, random));
    if (target.every((note) => note === target[0])) target[target.length - 1] = pickSeeded(exercise.notePool.filter((note) => note !== target[0]), random);
    return { id: `${exercise.id}-phrase-${index + 1}`, target, timbre: pickTimbre(exercise.timbres, random) };
  });
}

const SECOND_STRING_NOTES = ["C", "D", "E", "G", "A"] as const;
const SIXTH_STRING_ROOTS = [
  { note: "F", fret: 1 },
  { note: "G", fret: 3 },
  { note: "A", fret: 5 },
  { note: "B", fret: 7 },
  { note: "C", fret: 8 },
  { note: "D", fret: 10 },
  { note: "E", fret: 12 },
] as const;

export function buildFretboardQuestions(exercise: ExerciseDefinition): FretboardQuestion[] {
  const prompts: FretboardQuestion[] = [];

  for (const noteName of SECOND_STRING_NOTES) {
    const note = noteByName(noteName);
    prompts.push({
      id: `${exercise.id}-fret-${noteName}-to-fret`,
      prompt: `第二弦的 ${noteName} 在第几品？`,
      answer: String(note.secondStringFret),
      choices: ["1", "3", "5", "8", "10"],
    });
    prompts.push({
      id: `${exercise.id}-fret-${noteName}-to-name`,
      prompt: `第二弦第 ${note.secondStringFret} 品是什么音？`,
      answer: noteName,
      choices: SECOND_STRING_NOTES,
    });
  }

  for (const root of SIXTH_STRING_ROOTS) {
    prompts.push({
      id: `${exercise.id}-root-${root.note}`,
      prompt: `第六弦第 ${root.fret} 品的根音音名是什么？`,
      answer: root.note,
      choices: ["F", "G", "A", "B", "C", "D", "E"],
    });
  }

  return shuffleSeeded(prompts, `${exercise.id}:fretboard-order`).slice(0, exercise.rounds).map((question, index) => ({
    ...question,
    id: `${exercise.id}-fret-question-${index + 1}`,
  }));
}

const CHORD_ROOTS = ["F", "G", "A", "B", "C", "D", "E"] as const;

export function buildChordQuestions(exercise: ExerciseDefinition): ChordQuestion[] {
  const random = seededRandom(`${exercise.id}:chords`);
  return Array.from({ length: exercise.rounds }, (_, index) => {
    const root = pickSeeded(CHORD_ROOTS, random);
    const isMinor = random() > 0.5;
    const answer = `${root}${isMinor ? "m" : ""}`;
    const others = CHORD_ROOTS.filter((candidate) => candidate !== root).slice(0, 3).flatMap((candidate) => [`${candidate}`, `${candidate}m`]);
    return {
      id: `${exercise.id}-chord-${index + 1}`,
      prompt: isMinor
        ? `第六弦第 ${SIXTH_STRING_ROOTS.find((item) => item.note === root)?.fret ?? "?"} 品的根音上，使用 Em 型手型。这个和弦是什么？`
        : `第六弦第 ${SIXTH_STRING_ROOTS.find((item) => item.note === root)?.fret ?? "?"} 品的根音上，使用 E 型手型。这个和弦是什么？`,
      answer,
      choices: shuffleSeeded([answer, ...others.slice(0, 3)], `${exercise.id}-chord-choices-${index}`),
    };
  });
}

export function allPitchNames(): readonly NoteName[] {
  return PITCH_NOTES.map((note) => note.name);
}
