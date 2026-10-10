import React from "react";
import type { CalendarEvent } from "../../types/calendar";
import alertIcon from "../../assets/icons/alert.svg";
import bookIcon from "../../assets/icons/book.svg";
import usersIcon from "../../assets/icons/users.svg";

interface CalendarGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  events,
  onSelectEvent,
}) => {
  const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const today = new Date();
  const isCurrentMonthToday =
    today.getFullYear() === year && today.getMonth() === month;

  // 동적 달력 날짜 그리드 생성
  const gridCells = [];

  // 이전 달 남은 날짜
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    gridCells.push({
      dateStr,
      dayLabel: `${prevMonth + 1}/${dayNum}`,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // 현재 달 날짜
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    gridCells.push({
      dateStr,
      dayLabel: String(d),
      isCurrentMonth: true,
      isToday: isCurrentMonthToday && today.getDate() === d,
    });
  }

  // 다음 달 채우기 (총 35칸 또는 42칸)
  const totalCells = Math.ceil(gridCells.length / 7) * 7;
  const remainingCells = totalCells - gridCells.length;
  for (let i = 1; i <= remainingCells; i++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    gridCells.push({
      dateStr,
      dayLabel: `${nextMonth + 1}/${i}`,
      isCurrentMonth: false,
      isToday: false,
    });
  }

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

      {/* 달력 그리드 */}
      <div className="grid flex-1 grid-cols-7 grid-rows-5 bg-white">
        {gridCells.map((cell, idx) => {
          const dayEvents = events.filter((e) => e.date === cell.dateStr);

          return (
            <div
              key={idx}
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

              {/* 일정 목록 */}
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
