import { useState, type FormEvent } from "react";
import type { DailyLog } from "../types/progress";
import { useI18n } from "../i18n";

interface DailyReflectionProps {
  day: number;
  initialLog?: DailyLog;
  onSave: (log: DailyLog) => void;
}

export function DailyReflection({ day, initialLog, onSave }: DailyReflectionProps) {
  const { t } = useI18n();
  const [practiced, setPracticed] = useState(initialLog?.practiced ?? "");
  const [minutes, setMinutes] = useState(initialLog?.minutes ?? 60);
  const [blocker, setBlocker] = useState(initialLog?.blocker ?? "");
  const [saved, setSaved] = useState(Boolean(initialLog?.completedAt));

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSave({ day, practiced, minutes, blocker, completedAt: new Date().toISOString() });
    setSaved(true);
  }

  return (
    <form className="reflection panel" onSubmit={handleSubmit}>
      <div className="panel__heading">
        <div><strong>{t("reflection")}</strong><span>{t("logToday")}</span></div>
        {saved ? <span className="saved-state">{t("saved")}</span> : null}
      </div>
      <label className="field">
        <span>{t("practiceContent")}</span>
        <textarea value={practiced} onChange={(event) => setPracticed(event.target.value)} placeholder={t("notePlaceholder")} rows={2} />
      </label>
      <label className="field">
        <span>{t("timeMinutes")}</span>
        <input type="number" min="1" max="180" value={minutes} onChange={(event) => setMinutes(Number(event.target.value))} />
      </label>
      <label className="field">
        <span>{t("mainChallenge")}</span>
        <textarea value={blocker} onChange={(event) => setBlocker(event.target.value)} placeholder={t("blockerPlaceholder")} rows={2} />
      </label>
      <button className="button button--primary" type="submit">{t("saveNotes")}</button>
    </form>
  );
}
