import { createEmptySnapshot, domainStats, weakestDomain } from "./logic";
import type { ExerciseResult } from "../types/progress";

function result(skill: ExerciseResult["skill"], correct: boolean, attempts: number): ExerciseResult {
  return { id: `${skill}-${Math.random()}`, exerciseId: `${skill}-exercise`, day: 1, skill, correct, attempts, durationMs: 1000, createdAt: new Date().toISOString() };
}

describe("progress logic", () => {
  it("creates an empty versioned snapshot", () => {
    const snapshot = createEmptySnapshot();
    expect(snapshot.version).toBe(1);
    expect(snapshot.curriculumVersion).toBe("stage-1-v1");
    expect(snapshot.results).toEqual([]);
  });

  it("aggregates attempts and errors by skill", () => {
    const stats = domainStats([result("ear", true, 1), result("ear", false, 3), result("phrase", true, 2)]);
    expect(stats.ear).toMatchObject({ attempts: 4, errors: 1, count: 2 });
    expect(stats.phrase).toMatchObject({ attempts: 2, errors: 0, count: 1 });
  });

  it("selects the weakest practiced domain", () => {
    const weakest = weakestDomain([
      result("phrase", true, 1),
      result("ear", false, 4),
      result("ear", false, 3),
      result("fretboard", true, 1),
    ]);
    expect(weakest).toBe("ear");
  });
});
