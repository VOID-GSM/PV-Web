// src/components/calendar/CalendarGrid.tsx
import type { CalendarEvent, ViewMode } from "../../types/calendar";

interface CalendarGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  viewMode?: ViewMode;
  onSelectEvent: (event: CalendarEvent) => void;
  // ★ 날짜 칸을 눌렀을 때 (그 날짜 "2026-11-24"를 넘겨준다). 안 넘기면 칸 클릭은 아무 일도 안 한다
  onSelectDate?: (dateStr: string) => void;
}

// 로컬 시간 기준 YYYY-MM-DD (toISOString은 UTC라 한국에서 하루 밀림)
const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function CalendarGrid({
  currentDate,
  events,
  viewMode = "월간",
  onSelectEvent,
  onSelectDate,
}: CalendarGridProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // ★ 오늘 날짜 ("2026-11-24") — 이 칸만 동그라미로 표시한다
  const todayStr = toDateStr(new Date());

  const calendarDays: Array<{
    dateStr: string;
    dayNum: number;
    isCurrentMonth: boolean;
    isSunday: boolean;
  }> = [];

  if (viewMode === "주간") {
    // 현재 날짜가 속한 주의 일요일부터 7일
    const weekStart = new Date(
      year,
      month,
      currentDate.getDate() - currentDate.getDay(),
    );
    for (let i = 0; i < 7; i++) {
      const d = new Date(
        weekStart.getFullYear(),
        weekStart.getMonth(),
        weekStart.getDate() + i,
      );
      calendarDays.push({
        dateStr: toDateStr(d),
        dayNum: d.getDate(),
        isCurrentMonth: true,
        isSunday: i === 0,
      });
    }
  } else {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthLastDay - i);
      calendarDays.push({
        dateStr: toDateStr(prevDate),
        dayNum: prevMonthLastDay - i,
        isCurrentMonth: false,
        isSunday: calendarDays.length % 7 === 0,
      });
    }

    for (let d = 1; d <= totalDays; d++) {
      calendarDays.push({
        dateStr: toDateStr(new Date(year, month, d)),
        dayNum: d,
        isCurrentMonth: true,
        isSunday: calendarDays.length % 7 === 0,
      });
    }

    const remainingSlots = (7 - (calendarDays.length % 7)) % 7;
    for (let i = 1; i <= remainingSlots; i++) {
      const nextDate = new Date(year, month + 1, i);
      calendarDays.push({
        dateStr: toDateStr(nextDate),
        dayNum: i,
        isCurrentMonth: false,
        isSunday: calendarDays.length % 7 === 0,
      });
    }
  }

  // 주간은 한 줄이라 셀을 더 높게
  const cellMinHeight = viewMode === "주간" ? "min-h-[320px]" : "min-h-[115px]";
  return (
    <div className="flex flex-1 flex-col overflow-y-auto min-h-0 mt-4 pr-1 font-pretendard">
      {/* 요일 헤더 (스크롤 시 상단 고정) */}
      <div className="grid grid-cols-7 border-b border-gray-100 pb-2 text-center text-xs font-semibold text-gray-400 sticky top-0 bg-white z-10">
        <span className="text-red-500">일</span>
        <span>월</span>
        <span>화</span>
        <span>수</span>
        <span>목</span>
        <span>금</span>
        <span>토</span>
      </div>

      {/* 날짜 그리드 (셀 최소 높이 min-h-[115px] 지정으로 6주차 세로 스크롤 보장) */}
      <div className="grid grid-cols-7 divide-x divide-y divide-gray-100 border-b border-gray-100">
        {calendarDays.map((day, idx) => {
          const dayEvents = events.filter((e) => e.date === day.dateStr);
          // ★ 이 칸이 오늘인지
          const isToday = day.dateStr === todayStr;

          return (
            <div
              key={idx}
              // ★ 빈 곳을 누르면 그 날짜로 일정 추가
              onClick={() => onSelectDate?.(day.dateStr)}
              className={`${cellMinHeight} p-2 flex flex-col justify-between hover:bg-gray-50/50 transition ${
                !day.isCurrentMonth ? "bg-gray-50/30 text-gray-300" : ""
              } ${onSelectDate ? "cursor-pointer" : ""} ${
                // ★ 오늘 칸은 아주 옅은 배경
                isToday ? "bg-gray-50" : ""
              }`}
            >
              <div className="flex justify-between items-center">
                {/* ★ 오늘이면 검은 동그라미 안에 흰 숫자 */}
                <span
                  className={`text-xs ${
                    isToday
                      ? "flex h-6 w-6 items-center justify-center rounded-full bg-black font-bold text-white"
                      : !day.isCurrentMonth
                        ? "font-medium text-gray-300"
                        : day.isSunday
                          ? "text-red-500 font-bold"
                          : "font-medium text-gray-700"
                  }`}
                >
                  {day.dayNum}
                </span>
                {/* ★ 오늘 글자 표시 */}
                {isToday && (
                  <span className="text-[10px] font-bold text-gray-500">
                    오늘
                  </span>
                )}
              </div>

              <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                {dayEvents.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={(e) => {
                      // ★ 일정을 누르면 상세만 열리고, 칸 클릭(일정 추가)은 안 일어나게
                      e.stopPropagation();
                      onSelectEvent(evt);
                    }}
                    className="cursor-pointer truncate rounded-lg px-2 py-1 text-[11px] font-semibold transition"
                    style={{
                      backgroundColor:
                        evt.type === "마감"
                          ? "#FEE2E2"
                          : evt.type === "회의"
                            ? "#DBEAFE"
                            : "#D1FAE5",
                      color:
                        evt.type === "마감"
                          ? "#DC2626"
                          : evt.type === "회의"
                            ? "#2563EB"
                            : "#059669",
                    }}
                  >
                    {evt.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}