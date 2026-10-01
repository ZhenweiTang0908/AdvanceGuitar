import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { PlaceholderPage } from "./pages/PlaceholderPage";

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<PlaceholderPage title="今天继续" description="你的第一阶段练习会从这里开始。" />} />
        <Route path="stage/1" element={<PlaceholderPage title="第一阶段" description="28 天，把声音连接到一小块指板。" />} />
        <Route path="day/:day" element={<PlaceholderPage title="每日课程" description="今天的教材、练习和复盘会显示在这里。" />} />
        <Route path="exercise/:id" element={<PlaceholderPage title="专项练习" description="听、哼、找、弹，再核对答案。" />} />
        <Route path="library" element={<PlaceholderPage title="练习库" description="自由选择单音、短句、指板或和弦练习。" />} />
        <Route path="progress" element={<PlaceholderPage title="学习进度" description="看见尝试次数正在怎样减少。" />} />
        <Route path="settings" element={<PlaceholderPage title="设置" description="管理音频、麦克风和本地学习数据。" />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
