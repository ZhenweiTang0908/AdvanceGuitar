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
        <div><strong>训练备注</strong><span>记录今天的练习卡点（选填）。</span></div>
        {saved ? <span className="saved-state">已保存</span> : null}
      </div>
      <label className="field">
        <span>练习内容</span>
        <textarea value={practiced} onChange={(event) => setPracticed(event.target.value)} placeholder="例如：二弦五音定位" rows={2} />
      </label>
      <label className="field">
        <span>用时（分钟）</span>
        <input type="number" min="1" max="180" value={minutes} onChange={(event) => setMinutes(Number(event.target.value))} />
      </label>
      <label className="field">
        <span>主要难点</span>
        <textarea value={blocker} onChange={(event) => setBlocker(event.target.value)} placeholder="例如：找不到 E 在二弦的位置" rows={2} />
      </label>
      <button className="button button--primary" type="submit">保存备注</button>
    </form>
  );
}
