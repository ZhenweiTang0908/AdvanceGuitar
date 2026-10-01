import { ArrowLeft, ArrowRight, Check, Headphones, Mic, RotateCcw, Volume2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { playCadence, playTimedSequence, playTone, resumeAudio } from "../audio/engine";
import { isWithinTolerance } from "../audio/pitchDetection";
import { PageHeader } from "../components/PageHeader";
import { getExercise } from "../data/exercises";
import { buildChordQuestions, buildFretboardQuestions, buildNoteQuestions, buildPhraseQuestions } from "../data/questions";
import { usePitchCapture } from "../hooks/usePitchCapture";
import { noteByName, PITCH_NOTES, type NoteName } from "../types/music";
import type { ExerciseDefinition } from "../types/curriculum";
import { useProgress } from "../progress/ProgressProvider";

interface RoundOutcome {
  correct: boolean;
  attempts: number;
}

export function ExercisePage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const exercise = id ? getExercise(id) : undefined;
  const { recordResult } = useProgress();
  const startedAt = useRef(Date.now());
  const [roundIndex, setRoundIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [roundScores, setRoundScores] = useState<boolean[]>([]);

  if (!exercise) {
    return <Navigate to="/library" replace />;
  }

  function handleRound(outcome: RoundOutcome) {
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
    if (roundIndex + 1 >= exercise!.rounds) setFinished(true);
    else setRoundIndex((current) => current + 1);
  }

  function restart() {
    setRoundIndex(0);
    setFinished(false);
    setRoundScores([]);
    startedAt.current = Date.now();
  }

  return (
    <div className="page exercise-page">
      <PageHeader
        eyebrow={exercise.remedial ? "Adaptive practice" : `Week ${Math.ceil(exercise.day / 7)} · Day ${exercise.day}`}
        title={exercise.title}
        description={exercise.description}
        actions={<Link className="button button--secondary" to={exercise.day > 0 ? `/day/${exercise.day}` : "/library"}><ArrowLeft size={16} />返回</Link>}
      />
      {finished ? (
        <CompletionPanel exercise={exercise} scores={roundScores} onRestart={restart} />
      ) : (
        <>
          <div className="round-progress" aria-label={`进度 ${roundIndex + 1} / ${exercise.rounds}`}>
            <span style={{ width: `${((roundIndex + 1) / exercise.rounds) * 100}%` }} />
          </div>
          <p className="round-label">第 {roundIndex + 1} / {exercise.rounds} 题</p>
          <ExerciseRound key={`${exercise.id}-${roundIndex}`} exercise={exercise} roundIndex={roundIndex} onRound={handleRound} />
        </>
      )}
    </div>
  );
}

function CompletionPanel({ exercise, scores, onRestart }: { exercise: ExerciseDefinition; scores: readonly boolean[]; onRestart: () => void }) {
  const correct = scores.filter(Boolean).length;
  return (
    <section className="panel completion-panel">
      <span className="completion-mark"><Check aria-hidden="true" size={24} /></span>
      <p className="eyebrow">Round complete</p>
      <h2>{correct === scores.length ? "全部正确" : `完成 ${scores.length} 题`}</h2>
      <p>{correct} 题直接正确，{scores.length - correct} 题使用了反馈或揭晓。下一组会根据这些记录调整难度。</p>
      <div className="button-row button-row--center">
        <button className="button button--primary" type="button" onClick={onRestart}><RotateCcw size={16} />再练一组</button>
        <Link className="button button--secondary" to={exercise.day > 0 ? `/day/${exercise.day}` : "/library"}>回到{exercise.day > 0 ? "今日课程" : "练习库"} <ArrowRight size={16} /></Link>
      </div>
    </section>
  );
}

function ExerciseRound({ exercise, roundIndex, onRound }: { exercise: ExerciseDefinition; roundIndex: number; onRound: (outcome: RoundOutcome) => void }) {
  if (exercise.skill === "ear") return <NoteRound exercise={exercise} roundIndex={roundIndex} onRound={onRound} />;
  if (exercise.skill === "phrase") return <PhraseRound exercise={exercise} roundIndex={roundIndex} onRound={onRound} />;
  if (exercise.skill === "fretboard") return <ChoiceRound exercise={exercise} roundIndex={roundIndex} onRound={onRound} direction="fretboard" />;
  return <ChoiceRound exercise={exercise} roundIndex={roundIndex} onRound={onRound} direction="chord" />;
}

function NoteRound({ exercise, roundIndex, onRound }: { exercise: ExerciseDefinition; roundIndex: number; onRound: (outcome: RoundOutcome) => void }) {
  const questions = useMemo(() => buildNoteQuestions(exercise), [exercise]);
  const question = questions[roundIndex];
  const { snapshot } = useProgress();
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const microphone = usePitchCapture();
  const { stablePitch, stop: stopMicrophone } = microphone;

  useEffect(() => {
    setAttempts(0);
    setFeedback(null);
    setRevealed(false);
    stopMicrophone();
  }, [question.id, stopMicrophone]);

  useEffect(() => {
    if (snapshot.settings.answerMode !== "microphone" || !stablePitch || revealed) return;
    const target = noteByName(question.target);
    if (isWithinTolerance(stablePitch, target.midi)) {
      stopMicrophone();
      onRound({ correct: true, attempts: attempts + 1 });
    }
  }, [attempts, onRound, question.target, revealed, snapshot.settings.answerMode, stablePitch, stopMicrophone]);

  async function playReference() {
    microphone.stop();
    await resumeAudio();
    playCadence();
    playTone({ midi: noteByName(question.target).midi, timbre: question.timbre, delay: 3.25, duration: 0.9, volume: snapshot.settings.volume });
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
    setFeedback(`${note} 比目标${guessed > target ? "高" : "低"}。下一次往${guessed > target ? "低音" : "高音"}方向找。`);
  }

  return (
    <section className="practice-panel panel">
      <div className="practice-panel__header">
        <div><p className="eyebrow">Listen · hum · find</p><h2>先听定调，再找目标音</h2></div>
        <button className="button button--primary" type="button" onClick={() => void playReference()}><Headphones size={17} />播放定调与目标音</button>
      </div>
      <p className="practice-instruction">听完先哼出来，在琴上试音，再提交你找到的音。答错只会告诉你偏高还是偏低。</p>
      <div className="answer-grid">
        {question.choices.map((note) => <button className="note-button" type="button" key={note} onClick={() => answer(note)}>{note}<small>{noteByName(note).degree} 级</small></button>)}
      </div>
      {feedback ? <p className="inline-feedback" role="status">{feedback} 已尝试 {attempts} 次。</p> : null}
      {revealed ? <p className="inline-feedback inline-feedback--answer">答案是 {question.target}（{noteByName(question.target).degree} 级）。</p> : null}
      <div className="practice-footer">
        <span>已尝试 {attempts} 次</span>
        <button className="button button--quiet" type="button" onClick={() => { setRevealed(true); onRound({ correct: false, attempts: Math.max(attempts, 1) }); }}>揭晓并进入下一题</button>
      </div>
      {snapshot.settings.answerMode === "microphone" ? (
        <div className="mic-strip">
          <Mic aria-hidden="true" size={17} />
          <span>{microphone.state === "listening" ? (microphone.stablePitch ? `识别到 ${microphone.pitch?.frequency.toFixed(1)} Hz` : "弹一个稳定单音") : "用麦克风逐音确认"}</span>
          {microphone.state === "listening" ? <button className="text-action" type="button" onClick={microphone.stop}>停止</button> : <button className="text-action" type="button" onClick={() => void microphone.start()} disabled={microphone.state === "requesting"}><Volume2 size={14} />开启识别</button>}
        </div>
      ) : null}
    </section>
  );
}

function PhraseRound({ exercise, roundIndex, onRound }: { exercise: ExerciseDefinition; roundIndex: number; onRound: (outcome: RoundOutcome) => void }) {
  const questions = useMemo(() => buildPhraseQuestions(exercise), [exercise]);
  const question = questions[roundIndex];
  const { snapshot } = useProgress();
  const [answer, setAnswer] = useState<NoteName[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const microphone = usePitchCapture();
  const { stablePitch, stop: stopMicrophone, consumeStablePitch } = microphone;

  useEffect(() => {
    setAnswer([]);
    setAttempts(0);
    setFeedback(null);
    stopMicrophone();
  }, [question.id, stopMicrophone]);

  useEffect(() => {
    if (snapshot.settings.answerMode !== "microphone" || !stablePitch || answer.length >= question.target.length) return;
    const expected = noteByName(question.target[answer.length]);
    if (isWithinTolerance(stablePitch, expected.midi)) {
      consumeStablePitch();
      setAnswer((current) => [...current, question.target[current.length]]);
    }
  }, [answer.length, consumeStablePitch, question.target, snapshot.settings.answerMode, stablePitch]);

  async function playReference() {
    microphone.stop();
    await resumeAudio();
    playCadence();
    const delay = 3.3 + playTimedSequence(question.target.map((note) => noteByName(note).midi), question.timbre, question.rhythm);
    return delay;
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
    setFeedback(`第 ${firstMismatch + 1} 个音${actual.midi > expected.midi ? "偏高" : "偏低"}。保留其他音，再调整这里。`);
  }

  return (
    <section className="practice-panel panel">
      <div className="practice-panel__header">
        <div><p className="eyebrow">Phrase · {question.target.length} notes</p><h2>记住轮廓，再逐个放回去</h2></div>
        <button className="button button--primary" type="button" onClick={() => void playReference()}><Headphones size={17} />播放短句</button>
      </div>
      <p className="practice-instruction">先听完整短句并哼出来。短句只判音高顺序，节奏跟弹即可。</p>
      <div className="phrase-slots">
        {question.target.map((_, index) => <span className={answer[index] ? "is-filled" : ""} key={`${question.id}-slot-${index}`}>{answer[index] ?? "?"}</span>)}
      </div>
      <div className="answer-grid answer-grid--compact">
        {exercise.notePool.map((note) => <button className="note-button" type="button" key={note} onClick={() => setAnswer((current) => current.length < question.target.length ? [...current, note] : current)}>{note}</button>)}
      </div>
      {feedback ? <p className="inline-feedback" role="status">{feedback}</p> : null}
      <div className="practice-footer">
        <button className="button button--quiet" type="button" onClick={() => { setAnswer([]); setFeedback(null); }}><RotateCcw size={15} />清空排列</button>
        <button className="button button--primary" type="button" onClick={submit} disabled={answer.length !== question.target.length}>提交短句</button>
      </div>
      {snapshot.settings.answerMode === "microphone" ? (
        <div className="mic-strip">
          <Mic aria-hidden="true" size={17} />
          <span>{microphone.state === "listening" ? `正在等待第 ${answer.length + 1} 个音` : "用麦克风逐步录入短句"}</span>
          {microphone.state === "listening" ? <button className="text-action" type="button" onClick={microphone.stop}>停止</button> : <button className="text-action" type="button" onClick={() => void microphone.start()} disabled={microphone.state === "requesting"}>开启识别</button>}
        </div>
      ) : null}
    </section>
  );
}

function ChoiceRound({ exercise, roundIndex, onRound, direction }: { exercise: ExerciseDefinition; roundIndex: number; onRound: (outcome: RoundOutcome) => void; direction: "fretboard" | "chord" }) {
  const questions = useMemo(() => direction === "fretboard" ? buildFretboardQuestions(exercise) : buildChordQuestions(exercise), [direction, exercise]);
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
    setFeedback(`“${choice}”还不对。回到根音位置，重新数一下音程关系。`);
  }

  return (
    <section className="practice-panel panel">
      <div className="practice-panel__header">
        <div><p className="eyebrow">{direction === "fretboard" ? "Fretboard" : "Chord shape"}</p><h2>{question.prompt}</h2></div>
      </div>
      <div className="choice-answer-grid">
        {question.choices.map((choice) => <button className="choice-button" type="button" key={choice} onClick={() => answer(choice)}>{choice}</button>)}
      </div>
      {feedback ? <p className="inline-feedback" role="status">{feedback} 已尝试 {attempts} 次。</p> : null}
      <div className="practice-footer"><span>已尝试 {attempts} 次</span></div>
    </section>
  );
}

export function noteChoices(): readonly NoteName[] {
  return PITCH_NOTES.map((note) => note.name);
}
