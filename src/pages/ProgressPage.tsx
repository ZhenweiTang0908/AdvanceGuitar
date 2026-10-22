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
import { useI18n, type MessageKey } from "../i18n";

export function ProgressPage() {
  const { t } = useI18n();
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
      const errorKeys: Record<string, MessageKey> = {
        "进度文件不是有效对象": "importInvalidObject",
        "进度文件版本不受支持": "importUnsupportedVersion",
        "课程版本不匹配": "importCurriculumMismatch",
        "缺少答题记录": "importMissingResults",
        "缺少每日复盘": "importMissingLogs",
        "设置格式不正确": "importInvalidSettings",
        "音量设置超出范围": "importVolumeRange",
        "音色设置不正确": "importInvalidTone",
      };
      const reason = result.error ? (errorKeys[result.error] ? t(errorKeys[result.error]) : result.error) : t("importInvalidSettings");
      setMessage(result.ok ? t("importSuccessMessage") : t("importFailure", { reason }));
    } catch {
      setMessage(t("importInvalidJson"));
    }
  }

  return (
    <div className="page">
      <PageHeader eyebrow="Progress" title={t("progressTitle")} description={t("progressDescription")} />
      <section className="stat-grid">
        <StatCard icon={Target} label={t("completedDays")} value={`${completedDayCount(snapshot)} / 28`} note={t("fixedPracticeNote")} />
        <StatCard icon={Gauge} label={t("accuracy")} value={total > 0 ? `${Math.round((correct / total) * 100)}%` : "—"} note={`${correct} / ${total} ${t("answeredRounds")}`} />
        <StatCard icon={Activity} label={t("averageAttempts")} value={total > 0 ? averageAttempts.toFixed(1) : "—"} note={t("consecutiveDays", { count: calculateStreak(snapshot.dailyLogs) })} />
      </section>

      <section className="content-section">
        <div className="section-heading"><div><p className="eyebrow">By skill</p><h2>{t("fourSkills")}</h2></div></div>
        <div className="domain-grid">
          {(["ear", "phrase", "fretboard", "chord"] as SkillDomain[]).map((domain) => {
            const current = stats[domain];
            const accuracy = current.count > 0 ? Math.round((1 - current.errors / current.count) * 100) : 0;
            return (
              <article className="domain-card" key={domain}>
                <div><strong>{t(domain === "ear" ? "skillEar" : domain === "phrase" ? "skillPhrase" : domain === "fretboard" ? "skillFretboard" : "skillChord")}</strong><span>{t("questionCount", { count: current.count })}</span></div>
                <div className="usage-bar"><span style={{ width: `${current.count > 0 ? accuracy : 0}%` }} /></div>
                <small>{current.count > 0 ? t("accuracyNote", { accuracy }) : t("notPracticed")}</small>
              </article>
            );
          })}
        </div>
      </section>

      <section className="content-section panel">
        <div className="panel__heading"><div><strong>{t("stageChecks")}</strong><span>{acceptance.status === "passed" ? t("passedStatus") : acceptance.status === "needs_review" ? t("needsPractice") : t("waitingAssessment")}</span></div></div>
        <div className="acceptance-grid">
          {acceptance.checks.map((check) => {
            const count = check.detail.match(/^(\d+)\s*\//)?.[1] ?? "0";
            const detailKey = check.domain === "ear" ? "checkEar" : check.domain === "phrase" ? "checkPhrase" : check.domain === "fretboard" ? "checkFretboard" : "checkChord";
            return <article className={check.passed ? "is-complete" : ""} key={check.domain}><strong>{t(check.domain === "ear" ? "skillEar" : check.domain === "phrase" ? "skillPhrase" : check.domain === "fretboard" ? "skillFretboard" : "skillChord")}</strong><span>{t(detailKey, { count })}</span><small>{check.passed ? t("pass") : t("keepPracticing")}</small></article>;
          })}
        </div>
        {acceptance.status === "needs_review" ? (
          <div className="button-row">
            {acceptance.remedialPackage.map((domain) => <Link className="button button--secondary" to={`/exercise/remedial-${domain}`} key={domain}>{t("threeDayPack", { skill: t(domain === "ear" ? "skillEar" : domain === "phrase" ? "skillPhrase" : domain === "fretboard" ? "skillFretboard" : "skillChord") })}</Link>)}
          </div>
        ) : null}
      </section>

      <section className="content-section panel data-panel">
        <div className="panel__heading"><div><strong>{t("localDataHeading")}</strong><span>{t("exportHint")}</span></div></div>
        {message ? <p className="inline-feedback" role="status">{message}</p> : null}
        <div className="button-row">
          <button className="button button--primary" type="button" onClick={exportProgress}><Download aria-hidden="true" size={17} />{t("exportJson")}</button>
          <button className="button button--secondary" type="button" onClick={() => fileRef.current?.click()}><Upload aria-hidden="true" size={17} />{t("importProgress")}</button>
          <input ref={fileRef} className="sr-only" type="file" accept="application/json,.json" onChange={(event) => void handleImport(event.target.files?.[0])} />
          <button className="button button--quiet" type="button" onClick={() => { if (window.confirm(t("confirmClear"))) resetProgress(); }}>{t("clearLocal")}</button>
        </div>
      </section>
    </div>
  );
}
