import type { SkillDomain } from "./music";

export interface ExerciseResult {
  id: string;
  exerciseId: string;
  day: number;
  skill: SkillDomain;
  correct: boolean;
  attempts: number;
  durationMs: number;
  createdAt: string;
}

export interface DailyLog {
  day: number;
  practiced: string;
  minutes: number;
  blocker: string;
  completedAt?: string;
}

export interface UserSettings {
  answerMode: "manual" | "microphone";
  volume: number;
  preferredTimbre: "mixed" | "piano" | "guitar" | "pure";
}

export interface ProgressSnapshot {
  version: 1;
  curriculumVersion: "stage-1-v1";
  results: ExerciseResult[];
  dailyLogs: Record<number, DailyLog>;
  settings: UserSettings;
  exportedAt?: string;
}

export interface ImportResult {
  ok: boolean;
  snapshot?: ProgressSnapshot;
  error?: string;
}
