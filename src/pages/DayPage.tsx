import { ArrowLeft, ArrowRight, Clock3, Music2 } from "lucide-react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { DailyReflection } from "../components/DailyReflection";
import { ExerciseCard } from "../components/ExerciseCard";
import { MarkdownView } from "../components/MarkdownView";
import { PageHeader } from "../components/PageHeader";
import { MascotPicko } from "../components/MascotPicko";
import { getCurriculumDay } from "../content/loadCurriculum";
import { getExercise } from "../data/exercises";
import { weakestDomain } from "../progress/logic";
import { completedExerciseIds } from "../progress/selectors";
import { useProgress } from "../progress/ProgressProvider";
import { useI18n } from "../i18n";

export function DayPage() {
  const { t, language } = useI18n();
  const params = useParams();
  const dayNumber = Number(params.day);
  const day = getCurriculumDay(dayNumber, language);
  const { snapshot, saveDailyLog } = useProgress();
  const navigate = useNavigate();

  function handleDailyLogSave(log: Parameters<typeof saveDailyLog>[0]) {
    saveDailyLog(log);
    navigate(dayNumber < 28 ? `/day/${dayNumber + 1}` : "/progress");
  }

  if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 28) return <Navigate to="/stage/1" replace />;
  if (!day) {
    return (
      <div className="page">
        <PageHeader eyebrow={t("notFound")} title={t("dayNotFound")} actions={<Link className="button button--secondary" to="/stage/1"><ArrowLeft size={16} />{t("backToCurriculum")}</Link>} />
      </div>
    );
  }

  const exercises = day.exerciseIds.map((id) => getExercise(id)).filter((exercise): exercise is NonNullable<typeof exercise> => Boolean(exercise));
  const remedial = exercises.length > 0 ? `remedial-${weakestDomain(snapshot.results)}` : undefined;
  const completed = completedExerciseIds(snapshot);
  const isTodayAllDone = exercises.length > 0 && exercises.every((e) => completed.has(e.id));

  return (
    <div className="page">
      <div className="picko-companion-card">
        <MascotPicko mood={isTodayAllDone ? "celebrate" : "listen"} size={64} />
        <div className="picko-bubble">
          <p>
            {isTodayAllDone
              ? t("doneToday")
              : t("homeDescription")}
          </p>
        </div>
      </div>

      <PageHeader
        eyebrow={t("weekDay", { week: day.week, day: day.day })}
        title={day.title}
        description={day.goal}
        actions={<Link className="button button--secondary" to="/stage/1"><ArrowLeft size={16} />{t("allLessons")}</Link>}
      />
      <div className="day-meta-row">
        <span><Clock3 aria-hidden="true" size={16} />{t("aboutMinutes", { count: day.minutes })}</span>
        <span><Music2 aria-hidden="true" size={16} />{day.newNotes.length > 0 ? t("todaysNotes", { notes: day.newNotes.join(", ") }) : t("reviewAndAssessment")}</span>
        {day.songTask ? <span>{t("optionalSong")}</span> : null}
      </div>

      <nav className="day-navigation" aria-label={t("curriculum")}>
        {day.day > 1 ? <Link className="button button--secondary" to={`/day/${day.day - 1}`}><ArrowLeft size={16} />{t("previousDay")}</Link> : <span />}
        {day.day < 28
          ? <Link className="button button--secondary" to={`/day/${day.day + 1}`}>{t("nextDay")}<ArrowRight size={16} /></Link>
          : <Link className="button button--primary" to="/progress">{t("progress")}<ArrowRight size={16} /></Link>}
      </nav>

      <section className="content-section">
        <div className="section-heading">
          <div><p className="eyebrow">{t("guidedPractice")}</p><h2>{t("todaysExercises")}</h2></div>
          <span className="status-chip">{exercises.filter((exercise) => completed.has(exercise.id)).length} / {exercises.length}</span>
        </div>
        <div className="exercise-list">
          {exercises.map((exercise) => <ExerciseCard key={exercise.id} exercise={exercise} completed={completed.has(exercise.id)} />)}
          {remedial ? <Link className={`exercise-card remedial-card${completed.has(remedial) ? " is-complete" : ""}`} to={`/exercise/${remedial}?day=${dayNumber}`}><span className="exercise-card__status">＋</span><span className="exercise-card__copy"><small>{t("adaptive")}</small><strong>{t("remedialToday")}</strong><span>{t("notesDescription")}</span></span><span className="exercise-card__meta">{t("enter")}</span></Link> : null}
        </div>
      </section>

      <details className="study-notes">
        <summary>{t("keyPoints")} <span>{t("expand")}</span></summary>
        <div className="study-notes__body"><MarkdownView markdown={day.body} /></div>
      </details>

      <details className="study-notes reflection-notes" open={Boolean(snapshot.dailyLogs[day.day]?.completedAt)}>
        <summary>{t("reflection")} <span>{t("optional")}</span></summary>
        <div className="study-notes__body"><DailyReflection day={day.day} initialLog={snapshot.dailyLogs[day.day]} onSave={handleDailyLogSave} /></div>
      </details>
    </div>
  );
}
