import { LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { MarkdownView } from "../components/MarkdownView";
import { curriculumDays, stageOverviewMarkdown } from "../content/loadCurriculum";
import { completedDayCount, dayCompletion } from "../progress/selectors";
import { useProgress } from "../progress/ProgressProvider";

const WEEKS = [
  { week: 1, title: "建立 C、E、G 与局部指板的连接", days: "1–7" },
  { week: 2, title: "加入 D、A，形成五音范围", days: "8–14" },
  { week: 3, title: "从单音进入 4–6 音短句", days: "15–21" },
  { week: 4, title: "减少尝试次数并完成验收", days: "22–28" },
] as const;

export function StagePage() {
  const { snapshot } = useProgress();
  const completed = completedDayCount(snapshot);

  return (
    <div className="page">
      <PageHeader
        eyebrow="Stage 1 · 28 days"
        title="把声音连接到一小块指板"
        description={`当前完成 ${completed} 天。课程按顺序推荐但不硬锁，你可以在同一天同时推进听觉、指板、短句和和弦。`}
      />
      {stageOverviewMarkdown ? <section className="content-section panel"><MarkdownView markdown={stageOverviewMarkdown} /></section> : null}
      {curriculumDays.length === 0 ? (
        <section className="panel empty-state">
          <LockKeyhole aria-hidden="true" size={24} />
          <h2>课程内容正在落盘</h2>
          <p>页面结构、音频引擎和进度系统已经就绪；Markdown 课程内容会在下一批构建中出现在这里。</p>
        </section>
      ) : null}
      <div className="week-list">
        {WEEKS.map((week) => {
          const days = curriculumDays.filter((day) => day.week === week.week);
          return (
            <section className="week-card" key={week.week}>
              <header>
                <div><span>WEEK {week.week}</span><h2>{week.title}</h2></div>
                <small>Day {week.days}</small>
              </header>
              <div className="day-grid">
                {days.length === 0 ? <p className="muted">课程内容即将加入。</p> : days.map((day) => {
                  const status = dayCompletion(snapshot, day.day);
                  return (
                    <Link className={`day-cell${status.complete ? " is-complete" : ""}`} to={`/day/${day.day}`} key={day.day}>
                      <span>Day {day.day}</span>
                      <strong>{day.title}</strong>
                      <small>{status.complete ? "已完成" : status.completed > 0 ? `${status.completed}/${status.total} 练习` : "未开始"}</small>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
      <section className="content-section panel roadmap-panel">
        <div className="panel__heading"><div><strong>后续路线</strong><span>先完成第一阶段，再按能力验收逐步解锁。</span></div></div>
        <ol className="roadmap-list">
          <li><span>02</span><div><strong>已知调性，扒完整短句</strong><small>扩展完整大调音阶、第五弦与 A 型移动和弦。</small></div></li>
          <li><span>03</span><div><strong>从录音判断调性并验证</strong><small>用主音、停靠位置、低音与和弦互相核对。</small></div></li>
          <li><span>04</span><div><strong>从旋律扩展到和弦与伴奏</strong><small>低音、和弦性质、转位与 8 小节片段。</small></div></li>
          <li><span>05</span><div><strong>完整扒歌并提高速度</strong><small>串起旋律、和弦、节奏与指板位置。</small></div></li>
        </ol>
      </section>
    </div>
  );
}
