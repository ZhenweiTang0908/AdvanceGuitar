import { PITCH_NOTES, type NoteName } from "../types/music";
import { pickSeeded, seededRandom } from "./random";

export interface PhraseBankEntry {
  id: string;
  length: number;
  notes: readonly NoteName[];
  rhythm: readonly number[];
  partition: "daily" | "reserved";
}

const NOTE_NAMES = PITCH_NOTES.map((note) => note.name);

const SPECS = [
  { length: 2, total: 30 },
  { length: 3, total: 50 },
  { length: 4, total: 80 },
  { length: 5, total: 80 },
  { length: 6, total: 60 },
] as const;

const RHYTHM_PATTERNS: Record<number, readonly (readonly number[])[]> = {
  2: [[0.55, 0.55], [0.9, 0.55], [0.55, 0.9], [1.1, 0.55], [0.55, 1.1]],
  3: [[0.55, 0.55, 0.55], [0.9, 0.55, 0.55], [0.55, 0.9, 0.55]],
  4: [[0.55, 0.55, 0.55, 0.55], [0.9, 0.55, 0.55, 0.9], [0.55, 0.55, 0.9, 0.55]],
  5: [[0.55, 0.55, 0.55, 0.55, 0.55], [0.9, 0.55, 0.55, 0.9, 0.55]],
  6: [[0.55, 0.55, 0.55, 0.55, 0.55, 0.55], [0.9, 0.55, 0.55, 0.55, 0.55, 0.9]],
};

function generateEntries(length: number, total: number, offset: number): PhraseBankEntry[] {
  const random = seededRandom(`phrase-bank:${length}`);
  const reservedCount = Math.round(total * 0.2);
  const seen = new Set<string>();
  const entries: PhraseBankEntry[] = [];
  let guard = 0;

  while (entries.length < total && guard < total * 100) {
    guard += 1;
    const notes = Array.from({ length }, () => pickSeeded(NOTE_NAMES, random));
    if (notes.every((note) => note === notes[0])) continue;
    const patternIndex = length === 2 && entries.length >= 20
      ? entries.length % RHYTHM_PATTERNS[2].length
      : Math.floor(random() * RHYTHM_PATTERNS[length].length);
    const rhythm = RHYTHM_PATTERNS[length][patternIndex];
    const key = `${notes.join("")}:${rhythm.join(",")}`;
    if (seen.has(key)) continue;
    seen.add(key);
    entries.push({
      id: `phrase-${offset + entries.length + 1}`,
      length,
      notes,
      rhythm,
      partition: entries.length < reservedCount ? "reserved" : "daily",
    });
  }

  if (entries.length !== total) throw new Error(`Could only generate ${entries.length}/${total} phrases of length ${length}`);
  return entries;
}

export const phraseBank: readonly PhraseBankEntry[] = SPECS.flatMap((spec, index) => {
  const offset = SPECS.slice(0, index).reduce((sum, item) => sum + item.total, 0);
  return generateEntries(spec.length, spec.total, offset);
});

export function phrasesFor(length: number, pool: readonly NoteName[], partition: "daily" | "reserved"): readonly PhraseBankEntry[] {
  return phraseBank.filter((entry) => entry.length === length && entry.partition === partition && entry.notes.every((note) => pool.includes(note)));
}
