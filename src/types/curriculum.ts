import type { NoteName, SkillDomain, Timbre } from "./music";

export interface CurriculumDay {
  day: number;
  week: number;
  title: string;
  goal: string;
  minutes: number;
  newNotes: readonly NoteName[];
  exerciseIds: readonly string[];
  songTask: boolean;
  assessment: boolean;
  body: string;
}

export interface ExerciseDefinition {
  id: string;
  day: number;
  title: string;
  description: string;
  skill: SkillDomain;
  rounds: number;
  notePool: readonly NoteName[];
  phraseLength: number;
  timbres: readonly Timbre[];
  assessment: boolean;
  remedial: boolean;
}
