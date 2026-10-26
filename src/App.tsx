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
// ★ 업무일지 페이지
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

  const todayStr = new Date().toISOString().split("T")[0];
  const todayTaskCount = events.filter((e) => e.date === todayStr).length;

  // 지금 주소를 보고 사이드바에서 어떤 메뉴에 불을 켤지 정한다
  const getCurrentMenu = (path: string) => {
    if (path === "/today" || path === "/") return "오늘 할 일";
    if (path.startsWith("/calendar")) return "통합 캘린더";
    if (path.startsWith("/activity")) return "활동";
    if (path.startsWith("/report")) return "주간 리포트";
    if (path.startsWith("/invite")) return "팀원 초대";
    if (path.startsWith("/settings")) return "설정";
    // ★ /worklog 주소면 "업무일지" 메뉴에 불을 켠다
    if (path.startsWith("/worklog")) return "업무일지";
    return "통합 캘린더";
  };

  const currentMenu = getCurrentMenu(location.pathname);

  // 사이드바 메뉴를 눌렀을 때 해당 주소로 이동한다
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
      // ★ 사이드바에서 "업무일지"를 누르면 /worklog로
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

        {/* ★ 업무일지: 다른 페이지와 똑같이 왼쪽 사이드바 + 오른쪽 페이지 */}
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