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
  viewMode,
  onSelectEvent,
}) => {
  const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 날짜 포맷 (YYYY-MM-DD)
  const formatDateStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // 월간 데이터 계산
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthDays: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) monthDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    monthDays.push(new Date(year, month, d));
  }

  // 주간 데이터 계산 (현재 날짜가 속한 주의 일요일~토요일)
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  const weekDays: Date[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const displayDays = viewMode === "주간" ? weekDays : monthDays;

  const getEventsForDate = (dateObj: Date) => {
    const targetStr = formatDateStr(dateObj);
    return events.filter((e) => e.date === targetStr);
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

  const todayStr = formatDateStr(new Date());

  return (
    <div className="flex flex-1 flex-col overflow-hidden select-none">
      {/* 요어 헤더 */}
      <div className="grid grid-cols-7 border-b border-gray-100 text-center text-xs font-semibold text-gray-400 py-2">
        {daysOfWeek.map((day, idx) => (
          <div key={day} className={idx === 0 ? "text-red-400" : ""}>
            {day}
          </div>
        ))}
      </div>

      {/* 그리드 바디 */}
      <div
        className={`grid flex-1 grid-cols-7 gap-px bg-gray-100 ${
          viewMode === "주간" ? "grid-rows-1" : "grid-rows-5"
        }`}
      >
        {displayDays.map((dateObj, idx) => {
          if (!dateObj) {
            return <div key={`empty-${idx}`} className="bg-white p-2" />;
          }

          const dayEvents = getEventsForDate(dateObj);
          const dateStr = formatDateStr(dateObj);
          const isToday = dateStr === todayStr;

          return (
            <div
              key={dateStr}
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
                  {dateObj.getDate()}
                </span>
              </div>

              <div className="space-y-1 overflow-y-auto max-h-28">
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
