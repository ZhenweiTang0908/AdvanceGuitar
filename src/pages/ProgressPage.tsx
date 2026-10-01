import { Activity, Download, Gauge, Target, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { calculateStreak, domainStats } from "../progress/logic";
import { evaluateAcceptance } from "../progress/acceptance";
import { completedDayCount } from "../progress/selectors";
import { useProgress } from "../progress/ProgressProvider";
import type { SkillDomain } from "../types/music";

const DOMAIN_LABELS: Record<SkillDomain, string> = { ear: "单音听辨", phrase: "短句复现", fretboard: "指板定位", chord: "和弦推导" };

export function ProgressPage() {
  const { snapshot, exportProgress, importProgress, resetProgress } = useProgress();
  const [message, setMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const stats = domainStats(snapshot.results);
  const total = snapshot.results.length;
  const correct = snapshot.results.filter((result) => result.correct).length;
  const averageAttempts = total > 0 ? snapshot.results.reduce((sum, result) => sum + result.attempts, 0) / total : 0;
  const acceptance = evaluateAcceptance(snapshot);

  async function handleImport(file: File | undefined) {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      const result = importProgress(parsed);
      setMessage(result.ok ? "进度已恢复。" : `导入失败：${result.error ?? "文件格式不正确"}`);
    } catch {
      setMessage("导入失败：文件不是有效 JSON。");
    }
  }

  return (
    <div className="page">
      <PageHeader eyebrow="Progress" title="学习进度" description="看正确率和尝试次数怎样变化。补弱只选择得分最差的域，不惩罚练习中断。" />
      <section className="stat-grid">
        <StatCard icon={Target} label="完成天数" value={`${completedDayCount(snapshot)} / 28`} note="固定练习 + 一组补弱 + 复盘" />
        <StatCard icon={Gauge} label="正确率" value={total > 0 ? `${Math.round((correct / total) * 100)}%` : "—"} note={`${correct} / ${total} 个已作答回合`} />
        <StatCard icon={Activity} label="平均尝试" value={total > 0 ? averageAttempts.toFixed(1) : "—"} note={`连续 ${calculateStreak(snapshot.dailyLogs)} 天`} />
      </section>

      <section className="content-section">
        <div className="section-heading"><div><p className="eyebrow">By skill</p><h2>四个训练域</h2></div></div>
        <div className="domain-grid">
          {(Object.keys(DOMAIN_LABELS) as SkillDomain[]).map((domain) => {
            const current = stats[domain];
            const accuracy = current.count > 0 ? Math.round((1 - current.errors / current.count) * 100) : 0;
            return (
              <article className="domain-card" key={domain}>
                <div><strong>{DOMAIN_LABELS[domain]}</strong><span>{current.count} 题</span></div>
                <div className="usage-bar"><span style={{ width: `${current.count > 0 ? accuracy : 0}%` }} /></div>
                <small>{current.count > 0 ? `正确率 ${accuracy}%` : "尚未练习"}</small>
              </article>
            );
          })}
        </div>
      </section>

      <section className="content-section panel">
        <div className="panel__heading"><div><strong>第一阶段验收</strong><span>{acceptance.status === "passed" ? "已通过" : acceptance.status === "needs_review" ? "需要补练" : "等待最终验收"}</span></div></div>
        <div className="acceptance-grid">
          {acceptance.checks.map((check) => <article className={check.passed ? "is-complete" : ""} key={check.domain}><strong>{check.label}</strong><span>{check.detail}</span><small>{check.passed ? "通过" : "继续练"}</small></article>)}
        </div>
        {acceptance.status === "needs_review" ? (
          <div className="button-row">
            {acceptance.remedialPackage.map((domain) => <Link className="button button--secondary" to={`/exercise/remedial-${domain}`} key={domain}>三天补练包 · {DOMAIN_LABELS[domain]}</Link>)}
          </div>
        ) : null}
      </section>

      <section className="content-section panel data-panel">
        <div className="panel__heading"><div><strong>本机数据</strong><span>导出文件包含答题、复盘和设置。</span></div></div>
        {message ? <p className="inline-feedback" role="status">{message}</p> : null}
        <div className="button-row">
          <button className="button button--primary" type="button" onClick={exportProgress}><Download aria-hidden="true" size={17} />导出 JSON</button>
          <button className="button button--secondary" type="button" onClick={() => fileRef.current?.click()}><Upload aria-hidden="true" size={17} />导入进度</button>
          <input ref={fileRef} className="sr-only" type="file" accept="application/json,.json" onChange={(event) => void handleImport(event.target.files?.[0])} />
          <button className="button button--quiet" type="button" onClick={() => { if (window.confirm("确定清空全部本机进度吗？这个操作不可撤销。")) resetProgress(); }}>清空本机进度</button>
        </div>
      </section>
    </div>
  );
}
