import { curriculumDays } from "../content/loadCurriculum";
import { allExercises, getExercisesForDay } from "../data/exercises";
import type { ProgressSnapshot } from "../types/progress";
import { evaluateAcceptance } from "./acceptance";

export function completedExerciseIds(snapshot: ProgressSnapshot): Set<string> {
  const counts = new Map<string, number>();
  for (const result of snapshot.results) counts.set(result.exerciseId, (counts.get(result.exerciseId) ?? 0) + 1);
  return new Set(allExercises.filter((exercise) => (counts.get(exercise.id) ?? 0) >= exercise.rounds).map((exercise) => exercise.id));
}

export function dayCompletion(snapshot: ProgressSnapshot, day: number): { complete: boolean; completed: number; total: number; hasLog: boolean } {
  const exercises = getExercisesForDay(day);
  const completed = completedExerciseIds(snapshot);
  const completedCount = exercises.filter((exercise) => completed.has(exercise.id)).length;
  const hasRemedial = snapshot.results.some((result) => result.exerciseId.startsWith("remedial-") && result.day === day);
  const hasLog = Boolean(snapshot.dailyLogs[day]?.completedAt);
  return { complete: completedCount === exercises.length && hasRemedial && hasLog, completed: completedCount + (hasRemedial ? 1 : 0), total: exercises.length + 1, hasLog };
}

export function completedDayCount(snapshot: ProgressSnapshot): number {
  return curriculumDays.filter((day) => dayCompletion(snapshot, day.day).complete).length;
}

export function stageStatus(snapshot: ProgressSnapshot): "active" | "passed" | "needs_review" {
  return evaluateAcceptance(snapshot).status;
}
