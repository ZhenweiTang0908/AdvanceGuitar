import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ExerciseResult, DailyLog, ProgressSnapshot, UserSettings } from "../types/progress";
import { createEmptySnapshot, loadSnapshot, saveSnapshot, validateSnapshot } from "./logic";

interface ProgressContextValue {
  snapshot: ProgressSnapshot;
  recordResult: (result: Omit<ExerciseResult, "id" | "createdAt">) => void;
  saveDailyLog: (log: DailyLog) => void;
  updateSettings: (patch: Partial<UserSettings>) => void;
  exportProgress: () => void;
  importProgress: (value: unknown) => { ok: boolean; error?: string };
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<ProgressSnapshot>(() => loadSnapshot());

  useEffect(() => {
    saveSnapshot(snapshot);
  }, [snapshot]);

  const recordResult = useCallback((result: Omit<ExerciseResult, "id" | "createdAt">) => {
    setSnapshot((current) => ({
      ...current,
      results: [
        ...current.results,
        { ...result, id: `${result.exerciseId}-${Date.now()}-${current.results.length + 1}`, createdAt: new Date().toISOString() },
      ],
    }));
  }, []);

  const saveDailyLog = useCallback((log: DailyLog) => {
    setSnapshot((current) => ({ ...current, dailyLogs: { ...current.dailyLogs, [log.day]: log } }));
  }, []);

  const updateSettings = useCallback((patch: Partial<UserSettings>) => {
    setSnapshot((current) => ({ ...current, settings: { ...current.settings, ...patch } }));
  }, []);

  const exportProgress = useCallback(() => {
    const exported = { ...snapshot, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(exported, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `advance-guitar-progress-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [snapshot]);

  const importProgress = useCallback((value: unknown) => {
    const result = validateSnapshot(value);
    if (!result.ok || !result.snapshot) return { ok: false, error: result.error };
    setSnapshot(result.snapshot);
    return { ok: true };
  }, []);

  const resetProgress = useCallback(() => {
    setSnapshot(createEmptySnapshot());
  }, []);

  const value = useMemo<ProgressContextValue>(() => ({
    snapshot,
    recordResult,
    saveDailyLog,
    updateSettings,
    exportProgress,
    importProgress,
    resetProgress,
  }), [exportProgress, importProgress, recordResult, resetProgress, saveDailyLog, snapshot, updateSettings]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const context = useContext(ProgressContext);
  if (!context) throw new Error("useProgress must be used inside ProgressProvider");
  return context;
}
