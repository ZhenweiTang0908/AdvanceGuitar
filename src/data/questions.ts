import { PITCH_NOTES, noteByName, type NoteName, type Timbre } from "../types/music";
import type { ExerciseDefinition } from "../types/curriculum";
import { pickSeeded, seededRandom, shuffleSeeded } from "./random";
import { phrasesFor } from "./phraseBank";
import type { Language } from "../i18n";

export interface NoteQuestion {
  id: string;
  target: NoteName;
  timbre: Timbre;
  choices: readonly NoteName[];
}

export interface PhraseQuestion {
  id: string;
  target: readonly NoteName[];
  rhythm: readonly number[];
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
  const random = seededRandom(`${exercise.id}:notes:${exercise.assessment ? "reserved" : "daily"}`);
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
  const partition = exercise.assessment ? "reserved" : "daily";
  const candidates = phrasesFor(exercise.phraseLength, exercise.notePool, partition);
  const ordered = shuffleSeeded(candidates, `${exercise.id}:phrase-order`);
  return Array.from({ length: exercise.rounds }, (_, index) => {
    const entry = ordered[index % Math.max(ordered.length, 1)];
    if (!entry) throw new Error(`No ${exercise.phraseLength}-note phrases available for exercise ${exercise.id}`);
    return { id: `${exercise.id}-phrase-${index + 1}`, target: entry.notes, rhythm: entry.rhythm, timbre: pickTimbre(exercise.timbres, random) };
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

export function buildFretboardQuestions(exercise: ExerciseDefinition, language: Language = "en"): FretboardQuestion[] {
  const prompts: FretboardQuestion[] = [];

  for (const noteName of SECOND_STRING_NOTES) {
    const note = noteByName(noteName);
    prompts.push({
      id: `${exercise.id}-fret-${noteName}-to-fret`,
      prompt: language === "de" ? `Auf welchem Bund liegt ${noteName} auf der zweiten Saite?` : `Which fret is ${noteName} on the second string?`,
      answer: String(note.secondStringFret),
      choices: ["1", "3", "5", "8", "10"],
    });
    prompts.push({
      id: `${exercise.id}-fret-${noteName}-to-name`,
      prompt: language === "de" ? `Welcher Ton liegt am ${note.secondStringFret}. Bund der zweiten Saite?` : `Which note is at fret ${note.secondStringFret} on the second string?`,
      answer: noteName,
      choices: SECOND_STRING_NOTES,
    });
  }

  for (const root of SIXTH_STRING_ROOTS) {
    prompts.push({
      id: `${exercise.id}-root-${root.note}`,
      prompt: language === "de" ? `Welcher Grundton liegt am ${root.fret}. Bund der sechsten Saite?` : `What is the root note at fret ${root.fret} on the sixth string?`,
      answer: root.note,
      choices: ["F", "G", "A", "B", "C", "D", "E"],
    });
  }

  return shuffleSeeded(prompts, `${exercise.id}:fretboard-order:${exercise.assessment ? "reserved" : "daily"}`).slice(0, exercise.rounds).map((question, index) => ({
    ...question,
    id: `${exercise.id}-fret-question-${index + 1}`,
  }));
}

const CHORD_ROOTS = ["F", "G", "A", "B", "C", "D", "E"] as const;

export function buildChordQuestions(exercise: ExerciseDefinition, language: Language = "en"): ChordQuestion[] {
  const random = seededRandom(`${exercise.id}:chords:${exercise.assessment ? "reserved" : "daily"}`);
  return Array.from({ length: exercise.rounds }, (_, index) => {
    const root = pickSeeded(CHORD_ROOTS, random);
    const isMinor = random() > 0.5;
    const answer = `${root}${isMinor ? "m" : ""}`;
    const others = CHORD_ROOTS.filter((candidate) => candidate !== root).slice(0, 3).flatMap((candidate) => [`${candidate}`, `${candidate}m`]);
    return {
      id: `${exercise.id}-chord-${index + 1}`,
      prompt: language === "de"
        ? `Verwende den ${isMinor ? "Em" : "E"}-Akkordgriff mit dem Grundton am ${SIXTH_STRING_ROOTS.find((item) => item.note === root)?.fret ?? "?"}. Bund der sechsten Saite. Welcher Akkord ist das?`
        : `Using the ${isMinor ? "Em" : "E"} shape with its root at fret ${SIXTH_STRING_ROOTS.find((item) => item.note === root)?.fret ?? "?"} on the sixth string, what is the chord?`,
      answer,
      choices: shuffleSeeded([answer, ...others.slice(0, 3)], `${exercise.id}-chord-choices-${index}`),
    };
  });
}

export function allPitchNames(): readonly NoteName[] {
  return PITCH_NOTES.map((note) => note.name);
}
