import { useState } from "react";
import CalendarPage from "./pages/CalendarPage";
import { MainPage } from "./pages/MainPage";
import { AddEventModal } from "./components/calendar/AddEventModal";
import type { CalendarEvent } from "./types/calendar";

export default function App() {
  const [currentMenu, setCurrentMenu] = useState<string>("오늘 할 일");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddEvent = (newEvent: CalendarEvent) => {
    setEvents((prev) => [...prev, newEvent]);
  };

  return (
    <>
      {currentMenu === "오늘 할 일" ? (
        <MainPage
          events={events}
          onNavigate={(menu: string) => setCurrentMenu(menu)}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />
      ) : (
        <CalendarPage
          events={events}
          activeMenu={currentMenu}
          onNavigate={(menu: string) => setCurrentMenu(menu)}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onAddEvent={handleAddEvent}
        />
      )}

      {/* 공통 새로 만들기 모달 */}
      <AddEventModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddEvent={handleAddEvent}
      />
    </>
  );
}
