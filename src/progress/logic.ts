import type { ExerciseResult, DailyLog, ImportResult, ProgressSnapshot, UserSettings } from "../types/progress";
import type { SkillDomain } from "../types/music";

export const STORAGE_KEY = "advance-guitar:progress:v1";
export const CURRICULUM_VERSION = "stage-1-v1" as const;

export const defaultSettings: UserSettings = {
  answerMode: "manual",
  volume: 0.22,
  preferredTimbre: "mixed",
};

export function createEmptySnapshot(): ProgressSnapshot {
  return {
    version: 1,
    curriculumVersion: CURRICULUM_VERSION,
    results: [],
    dailyLogs: {},
    settings: { ...defaultSettings },
  };
}

export function loadSnapshot(storage: Storage | undefined = globalThis.localStorage): ProgressSnapshot {
  if (!storage) return createEmptySnapshot();
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return createEmptySnapshot();
  try {
    const parsed = validateSnapshot(JSON.parse(raw));
    return parsed.ok && parsed.snapshot ? parsed.snapshot : createEmptySnapshot();
  } catch {
    return createEmptySnapshot();
  }
}

export function saveSnapshot(snapshot: ProgressSnapshot, storage: Storage | undefined = globalThis.localStorage): void {
  storage?.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

export function validateSnapshot(value: unknown): ImportResult {
  if (!value || typeof value !== "object") return { ok: false, error: "进度文件不是有效对象" };
  const candidate = value as Partial<ProgressSnapshot>;
  if (candidate.version !== 1) return { ok: false, error: "进度文件版本不受支持" };
  if (candidate.curriculumVersion !== CURRICULUM_VERSION) return { ok: false, error: "课程版本不匹配" };
  if (!Array.isArray(candidate.results)) return { ok: false, error: "缺少答题记录" };
  if (!candidate.dailyLogs || typeof candidate.dailyLogs !== "object") return { ok: false, error: "缺少每日复盘" };
  const settings = candidate.settings;
  if (!settings || !["manual", "microphone"].includes(settings.answerMode)) return { ok: false, error: "设置格式不正确" };
  if (typeof settings.volume !== "number" || settings.volume < 0 || settings.volume > 1) return { ok: false, error: "音量设置超出范围" };
  if (!["mixed", "piano", "guitar", "pure"].includes(settings.preferredTimbre)) return { ok: false, error: "音色设置不正确" };
  return { ok: true, snapshot: candidate as ProgressSnapshot };
}

export function domainStats(results: readonly ExerciseResult[]): Record<SkillDomain, { attempts: number; errors: number; durationMs: number; count: number }> {
  const stats: Record<SkillDomain, { attempts: number; errors: number; durationMs: number; count: number }> = {
    ear: { attempts: 0, errors: 0, durationMs: 0, count: 0 },
    phrase: { attempts: 0, errors: 0, durationMs: 0, count: 0 },
    fretboard: { attempts: 0, errors: 0, durationMs: 0, count: 0 },
    chord: { attempts: 0, errors: 0, durationMs: 0, count: 0 },
  };
  for (const result of results) {
    const current = stats[result.skill];
    current.attempts += result.attempts;
    current.errors += result.correct ? 0 : 1;
    current.durationMs += result.durationMs;
    current.count += 1;
  }
  return stats;
}

const DOMAIN_ORDER: readonly SkillDomain[] = ["ear", "phrase", "fretboard", "chord"];

export function weakestDomain(results: readonly ExerciseResult[]): SkillDomain {
  const stats = domainStats(results);
  return [...DOMAIN_ORDER].sort((first, second) => {
    const firstStats = stats[first];
    const secondStats = stats[second];
    const firstScore = scoreDomain(firstStats);
    const secondScore = scoreDomain(secondStats);
    return secondScore - firstScore || DOMAIN_ORDER.indexOf(first) - DOMAIN_ORDER.indexOf(second);
  })[0];
}

function scoreDomain(stats: { attempts: number; errors: number; durationMs: number; count: number }): number {
  if (stats.count === 0) return -1;
  const errorRate = stats.errors / stats.count;
  const averageAttempts = stats.attempts / stats.count;
  const normalizedDuration = Math.min(stats.durationMs / stats.count / 20_000, 1.5);
  return errorRate * 0.6 + Math.min(averageAttempts / 4, 1.5) * 0.25 + normalizedDuration * 0.15;
}

export function calculateStreak(logs: Record<number, DailyLog>, today = new Date()): number {
  const completedDays = Object.values(logs)
    .filter((log) => log.completedAt)
    .map((log) => new Date(log.completedAt as string).toISOString().slice(0, 10))
    .sort();
  if (completedDays.length === 0) return 0;
  const unique = [...new Set(completedDays)];
  const byDate = new Set(unique);
  let streak = 0;
  const cursor = new Date(today);
  for (let index = 0; index < 365; index += 1) {
    const key = cursor.toISOString().slice(0, 10);
    if (byDate.has(key)) streak += 1;
    else if (index > 0) break;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function nextRecommendedDay(logs: Record<number, DailyLog>): number {
  for (let day = 1; day <= 28; day += 1) {
    if (!logs[day]?.completedAt) return day;
  }
  return 28;
}
