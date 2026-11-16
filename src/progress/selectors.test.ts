import { getExercisesForDay } from "../data/exercises";
import { createEmptySnapshot } from "./logic";
import { currentDay, dayCompletion, nextExerciseForDay } from "./selectors";
import type { ExerciseResult, ProgressSnapshot } from "../types/progress";

function result(exerciseId: string, day: number, skill: ExerciseResult["skill"]): ExerciseResult {
  return { id: `${exerciseId}-${Math.random()}`, exerciseId, day, skill, correct: true, attempts: 1, durationMs: 1000, createdAt: new Date().toISOString() };
}

describe("day completion", () => {
  it("is complete once every core exercise is done", () => {
    let snapshot: ProgressSnapshot = createEmptySnapshot();
    expect(dayCompletion(snapshot, 1).status).toBe("not_started");

    const fixed = getExercisesForDay(1).flatMap((exercise) => Array.from({ length: exercise.rounds }, () => result(exercise.id, 1, exercise.skill)));
    snapshot = { ...snapshot, results: fixed.slice(1) };
    expect(dayCompletion(snapshot, 1).status).toBe("in_progress");
    expect(currentDay(snapshot)).toBe(1);

    snapshot = { ...snapshot, results: fixed };
    expect(dayCompletion(snapshot, 1).status).toBe("completed");
    expect(currentDay(snapshot)).toBe(2);

  });
});

describe("next exercise", () => {
  it("walks through unfinished exercises of the day, then returns undefined", () => {
    const exercises = getExercisesForDay(1);
    let snapshot: ProgressSnapshot = createEmptySnapshot();
    expect(nextExerciseForDay(snapshot, 1)).toBe(exercises[0].id);
    expect(nextExerciseForDay(snapshot, 1, exercises[0].id)).toBe(exercises[1].id);
    const all = [...exercises.flatMap((exercise) => Array.from({ length: exercise.rounds }, () => result(exercise.id, 1, exercise.skill)))];
    snapshot = { ...snapshot, results: all };
    expect(nextExerciseForDay(snapshot, 1)).toBeUndefined();
  });
});
