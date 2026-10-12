import React from "react";
import type { ViewMode } from "../../types/calendar";
import chevronLeftIcon from "../../assets/icons/chevron-left.svg";
import chevronRightIcon from "../../assets/icons/chevron-right.svg";
import plusIcon from "../../assets/icons/plus.svg";

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
  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  return (
    <div className="flex items-center justify-between pb-4 select-none">
      {/* 날짜 이동 컨트롤 */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrev}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition cursor-pointer"
          >
            <img src={chevronLeftIcon} alt="이전" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onNext}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition cursor-pointer"
          >
            <img src={chevronRightIcon} alt="다음" className="h-4 w-4" />
          </button>
        </div>

        <h2 className="text-base font-bold text-gray-900">
          {year}년 {month}월
        </h2>

        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
          오늘 {today.getMonth() + 1}월 {today.getDate()}일
        </span>
      </div>

      {/* 뷰 전환 & 버튼 */}
      <div className="flex items-center gap-3">
        <div className="flex rounded-xl bg-gray-100 p-1 text-xs font-medium text-gray-500">
          {(["월간", "주간", "타임라인"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onViewChange(mode)}
              className={`rounded-lg px-3 py-1 transition cursor-pointer ${
                viewMode === mode
                  ? "bg-white font-bold text-gray-900 shadow-sm"
                  : "hover:text-gray-900"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* 내 일정만 보기 토글 */}
        <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
          <span>내 일정만</span>
          <button
            type="button"
            onClick={onToggleOnlyMyEvents}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              onlyMyEvents ? "bg-black" : "bg-gray-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                onlyMyEvents ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="flex h-8 items-center gap-1.5 rounded-xl bg-black px-3.5 text-xs font-medium text-white hover:bg-gray-800 transition cursor-pointer"
        >
          <img src={plusIcon} alt="" className="h-3.5 w-3.5 filter invert" />
          <span>일정 추가</span>
        </button>
      </div>
    </div>
  );
};
