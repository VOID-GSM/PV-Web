import { useState } from "react";

import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { CalendarHeader } from "../components/calendar/CalendarHeader";
import { CalendarGrid } from "../components/calendar/CalendarGrid";
import { RightPanel } from "../components/calendar/RightPanel";
import { AddEventModal } from "../components/calendar/AddEventModal";
import { EventDetailModal } from "../components/calendar/EventDetailModal";

import type {
  CalendarEvent,
  BoardFilter,
  MilestoneItem,
  ViewMode,
} from "../types/calendar";

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("월간");
  const [onlyMyEvents, setOnlyMyEvents] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [boardFilters, setBoardFilters] = useState<BoardFilter[]>([]);
  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);

  // 오늘 할 일 / 과제·역량맵 수치 자동 계산
  const todayStr = currentDate.toISOString().split("T")[0];
  const todayTaskCount = events.filter((e) => e.date === todayStr).length;
  const assignmentCount = events.filter(
    (e) => e.type === "마감" || e.type === "활동"
  ).length;

  // 뷰 모드(주간/월간)에 따른 이전/다음 이동 핸들러
  const handlePrevDate = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "주간") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNextDate = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "주간") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleAddEvent = (newEvent: CalendarEvent) => {
    setEvents((prev) => [...prev, newEvent]);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((evt) => evt.id !== id));
  };

  const handleAddMilestone = (title: string, date: string) => {
    const newItem: MilestoneItem = {
      id: Date.now().toString(),
      title,
      date,
      status: "제안",
    };
    setMilestones((prev) => [...prev, newItem]);
  };

  const handleApplyMilestonesToCalendar = () => {
    if (milestones.length === 0) return;

    const newEvents: CalendarEvent[] = milestones.map((m) => ({
      id: `ms-${m.id}`,
      title: m.title,
      type: "마감",
      board: "마일스톤 제안",
      date: m.date.includes("-") ? m.date : `${currentDate.getFullYear()}-${m.date.replace("/", "-")}`,
      isMyEvent: true,
    }));

    setEvents((prev) => [...prev, ...newEvents]);
    setMilestones((prev) => prev.map((m) => ({ ...m, status: "확정" })));
  };

  const filteredEvents = onlyMyEvents
    ? events.filter((e) => e.isMyEvent)
    : events;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f7f7f8]">
      <Sidebar
        todayTaskCount={todayTaskCount}
        assignmentCount={assignmentCount}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onOpenAddModal={() => setIsAddModalOpen(true)} />

        <main className="flex flex-1 gap-5 overflow-hidden p-6">
          <div className="flex flex-1 flex-col overflow-hidden rounded-3xl bg-white p-6 shadow-sm">
            <CalendarHeader
              currentDate={currentDate}
              viewMode={viewMode}
              onlyMyEvents={onlyMyEvents}
              onViewChange={(mode) => setViewMode(mode)}
              onToggleOnlyMyEvents={() => setOnlyMyEvents(!onlyMyEvents)}
              onPrev={handlePrevDate}
              onNext={handleNextDate}
              onOpenAddModal={() => setIsAddModalOpen(true)}
            />

            <CalendarGrid
              currentDate={currentDate}
              events={filteredEvents}
              viewMode={viewMode}
              onSelectEvent={(evt) => setSelectedEvent(evt)}
            />
          </div>

          <RightPanel
            boardFilters={boardFilters}
            milestones={milestones}
            onToggleFilter={(id) => {
              setBoardFilters((prev) =>
                prev.map((f) =>
                  f.id === id ? { ...f, checked: !f.checked } : f
                )
              );
            }}
            onAddMilestone={handleAddMilestone}
            onApplyMilestonesToCalendar={handleApplyMilestonesToCalendar}
          />
        </main>
      </div>

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