import { useState } from "react";

import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { CalendarHeader } from "../components/calendar/CalendarHeader";
import { CalendarGrid } from "../components/calendar/CalendarGrid";
import { RightPanel } from "../components/calendar/RightPanel";
import { AddEventModal } from "../components/calendar/AddEventModal";
import { EventDetailModal } from "../components/calendar/EventDetailModal";

import type { CalendarEvent, BoardFilter } from "../types/calendar";

export default function CalendarPage() {
  // PR 피드백 기준: 초기 상태는 빈 배열 및 null로 설정
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [boardFilters, setBoardFilters] = useState<BoardFilter[]>([]);

  const handleAddEvent = (newEvent: CalendarEvent) => {
    setEvents((prev) => [...prev, newEvent]);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((evt) => evt.id !== id));
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f7f7f8]">
      {/* Sidebar */}
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Main Workspace */}
        <main className="flex flex-1 gap-5 overflow-hidden p-6">
          <div className="flex flex-1 flex-col overflow-hidden rounded-3xl bg-white p-6 shadow-sm">
            <CalendarHeader
              currentDate={currentDate}
              onPrevMonth={() =>
                setCurrentDate(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() - 1,
                    1,
                  ),
                )
              }
              onNextMonth={() =>
                setCurrentDate(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + 1,
                    1,
                  ),
                )
              }
              onOpenAddModal={() => setIsAddModalOpen(true)}
            />

            <CalendarGrid
              currentDate={currentDate}
              events={events}
              onSelectEvent={(evt) => setSelectedEvent(evt)}
            />
          </div>

          {/* Right Panel */}
          <RightPanel
            events={events}
            boardFilters={boardFilters}
            onToggleFilter={(id) => {
              setBoardFilters((prev) =>
                prev.map((f) =>
                  f.id === id ? { ...f, checked: !f.checked } : f,
                ),
              );
            }}
            onSelectEvent={(evt) => setSelectedEvent(evt)}
          />
        </main>
      </div>

      {/* Modals */}
      <AddEventModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddEvent={handleAddEvent}
      />

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  );
}
