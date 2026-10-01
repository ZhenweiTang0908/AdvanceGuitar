import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ExerciseCard } from "../components/ExerciseCard";
import { PageHeader } from "../components/PageHeader";
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

  return (
    <div className="page">
      <PageHeader
        eyebrow={`第一阶段 · 第 ${nextDay} 天`}
        title={day ? `第 ${nextDay} 天 · ${day.title}` : "今天继续"}
        description={day?.goal}
        actions={<Link className="button button--primary" to={`/day/${nextDay}`}>开始 60 分钟 <ArrowRight aria-hidden="true" size={17} /></Link>}
      />

      <div className="progress-strip">
        <span><strong>{stageComplete}/28</strong>阶段</span>
        <span><strong>{calculateStreak(snapshot.dailyLogs)} 天</strong>连续</span>
        <span><strong>{completion.completed}/{completion.total}</strong>今天</span>
      </div>

      <section className="content-section">
        <div className="section-heading">
          <div><p className="eyebrow">Today</p><h2>今天</h2></div>
          <span className="status-chip">{completion.complete ? "完成" : "60 分钟"}</span>
        </div>
        <div className="exercise-list">
          {exercises.map((exercise) => <ExerciseCard key={exercise.id} exercise={exercise} completed={completed.has(exercise.id)} />)}
        </div>
      </section>
    </div>
  );
}
