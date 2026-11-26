// src/pages/CalendarPage.tsx
import { useEffect, useState } from "react";

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
  myEvents?: CalendarEvent[];
  canManageMeetings?: boolean;
  boards?: { id: number; name: string; color: string; status?: string }[];
  activeMenu?: string;
  onNavigate?: (menu: string) => void;
  onOpenAddModal?: () => void;
  onAddEvent?: (newEvent: CalendarEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
  onUpdateEvent?: (event: CalendarEvent) => void;
  onMonthChange?: (date: Date, mine?: boolean) => void;
}

export default function CalendarPage({
  events = [],
  myEvents = [],
  canManageMeetings = false,
  boards = [],
  onOpenAddModal = () => {},
  onAddEvent = () => {},
  onDeleteEvent = () => {},
  onUpdateEvent = () => {},
  onMonthChange,
}: CalendarPageProps = {}) {
  const [viewMode, setViewMode] = useState<ViewMode>("월간");
  const [onlyMyEvents, setOnlyMyEvents] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // 보는 달이 바뀌면 그 달의 일정을 불러온다 (이미 불러온 달은 App에서 건너뜀)
  useEffect(() => {
    onMonthChange?.(currentDate, onlyMyEvents);
  }, [currentDate, onlyMyEvents, onMonthChange]);

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 날짜 칸을 눌러서 일정을 추가할 날짜 ("2026-11-24"). null이면 추가 창이 닫혀 있다
  const [addDate, setAddDate] = useState<string | null>(null);

  // ☆ 마감을 걸 수 있는 보드 (진행 중인 것만). App이 부장일 때만 보드를 불러와서, 부장이 아니면 빈 목록
  const deadlineBoards = boards.filter((board) => board.status !== "CLOSED");

  // 보드는 미리 만들어 두지 않고, 실제 일정에 입력된 보드만 표시한다.
  const [uncheckedBoards, setUncheckedBoards] = useState<
    Record<string, boolean>
  >({});
  const boardColors = [
    "#3b82f6",
    "#10b981",
    "#8b5cf6",
    "#14b8a6",
    "#ec4899",
    "#f59e0b",
  ];
  const eventBoardNames = [...events, ...myEvents]
    .map((event) => event.board?.trim())
    .filter(
      (name): name is string => Boolean(name) && name !== "지정된 보드 없음",
    );
  const boardNames = Array.from(
    new Set([...boards.map((board) => board.name), ...eventBoardNames]),
  );
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

  const activeFilters = boardFilters
    .filter((filter) => filter.checked)
    .map((filter) => filter.name);
  const eventsToDisplay = onlyMyEvents ? myEvents : events;
  const filteredEvents = eventsToDisplay.filter(
    (event) =>
      !event.board ||
      event.board === "지정된 보드 없음" ||
      activeFilters.includes(event.board),
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
            // 날짜 칸을 누르면 그 날짜로 일정 추가 창 열기
            onSelectDate={(dateStr) => setAddDate(dateStr)}
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
          canManageMeetings={canManageMeetings}
          onClose={() => setSelectedEvent(null)}
          onDelete={handleDeleteEvent}
          onEdit={() => setIsEditModalOpen(true)}
        />
      )}

      {selectedEvent && (
        <AddEventModal
          isOpen={isEditModalOpen}
          initialEvent={selectedEvent}
          canManageMeetings={canManageMeetings}
          onUpdateEvent={onUpdateEvent}
          // ☆ 수정 창에도 보드 목록 (마감 화면을 똑같이 보여주려고)
          boards={deadlineBoards}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedEvent(null);
          }}
        />
      )}

      {/* 날짜 칸을 눌러서 여는 일정 추가 창 (그 날짜가 미리 채워진다) */}
      <AddEventModal
        isOpen={addDate !== null}
        canManageMeetings={canManageMeetings}
        initialDate={addDate ?? undefined}
        onAddEvent={onAddEvent}
        // ☆ 부장이면 마감을 보드에 등록할 수 있게 보드 목록 넘기기
        boards={deadlineBoards}
        onClose={() => setAddDate(null)}
      />
    </div>
  );
}
