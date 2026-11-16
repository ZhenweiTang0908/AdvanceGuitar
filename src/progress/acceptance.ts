import type { ProgressSnapshot } from "../types/progress";
import type { SkillDomain } from "../types/music";
import { completedExerciseIds } from "./selectors";
import { getExercisesForDay } from "../data/exercises";

export interface AcceptanceCheck {
  domain: SkillDomain;
  label: string;
  passed: boolean;
  detail: string;
}

export interface AcceptanceReport {
  status: "active" | "passed" | "needs_review";
  checks: AcceptanceCheck[];
}

const LABELS: Record<SkillDomain, string> = { ear: "单音", phrase: "短句", fretboard: "指板", chord: "和弦" };

function lastResults(snapshot: ProgressSnapshot, domain: SkillDomain, limit: number) {
  return snapshot.results.filter((result) => result.skill === domain).slice(-limit);
}

export function evaluateAcceptance(snapshot: ProgressSnapshot): AcceptanceReport {
  const ear = lastResults(snapshot, "ear", 10);
  const phrase = lastResults(snapshot, "phrase", 3);
  const fretboard = lastResults(snapshot, "fretboard", 10);
  const chord = lastResults(snapshot, "chord", 5);
  const earPassed = ear.length >= 10 && ear.filter((result) => result.correct && result.attempts <= 2).length >= 8;
  const phrasePassed = phrase.length >= 3 && phrase.filter((result) => result.correct).length >= 2;
  const fretboardPassed = fretboard.length >= 10 && fretboard.filter((result) => result.correct).length >= 8;
  const chordPassed = chord.length >= 5 && chord.filter((result) => result.correct).length >= 4;

  const checks: AcceptanceCheck[] = [
    { domain: "ear", label: LABELS.ear, passed: earPassed, detail: `${ear.filter((result) => result.correct && result.attempts <= 2).length} / 10 在两次试音内正确` },
    { domain: "phrase", label: LABELS.phrase, passed: phrasePassed, detail: `${phrase.filter((result) => result.correct).length} / 3 短句完全正确` },
    { domain: "fretboard", label: LABELS.fretboard, passed: fretboardPassed, detail: `${fretboard.filter((result) => result.correct).length} / 10 定位正确` },
    { domain: "chord", label: LABELS.chord, passed: chordPassed, detail: `${chord.filter((result) => result.correct).length} / 5 推导正确` },
  ];

  const done = completedExerciseIds(snapshot);
  const hasFinalDay = getExercisesForDay(28).every((exercise) => done.has(exercise.id));
  const allPassed = checks.every((check) => check.passed);
  const status = hasFinalDay ? (allPassed ? "passed" : "needs_review") : "active";

  return { status, checks };
}
