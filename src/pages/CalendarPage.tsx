import { useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { CalendarHeader } from "../components/calendar/CalendarHeader";
import { CalendarGrid } from "../components/calendar/CalendarGrid";
import { RightPanel } from "../components/calendar/RightPanel";
import { EventDetailModal } from "../components/calendar/EventDetailModal";

import type {
  CalendarEvent,
  BoardFilter,
  MilestoneItem,
  ViewMode,
} from "../types/calendar";

// Props 옵셔널(?) 처리
export interface CalendarPageProps {
  events?: CalendarEvent[];
  activeMenu?: string;
  onNavigate?: (menu: string) => void;
  onOpenAddModal?: () => void;
  onAddEvent?: (newEvent: CalendarEvent) => void;
}

export default function CalendarPage({
  events = [],
  activeMenu = "통합 캘린더",
  onNavigate,
  onOpenAddModal,
  onAddEvent,
}: CalendarPageProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("월간");
  const [onlyMyEvents, setOnlyMyEvents] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );

  const [boardFilters, setBoardFilters] = useState<BoardFilter[]>([]);
  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);

  const todayStr = currentDate.toISOString().split("T")[0];
  const todayTaskCount = events.filter((e) => e.date === todayStr).length;

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

  const handleApplyMilestonesToCalendar = () => {
    if (milestones.length === 0 || !onAddEvent) return;

    milestones.forEach((m) => {
      onAddEvent({
        id: `ms-${m.id}`,
        title: m.title,
        type: "마감",
        board: "마일스톤 제안",
        date: m.date.includes("-")
          ? m.date
          : `${currentDate.getFullYear()}-${m.date.replace("/", "-")}`,
        isMyEvent: true,
      });
    });

    setMilestones((prev) => prev.map((m) => ({ ...m, status: "확정" })));
  };

  const filteredEvents = onlyMyEvents
    ? events.filter((e) => e.isMyEvent)
    : events;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f7f7f8]">
      <Sidebar
        activeMenu={activeMenu}
        todayTaskCount={todayTaskCount}
        assignmentCount={0}
        onNavigate={onNavigate}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          title="통합 캘린더"
          subtitle="모든 보드의 마감·회의·활동을 한 화면에서"
          onOpenAddModal={onOpenAddModal}
        />

        <main className="flex flex-1 gap-5 overflow-hidden p-6">
          <div className="flex flex-1 flex-col overflow-hidden rounded-3xl bg-white p-6 shadow-xs">
            <CalendarHeader
              currentDate={currentDate}
              viewMode={viewMode}
              onlyMyEvents={onlyMyEvents}
              onViewChange={(mode) => setViewMode(mode)}
              onToggleOnlyMyEvents={() => setOnlyMyEvents(!onlyMyEvents)}
              onPrev={handlePrevDate}
              onNext={handleNextDate}
              onOpenAddModal={onOpenAddModal ?? (() => {})}
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
                  f.id === id ? { ...f, checked: !f.checked } : f,
                ),
              );
            }}
            onAddMilestone={(title, date) => {
              setMilestones((prev) => [
                ...prev,
                { id: Date.now().toString(), title, date, status: "제안" },
              ]);
            }}
            onApplyMilestonesToCalendar={handleApplyMilestonesToCalendar}
          />
        </main>
      </div>

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onDelete={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
