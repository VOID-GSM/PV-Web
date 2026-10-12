import React from "react";
import type { CalendarEvent, ViewMode } from "../../types/calendar";
import alertIcon from "../../assets/icons/alert.svg";
import bookIcon from "../../assets/icons/book.svg";
import usersIcon from "../../assets/icons/users.svg";

interface CalendarGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  viewMode: ViewMode;
  onSelectEvent: (event: CalendarEvent) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  events,
  viewMode,
  onSelectEvent,
}) => {
  const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];
  const today = new Date();

  // 1. 일정 칩 렌더링
  const renderEventChip = (evt: CalendarEvent) => {
    switch (evt.type) {
      case "활동":
        return (
          <button
            key={evt.id}
            type="button"
            onClick={() => onSelectEvent(evt)}
            className="flex w-full items-center gap-1 rounded bg-[#e8f1ff] px-2 py-1 text-left text-[11px] font-medium text-[#2d62d3] transition hover:opacity-80"
          >
            <img src={bookIcon} alt="" className="h-3 w-3" />
            <span className="truncate">{evt.title}</span>
          </button>
        );
      case "회의":
        return (
          <button
            key={evt.id}
            type="button"
            onClick={() => onSelectEvent(evt)}
            className="flex w-full items-center gap-1 rounded border border-[#00a86b] bg-white px-2 py-1 text-left text-[11px] font-medium text-[#008f5a] transition hover:bg-gray-50"
          >
            <img src={usersIcon} alt="" className="h-3 w-3" />
            <span className="truncate">{evt.title}</span>
          </button>
        );
      case "마감":
        return (
          <button
            key={evt.id}
            type="button"
            onClick={() => onSelectEvent(evt)}
            className="flex w-full items-center gap-1 rounded bg-[#2c6ecb] px-2 py-1 text-left text-[11px] font-medium text-white transition hover:opacity-90"
          >
            <img src={alertIcon} alt="" className="h-3 w-3 filter invert" />
            <span className="truncate">{evt.title}</span>
          </button>
        );
      default:
        return (
          <button
            key={evt.id}
            type="button"
            onClick={() => onSelectEvent(evt)}
            className="flex w-full items-center gap-1 rounded bg-gray-100 px-2 py-1 text-left text-[11px] font-medium text-gray-700 transition hover:bg-gray-200"
          >
            <span className="truncate">{evt.title}</span>
          </button>
        );
    }
  };

  // 2. 주간 뷰 (선택한 날짜가 속한 주 7일 정밀 계산)
  if (viewMode === "주간") {
    const currentDayOfWeek = currentDate.getDay();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDayOfWeek);

    const weekCells = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);

      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const dateNum = d.getDate();
      const dateStr = `${y}-${String(m).padStart(2, "0")}-${String(dateNum).padStart(2, "0")}`;

      weekCells.push({
        dateStr,
        dayLabel: `${m}/${dateNum}`,
        isToday: d.toDateString() === today.toDateString(),
      });
    }

    return (
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <div className="grid grid-cols-7 border-b border-gray-100 bg-white text-center text-xs font-semibold text-gray-500">
          {daysOfWeek.map((day, idx) => (
            <div
              key={day}
              className={`py-3 ${
                idx === 0 ? "text-red-500" : idx === 6 ? "text-blue-500" : ""
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid flex-1 grid-cols-7 bg-white">
          {weekCells.map((cell) => {
            const dayEvents = events.filter((e) => e.date === cell.dateStr);
            return (
              <div
                key={cell.dateStr}
                className="flex flex-col border-r border-gray-100 p-2 min-h-[300px]"
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    cell.isToday ? "bg-black text-white" : "text-gray-700"
                  }`}
                >
                  {cell.dayLabel}
                </span>
                <div className="mt-2 space-y-1 overflow-y-auto">
                  {dayEvents.map((evt) => renderEventChip(evt))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 3. 타임라인 뷰
  if (viewMode === "타임라인") {
    return (
      <div className="flex flex-1 flex-col overflow-y-auto rounded-2xl border border-gray-100 bg-white p-5">
        <h3 className="text-xs font-bold text-gray-900 mb-3">
          간트형 타임라인 뷰
        </h3>
        {events.length === 0 ? (
          <p className="text-xs text-gray-400">등록된 일정이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {events.map((evt) => (
              <div
                key={evt.id}
                onClick={() => onSelectEvent(evt)}
                className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:border-gray-300 cursor-pointer transition"
              >
                <div>
                  <span className="text-[10px] font-bold text-blue-600">
                    [{evt.board}]
                  </span>
                  <p className="text-xs font-bold text-gray-800">{evt.title}</p>
                </div>
                <span className="text-xs text-gray-500">{evt.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 4. 월간 뷰 (JavaScript Date 객체 연산 기반 35/42일 동적 셀 생성)
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDateOfMonth = new Date(year, month, 1);
  const firstDayOfWeek = firstDateOfMonth.getDay();
  const gridStartDate = new Date(year, month, 1 - firstDayOfWeek);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalDays = firstDayOfWeek + daysInMonth > 35 ? 42 : 35;

  const monthCells = [];
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(gridStartDate);
    d.setDate(gridStartDate.getDate() + i);

    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const dateNum = d.getDate();
    const dateStr = `${y}-${String(m).padStart(2, "0")}-${String(dateNum).padStart(2, "0")}`;

    monthCells.push({
      dateStr,
      dayLabel: d.getMonth() === month ? String(dateNum) : `${m}/${dateNum}`,
      isCurrentMonth: d.getMonth() === month,
      isToday: d.toDateString() === today.toDateString(),
    });
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-gray-100 bg-white text-center text-xs font-semibold text-gray-500">
        {daysOfWeek.map((day, idx) => (
          <div
            key={day}
            className={`py-3 ${
              idx === 0 ? "text-red-500" : idx === 6 ? "text-blue-500" : ""
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 월간 그리드 */}
      <div className="grid flex-1 grid-cols-7 grid-rows-5 bg-white">
        {monthCells.map((cell) => {
          const dayEvents = events.filter((e) => e.date === cell.dateStr);

          return (
            <div
              key={cell.dateStr}
              className={`flex flex-col border-b border-r border-gray-100 p-2 min-h-[85px] ${
                cell.isCurrentMonth ? "bg-white" : "bg-gray-50/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                    cell.isToday
                      ? "bg-black text-white"
                      : cell.isCurrentMonth
                        ? "text-gray-800"
                        : "text-gray-300"
                  }`}
                >
                  {cell.dayLabel}
                </span>
              </div>

              <div className="mt-1.5 space-y-1 overflow-y-auto">
                {dayEvents.map((evt) => renderEventChip(evt))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
