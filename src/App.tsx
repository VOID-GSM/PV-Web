
import { useState } from "react";
import { Navigate, Route, Routes, useNavigate, useLocation } from "react-router-dom";

import { MainPage } from "./pages/MainPage";
import CalendarPage from "./pages/CalendarPage";
import ActivityDetailPage from "./pages/ActivityDetailPage";
import ArchivePage from "./pages/ArchivePage";
import ArticleEditorPage from "./pages/ArticleEditorPage";
import WeeklyReportPage from "./pages/WeeklyReportPage";
import InvitePage from "./pages/InvitePage";
import SettingsPage from "./pages/SettingsPage";

import SidebarLayout from "./components/layout/SidebarLayout";
import { AddEventModal } from "./components/calendar/AddEventModal";
import type { CalendarEvent } from "./types/calendar";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddEvent = (newEvent: CalendarEvent) => {
    setEvents((prev) => [...prev, newEvent]);
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const todayTaskCount = events.filter(
    (event) => event.date === todayStr,
  ).length;

  const getCurrentMenu = (path: string) => {
    if (path === "/" || path.startsWith("/today")) return "오늘 할 일";
    if (path.startsWith("/calendar")) return "통합 캘린더";
    if (path.startsWith("/activity")) return "활동";
    if (path.startsWith("/archive") || path.startsWith("/editor")) {
      return "정리글 아카이브";
    }
    if (path.startsWith("/report")) return "주간 리포트";
    if (path.startsWith("/invite")) return "팀원 초대";
    if (path.startsWith("/settings")) return "설정";
    return "통합 캘린더";
  };

  const currentMenu = getCurrentMenu(location.pathname);

  const handleNavigate = (menuName: string) => {
    switch (menuName) {
      case "오늘 할 일":
        navigate("/today");
        break;
      case "통합 캘린더":
        navigate("/calendar");
        break;
      case "활동":
        navigate("/activity");
        break;
      case "정리글":
      case "아카이브":
      case "정리글 아카이브":
        navigate("/archive");
        break;
      case "주간 리포트":
      case "주간리포트":
        navigate("/report");
        break;
      case "팀원 초대":
        navigate("/invite");
        break;
      case "설정":
        navigate("/settings");
        break;
      default:
        break;
    }
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/today" replace />} />

        <Route
          path="/today"
          element={
            <MainPage
              events={events}
              onNavigate={handleNavigate}
              onOpenAddModal={() => setIsAddModalOpen(true)}
            />
          }
        />

        <Route path="/invite" element={<InvitePage />} />
        <Route path="/invite/:code" element={<InvitePage />} />

        <Route
          element={
            <SidebarLayout
              todayTaskCount={todayTaskCount}
              onNavigate={handleNavigate}
              onOpenAddModal={() => setIsAddModalOpen(true)}
            />
          }
        >
          <Route
            path="/calendar"
            element={
              <CalendarPage
                events={events}
                activeMenu={currentMenu}
                onNavigate={handleNavigate}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                onAddEvent={handleAddEvent}
              />
            }
          />
          <Route path="/activity" element={<ActivityDetailPage />} />
          <Route path="/activity/:id" element={<ActivityDetailPage />} />
          <Route path="/archive" element={<ArchivePage />} />
          <Route path="/editor" element={<ArticleEditorPage />} />
          <Route path="/archive/editor" element={<ArticleEditorPage />} />
          <Route
            path="/report"
            element={
              <WeeklyReportPage
                onOpenAddModal={() => setIsAddModalOpen(true)}
              />
            }
          />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>

      <AddEventModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddEvent={handleAddEvent}
      />
    </>
  );
}
