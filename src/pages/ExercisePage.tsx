import { ArrowLeft, ArrowRight, Headphones, Mic, RotateCcw, Volume2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { MascotPicko } from "../components/MascotPicko";
import { playChord, playFeedbackSound, playTimedSequence, playTone, resumeAudio } from "../audio/engine";
import { isWithinTolerance } from "../audio/pitchDetection";
import { PageHeader } from "../components/PageHeader";
import { getExercise } from "../data/exercises";
import { buildChordQuestions, buildFretboardQuestions, buildNoteQuestions, buildPhraseQuestions } from "../data/questions";
import { usePitchCapture, type PitchCaptureResult } from "../hooks/usePitchCapture";
import { useMicrophoneSpaceToggle } from "../hooks/useMicrophoneSpaceToggle";
import { midiForRootName, noteByName, PITCH_NOTES, type NoteName } from "../types/music";
import type { ExerciseDefinition } from "../types/curriculum";
import { useProgress } from "../progress/ProgressProvider";
import { useI18n } from "../i18n";

interface RoundOutcome {
  correct: boolean;
  attempts: number;
}

export function ExercisePage() {
  const { t } = useI18n();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const exercise = id ? getExercise(id) : undefined;
  const { recordResult, snapshot } = useProgress();
  const startedAt = useRef(Date.now());
  const [roundIndex, setRoundIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [roundScores, setRoundScores] = useState<boolean[]>([]);
  const microphone = usePitchCapture();
  const supportsMicrophone = exercise?.skill === "ear" || exercise?.skill === "phrase";

  useMicrophoneSpaceToggle({
    enabled: Boolean(exercise && supportsMicrophone && snapshot.settings.answerMode === "microphone"),
    state: microphone.state,
    start: microphone.start,
    stop: microphone.stop,
  });

  if (!exercise) {
    return <Navigate to="/library" replace />;
  }

  function handleRound(outcome: RoundOutcome) {
    if (outcome.correct) {
      playFeedbackSound("correct", snapshot.settings.volume);
    } else {
      playFeedbackSound("incorrect", snapshot.settings.volume);
    }

    recordResult({
      exerciseId: exercise!.id,
      day: Number(searchParams.get("day")) || exercise!.day,
      skill: exercise!.skill,
      correct: outcome.correct,
      attempts: outcome.attempts,
      durationMs: Date.now() - startedAt.current,
    });
    const nextScores = [...roundScores, outcome.correct];
    setRoundScores(nextScores);
    startedAt.current = Date.now();
    if (roundIndex + 1 >= exercise!.rounds) {
      setFinished(true);
      playFeedbackSound("complete", snapshot.settings.volume);
    } else {
      setRoundIndex((current) => current + 1);
    }
  }

  function restart() {
    setRoundIndex(0);
    setFinished(false);
    setRoundScores([]);
    startedAt.current = Date.now();
  }

  // Calculate current streak of correct answers
  let currentStreak = 0;
  for (let i = roundScores.length - 1; i >= 0; i--) {
    if (roundScores[i]) currentStreak++;
    else break;
  }

  return (
    <div className="page exercise-page">
      <PageHeader
        eyebrow={exercise.remedial ? "Adaptive practice" : `Week ${Math.ceil(exercise.day / 7)} · Day ${exercise.day}`}
        title={exercise.title}
        actions={<Link className="button button--secondary" to={exercise.day > 0 ? `/day/${exercise.day}` : "/library"}><ArrowLeft size={16} />{t("goBack")}</Link>}
      />
      {finished ? (
        <CompletionPanel exercise={exercise} scores={roundScores} onRestart={restart} />
      ) : (
        <>
          <div className="round-progress">
            <span style={{ width: `${((roundIndex + 1) / exercise.rounds) * 100}%` }} />
          </div>
          <div className="round-info-bar">
            <p className="round-label">{t("round", { current: roundIndex + 1, total: exercise.rounds })}</p>
            {currentStreak >= 2 ? (
              <span className="combo-badge">{t("streakCorrect", { count: currentStreak })}</span>
            ) : null}
          </div>
          <ExerciseRound key={`${exercise.id}-${roundIndex}`} exercise={exercise} roundIndex={roundIndex} onRound={handleRound} microphone={microphone} />
        </>
      )}
    </div>
  );
}

function CompletionPanel({ exercise, scores, onRestart }: { exercise: ExerciseDefinition; scores: readonly boolean[]; onRestart: () => void }) {
  const { t } = useI18n();
  const correct = scores.filter(Boolean).length;
  return (
    <section className="panel completion-panel">
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
        <MascotPicko mood="celebrate" size={88} />
      </div>
      <p className="eyebrow">{t("greatJob")}</p>
      <h2>{correct === scores.length ? t("perfectRun") : t("performPractice", { count: scores.length })}</h2>
      <p>{t("roundSummary", { correct, helped: scores.length - correct })}</p>
      <div className="button-row button-row--center">
        <button className="button button--primary" type="button" onClick={onRestart}><RotateCcw size={16} />{t("practiceAnother")}</button>
        <Link className="button button--secondary" to={exercise.day > 0 ? `/day/${exercise.day}` : "/library"}>{t("backTo", { page: exercise.day > 0 ? t("today") : t("library") })} <ArrowRight size={16} /></Link>
      </div>
    </section>
  );
}

function ExerciseRound({ exercise, roundIndex, onRound, microphone }: { exercise: ExerciseDefinition; roundIndex: number; onRound: (outcome: RoundOutcome) => void; microphone: PitchCaptureResult }) {
  if (exercise.skill === "ear") return <NoteRound exercise={exercise} roundIndex={roundIndex} onRound={onRound} microphone={microphone} />;
  if (exercise.skill === "phrase") return <PhraseRound exercise={exercise} roundIndex={roundIndex} onRound={onRound} microphone={microphone} />;
  if (exercise.skill === "fretboard") return <ChoiceRound exercise={exercise} roundIndex={roundIndex} onRound={onRound} direction="fretboard" />;
  return <ChoiceRound exercise={exercise} roundIndex={roundIndex} onRound={onRound} direction="chord" />;
}

function NoteRound({ exercise, roundIndex, onRound, microphone }: { exercise: ExerciseDefinition; roundIndex: number; onRound: (outcome: RoundOutcome) => void; microphone: PitchCaptureResult }) {
  const { t, language } = useI18n();
  const questions = useMemo(() => buildNoteQuestions(exercise), [exercise]);
  const question = questions[roundIndex];
  const { snapshot } = useProgress();
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const { stablePitch, consumeStablePitch } = microphone;

  useEffect(() => {
    setAttempts(0);
    setFeedback(null);
    setRevealed(false);
  }, [question.id]);

  useEffect(() => {
    if (snapshot.settings.answerMode !== "microphone" || !stablePitch || revealed) return;
    const target = noteByName(question.target);
    if (isWithinTolerance(stablePitch, target.midi)) {
      consumeStablePitch();
      onRound({ correct: true, attempts: attempts + 1 });
    }
  }, [attempts, consumeStablePitch, onRound, question.target, revealed, snapshot.settings.answerMode, stablePitch]);

  async function playReference() {
    await resumeAudio();
    microphone.suppressDetection(1_200);
    playTone({ midi: noteByName(question.target).midi, timbre: question.timbre, delay: 0.15, duration: 0.9, volume: snapshot.settings.volume });
  }

  async function playTonicReference() {
    await resumeAudio();
    microphone.suppressDetection(1_250);
    playTone({ midi: 60, timbre: "piano", delay: 0.1, duration: 1, volume: snapshot.settings.volume });
  }

  function answer(note: NoteName) {
    if (note === question.target) {
      onRound({ correct: true, attempts: attempts + 1 });
      return;
    }
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    const guessed = noteByName(note).midi;
    const target = noteByName(question.target).midi;
    setFeedback(language === "de"
      ? `${note} ist ${guessed > target ? t("noteHigh") : t("noteLow")} als der Zielton. ${guessed > target ? t("moveHigher") : t("moveLower")}`
      : `${note} is ${guessed > target ? t("noteHigh") : t("noteLow")} than the target. ${guessed > target ? t("moveHigher") : t("moveLower")}`);
  }

  // Keyboard shortcut listener: R to replay, C for tonic, numbers 1-9 for choices
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.repeat
        || event.defaultPrevented
        || event.altKey
        || event.ctrlKey
        || event.metaKey
        || (event.target instanceof HTMLElement && (event.target.isContentEditable || ["INPUT", "TEXTAREA"].includes(event.target.tagName)))
      ) return;

      const key = event.key.toLowerCase();
      if (key === "r") {
        event.preventDefault();
        void playReference();
      } else if (key === "c") {
        event.preventDefault();
        void playTonicReference();
      } else if (key >= "1" && key <= "9") {
        const index = parseInt(key, 10) - 1;
        if (index < question.choices.length) {
          event.preventDefault();
          answer(question.choices[index]);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [question.choices, question.target, playReference, playTonicReference, answer]);

  return (
    <section className="practice-panel panel">
      <div className="practice-panel__header">
        <div><p className="eyebrow">{t("listenHumFind")}</p><h2>{t("listenTarget")}</h2></div>
        <div className="button-row">
          <button className="button button--quiet" type="button" onClick={() => void playTonicReference()}>
            {t("onlyC")} <span className="keycap-badge">C</span>
          </button>
          <button className="button button--primary" type="button" onClick={() => void playReference()}>
            <Headphones size={17} />{t("playTargetNote")} <span className="keycap-badge keycap-badge--inverse">R</span>
          </button>
        </div>
      </div>
      <p className="practice-instruction">{t("notePracticeHelp", { count: question.choices.length })}</p>
      <div className="answer-grid">
        {question.choices.map((note, index) => (
          <button className="note-button" type="button" key={note} onClick={() => answer(note)}>
            <span className="note-button__keycap">{index + 1}</span>
            {note}
            <small>{noteByName(note).degree} {t("degree")}</small>
          </button>
        ))}
      </div>
      {feedback ? <p className="inline-feedback" role="status">{feedback} {t("triedCount", { count: attempts })}.</p> : null}
      {revealed ? <p className="inline-feedback inline-feedback--answer">{t("answerIs", { note: question.target, degree: noteByName(question.target).degree })}</p> : null}
      <div className="practice-footer">
        <span>{t("triedCount", { count: attempts })}</span>
        <button className="button button--quiet" type="button" onClick={() => { setRevealed(true); onRound({ correct: false, attempts: Math.max(attempts, 1) }); }}>{t("revealAndContinue")}</button>
      </div>
      {snapshot.settings.answerMode === "microphone" ? (
        <div className="mic-strip">
          <Mic aria-hidden="true" size={17} />
          <span>{microphone.state === "listening" ? (microphone.stablePitch ? t("identify", { frequency: microphone.pitch?.frequency.toFixed(1) ?? "" }) : t("stopMic")) : t("startMicSpace")}</span>
          {microphone.state === "listening" ? <button className="text-action" type="button" onClick={microphone.stop}>{t("stop")}</button> : <button className="text-action" type="button" onClick={() => void microphone.start()} disabled={microphone.state === "requesting"}><Volume2 size={14} />{t("enableMic")}</button>}
        </div>
      ) : null}
    </section>
  );
}

function PhraseRound({ exercise, roundIndex, onRound, microphone }: { exercise: ExerciseDefinition; roundIndex: number; onRound: (outcome: RoundOutcome) => void; microphone: PitchCaptureResult }) {
  const { t, language } = useI18n();
  const questions = useMemo(() => buildPhraseQuestions(exercise), [exercise]);
  const question = questions[roundIndex];
  const { snapshot } = useProgress();
  const [answer, setAnswer] = useState<NoteName[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const { stablePitch, consumeStablePitch } = microphone;

  useEffect(() => {
    setAnswer([]);
    setAttempts(0);
    setFeedback(null);
  }, [question.id]);

  useEffect(() => {
    if (snapshot.settings.answerMode !== "microphone" || !stablePitch || answer.length >= question.target.length) return;
    const expected = noteByName(question.target[answer.length]);
    if (isWithinTolerance(stablePitch, expected.midi)) {
      consumeStablePitch();
      setAnswer((current) => [...current, question.target[current.length]]);
    }
  }, [answer.length, consumeStablePitch, question.target, snapshot.settings.answerMode, stablePitch]);

  async function playReference() {
    await resumeAudio();
    const delay = 0.15 + playTimedSequence(question.target.map((note) => noteByName(note).midi), question.timbre, question.rhythm, 0.15);
    microphone.suppressDetection(delay * 1_000);
    return delay;
  }

  async function playTonicReference() {
    await resumeAudio();
    microphone.suppressDetection(1_250);
    playTone({ midi: 60, timbre: "piano", delay: 0.1, duration: 1, volume: snapshot.settings.volume });
  }

  function submit() {
    if (answer.length !== question.target.length) return;
    const correct = answer.every((note, index) => note === question.target[index]);
    if (correct) {
      onRound({ correct: true, attempts: attempts + 1 });
      return;
    }
    const firstMismatch = answer.findIndex((note, index) => note !== question.target[index]);
    const expected = noteByName(question.target[firstMismatch]);
    const actual = noteByName(answer[firstMismatch]);
    setAttempts(attempts + 1);
    setFeedback(language === "de"
      ? `Ton ${firstMismatch + 1} ist ${actual.midi > expected.midi ? "zu hoch" : "zu tief"}. Behalte die anderen Töne bei und ändere diesen.`
      : `Note ${firstMismatch + 1} is ${actual.midi > expected.midi ? "too high" : "too low"}. Keep the other notes and adjust this one.`);
  }

  // Keyboard shortcut listener: R to replay, C for tonic, Backspace to delete last, Enter to submit
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.repeat
        || event.defaultPrevented
        || event.altKey
        || event.ctrlKey
        || event.metaKey
        || (event.target instanceof HTMLElement && (event.target.isContentEditable || ["INPUT", "TEXTAREA"].includes(event.target.tagName)))
      ) return;

      const key = event.key.toLowerCase();
      if (key === "r") {
        event.preventDefault();
        void playReference();
      } else if (key === "c") {
        event.preventDefault();
        void playTonicReference();
      } else if (event.key === "Backspace") {
        event.preventDefault();
        setAnswer((current) => current.slice(0, -1));
        setFeedback(null);
      } else if (event.key === "Enter" && answer.length === question.target.length) {
        event.preventDefault();
        submit();
      } else if (key >= "1" && key <= "9") {
        const index = parseInt(key, 10) - 1;
        if (index < exercise.notePool.length) {
          event.preventDefault();
          const note = exercise.notePool[index];
          setAnswer((current) => current.length < question.target.length ? [...current, note] : current);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [answer.length, exercise.notePool, playReference, playTonicReference, question.target.length, submit]);

  return (
    <section className="practice-panel panel">
      <div className="practice-panel__header">
        <div><p className="eyebrow">{t("phraseLabel")} · {question.target.length} notes</p><h2>{t("phrasePractice")}</h2></div>
        <div className="button-row">
          <button className="button button--quiet" type="button" onClick={() => void playTonicReference()}>
            {t("onlyC")} <span className="keycap-badge">C</span>
          </button>
          <button className="button button--primary" type="button" onClick={() => void playReference()}>
            <Headphones size={17} />{language === "de" ? "Melodie abspielen" : "Play phrase"} <span className="keycap-badge keycap-badge--inverse">R</span>
          </button>
        </div>
      </div>
      <p className="practice-instruction">{t("phraseHelp")}</p>
      <div className="phrase-slots">
        {question.target.map((_, index) => (
          <span
            className={answer[index] ? "is-filled" : index === answer.length ? "is-active-slot" : ""}
            key={`${question.id}-slot-${index}`}
            onClick={() => {
              if (index < answer.length) {
                setAnswer((current) => current.slice(0, index));
              }
            }}
            title={index < answer.length ? t("undoHere") : undefined}
            style={{ cursor: index < answer.length ? "pointer" : "default" }}
          >
            {answer[index] ?? "?"}
          </span>
        ))}
      </div>
      <div className="answer-grid answer-grid--compact">
        {exercise.notePool.map((note, index) => (
          <button
            className="note-button"
            type="button"
            key={note}
            onClick={() => setAnswer((current) => current.length < question.target.length ? [...current, note] : current)}
          >
            <span className="note-button__keycap">{index + 1}</span>
            {note}
          </button>
        ))}
      </div>
      {feedback ? <p className="inline-feedback" role="status">{feedback}</p> : null}
      <div className="practice-footer">
        <button className="button button--quiet" type="button" onClick={() => { setAnswer([]); setFeedback(null); }}><RotateCcw size={15} />{t("clearArrangement")}</button>
        <button className="button button--primary" type="button" onClick={submit} disabled={answer.length !== question.target.length}>
          {t("submitPhrase")} <span className="keycap-badge keycap-badge--inverse">Enter</span>
        </button>
      </div>
      {snapshot.settings.answerMode === "microphone" ? (
        <div className="mic-strip">
          <Mic aria-hidden="true" size={17} />
          <span>{microphone.state === "listening" ? `正在等待第 ${answer.length + 1} 个音 · 按空格停止` : "按空格开启麦克风，开启后会跨题持续"}</span>
          {microphone.state === "listening" ? <button className="text-action" type="button" onClick={microphone.stop}>停止</button> : <button className="text-action" type="button" onClick={() => void microphone.start()} disabled={microphone.state === "requesting"}>开启识别</button>}
        </div>
      ) : null}
    </section>
  );
}

function ChoiceRound({ exercise, roundIndex, onRound, direction }: { exercise: ExerciseDefinition; roundIndex: number; onRound: (outcome: RoundOutcome) => void; direction: "fretboard" | "chord" }) {
  const { t, language } = useI18n();
  const questions = useMemo(() => direction === "fretboard" ? buildFretboardQuestions(exercise, language) : buildChordQuestions(exercise, language), [direction, exercise, language]);
  const question = questions[roundIndex];
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => { setAttempts(0); setFeedback(null); }, [question.id]);

  function answer(choice: string) {
    if (choice === question.answer) {
      onRound({ correct: true, attempts: attempts + 1 });
      return;
    }
    setAttempts(attempts + 1);
    setFeedback(t("wrongNote", { choice }));
  }

  async function playChordReference() {
    if (direction !== "chord") return;
    await resumeAudio();
    const rootName = question.answer.charAt(0);
    const minor = question.answer.endsWith("m");
    const root = midiForRootName(rootName);
    playTone({ midi: root, timbre: "guitar", duration: 0.7 });
    playChord([root, root + (minor ? 3 : 4), root + 7], "guitar", 1.1, 0.1);
  }

  // Keyboard shortcut listener: 1-4 for choices, R for chord reference
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.repeat
        || event.defaultPrevented
        || event.altKey
        || event.ctrlKey
        || event.metaKey
        || (event.target instanceof HTMLElement && (event.target.isContentEditable || ["INPUT", "TEXTAREA"].includes(event.target.tagName)))
      ) return;

      const key = event.key.toLowerCase();
      if (key === "r" && direction === "chord") {
        event.preventDefault();
        void playChordReference();
      } else if (key >= "1" && key <= "9") {
        const index = parseInt(key, 10) - 1;
        if (index < question.choices.length) {
          event.preventDefault();
          answer(question.choices[index]);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [direction, playChordReference, question.choices, answer]);

  return (
    <section className="practice-panel panel">
      <div className="practice-panel__header">
        <div><p className="eyebrow">{direction === "fretboard" ? t("skillFretboard") : t("skillChord")}</p><h2>{question.prompt}</h2></div>
        {direction === "chord" ? (
          <button className="button button--secondary" type="button" onClick={() => void playChordReference()}>
            <Volume2 size={16} />{t("chordReference")} <span className="keycap-badge">R</span>
          </button>
        ) : null}
      </div>
      <div className="choice-answer-grid">
        {question.choices.map((choice, index) => (
          <button className="choice-button" type="button" key={choice} onClick={() => answer(choice)}>
            <span className="choice-button__keycap">{index + 1}</span>
            {choice}
          </button>
        ))}
      </div>
      {feedback ? <p className="inline-feedback" role="status">{feedback} {t("triedCount", { count: attempts })}.</p> : null}
      <div className="practice-footer">
        <span>{t("keyInstructions", { count: attempts })}</span>
      </div>
    </section>
  );
}

export function noteChoices(): readonly NoteName[] {
  return PITCH_NOTES.map((note) => note.name);
}
