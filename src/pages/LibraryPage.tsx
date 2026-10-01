import { useState } from "react";
import { Drum, Music2, Play } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { ExerciseCard } from "../components/ExerciseCard";
import { allExercises } from "../data/exercises";
import type { SkillDomain } from "../types/music";
import { useProgress } from "../progress/ProgressProvider";
import { completedExerciseIds } from "../progress/selectors";
import { playCadence, playMetronome, playTonic, resumeAudio } from "../audio/engine";

const FILTERS: readonly { id: "all" | SkillDomain; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "ear", label: "单音" },
  { id: "phrase", label: "短句" },
  { id: "fretboard", label: "指板" },
  { id: "chord", label: "和弦" },
];

export function LibraryPage() {
  const { snapshot } = useProgress();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const completed = completedExerciseIds(snapshot);
  const exercises = allExercises.filter((exercise) => filter === "all" || exercise.skill === filter);

  return (
    <div className="page">
      <PageHeader eyebrow="Practice library" title="练习库" description="按能力自由选择训练。日常题、周测题和最终验收题来自不同的确定性题池。" />
      <section className="content-section panel">
        <div className="panel__heading"><div><strong>音频工具</strong><span>全部由浏览器离线生成，不需要联网或 API key。</span></div><Music2 aria-hidden="true" size={19} /></div>
        <div className="button-row">
          <button className="button button--primary" type="button" onClick={() => { void resumeAudio().then(playCadence); }}><Play size={16} />C 大调 I–IV–V–I</button>
          <button className="button button--secondary" type="button" onClick={() => { void resumeAudio().then(playTonic); }}>主和弦与主音</button>
          {[60, 72, 84].map((bpm) => <button className="button button--quiet" type="button" key={bpm} onClick={() => { void resumeAudio().then(() => playMetronome(bpm as 60 | 72 | 84)); }}><Drum size={16} />{bpm} BPM</button>)}
        </div>
      </section>
      <div className="filter-row" role="group" aria-label="按技能筛选">
        {FILTERS.map((item) => <button className={filter === item.id ? "is-active" : ""} type="button" key={item.id} onClick={() => setFilter(item.id)}>{item.label}</button>)}
      </div>
      <div className="exercise-list">
        {exercises.map((exercise) => <ExerciseCard key={exercise.id} exercise={exercise} completed={completed.has(exercise.id)} />)}
      </div>
    </div>
  );
}
