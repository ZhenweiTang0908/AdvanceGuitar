import { curriculumDays } from "../content/loadCurriculum";
import { allExercises, getExercisesForDay } from "../data/exercises";
import type { ProgressSnapshot } from "../types/progress";
import { evaluateAcceptance } from "./acceptance";

export function completedExerciseIds(snapshot: ProgressSnapshot): Set<string> {
  const counts = new Map<string, number>();
  for (const result of snapshot.results) counts.set(result.exerciseId, (counts.get(result.exerciseId) ?? 0) + 1);
  return new Set(allExercises.filter((exercise) => (counts.get(exercise.id) ?? 0) >= exercise.rounds).map((exercise) => exercise.id));
}

export function dayCompletion(snapshot: ProgressSnapshot, day: number): { complete: boolean; status: "not_started" | "in_progress" | "completed"; completed: number; total: number } {
  const exercises = getExercisesForDay(day);
  const completed = completedExerciseIds(snapshot);
  const completedCount = exercises.filter((exercise) => completed.has(exercise.id)).length;
  const complete = exercises.length > 0 && completedCount === exercises.length;
  const started = completedCount > 0 || snapshot.results.some((result) => result.day === day);
  return { complete, status: complete ? "completed" : started ? "in_progress" : "not_started", completed: completedCount, total: exercises.length };
}

export function completedDayCount(snapshot: ProgressSnapshot): number {
  return curriculumDays.filter((day) => dayCompletion(snapshot, day.day).complete).length;
}

export function stageStatus(snapshot: ProgressSnapshot): "active" | "passed" | "needs_review" {
  return evaluateAcceptance(snapshot).status;
}

/** The first day whose core practice is not yet finished — where the learner should continue. */
export function currentDay(snapshot: ProgressSnapshot): number {
  for (let day = 1; day <= 28; day += 1) {
    if (!dayCompletion(snapshot, day).complete) return day;
  }
  return 28;
}

/** Next unfinished exercise of a day, or undefined when all are done. */
export function nextExerciseForDay(snapshot: ProgressSnapshot, day: number, afterId?: string): string | undefined {
  const completed = completedExerciseIds(snapshot);
  const ordered = getExercisesForDay(day).map((exercise) => exercise.id);
  const start = afterId ? ordered.indexOf(afterId) + 1 : 0;
  const rotated = [...ordered.slice(start), ...ordered.slice(0, start)].filter((id) => id !== afterId);
  return rotated.find((id) => !completed.has(id));
}
