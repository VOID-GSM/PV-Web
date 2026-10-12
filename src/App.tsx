import { useState } from "react";
import CalendarPage from "./pages/CalendarPage";
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
    <>
      {/* 1. 통합 캘린더 */}
      {currentMenu === "통합 캘린더" && (
        <CalendarPage
          events={events}
          activeMenu={currentMenu}
          onNavigate={(menu: string) => setCurrentMenu(menu)}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onAddEvent={handleAddEvent}
        />
      )}

      {/* 2. 통합 캘린더 외 기타 메뉴 (오늘 할 일 및 기타 - 빈 흰 화면) */}
      {currentMenu !== "통합 캘린더" && (
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

      {/* 새로 만들기 공통 모달 */}
      <AddEventModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddEvent={handleAddEvent}
      />
    </>
  );
}
