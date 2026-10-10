import React from "react";
import chevronLeftIcon from "../../assets/icons/chevron-left.svg";
import chevronRightIcon from "../../assets/icons/chevron-right.svg";
import plusIcon from "../../assets/icons/plus.svg";

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onOpenAddModal: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onOpenAddModal,
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const today = new Date();
  const todayString = `오늘 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  return (
    <div className="flex items-center justify-between pb-4 select-none">
      {/* Date controls */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrevMonth}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100"
          >
            <img src={chevronLeftIcon} alt="이전" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100"
          >
            <img src={chevronRightIcon} alt="다음" className="h-4 w-4" />
          </button>
        </div>

        <h2 className="text-lg font-bold text-gray-900">
          {year}년 {month}월
        </h2>

        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
          {todayString}
        </span>
      </div>

      {/* View Switcher & Action */}
      <div className="flex items-center gap-3">
        <div className="flex rounded-xl bg-gray-100 p-1 text-xs font-medium text-gray-500">
          <button
            type="button"
            className="rounded-lg bg-white px-3 py-1 text-gray-900 shadow-sm"
          >
            월간
          </button>
          <button type="button" className="px-3 py-1 hover:text-gray-900">
            주간
          </button>
          <button type="button" className="px-3 py-1 hover:text-gray-900">
            타임라인
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="flex h-8 items-center gap-1.5 rounded-xl bg-black px-3.5 text-xs font-medium text-white hover:bg-gray-800"
        >
          <img src={plusIcon} alt="" className="h-3.5 w-3.5 filter invert" />
          <span>일정 추가</span>
        </button>
      </div>
    </div>
  );
};
