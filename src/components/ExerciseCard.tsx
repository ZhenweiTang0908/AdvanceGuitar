import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { Link } from "react-router-dom";
import type { ExerciseDefinition } from "../types/curriculum";
import { useI18n } from "../i18n";

interface ExerciseCardProps {
  exercise: ExerciseDefinition;
  completed?: boolean;
}

export function ExerciseCard({ exercise, completed = false }: ExerciseCardProps) {
  const { t } = useI18n();
  const skillLabel = exercise.skill === "ear" ? t("skillEar") : exercise.skill === "phrase" ? t("skillPhrase") : exercise.skill === "fretboard" ? t("skillFretboard") : t("skillChord");
  const title = exercise.remedial
    ? t(exercise.skill === "ear" ? "notesSingle" : exercise.skill === "phrase" ? "notesPhrase" : exercise.skill === "fretboard" ? "notesFretboard" : "notesChord")
    : skillLabel;
  return (
    <Link className={`exercise-card${completed ? " is-complete" : ""}`} to={`/exercise/${exercise.id}`}>
      <span className="exercise-card__status">
        {completed ? <CheckCircle2 aria-hidden="true" size={18} /> : <Circle aria-hidden="true" size={18} />}
      </span>
      <span className="exercise-card__copy">
        <small>{skillLabel}</small>
        <strong>{title}</strong>
      </span>
      <span className="exercise-card__meta">{t("roundCount", { count: exercise.rounds })} <ArrowRight aria-hidden="true" size={16} /></span>
    </Link>
  );
}
