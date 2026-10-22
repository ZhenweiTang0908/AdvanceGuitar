import { LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { MarkdownView } from "../components/MarkdownView";
import { getCurriculumDays, getStageOverview } from "../content/loadCurriculum";
import { completedDayCount, dayCompletion } from "../progress/selectors";
import { useProgress } from "../progress/ProgressProvider";
import { useI18n } from "../i18n";

const WEEKS = [
  { week: 1, days: "1–7" },
  { week: 2, days: "8–14" },
  { week: 3, days: "15–21" },
  { week: 4, days: "22–28" },
] as const;

export function StagePage() {
  const { t, language } = useI18n();
  const { snapshot } = useProgress();
  const completed = completedDayCount(snapshot);
  const daysInLanguage = getCurriculumDays(language);
  const stageOverview = getStageOverview(language);

  return (
    <div className="page">
      <PageHeader
        eyebrow="Stage 1 · 28 days"
        title={t("stageTitle")}
        description={t("stageDescription", { count: completed })}
      />
      {stageOverview ? (
        <details className="study-notes stage-overview">
          <summary>{t("stageNotes")} <span>{t("stageNotesSubtitle")}</span></summary>
          <div className="study-notes__body"><MarkdownView markdown={stageOverview} /></div>
        </details>
      ) : null}
      {daysInLanguage.length === 0 ? (
        <section className="panel empty-state">
          <LockKeyhole aria-hidden="true" size={24} />
          <h2>{language === "de" ? "Kursinhalte werden vorbereitet" : "Curriculum is being prepared"}</h2>
          <p>{language === "de" ? "Seitenstruktur, Audio und Fortschritt sind bereit. Die Markdown-Lektionen erscheinen mit einem späteren Build." : "The page layout, audio engine, and progress tracking are ready. Markdown lessons will appear in a future build."}</p>
        </section>
      ) : null}
      <div className="week-list">
        {WEEKS.map((week) => {
          const days = daysInLanguage.filter((day) => day.week === week.week);
          return (
            <section className="week-card" key={week.week}>
              <header>
                <div><span>{t("week", { week: week.week })}</span><h2>{language === "de" ? ["", "C, E und G mit dem Griffbrett verbinden", "D und A ergänzen den Fünftonraum", "Von Einzeltönen zu 4–6-tönigen Melodien", "Versuche reduzieren und Prüfung bestehen"][week.week] : ["", "Connect C, E, and G to nearby fretboard positions", "Add D and A to form a five-note range", "Move from single notes to 4–6-note phrases", "Reduce attempts and complete the assessment"][week.week]}</h2></div>
                <small>{language === "de" ? "Tage" : "Days"} {week.days}</small>
              </header>
              <div className="day-grid">
                {days.length === 0 ? <p className="muted">{language === "de" ? "Lektionen folgen in Kürze." : "Lessons coming soon."}</p> : days.map((day) => {
                  const status = dayCompletion(snapshot, day.day);
                  return (
                    <Link className={`day-cell${status.complete ? " is-complete" : ""}`} to={`/day/${day.day}`} key={day.day}>
                      <span>{t("day", { day: day.day })}</span>
                      <strong>{day.title}</strong>
                      <small>{status.complete ? t("completed") : status.completed > 0 ? `${status.completed}/${status.total} ${t("exercises")}` : t("notStarted")}</small>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
      <section className="content-section panel roadmap-panel">
        <div className="panel__heading"><div><strong>{t("nextSteps")}</strong><span>{t("stageFutureDescription")}</span></div></div>
        <ol className="roadmap-list">
          <li><span>02</span><div><strong>{language === "de" ? "Melodien in einer bekannten Tonart heraushören" : "Transcribe full phrases in a known key"}</strong><small>{language === "de" ? "Erweitere die Durtonleiter, fünfte Saite und verschiebbare A-Akkordgriffe." : "Expand the major scale, fifth-string roots, and movable A-shape chords."}</small></div></li>
          <li><span>03</span><div><strong>{language === "de" ? "Tonart aus einer Aufnahme bestimmen" : "Identify and verify a key from a recording"}</strong><small>{language === "de" ? "Gleiche Grundton, Ruhepunkte, Bass und Akkorde miteinander ab." : "Cross-check the tonic, resting points, bass, and chords."}</small></div></li>
          <li><span>04</span><div><strong>{language === "de" ? "Von der Melodie zu Akkorden und Begleitung" : "Expand from melody to chords and accompaniment"}</strong><small>{language === "de" ? "Übe Bass, Akkordqualitäten, Umkehrungen und acht Takte." : "Work on bass, chord qualities, inversions, and eight-bar sections."}</small></div></li>
          <li><span>05</span><div><strong>{language === "de" ? "Songs vollständig und schneller heraushören" : "Transcribe complete songs at higher speed"}</strong><small>{language === "de" ? "Verbinde Melodie, Akkorde, Rhythmus und Griffbrettpositionen." : "Connect melody, chords, rhythm, and fretboard positions."}</small></div></li>
        </ol>
      </section>
    </div>
  );
}
