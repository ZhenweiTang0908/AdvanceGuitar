import { useState } from "react";
import { Drum, Music2, Play } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { ExerciseCard } from "../components/ExerciseCard";
import { allExercises } from "../data/exercises";
import type { SkillDomain } from "../types/music";
import { useProgress } from "../progress/ProgressProvider";
import { completedExerciseIds } from "../progress/selectors";
import { useI18n } from "../i18n";
import { playCadence, playMetronome, playTonic, resumeAudio } from "../audio/engine";

const FILTERS: readonly ("all" | SkillDomain)[] = ["all", "ear", "phrase", "fretboard", "chord"];

export function LibraryPage() {
  const { t } = useI18n();
  const { snapshot } = useProgress();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const completed = completedExerciseIds(snapshot);
  const exercises = allExercises.filter((exercise) => filter === "all" || exercise.skill === filter);

  return (
    <div className="page">
      <PageHeader eyebrow={t("library")} title={t("libraryTitle")} description={t("libraryDescription")} />
      <section className="content-section panel">
        <div className="panel__heading"><div><strong>{t("audioTools")}</strong><span>{t("audioToolsHint")}</span></div><Music2 aria-hidden="true" size={19} /></div>
        <div className="button-row">
          <button className="button button--primary" type="button" onClick={() => { void resumeAudio().then(playCadence); }}><Play size={16} />{t("playCadence")}</button>
          <button className="button button--secondary" type="button" onClick={() => { void resumeAudio().then(playTonic); }}>{t("tonicAndChord")}</button>
          {[60, 72, 84].map((bpm) => <button className="button button--quiet" type="button" key={bpm} onClick={() => { void resumeAudio().then(() => playMetronome(bpm as 60 | 72 | 84)); }}><Drum size={16} />{bpm} BPM</button>)}
        </div>
      </section>
      <div className="filter-row" role="group" aria-label={t("filterBySkill")}>
        {FILTERS.map((item) => <button className={filter === item ? "is-active" : ""} type="button" key={item} onClick={() => setFilter(item)}>{t(item === "all" ? "all" : item === "ear" ? "earLabel" : item === "phrase" ? "phraseLabel" : item === "fretboard" ? "fretboardLabel" : "chordLabel")}</button>)}
      </div>
      <div className="exercise-list">
        {exercises.map((exercise) => <ExerciseCard key={exercise.id} exercise={exercise} completed={completed.has(exercise.id)} />)}
      </div>
    </div>
  );
}
