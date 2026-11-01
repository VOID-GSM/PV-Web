// src/pages/CalendarPage.tsx
import { useState } from "react";

import { Header } from "../components/layout/Header";
import { CalendarHeader } from "../components/calendar/CalendarHeader";
import { CalendarGrid } from "../components/calendar/CalendarGrid";
import { RightPanel } from "../components/calendar/RightPanel";
import { EventDetailModal } from "../components/calendar/EventDetailModal";
import { AddEventModal } from "../components/calendar/AddEventModal";

import type {
  CalendarEvent,
  BoardFilter,
  MilestoneItem,
  ViewMode,
} from "../types/calendar";

interface CalendarPageProps {
  events?: CalendarEvent[];
  boards?: { id: number; name: string; color: string; status?: string }[];
  activeMenu?: string;
  onNavigate?: (menu: string) => void;
  onOpenAddModal?: () => void;
  onAddEvent?: (newEvent: CalendarEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
  onUpdateEvent?: (event: CalendarEvent) => void;
}

export default function CalendarPage({
  events = [],
  boards = [],
  onOpenAddModal = () => {},
  onAddEvent = () => {},
  onDeleteEvent = () => {},
  onUpdateEvent = () => {},
}: CalendarPageProps = {}) {
  const [viewMode, setViewMode] = useState<ViewMode>("월간");
  const [onlyMyEvents, setOnlyMyEvents] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 보드는 미리 만들어 두지 않고, 실제 일정에 입력된 보드만 표시한다.
  const [uncheckedBoards, setUncheckedBoards] = useState<Record<string, boolean>>({});
  const boardColors = ["#3b82f6", "#10b981", "#8b5cf6", "#14b8a6", "#ec4899", "#f59e0b"];
  const eventBoardNames = events.map((event) => event.board?.trim()).filter((name): name is string => Boolean(name));
  const boardNames = Array.from(new Set([...boards.map((board) => board.name), ...eventBoardNames]));
  const boardFilters: BoardFilter[] = boardNames.map((name, index) => {
    const serverBoard = boards.find((board) => board.name === name);
    return {
      id: name,
      name,
      color: serverBoard?.color || boardColors[index % boardColors.length],
      checked: uncheckedBoards[name] !== false,
    };
  });
  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);

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

  const handleDeleteEvent = () => {
    if (!selectedEvent) return;
    onDeleteEvent(selectedEvent.id);
    setSelectedEvent(null);
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

  const activeFilters = boardFilters.filter((filter) => filter.checked).map((filter) => filter.name);
  const filteredEvents = events.filter((event) =>
    (!onlyMyEvents || event.isMyEvent) &&
    (!event.board || activeFilters.includes(event.board))
  );

  return (
    <div className="flex flex-1 flex-col overflow-hidden h-full">
      <Header
        title="통합 캘린더"
        subtitle="모든 보드의 마감·회의·활동을 한 화면에서"
        onOpenAddModal={onOpenAddModal}
      />

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
            onOpenAddModal={onOpenAddModal}
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
            setUncheckedBoards((prev) => ({
              ...prev,
              [id]: prev[id] === false ? true : false,
            }));
          }}
          onAddMilestone={handleAddMilestone}
          onApplyMilestonesToCalendar={handleApplyMilestonesToCalendar}
        />
      </main>

      {selectedEvent && !isEditModalOpen && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onDelete={handleDeleteEvent}
          onEdit={() => setIsEditModalOpen(true)}
        />
      )}

      {selectedEvent && (
        <AddEventModal
          isOpen={isEditModalOpen}
          initialEvent={selectedEvent}
          onUpdateEvent={onUpdateEvent}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
}
