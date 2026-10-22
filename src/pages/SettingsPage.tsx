import { Mic, RotateCcw, SlidersHorizontal, Volume2 } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { useProgress } from "../progress/ProgressProvider";
import { usePitchCapture } from "../hooks/usePitchCapture";
import { frequencyForName } from "../types/music";
import { useI18n, type MessageKey } from "../i18n";

export function SettingsPage() {
  const { t, language, setLanguage } = useI18n();
  const { snapshot, updateSettings, resetProgress } = useProgress();
  const microphone = usePitchCapture();
  const aFrequency = frequencyForName("A");
  const centsOff = microphone.pitch ? Math.round(1200 * Math.log2(microphone.pitch.frequency / aFrequency)) : null;

  return (
    <div className="page">
      <PageHeader eyebrow="Settings" title={t("settings")} description={t("settingsIntro")} />
      <div className="settings-layout">
        <section className="panel settings-section">
          <div className="panel__heading"><div><strong>{t("language")}</strong><span>{t("languageDescription")}</span></div></div>
          <label className="field">
            <span>{t("language")}</span>
            <select value={language} onChange={(event) => setLanguage(event.target.value as "en" | "de")}>
              <option value="en">{t("english")}</option>
              <option value="de">{t("german")}</option>
            </select>
          </label>
        </section>
        <section className="panel settings-section">
          <div className="panel__heading"><div><strong>{t("answerMode")}</strong><span>{t("answerModeHint")}</span></div><SlidersHorizontal aria-hidden="true" size={19} /></div>
          <div className="choice-list">
            <label className="choice-card">
              <input type="radio" name="answer-mode" checked={snapshot.settings.answerMode === "manual"} onChange={() => updateSettings({ answerMode: "manual" })} />
              <span><strong>{t("manual")}</strong><small>{t("manualDescription")}</small></span>
            </label>
            <label className="choice-card">
              <input type="radio" name="answer-mode" checked={snapshot.settings.answerMode === "microphone"} onChange={() => updateSettings({ answerMode: "microphone" })} />
              <span><strong>{t("microphoneMode")}</strong><small>{t("microphoneDescription")}</small></span>
            </label>
          </div>
        </section>

        <section className="panel settings-section">
          <div className="panel__heading"><div><strong>{t("playbackVolume")}</strong><span>{t("playbackVolumeHint")}</span></div><Volume2 aria-hidden="true" size={19} /></div>
          <label className="field">
            <span>{Math.round(snapshot.settings.volume * 100)}%</span>
            <input type="range" min="0" max="1" step="0.01" value={snapshot.settings.volume} onChange={(event) => updateSettings({ volume: Number(event.target.value) })} />
          </label>
          <label className="field">
            <span>{t("preferredTone")}</span>
            <select value={snapshot.settings.preferredTimbre} onChange={(event) => updateSettings({ preferredTimbre: event.target.value as typeof snapshot.settings.preferredTimbre })}>
              <option value="mixed">{t("mixedRecommended")}</option>
              <option value="piano">{t("piano")}</option>
              <option value="guitar">{t("guitar")}</option>
              <option value="pure">{t("pureTone")}</option>
            </select>
          </label>
        </section>

        <section className="panel settings-section settings-section--wide">
          <div className="panel__heading"><div><strong>{t("microphoneCalibration")}</strong><span>{t("calibrationHint")}</span></div><Mic aria-hidden="true" size={19} /></div>
          <div className="mic-readout">
            <span className={`status-dot status-dot--${microphone.state === "listening" ? "success" : microphone.state === "error" || microphone.state === "denied" ? "danger" : "muted"}`} />
            <strong>{t(({ idle: "notStartedMic", requesting: "requesting", listening: "listening", unsupported: "unavailable", denied: "denied", error: "error" } as const)[microphone.state] as MessageKey)}</strong>
            {microphone.pitch ? <span>{microphone.pitch.frequency.toFixed(1)} Hz · {centsOff !== null && Math.abs(centsOff) <= 40 ? t("nearA") : t("awayA")} · {centsOff ?? 0} cents</span> : <span>{t("waitingPitch")}</span>}
          </div>
          {microphone.error ? <p className="inline-feedback inline-feedback--error">{microphone.error}</p> : null}
          <div className="button-row">
            <button className="button button--primary" type="button" onClick={() => void microphone.start()} disabled={microphone.state === "requesting" || microphone.state === "listening"}><Mic size={17} />{t("startCalibration")}</button>
            <button className="button button--secondary" type="button" onClick={microphone.stop} disabled={microphone.state !== "listening"}>{t("stop")}</button>
          </div>
        </section>

        <section className="panel settings-section settings-section--wide danger-zone">
          <div><strong>{t("clearLocalProgress")}</strong><small>{t("clearProgressHint")}</small></div>
          <button className="button button--quiet" type="button" onClick={() => { if (window.confirm(t("confirmClear"))) resetProgress(); }}><RotateCcw size={16} />{t("clear")}</button>
        </section>
      </div>
    </div>
  );
}
