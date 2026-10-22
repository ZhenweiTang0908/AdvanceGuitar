import { AudioLines, BookOpen, ChartNoAxesCombined, CircleHelp, Library, Settings } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { MascotPicko } from "./MascotPicko";
import { useI18n } from "../i18n";

export function AppShell() {
  const { t } = useI18n();
  const primaryNavigation: readonly { to: string; label: string; icon: typeof AudioLines; end?: boolean }[] = [
    { to: "/", label: t("today"), icon: AudioLines, end: true },
    { to: "/stage/1", label: t("curriculum"), icon: BookOpen },
    { to: "/library", label: t("library"), icon: Library },
    { to: "/progress", label: t("progress"), icon: ChartNoAxesCombined },
  ];
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink className="brand" to="/" aria-label={t("brand")}>
          <MascotPicko mood="cheer" size={38} />
          <span><strong>{t("brand")}</strong><small>PICKO EAR LAB</small></span>
        </NavLink>
        <nav className="primary-nav" aria-label={t("curriculum")}>
          {primaryNavigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}>
              <Icon aria-hidden="true" size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar__footer">
          <NavLink to="/settings"><Settings aria-hidden="true" size={18} />{t("settings")}</NavLink>
          <a href="https://college.berklee.edu/ear-training/ear-training-core" target="_blank" rel="noreferrer">
            <CircleHelp aria-hidden="true" size={18} />{t("trainingApproach")}
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
