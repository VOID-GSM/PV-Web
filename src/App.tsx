import { Routes, Route, Navigate } from "react-router-dom";

import SidebarLayout from "./components/layout/SidebarLayout";

import { MainPage } from "./pages/MainPage";
import ActivityDetailPage from "./pages/ActivityDetailPage";
import CalendarPage from "./pages/CalendarPage";
import ArchivePage from "./pages/ArchivePage"; // ArchivePage로 경로 수정
import WeeklyReportPage from "./pages/WeeklyReportPage";
import InvitePage from "./pages/InvitePage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <Routes>
      {/* 1. 사이드바가 포함되는 메인 서비스 영역 */}
      <Route element={<SidebarLayout />}>
        <Route path="/" element={<Navigate to="/today" replace />} />
        <Route
          path="/today"
          element={
            <MainPage
              events={[]}
              onNavigate={() => {}}
              onOpenAddModal={() => {}}
            />
          }
        />
        <Route path="/activity" element={<ActivityDetailPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="/weekly-report" element={<WeeklyReportPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* 2. 사이드바가 없는 독립 초대 페이지 */}
      <Route path="/invite" element={<InvitePage />} />
    </Routes>
  );
}
