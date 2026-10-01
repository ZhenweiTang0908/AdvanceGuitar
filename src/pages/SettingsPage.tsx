import { Mic, RotateCcw, SlidersHorizontal, Volume2 } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { useProgress } from "../progress/ProgressProvider";
import { usePitchCapture } from "../hooks/usePitchCapture";
import { frequencyForName } from "../types/music";

const STATE_LABELS = {
  idle: "未启动",
  requesting: "正在请求权限",
  listening: "正在监听",
  unsupported: "当前环境不可用",
  denied: "权限被拒绝",
  error: "发生错误",
} as const;

export function SettingsPage() {
  const { snapshot, updateSettings, resetProgress } = useProgress();
  const microphone = usePitchCapture();
  const aFrequency = frequencyForName("A");
  const centsOff = microphone.pitch ? Math.round(1200 * Math.log2(microphone.pitch.frequency / aFrequency)) : null;

  return (
    <div className="page">
      <PageHeader eyebrow="Settings" title="设置" description="音频、麦克风和进度都留在本机。原始录音不会保存或上传。" />
      <div className="settings-layout">
        <section className="panel settings-section">
          <div className="panel__heading"><div><strong>答题方式</strong><span>麦克风不可用时可以随时切回手动。</span></div><SlidersHorizontal aria-hidden="true" size={19} /></div>
          <div className="choice-list">
            <label className="choice-card">
              <input type="radio" name="answer-mode" checked={snapshot.settings.answerMode === "manual"} onChange={() => updateSettings({ answerMode: "manual" })} />
              <span><strong>手动答题</strong><small>弹奏后选择音名，或逐音排列短句。</small></span>
            </label>
            <label className="choice-card">
              <input type="radio" name="answer-mode" checked={snapshot.settings.answerMode === "microphone"} onChange={() => updateSettings({ answerMode: "microphone" })} />
              <span><strong>麦克风逐音</strong><small>单音和短句的每一步由本地音高检测确认。</small></span>
            </label>
          </div>
        </section>

        <section className="panel settings-section">
          <div className="panel__heading"><div><strong>播放音量</strong><span>只影响网站生成的合成音频。</span></div><Volume2 aria-hidden="true" size={19} /></div>
          <label className="field">
            <span>{Math.round(snapshot.settings.volume * 100)}%</span>
            <input type="range" min="0" max="1" step="0.01" value={snapshot.settings.volume} onChange={(event) => updateSettings({ volume: Number(event.target.value) })} />
          </label>
          <label className="field">
            <span>偏好音色</span>
            <select value={snapshot.settings.preferredTimbre} onChange={(event) => updateSettings({ preferredTimbre: event.target.value as typeof snapshot.settings.preferredTimbre })}>
              <option value="mixed">混合（推荐）</option>
              <option value="piano">钢琴式</option>
              <option value="guitar">吉他拨弦式</option>
              <option value="pure">纯音</option>
            </select>
          </label>
        </section>

        <section className="panel settings-section settings-section--wide">
          <div className="panel__heading"><div><strong>麦克风校准</strong><span>弹响开放 A 弦，确认输入稳定。</span></div><Mic aria-hidden="true" size={19} /></div>
          <div className="mic-readout">
            <span className={`status-dot status-dot--${microphone.state === "listening" ? "success" : microphone.state === "error" || microphone.state === "denied" ? "danger" : "muted"}`} />
            <strong>{STATE_LABELS[microphone.state]}</strong>
            {microphone.pitch ? <span>{microphone.pitch.frequency.toFixed(1)} Hz · {centsOff !== null && Math.abs(centsOff) <= 40 ? "接近 A" : "偏离 A"} · {centsOff ?? 0} cents</span> : <span>等待稳定音高</span>}
          </div>
          {microphone.error ? <p className="inline-feedback inline-feedback--error">{microphone.error}</p> : null}
          <div className="button-row">
            <button className="button button--primary" type="button" onClick={() => void microphone.start()} disabled={microphone.state === "requesting" || microphone.state === "listening"}><Mic size={17} />开始校准</button>
            <button className="button button--secondary" type="button" onClick={microphone.stop} disabled={microphone.state !== "listening"}>停止</button>
          </div>
        </section>

        <section className="panel settings-section settings-section--wide danger-zone">
          <div><strong>清空本机进度</strong><small>删除答题、复盘和设置。建议先导出 JSON。</small></div>
          <button className="button button--quiet" type="button" onClick={() => { if (window.confirm("确定清空全部本机进度吗？这个操作不可撤销。")) resetProgress(); }}><RotateCcw size={16} />清空</button>
        </section>
      </div>
    </div>
  );
}
