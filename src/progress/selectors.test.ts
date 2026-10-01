import { getExercisesForDay } from "../data/exercises";
import { createEmptySnapshot } from "./logic";
import { dayCompletion } from "./selectors";
import type { ExerciseResult, ProgressSnapshot } from "../types/progress";

function result(exerciseId: string, day: number, skill: ExerciseResult["skill"]): ExerciseResult {
  return { id: `${exerciseId}-${Math.random()}`, exerciseId, day, skill, correct: true, attempts: 1, durationMs: 1000, createdAt: new Date().toISOString() };
}

describe("day completion", () => {
  it("requires every fixed round, a full remedial round, and a reflection", () => {
    let snapshot: ProgressSnapshot = createEmptySnapshot();
    expect(dayCompletion(snapshot, 1).status).toBe("not_started");

    const fixed = getExercisesForDay(1).flatMap((exercise) => Array.from({ length: exercise.rounds }, () => result(exercise.id, 1, exercise.skill)));
    const remedial = Array.from({ length: 8 }, () => result("remedial-ear", 1, "ear"));
    snapshot = { ...snapshot, results: [...fixed, ...remedial.slice(0, 7)] };
    expect(dayCompletion(snapshot, 1).status).toBe("in_progress");

    snapshot = { ...snapshot, results: [...fixed, ...remedial], dailyLogs: { 1: { day: 1, practiced: "test", minutes: 60, blocker: "none", completedAt: new Date().toISOString() } } };
    expect(dayCompletion(snapshot, 1).status).toBe("completed");
  });
});
