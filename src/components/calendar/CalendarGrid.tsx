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

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const today = new Date();
  const isThisMonth =
    today.getFullYear() === year && today.getMonth() === month;

  // 1. 월간 뷰 데이터 생성
  const monthCells = [];

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevM = month === 0 ? 12 : month;
    const prevY = month === 0 ? year - 1 : year;
    const dateStr = `${prevY}-${String(prevM).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    monthCells.push({
      dateStr,
      dayLabel: `${prevM}/${dayNum}`,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    monthCells.push({
      dateStr,
      dayLabel: String(d),
      isCurrentMonth: true,
      isToday: isThisMonth && today.getDate() === d,
    });
  }

  const totalCells = Math.ceil(monthCells.length / 7) * 7;
  const remainingCells = totalCells - monthCells.length;
  for (let i = 1; i <= remainingCells; i++) {
    const nextM = month === 11 ? 1 : month + 2;
    const nextY = month === 11 ? year + 1 : year;
    const dateStr = `${nextY}-${String(nextM).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    monthCells.push({
      dateStr,
      dayLabel: `${nextM}/${i}`,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // 일정 칩 렌더링
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

  // 뷰 모드별 분기 처리
  if (viewMode === "주간") {
    // 현재 기준 1주(7일)만 출력
    const weekCells = monthCells.slice(0, 7);
    return (
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <div className="grid grid-cols-7 border-b border-gray-100 bg-white text-center text-xs font-semibold text-gray-500">
          {daysOfWeek.map((day, idx) => (
            <div key={day} className="py-3">
              {day}
            </div>
          ))}
        </div>
        <div className="grid flex-1 grid-cols-7 bg-white">
          {weekCells.map((cell, idx) => {
            const dayEvents = events.filter((e) => e.date === cell.dateStr);
            return (
              <div
                key={idx}
                className="border-r border-gray-100 p-2 min-h-[300px]"
              >
                <span className="text-xs font-bold text-gray-700">
                  {cell.dayLabel}일
                </span>
                <div className="mt-2 space-y-1">
                  {dayEvents.map((evt) => renderEventChip(evt))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

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
                className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:border-gray-300 cursor-pointer"
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

  // 기본 월간 뷰
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

      <div className="grid flex-1 grid-cols-7 grid-rows-5 bg-white">
        {monthCells.map((cell, idx) => {
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
