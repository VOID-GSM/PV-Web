import React from "react";
import logo from "../../assets/images/logo.svg";
import homeIcon from "../../assets/icons/home.svg";
import calendarIcon from "../../assets/icons/calendar.svg";
import bookIcon from "../../assets/icons/book.svg";
import micIcon from "../../assets/icons/mic.svg";
import fileTextIcon from "../../assets/icons/file-text.svg";
import clipboardIcon from "../../assets/icons/clipboard.svg";
import trendingUpIcon from "../../assets/icons/trending-up.svg";
import usersIcon from "../../assets/icons/users.svg";
import filterIcon from "../../assets/icons/filter.svg";

interface SidebarProps {
  todayTaskCount?: number;
  assignmentCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  todayTaskCount = 0,
  assignmentCount = 0,
}) => {
  return (
    <aside className="flex h-screen w-60 flex-col border-r border-gray-100 bg-white px-4 py-5 select-none shrink-0">
      {/* Logo & VOID Title */}
      <div className="mb-6 px-2 flex items-center gap-2.5">
        <img src={logo} alt="" className="h-6 w-auto object-contain" />
        <span className="text-xl font-black tracking-wider text-gray-900 font-sans">
          VOID
        </span>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 space-y-5 overflow-y-auto text-[13px]">
        {/* 워크스페이스 */}
        <div>
          <p className="px-2 pb-2 text-[10px] font-semibold text-gray-400">
            워크스페이스
          </p>
          <div className="space-y-1">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <img src={homeIcon} alt="" className="h-4 w-4 opacity-70" />
                오늘 할 일
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                {todayTaskCount}
              </span>
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-xl bg-black px-2.5 py-2.5 text-xs font-semibold text-white shadow-xs cursor-pointer"
            >
              <img
                src={calendarIcon}
                alt=""
                className="h-4 w-4 filter invert"
              />
              통합 캘린더
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            >
              <img src={bookIcon} alt="" className="h-4 w-4 opacity-70" />
              활동
            </button>
          </div>
        </div>

        {/* 학습 */}
        <div>
          <p className="px-2 pb-2 text-[10px] font-semibold text-gray-400">
            학습
          </p>
          <div className="space-y-1">
            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            >
              <img src={bookIcon} alt="" className="h-4 w-4 opacity-70" />
              정리글 아카이브
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            >
              <img src={micIcon} alt="" className="h-4 w-4 opacity-70" />
              면접 질문 뱅크
            </button>

            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <img src={fileTextIcon} alt="" className="h-4 w-4 opacity-70" />
                과제 · 역량맵
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                {assignmentCount}
              </span>
            </button>
          </div>
        </div>

        {/* 기록 */}
        <div>
          <p className="px-2 pb-2 text-[10px] font-semibold text-gray-400">
            기록
          </p>
          <div className="space-y-1">
            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            >
              <img src={clipboardIcon} alt="" className="h-4 w-4 opacity-70" />
              업무일지
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            >
              <img src={trendingUpIcon} alt="" className="h-4 w-4 opacity-70" />
              주간 리포트
            </button>
          </div>
        </div>

        {/* 관리 */}
        <div>
          <p className="px-2 pb-2 text-[10px] font-semibold text-gray-400">
            관리
          </p>
          <div className="space-y-1">
            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            >
              <img src={usersIcon} alt="" className="h-4 w-4 opacity-70" />
              팀원 관리
            </button>
          </div>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="mt-auto border-t border-gray-100 pt-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
              동
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">동키</p>
              <p className="text-[10px] text-gray-400">10기 · Front-end</p>
            </div>
          </div>
          <button
            type="button"
            className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <img src={filterIcon} alt="설정" className="h-4 w-4 opacity-50" />
          </button>
        </div>
      </div>
    </aside>
  );
};
