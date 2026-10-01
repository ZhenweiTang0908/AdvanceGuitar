import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { Link } from "react-router-dom";
import type { ExerciseDefinition } from "../types/curriculum";

interface ExerciseCardProps {
  exercise: ExerciseDefinition;
  completed?: boolean;
}

export function ExerciseCard({ exercise, completed = false }: ExerciseCardProps) {
  return (
    <Link className={`exercise-card${completed ? " is-complete" : ""}`} to={`/exercise/${exercise.id}`}>
      <span className="exercise-card__status">
        {completed ? <CheckCircle2 aria-hidden="true" size={18} /> : <Circle aria-hidden="true" size={18} />}
      </span>
      <span className="exercise-card__copy">
        <small>{exercise.skill === "ear" ? "听音" : exercise.skill === "phrase" ? "短句" : exercise.skill === "fretboard" ? "指板" : "和弦"}</small>
        <strong>{exercise.title}</strong>
      </span>
      <span className="exercise-card__meta">{exercise.rounds} 题 <ArrowRight aria-hidden="true" size={16} /></span>
    </Link>
  );
}
