import React from "react";
import type { CalendarEvent, ViewMode } from "../../types/calendar";

interface CalendarGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  viewMode: ViewMode;
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

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const getEventsForDate = (day: number) => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day,
    ).padStart(2, "0")}`;
    return events.filter((e) => e.date === formattedDate);
  };

  const getBadgeStyle = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "마감":
        return "bg-red-50 text-red-600 hover:bg-red-100";
      case "회의":
        return "bg-blue-50 text-blue-600 hover:bg-blue-100";
      case "활동":
        return "bg-emerald-50 text-emerald-600 hover:bg-emerald-100";
      case "개인 일정":
        return "bg-purple-50 text-purple-600 hover:bg-purple-100";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-200";
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden select-none">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-gray-100 text-center text-xs font-semibold text-gray-400 py-2">
        {daysOfWeek.map((day, idx) => (
          <div key={day} className={idx === 0 ? "text-red-400" : ""}>
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid flex-1 grid-cols-7 grid-rows-5 gap-px bg-gray-100">
        {days.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="bg-white p-2" />;
          }

          const dayEvents = getEventsForDate(day);
          const isToday =
            new Date().getFullYear() === year &&
            new Date().getMonth() === month &&
            new Date().getDate() === day;

          return (
            <div
              key={`day-${day}`}
              className="flex flex-col bg-white p-2 transition hover:bg-gray-50/50"
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold ${
                    isToday
                      ? "bg-black text-white"
                      : idx % 7 === 0
                        ? "text-red-500"
                        : "text-gray-700"
                  }`}
                >
                  {day}
                </span>
              </div>

              {/* 일정 칩 항목들 (클릭 가능하므로 cursor-pointer 추가) */}
              <div className="space-y-1 overflow-y-auto max-h-20">
                {dayEvents.map((evt) => (
                  <button
                    key={evt.id}
                    type="button"
                    onClick={() => onSelectEvent(evt)}
                    className={`flex w-full items-center justify-between rounded-lg px-2 py-1 text-[10px] font-medium transition cursor-pointer ${getBadgeStyle(
                      evt.type,
                    )}`}
                  >
                    <span className="truncate">{evt.title}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
