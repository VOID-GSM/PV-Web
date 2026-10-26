import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import SidebarLayout from "./components/layout/SidebarLayout";
import { MainPage } from "./pages/MainPage";
import ActivityDetailPage from "./pages/ActivityDetailPage";
import CalendarPage from "./pages/CalendarPage";
import ArchivePage from "./pages/ArchivePage";
import ArticleEditorPage from "./pages/ArticleEditorPage";
import WeeklyReportPage from "./pages/WeeklyReportPage";
import InvitePage from "./pages/InvitePage";
import SettingsPage from "./pages/SettingsPage";

import { AddEventModal } from "./components/calendar/AddEventModal";
import type { CalendarEvent } from "./types/calendar";

export default function App() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddEvent = (newEvent: CalendarEvent) => {
    setEvents((prev) => [...prev, newEvent]);
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const todayTaskCount = events.filter((e) => e.date === todayStr).length;

  return (
    <>
      <Routes>
        {/* 1. 사이드바가 포함되는 메인 서비스 영역 */}
        <Route
          element={
            <SidebarLayout
              todayTaskCount={todayTaskCount}
              onOpenAddModal={() => setIsAddModalOpen(true)}
            />
          }
        >
          <Route path="/" element={<Navigate to="/today" replace />} />
          <Route
            path="/today"
            element={
              <MainPage
                events={events}
                onOpenAddModal={() => setIsAddModalOpen(true)}
              />
            }
          />
          <Route
            path="/calendar"
            element={
              <CalendarPage
                events={events}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                onAddEvent={handleAddEvent}
              />
            }
          />
          <Route path="/activity" element={<ActivityDetailPage />} />
          <Route path="/activity/:id" element={<ActivityDetailPage />} />
          <Route path="/archive" element={<ArchivePage />} />
          <Route path="/archive/editor" element={<ArticleEditorPage />} />
          <Route path="/weekly-report" element={<WeeklyReportPage />} />
          <Route
            path="/report"
            element={<Navigate to="/weekly-report" replace />}
          />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* 2. 사이드바가 없는 독립 초대 페이지 */}
        <Route path="/invite" element={<InvitePage />} />
        <Route path="/invite/:code" element={<InvitePage />} />
      </Routes>

      <AddEventModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddEvent={handleAddEvent}
      />
    </>
  );
}
