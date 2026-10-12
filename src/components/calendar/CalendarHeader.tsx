import React from "react";
import type { ViewMode } from "../../types/calendar";

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: ViewMode;
  onlyMyEvents: boolean;
  onViewChange: (mode: ViewMode) => void;
  onToggleOnlyMyEvents: () => void;
  onPrev: () => void;
  onNext: () => void;
  onOpenAddModal: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  viewMode,
  onlyMyEvents,
  onViewChange,
  onToggleOnlyMyEvents,
  onPrev,
  onNext,
  onOpenAddModal,
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  return (
    <div className="flex items-center justify-between pb-5 select-none">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-gray-900">
          {year}년 {month}월
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrev}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 transition cursor-pointer"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={onNext}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 transition cursor-pointer"
          >
            ›
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleOnlyMyEvents}
          className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
            onlyMyEvents
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              onlyMyEvents ? "bg-emerald-400" : "bg-gray-400"
            }`}
          />
          내 일정만
        </button>

        <div className="flex rounded-xl bg-gray-100 p-1">
          {(["월간", "주간"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onViewChange(mode)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                viewMode === mode
                  ? "bg-white text-gray-900 shadow-2xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 rounded-xl bg-black px-3.5 py-1.5 text-xs font-bold text-white hover:bg-gray-800 transition cursor-pointer"
        >
          <span>+</span>
          <span>일정 추가</span>
        </button>
      </div>
    </div>
  );
};
