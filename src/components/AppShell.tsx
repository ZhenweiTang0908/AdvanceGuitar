import {
  AudioLines,
  BookOpen,
  ChartNoAxesCombined,
  CircleHelp,
  Guitar,
  Library,
  Settings,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const primaryNavigation: readonly { to: string; label: string; icon: typeof AudioLines; end?: boolean }[] = [
  { to: "/", label: "今天", icon: AudioLines, end: true },
  { to: "/stage/1", label: "课程", icon: BookOpen },
  { to: "/library", label: "练习库", icon: Library },
  { to: "/progress", label: "进度", icon: ChartNoAxesCombined },
];

export function AppShell() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink className="brand" to="/" aria-label="听见指板首页">
          <span className="brand__mark"><Guitar aria-hidden="true" size={22} /></span>
          <span><strong>听见指板</strong><small>Guitar Ear Lab</small></span>
        </NavLink>
        <nav className="primary-nav" aria-label="主导航">
          {primaryNavigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}>
              <Icon aria-hidden="true" size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar__footer">
          <NavLink to="/settings"><Settings aria-hidden="true" size={18} />设置</NavLink>
          <a href="https://college.berklee.edu/ear-training/ear-training-core" target="_blank" rel="noreferrer">
            <CircleHelp aria-hidden="true" size={18} />训练理念
          </a>
        </div>
      </aside>
      <main className="main-content" id="main-content">
        <Outlet />
      </main>
      <nav className="bottom-nav" aria-label="移动端主导航">
        {primaryNavigation.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}>
            <Icon aria-hidden="true" size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
