// src/App.tsx
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CalendarPage from "./pages/CalendarPage";
import { MainPage } from "./pages/MainPage";
import ActivityDetailPage from "./pages/ActivityDetailPage";
import InvitePage from "./pages/InvitePage";
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

  return (
    <BrowserRouter>
      <Routes>
        {/* 메인 대시보드 및 캘린더 경로 */}
        <Route
          path="/"
          element={
            <>
              {/* 1. 오늘 할 일 (메인 대시보드) */}
              {currentMenu === "오늘 할 일" && (
                <MainPage
                  events={events}
                  onNavigate={(menu: string) => setCurrentMenu(menu)}
                  onOpenAddModal={() => setIsAddModalOpen(true)}
                />
              )}

              {/* 2. 통합 캘린더 */}
              {currentMenu === "통합 캘린더" && (
                <CalendarPage
                  events={events}
                  activeMenu={currentMenu}
                  onNavigate={(menu: string) => setCurrentMenu(menu)}
                  onOpenAddModal={() => setIsAddModalOpen(true)}
                  onAddEvent={handleAddEvent}
                />
              )}

              {/* 3. 기타 메뉴 (빈 화면) */}
              {currentMenu === "활동" && (
                <div className="flex h-screen w-full overflow-hidden bg-[#f7f7f8]">
                  <Sidebar
                    activeMenu={currentMenu}
                    todayTaskCount={todayTaskCount}
                    assignmentCount={0}
                    onNavigate={(menu: string) => setCurrentMenu(menu)}
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
                      onNavigate={(menu: string) => setCurrentMenu(menu)}
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
        {/* 초대 페이지 라우트 */}
        <Route path="/invite" element={<InvitePage />} />
        <Route path="/invite/:code" element={<InvitePage />} />
        {/* 활동 상세 페이지 라우트 */}
        {/* 오늘 할 일 페이지 */}
        <Route
          path="/activity"
          element={
            <MainPage
              events={events}
              onNavigate={(menu: string) => setCurrentMenu(menu)}
              onOpenAddModal={() => setIsAddModalOpen(true)}
            />
          }
        />
        {/* 활동 상세 페이지 */}
        <Route path="/activity/:id" element={<ActivityDetailPage />} />{" "}
      </Routes>

      {/* 새로 만들기 공통 모달 */}
      <AddEventModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddEvent={handleAddEvent}
      />
    </BrowserRouter>
  );
}

