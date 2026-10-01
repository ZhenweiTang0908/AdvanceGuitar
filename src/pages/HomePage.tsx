import { ArrowRight, CalendarCheck2, Flame, Gauge, Music2 } from "lucide-react";
import { Link } from "react-router-dom";
import { ExerciseCard } from "../components/ExerciseCard";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { curriculumDays, getCurriculumDay } from "../content/loadCurriculum";
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
        eyebrow="第一阶段 · C 大调起步"
        title={day ? `第 ${nextDay} 天 · ${day.title}` : "今天继续"}
        description={day?.goal ?? "28 天课程内容正在建立，先把每天的听觉、指板、短句与和弦串成一个小时。"}
        actions={<Link className="button button--primary" to={`/day/${nextDay}`}>继续今天 <ArrowRight aria-hidden="true" size={17} /></Link>}
      />

      <section className="stat-grid">
        <StatCard icon={CalendarCheck2} label="阶段进度" value={`${stageComplete} / 28`} note="完成课程与复盘的天数" />
        <StatCard icon={Flame} label="连续练习" value={`${calculateStreak(snapshot.dailyLogs)} 天`} note="错过后温和接上，不惩罚" />
        <StatCard icon={Gauge} label="今日完成" value={`${completion.completed} / ${completion.total}`} note="固定练习的提交进度" />
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div><p className="eyebrow">Today · 60 minutes</p><h2>今天的训练块</h2></div>
          <span className="status-chip">{completion.complete ? "已完成" : "约 60 分钟"}</span>
        </div>
        <div className="exercise-list">
          {exercises.map((exercise) => <ExerciseCard key={exercise.id} exercise={exercise} completed={completed.has(exercise.id)} />)}
        </div>
      </section>

      <section className="content-section two-column">
        <article className="panel panel--accent">
          <Music2 aria-hidden="true" size={22} />
          <h2>真实歌曲不强求 C 调</h2>
          <p>每周安排三次微型扒歌。只取四到六个音，先哼、再找、最后核对。网站不提供歌曲录音，也不需要你上传音乐。</p>
          <Link to="/stage/1">查看完整路线 <ArrowRight aria-hidden="true" size={16} /></Link>
        </article>
        <article className="panel">
          <p className="eyebrow">第一阶段目标</p>
          <h2>把尝试变成方向</h2>
          <p>最终不追求一次听准，而是能记住声音、说出偏高或偏低，并在五音范围内逐步减少试音次数。</p>
          <p className="muted">当前可用内容：{curriculumDays.length > 0 ? `${curriculumDays.length} 天课程` : "课程正在生成"}；练习题库 112 组日常题 + 自适应补弱。</p>
        </article>
      </section>
    </div>
  );
}
