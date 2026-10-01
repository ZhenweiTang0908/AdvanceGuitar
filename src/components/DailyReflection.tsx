import { useState, type FormEvent } from "react";
import type { DailyLog } from "../types/progress";

interface DailyReflectionProps {
  day: number;
  initialLog?: DailyLog;
  onSave: (log: DailyLog) => void;
}

export function DailyReflection({ day, initialLog, onSave }: DailyReflectionProps) {
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
        <div><strong>今日复盘</strong><span>用具体卡点决定明天的补弱题。</span></div>
        {saved ? <span className="saved-state">已保存</span> : null}
      </div>
      <label className="field">
        <span>今天练了什么</span>
        <textarea value={practiced} onChange={(event) => setPracticed(event.target.value)} placeholder="例如：二弦五音定位，四条四音短句，A/Am 横按推导" required />
      </label>
      <label className="field">
        <span>实际用时（分钟）</span>
        <input type="number" min="1" max="180" value={minutes} onChange={(event) => setMinutes(Number(event.target.value))} required />
      </label>
      <label className="field">
        <span>主要卡在哪里</span>
        <textarea value={blocker} onChange={(event) => setBlocker(event.target.value)} placeholder="例如：能哼出来，但找不到 E 在第二弦的位置" required />
      </label>
      <button className="button button--primary" type="submit">保存复盘</button>
    </form>
  );
}
