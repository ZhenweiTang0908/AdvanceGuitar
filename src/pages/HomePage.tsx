import { ArrowRight, Flame, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { ExerciseCard } from "../components/ExerciseCard";
import { PageHeader } from "../components/PageHeader";
import { MascotPicko, usePickoQuote } from "../components/MascotPicko";
import { getCurriculumDay } from "../content/loadCurriculum";
import { getExercise, getExercisesForDay } from "../data/exercises";
import { calculateStreak, nextRecommendedDay } from "../progress/logic";
import { completedDayCount, completedExerciseIds, dayCompletion } from "../progress/selectors";
import { useProgress } from "../progress/ProgressProvider";
import { useI18n } from "../i18n";

export function HomePage() {
  const { t } = useI18n();
  const { snapshot } = useProgress();
  const nextDay = nextRecommendedDay(snapshot.dailyLogs);
  const day = getCurriculumDay(nextDay);
  const exercises = day
    ? day.exerciseIds.map((id) => getExercise(id)).filter((exercise): exercise is NonNullable<typeof exercise> => Boolean(exercise))
    : getExercisesForDay(nextDay);
  const completed = completedExerciseIds(snapshot);
  const completion = dayCompletion(snapshot, nextDay);
  const stageComplete = completedDayCount(snapshot);
  const quote = usePickoQuote(nextDay);

  // When all exercises for nextDay are done, give a clear prompt to advance or log
  const isTodayExercisesDone = exercises.length > 0 && exercises.every((e) => completed.has(e.id));

  return (
    <div className="page">
      <div className="picko-companion-card">
        <MascotPicko mood={completion.complete ? "celebrate" : isTodayExercisesDone ? "wink" : "cheer"} size={68} />
        <div className="picko-bubble">
          <p>
            {completion.complete
              ? t("successToday")
              : isTodayExercisesDone
              ? t("doneToday")
              : quote}
          </p>
        </div>
      </div>

      <PageHeader
        eyebrow={`STAGE 1 · ${t("day", { day: nextDay })}`}
        title={day ? `${t("day", { day: nextDay })} · ${day.title}` : t("homeTitle")}
        description={day?.goal}
        actions={
          isTodayExercisesDone && nextDay < 28 ? (
            <Link className="button button--primary" to={`/day/${nextDay + 1}`} style={{ fontSize: "1.05rem", padding: "0.85rem 1.6rem" }}>
              {t("continueDay", { day: nextDay + 1 })} <ArrowRight aria-hidden="true" size={18} />
            </Link>
          ) : (
            <Link className="button button--primary" to={`/day/${nextDay}`} style={{ fontSize: "1.05rem", padding: "0.85rem 1.6rem" }}>
              {t("start60")} <ArrowRight aria-hidden="true" size={18} />
            </Link>
          )
        }
      />

      <div className="duo-progress-container">
        <div className="duo-progress-pill duo-progress-pill--accent">
          <Sparkles size={16} />
          <span>{t("stageProgress", { count: stageComplete })}</span>
        </div>
        <div className="duo-progress-pill">
          <Flame size={16} color="var(--color-brand)" />
          <span>{t("streak", { count: calculateStreak(snapshot.dailyLogs) })}</span>
        </div>
        <div className={`duo-progress-pill${completion.complete ? " duo-progress-pill--success" : ""}`}>
          <span>{t("todayProgress", { done: completion.completed, total: completion.total })}</span>
        </div>
      </div>

      <section className="content-section">
        <div className="section-heading">
          <div><p className="eyebrow">{t("dailyRoutine")}</p><h2>{t("todayHeading")}</h2></div>
          <span className="status-chip">{completion.complete ? t("completed") : isTodayExercisesDone ? t("practiceDone") : t("minutes60")}</span>
        </div>
        <div className="exercise-list">
          {exercises.map((exercise) => <ExerciseCard key={exercise.id} exercise={exercise} completed={completed.has(exercise.id)} />)}
        </div>
      </section>
    </div>
  );
}
