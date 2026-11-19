import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { HomePage } from "./pages/HomePage";

const StagePage = lazy(() => import("./pages/StagePage").then((m) => ({ default: m.StagePage })));
const DayPage = lazy(() => import("./pages/DayPage").then((m) => ({ default: m.DayPage })));
const ExercisePage = lazy(() => import("./pages/ExercisePage").then((m) => ({ default: m.ExercisePage })));
const LibraryPage = lazy(() => import("./pages/LibraryPage").then((m) => ({ default: m.LibraryPage })));
const ProgressPage = lazy(() => import("./pages/ProgressPage").then((m) => ({ default: m.ProgressPage })));
const SettingsPage = lazy(() => import("./pages/SettingsPage").then((m) => ({ default: m.SettingsPage })));

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="stage/1" element={<StagePage />} />
        <Route path="day/:day" element={<DayPage />} />
        <Route path="exercise/:id" element={<ExercisePage />} />
        <Route path="library" element={<LibraryPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
