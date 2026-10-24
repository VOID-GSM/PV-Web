import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CalendarPage from "./pages/CalendarPage";
import { MainPage } from "./pages/MainPage";
import ActivityDetailPage from "./pages/ActivityDetailPage";
import InvitePage from "./pages/InvitePage";
import SettingsPage from "./pages/SettingsPage";
<<<<<<< HEAD
=======
import ArchivePage from "./pages/ArchivePage";
import ArticleEditorPage from "./pages/ArticleEditorPage";
import WeeklyReportPage from "./pages/WeeklyReportPage"; // 주간 리포트 추가
>>>>>>> b087475 (feat: 주간 리포트 페이지 구현 및 팀 공유 모달 c추가)
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { AddEventModal } from "./components/calendar/AddEventModal";
import type { CalendarEvent } from "./types/calendar";

export default function App() {
  const [currentMenu, setCurrentMenu] = useState<string>("통합 캘린더");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddEvent = (newEvent: CalendarEvent) => {
    setEvents((prev) => [...prev, newEvent]);
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const todayTaskCount = events.filter((e) => e.date === todayStr).length;

<<<<<<< HEAD
=======
  const getCurrentMenu = (path: string) => {
    if (path === "/today" || path === "/") return "오늘 할 일";
    if (path.startsWith("/calendar")) return "통합 캘린더";
    if (path.startsWith("/activity")) return "활동";
    if (path.startsWith("/archive")) return "정리글 아카이브";
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
      case "정리글 아카이브":
        navigate("/archive");
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

>>>>>>> b087475 (feat: 주간 리포트 페이지 구현 및 팀 공유 모달 c추가)
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <>
              {currentMenu === "오늘 할 일" && (
                <MainPage
                  events={events}
                  onNavigate={setCurrentMenu}
                  onOpenAddModal={() => setIsAddModalOpen(true)}
                />
              )}

              {currentMenu === "통합 캘린더" && (
                <CalendarPage
                  events={events}
                  activeMenu={currentMenu}
                  onNavigate={setCurrentMenu}
                  onOpenAddModal={() => setIsAddModalOpen(true)}
                  onAddEvent={handleAddEvent}
                />
              )}

              {currentMenu === "활동" && (
                <div className="flex h-screen w-full overflow-hidden bg-[#f7f7f8]">
                  <Sidebar
                    activeMenu={currentMenu}
                    todayTaskCount={todayTaskCount}
                    assignmentCount={0}
                    onNavigate={setCurrentMenu}
                  />
                  <div className="flex flex-1 flex-col overflow-y-auto">
                    <ActivityDetailPage />
                  </div>
                </div>
              )}

              {currentMenu !== "오늘 할 일" &&
                currentMenu !== "통합 캘린더" &&
                currentMenu !== "활동" && (
                  <div className="flex h-screen w-full overflow-hidden bg-[#f7f7f8]">
                    <Sidebar
                      activeMenu={currentMenu}
                      todayTaskCount={todayTaskCount}
                      assignmentCount={0}
                      onNavigate={setCurrentMenu}
                    />
                    <div className="flex flex-1 flex-col overflow-hidden">
                      <Header
                        title={currentMenu}
                        subtitle=""
                        onOpenAddModal={() => setIsAddModalOpen(true)}
                      />
                      <main className="flex-1 bg-white" />
                    </div>
                  </div>
                )}
            </>
          }
        />

        <Route path="/invite" element={<InvitePage />} />
        <Route path="/invite/:code" element={<InvitePage />} />
        <Route path="/settings" element={<SettingsPage />} />

        <Route
          path="/activity"
          element={
<<<<<<< HEAD
            <MainPage
              events={events}
              onNavigate={setCurrentMenu}
              onOpenAddModal={() => setIsAddModalOpen(true)}
            />
          }
        />

        <Route path="/activity/:id" element={<ActivityDetailPage />} />
=======
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

        {/* 주간 리포트 라우트 연결 */}
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
>>>>>>> b087475 (feat: 주간 리포트 페이지 구현 및 팀 공유 모달 c추가)
      </Routes>

      <AddEventModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddEvent={handleAddEvent}
      />
    </BrowserRouter>
  );
}