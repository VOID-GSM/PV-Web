// src/App.tsx
import { useState } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";

import CalendarPage from "./pages/CalendarPage";
import { MainPage } from "./pages/MainPage";
import ActivityDetailPage from "./pages/ActivityDetailPage";
import InvitePage from "./pages/InvitePage";
import SettingsPage from "./pages/SettingsPage";
import ArchivePage from "./pages/ArchivePage";
import ArticleEditorPage from "./pages/ArticleEditorPage";
import WeeklyReportPage from "./pages/WeeklyReportPage";
// ★ 과제·역량맵 페이지
import AssignmentPage from "./pages/AssignmentPage";
import SidebarLayout from "./components/layout/SidebarLayout";
import { AddEventModal } from "./components/calendar/AddEventModal";
import type { CalendarEvent } from "./types/calendar";

export default function App() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddEvent = (newEvent: CalendarEvent) => {
    setEvents((prev) => [...prev, newEvent]);
  };

  // 오늘 날짜 "2026-10-26" (한국 시간 기준)
  const todayStr = new Date().toLocaleDateString("sv-SE");
  const todayTaskCount = events.filter((e) => e.date === todayStr).length;

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
      // ★ 과제·역량맵
      case "과제 · 역량맵":
        navigate("/assignments");
        break;
      case "주간 리포트":
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

        <Route
          path="/calendar"
          element={
            <CalendarPage
              events={events}
              activeMenu="통합 캘린더"
              onNavigate={handleNavigate}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onAddEvent={handleAddEvent}
            />
          }
        />

        <Route element={<SidebarLayout todayTaskCount={todayTaskCount} />}>
          <Route path="/activity" element={<ActivityDetailPage />} />
          <Route path="/activity/:id" element={<ActivityDetailPage />} />
          <Route path="/archive" element={<ArchivePage />} />
          <Route path="/editor" element={<ArticleEditorPage />} />
          <Route path="/archive/editor" element={<ArticleEditorPage />} />
          <Route path="/report" element={<WeeklyReportPage />} />
          <Route path="/invite" element={<InvitePage />} />
          <Route path="/invite/:code" element={<InvitePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          {/* ★ 과제·역량맵 */}
          <Route path="/assignments" element={<AssignmentPage />} />
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