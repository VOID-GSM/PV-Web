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
// ★ 면접 질문 뱅크 페이지
import QuestionBankPage from "./pages/QuestionBankPage";
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

  // ★ 오늘 날짜 "2026-10-26" (한국 시간 기준)
  // toISOString()은 UTC 기준이라 한국 오전 0~9시에 하루 전 날짜가 나와서 바꿨다
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
      // ★ 면접 질문 뱅크
      case "면접 질문 뱅크":
        navigate("/questions");
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

        {/* 사이드바 공유 레이아웃 구역: 이 안에 넣은 페이지는 사이드바가 자동으로 붙는다 */}
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
          {/* ★ 면접 질문 뱅크 */}
          <Route path="/questions" element={<QuestionBankPage />} />
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