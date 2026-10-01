import type { CurriculumDay, ExerciseDefinition } from "../types/curriculum";
import type { NoteName, SkillDomain, Timbre } from "../types/music";

const DEFICIT_TITLES: Record<SkillDomain, string> = {
  ear: "单音补弱",
  phrase: "短句补弱",
  fretboard: "指板补弱",
  chord: "和弦补弱",
};

function poolForDay(day: number): readonly NoteName[] {
  if (day <= 7) return ["C", "E", "G"];
  if (day === 8) return ["C", "D", "E", "G"];
  if (day === 9) return ["C", "D", "E", "G"];
  return ["C", "D", "E", "G", "A"];
}

function phraseLengthForDay(day: number): number {
  if (day <= 2) return 2;
  if (day <= 7) return 3;
  if (day <= 14) return 4;
  if (day <= 20) return 5;
  return 6;
}

function timbresForDay(day: number): readonly Timbre[] {
  if (day <= 7) return ["piano"];
  if (day <= 14) return ["piano", "guitar"];
  return ["piano", "guitar", "pure"];
}

function exerciseId(day: number, skill: SkillDomain): string {
  return `day-${day}-${skill}`;
}

export function buildDayExercises(day: CurriculumDay): ExerciseDefinition[] {
  const pool = poolForDay(day.day);
  const common = {
    day: day.day,
    notePool: pool,
    phraseLength: phraseLengthForDay(day.day),
    timbres: timbresForDay(day.day),
    assessment: day.assessment,
    remedial: false,
  };

  return [
    { ...common, id: exerciseId(day.day, "fretboard"), title: "指板定位", description: "在第二弦旋律音与第六弦根音之间双向转换。", skill: "fretboard", rounds: 8 },
    { ...common, id: exerciseId(day.day, "ear"), title: "单音听辨", description: "听定调与目标音，先哼，再在琴上找，并记录方向。", skill: "ear", rounds: day.assessment ? 10 : 8 },
    { ...common, id: exerciseId(day.day, "phrase"), title: day.day >= 20 ? "六音短句" : "旋律复现", description: "从少到多复现陌生短句，逐个提交音高顺序。", skill: "phrase", rounds: day.assessment ? 3 : 5 },
    { ...common, id: exerciseId(day.day, "chord"), title: "和弦推导", description: "根据根音、大小性质和 E/Em 型手型解释和弦。", skill: "chord", rounds: day.assessment ? 5 : 4 },
  ];
}

export const dayExercises: readonly ExerciseDefinition[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28]
  .flatMap((day) => {
    const pool = poolForDay(day);
    const common = {
      day,
      notePool: pool,
      phraseLength: phraseLengthForDay(day),
      timbres: timbresForDay(day),
      assessment: [7, 14, 21, 25, 28].includes(day),
      remedial: false,
    };
    return [
      { ...common, id: exerciseId(day, "fretboard"), title: "指板定位", description: "第二弦旋律音与第六弦根音的双向定位。", skill: "fretboard" as const, rounds: 8 },
      { ...common, id: exerciseId(day, "ear"), title: "单音听辨", description: "听定调、目标音和方向反馈。", skill: "ear" as const, rounds: 8 },
      { ...common, id: exerciseId(day, "phrase"), title: "旋律复现", description: "复现陌生短句并核对音高顺序。", skill: "phrase" as const, rounds: 5 },
      { ...common, id: exerciseId(day, "chord"), title: "和弦推导", description: "根据根音和大、小性质推导可移动手型。", skill: "chord" as const, rounds: 4 },
    ];
  });

export const remedialExercises: readonly ExerciseDefinition[] = (["ear", "phrase", "fretboard", "chord"] as const).map((skill) => ({
  id: `remedial-${skill}`,
  day: 0,
  title: DEFICIT_TITLES[skill],
  description: "根据最近错误率、尝试次数和用时的自适应练习。",
  skill,
  rounds: skill === "phrase" ? 4 : 8,
  notePool: ["C", "D", "E", "G", "A"],
  phraseLength: 5,
  timbres: ["piano", "guitar", "pure"],
  assessment: false,
  remedial: true,
}));

export const allExercises: readonly ExerciseDefinition[] = [...dayExercises, ...remedialExercises];

export function getExercise(id: string): ExerciseDefinition | undefined {
  return allExercises.find((exercise) => exercise.id === id);
}

export function getExercisesForDay(day: number): readonly ExerciseDefinition[] {
  return dayExercises.filter((exercise) => exercise.day === day);
}
