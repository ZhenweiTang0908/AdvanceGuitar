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

export function HomePage() {
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
              ? "太棒啦！今天的核心训练已经全部搞定，去复盘或者冲刺阶段验收吧！"
              : isTodayExercisesDone
              ? "今天练习已达标！可以直接开启下一天啦。"
              : quote}
          </p>
        </div>
      </div>

      <PageHeader
        eyebrow={`第一阶段 · 第 ${nextDay} 天`}
        title={day ? `第 ${nextDay} 天 · ${day.title}` : "今天继续"}
        description={day?.goal}
        actions={
          isTodayExercisesDone && nextDay < 28 ? (
            <Link className="button button--primary" to={`/day/${nextDay + 1}`} style={{ fontSize: "1.05rem", padding: "0.85rem 1.6rem" }}>
              进入第 {nextDay + 1} 天 <ArrowRight aria-hidden="true" size={18} />
            </Link>
          ) : (
            <Link className="button button--primary" to={`/day/${nextDay}`} style={{ fontSize: "1.05rem", padding: "0.85rem 1.6rem" }}>
              开始 60 分钟 <ArrowRight aria-hidden="true" size={18} />
            </Link>
          )
        }
      />

      <div className="duo-progress-container">
        <div className="duo-progress-pill duo-progress-pill--accent">
          <Sparkles size={16} />
          <span>第一阶段：<strong>{stageComplete} / 28 天</strong></span>
        </div>
        <div className="duo-progress-pill">
          <Flame size={16} color="var(--color-brand)" />
          <span>持续训练：<strong>{calculateStreak(snapshot.dailyLogs)} 天</strong></span>
        </div>
        <div className={`duo-progress-pill${completion.complete ? " duo-progress-pill--success" : ""}`}>
          <span>今日训练：<strong>{completion.completed} / {completion.total}</strong></span>
        </div>
      </div>

      <section className="content-section">
        <div className="section-heading">
          <div><p className="eyebrow">DAILY ROUTINE</p><h2>今天</h2></div>
          <span className="status-chip">{completion.complete ? "已达标" : isTodayExercisesDone ? "练习完成 · 待复盘" : "60 分钟"}</span>
        </div>
        <div className="exercise-list">
          {exercises.map((exercise) => <ExerciseCard key={exercise.id} exercise={exercise} completed={completed.has(exercise.id)} />)}
        </div>
      </section>
    </div>
  );
}
