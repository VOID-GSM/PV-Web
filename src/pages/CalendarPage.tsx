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
  // 1. 이벤트 데이터 (초기값 빈 배열)
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // 2. 뷰 및 필터 상태
  const [viewMode, setViewMode] = useState<ViewMode>("월간");
  const [onlyMyEvents, setOnlyMyEvents] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // 3. 보드 필터 및 마일스톤 상태
  const [boardFilters, setBoardFilters] = useState<BoardFilter[]>([]);
  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);

  // 4. 수치 연동 (오늘 할 일 / 과제·역량맵)
  const todayStr = currentDate.toISOString().split("T")[0];
  const todayTaskCount = events.filter((e) => e.date === todayStr).length;
  const assignmentCount = events.filter(
    (e) => e.type === "마감" || e.type === "활동",
  ).length;

  // 일정 추가 핸들러 (+1 동적 반영)
  const handleAddEvent = (newEvent: CalendarEvent) => {
    setEvents((prev) => [...prev, newEvent]);
  };

  // 일정 삭제 핸들러
  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((evt) => evt.id !== id));
  };

  // 마일스톤 추가
  const handleAddMilestone = (title: string, date: string) => {
    const newItem: MilestoneItem = {
      id: Date.now().toString(),
      title,
      date,
      status: "제안",
    };
    setMilestones((prev) => [...prev, newItem]);
  };

  // 마감 역산 마일스톤 -> 캘린더에 실제 마감 일정으로 일괄 반영
  const handleApplyMilestonesToCalendar = () => {
    if (milestones.length === 0) return;

    const newEvents: CalendarEvent[] = milestones.map((m) => ({
      id: `ms-${m.id}`,
      title: m.title,
      type: "마감",
      board: "마일스톤 제안",
      date: m.date.includes("-")
        ? m.date
        : `${currentDate.getFullYear()}-${m.date.replace("/", "-")}`,
      isMyEvent: true,
    }));

    setEvents((prev) => [...prev, ...newEvents]);
    setMilestones((prev) => prev.map((m) => ({ ...m, status: "확정" })));
  };

  // '내 일정만 보기' 필터링 처리
  const filteredEvents = onlyMyEvents
    ? events.filter((e) => e.isMyEvent)
    : events;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f7f7f8]">
      {/* 1. 사이드바 (동적 수치 연동) */}
      <Sidebar
        todayTaskCount={todayTaskCount}
        assignmentCount={assignmentCount}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* 2. 상단 헤더 */}
        <Header onOpenAddModal={() => setIsAddModalOpen(true)} />

        {/* 3. 메인 영역 */}
        <main className="flex flex-1 gap-5 overflow-hidden p-6">
          <div className="flex flex-1 flex-col overflow-hidden rounded-3xl bg-white p-6 shadow-sm">
            <CalendarHeader
              currentDate={currentDate}
              viewMode={viewMode}
              onlyMyEvents={onlyMyEvents}
              onViewChange={(mode) => setViewMode(mode)}
              onToggleOnlyMyEvents={() => setOnlyMyEvents(!onlyMyEvents)}
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
              events={filteredEvents}
              viewMode={viewMode}
              onSelectEvent={(evt) => setSelectedEvent(evt)}
            />
          </div>

          {/* 우측 패널 (D-day 버튼 토글 및 마일스톤 반영) */}
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
            onAddMilestone={handleAddMilestone}
            onApplyMilestonesToCalendar={handleApplyMilestonesToCalendar}
          />
        </main>
      </div>

      {/* 모달 */}
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
