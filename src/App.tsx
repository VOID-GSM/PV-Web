// src/App.tsx
import { useState } from "react";
import {
  BrowserRouter,
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
import ArchivePage from "./pages/ArchivePage";
import ArticleEditorPage from "./pages/ArticleEditorPage";
import { Sidebar } from "./components/layout/Sidebar";
import { AddEventModal } from "./components/calendar/AddEventModal";
import type { CalendarEvent } from "./types/calendar";

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddEvent = (newEvent: CalendarEvent) => {
    setEvents((prev) => [...prev, newEvent]);
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const todayTaskCount = events.filter((e) => e.date === todayStr).length;

  const getCurrentMenu = (path: string) => {
    if (path === "/today" || path === "/") return "오늘 할 일";
    if (path.startsWith("/calendar")) return "통합 캘린더";
    if (path.startsWith("/activity")) return "활동";
    if (path.startsWith("/archive")) return "정리글 아카이브";
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
      case "정리글 아카이브":
        navigate("/archive");
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
          path="/activity/:id"
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

        {/* 정리글 아카이브 메인 */}
        <Route
          path="/archive"
          element={
            <div className="flex h-screen w-full overflow-hidden bg-[#f7f7f8]">
              <Sidebar
                activeMenu={currentMenu}
                todayTaskCount={todayTaskCount}
                assignmentCount={0}
                onNavigate={handleNavigate}
              />
              <div className="flex flex-1 flex-col overflow-hidden">
                <ArchivePage />
              </div>
            </div>
          }
        />

        {/* 정리글 작성/수정 에디터 - 사이드바 레이아웃 추가 */}
        <Route
          path="/archive/editor"
          element={
            <div className="flex h-screen w-full overflow-hidden bg-[#f7f7f8]">
              <Sidebar
                activeMenu={currentMenu}
                todayTaskCount={todayTaskCount}
                assignmentCount={0}
                onNavigate={handleNavigate}
              />
              <div className="flex flex-1 flex-col overflow-hidden">
                <ArticleEditorPage />
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
          path="/invite/:code"
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
      </Routes>

      <AddEventModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddEvent={handleAddEvent}
      />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
