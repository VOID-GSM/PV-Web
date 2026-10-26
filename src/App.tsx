// src/App.tsx
import { useState } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";

import CalendarPage from "./pages/CalendarPage";
import { MainPage } from "./pages/MainPage";
import ActivityDetailPage from "./pages/ActivityDetailPage";
import InvitePage from "./pages/InvitePage";
import SettingsPage from "./pages/SettingsPage";
import WeeklyReportPage from "./pages/WeeklyReportPage";
import WorklogPage from "./pages/WorklogPage";
import { Sidebar } from "./components/layout/Sidebar";
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

  // ★ 오늘 날짜를 "2026-10-26" 모양으로 (내 컴퓨터의 시간대 = 한국 시간 기준)
  // toISOString()은 UTC(영국 시간) 기준이라 한국 오전 0~9시에는 하루 전 날짜가 나와서 바꿨다
  // toLocaleDateString("sv-SE"): 스웨덴 표기법이 YYYY-MM-DD 모양이라 빌려 쓴다
  const todayStr = new Date().toLocaleDateString("sv-SE");
  const todayTaskCount = events.filter((e) => e.date === todayStr).length;

  const getCurrentMenu = (path: string) => {
    if (path === "/today" || path === "/") return "오늘 할 일";
    if (path.startsWith("/calendar")) return "통합 캘린더";
    if (path.startsWith("/activity")) return "활동";
    if (path.startsWith("/report")) return "주간 리포트";
    if (path.startsWith("/invite")) return "팀원 초대";
    if (path.startsWith("/settings")) return "설정";
    if (path.startsWith("/worklog")) return "업무일지";
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
      case "주간 리포트":
        navigate("/report");
        break;
      case "팀원 초대":
        navigate("/invite");
        break;
      case "설정":
        navigate("/settings");
        break;
      case "업무일지":
        navigate("/worklog");
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
              activeMenu={currentMenu}
              onNavigate={handleNavigate}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onAddEvent={handleAddEvent}
            />
          }
        />

        <Route
          path="/activity"
          element={
            <div className="flex h-screen w-full overflow-hidden bg-[#f7f7f8]">
              <Sidebar
                activeMenu={currentMenu}
                todayTaskCount={todayTaskCount}
                assignmentCount={0}
                onNavigate={handleNavigate}
              />
              <div className="flex flex-1 flex-col overflow-y-auto">
                <ActivityDetailPage />
              </div>
            </div>
          }
        />

        <Route
          path="/report"
          element={
            <div className="flex h-screen w-full overflow-hidden bg-[#f7f7f8]">
              <Sidebar
                activeMenu={currentMenu}
                todayTaskCount={todayTaskCount}
                assignmentCount={0}
                onNavigate={handleNavigate}
              />
              <div className="flex flex-1 flex-col overflow-hidden">
                <WeeklyReportPage />
              </div>
            </div>
          }
        />

        <Route
          path="/invite"
          element={
            <div className="flex h-screen w-full overflow-hidden bg-[#f7f7f8]">
              <Sidebar
                activeMenu={currentMenu}
                todayTaskCount={todayTaskCount}
                assignmentCount={0}
                onNavigate={handleNavigate}
              />
              <div className="flex flex-1 flex-col overflow-y-auto">
                <InvitePage />
              </div>
            </div>
          }
        />

        <Route
          path="/settings"
          element={
            <div className="flex h-screen w-full overflow-hidden bg-[#f7f7f8]">
              <Sidebar
                activeMenu={currentMenu}
                todayTaskCount={todayTaskCount}
                assignmentCount={0}
                onNavigate={handleNavigate}
              />
              <div className="flex flex-1 flex-col overflow-y-auto">
                <SettingsPage />
              </div>
            </div>
          }
        />

        <Route
          path="/worklog"
          element={
            <div className="flex h-screen w-full overflow-hidden bg-[#f7f7f8]">
              <Sidebar
                activeMenu={currentMenu}
                todayTaskCount={todayTaskCount}
                assignmentCount={0}
                onNavigate={handleNavigate}
              />
              <div className="flex flex-1 flex-col overflow-y-auto">
                <WorklogPage />
              </div>
            </div>
          }
        />
      </Routes>

      <AddEventModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddEvent={handleAddEvent}
      />
    </>
  );
}