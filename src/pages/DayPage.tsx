import { ArrowLeft, ArrowRight, Clock3, Music2 } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { DailyReflection } from "../components/DailyReflection";
import { ExerciseCard } from "../components/ExerciseCard";
import { MarkdownView } from "../components/MarkdownView";
import { PageHeader } from "../components/PageHeader";
import { getCurriculumDay } from "../content/loadCurriculum";
import { getExercisesForDay } from "../data/exercises";
import { weakestDomain } from "../progress/logic";
import { completedExerciseIds } from "../progress/selectors";
import { useProgress } from "../progress/ProgressProvider";

export function DayPage() {
  const params = useParams();
  const dayNumber = Number(params.day);
  const day = getCurriculumDay(dayNumber);
  const { snapshot, saveDailyLog } = useProgress();
  const exercises = getExercisesForDay(dayNumber);
  const remedial = exercises.length > 0 ? `remedial-${weakestDomain(snapshot.results)}` : undefined;
  const completed = completedExerciseIds(snapshot);

  if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 28) return <Navigate to="/stage/1" replace />;
  if (!day) {
    return (
      <div className="page">
        <PageHeader eyebrow="Day not found" title="这一天的课程还没有内容" actions={<Link className="button button--secondary" to="/stage/1"><ArrowLeft size={16} />返回课程</Link>} />
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow={`Week ${day.week} · Day ${day.day}`}
        title={day.title}
        description={day.goal}
        actions={<Link className="button button--secondary" to="/stage/1"><ArrowLeft size={16} />课程总览</Link>}
      />
      <div className="day-meta-row">
        <span><Clock3 aria-hidden="true" size={16} />约 {day.minutes} 分钟</span>
        <span><Music2 aria-hidden="true" size={16} />{day.newNotes.length > 0 ? `今日音：${day.newNotes.join("、")}` : "复习与验收"}</span>
        {day.songTask ? <span>包含自选歌曲片段</span> : null}
      </div>

      <section className="content-section">
        <div className="section-heading">
          <div><p className="eyebrow">Guided practice</p><h2>今天的练习入口</h2></div>
          <span className="status-chip">{exercises.filter((exercise) => completed.has(exercise.id)).length} / {exercises.length}</span>
        </div>
        <div className="exercise-list">
          {exercises.map((exercise) => <ExerciseCard key={exercise.id} exercise={exercise} completed={completed.has(exercise.id)} />)}
          {remedial ? <Link className={`exercise-card remedial-card${completed.has(remedial) ? " is-complete" : ""}`} to={`/exercise/${remedial}?day=${dayNumber}`}><span className="exercise-card__status">＋</span><span className="exercise-card__copy"><small>自适应</small><strong>今日补弱</strong><span>根据错误率、尝试次数和用时选择最弱训练域。</span></span><span className="exercise-card__meta">进入</span></Link> : null}
        </div>
      </section>

      <section className="content-section two-column">
        <article className="panel">
          <MarkdownView markdown={day.body} />
        </article>
        <aside className="day-sidebar">
          <DailyReflection day={day.day} initialLog={snapshot.dailyLogs[day.day]} onSave={saveDailyLog} />
          {day.day < 28 ? <Link className="button button--secondary button--block" to={`/day/${day.day + 1}`}>查看下一天 <ArrowRight size={16} /></Link> : <Link className="button button--primary button--block" to="/progress">查看阶段进度 <ArrowRight size={16} /></Link>}
        </aside>
      </section>
    </div>
  );
}
