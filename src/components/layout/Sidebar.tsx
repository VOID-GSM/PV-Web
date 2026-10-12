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

export interface SidebarProps {
  activeMenu?: string;
  todayTaskCount?: number;
  assignmentCount?: number;
  onNavigate?: (menu: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeMenu = "오늘 할 일",
  todayTaskCount = 0,
  assignmentCount = 0,
  onNavigate,
}) => {
  return (
    <aside className="flex h-screen w-60 flex-col border-r border-gray-100 bg-white px-4 py-5 select-none shrink-0">
      {/* Logo */}
      <div className="mb-6 px-2 flex items-center gap-2.5">
        <img src={logo} alt="" className="h-6 w-auto object-contain" />
        <span className="text-xl font-black tracking-wider text-gray-900 font-sans">
          VOID
        </span>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 space-y-5 overflow-y-auto text-[13px]">
        <div>
          <p className="px-2 pb-2 text-[10px] font-semibold text-gray-400">
            워크스페이스
          </p>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => onNavigate?.("오늘 할 일")}
              className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2.5 text-xs font-medium transition cursor-pointer ${
                activeMenu === "오늘 할 일"
                  ? "bg-black text-white font-semibold shadow-xs"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <img
                  src={homeIcon}
                  alt=""
                  className={`h-4 w-4 ${
                    activeMenu === "오늘 할 일" ? "filter invert" : "opacity-70"
                  }`}
                />
                오늘 할 일
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  activeMenu === "오늘 할 일"
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {todayTaskCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate?.("통합 캘린더")}
              className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-xs font-medium transition cursor-pointer ${
                activeMenu === "통합 캘린더"
                  ? "bg-black text-white font-semibold shadow-xs"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <img
                src={calendarIcon}
                alt=""
                className={`h-4 w-4 ${
                  activeMenu === "통합 캘린더" ? "filter invert" : "opacity-70"
                }`}
              />
              통합 캘린더
            </button>

            <button
              type="button"
              onClick={() => onNavigate?.("활동")}
              className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-xs font-medium transition cursor-pointer ${
                activeMenu === "활동"
                  ? "bg-black text-white font-semibold shadow-xs"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <img
                src={bookIcon}
                alt=""
                className={`h-4 w-4 ${
                  activeMenu === "활동" ? "filter invert" : "opacity-70"
                }`}
              />
              활동
            </button>
          </div>
        </div>

        <div>
          <p className="px-2 pb-2 text-[10px] font-semibold text-gray-400">
            학습
          </p>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => onNavigate?.("정리글 아카이브")}
              className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-xs font-medium transition cursor-pointer ${
                activeMenu === "정리글 아카이브"
                  ? "bg-black text-white font-semibold shadow-xs"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <img
                src={bookIcon}
                alt=""
                className={`h-4 w-4 ${
                  activeMenu === "정리글 아카이브"
                    ? "filter invert"
                    : "opacity-70"
                }`}
              />
              정리글 아카이브
            </button>

            <button
              type="button"
              onClick={() => onNavigate?.("면접 질문 뱅크")}
              className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-xs font-medium transition cursor-pointer ${
                activeMenu === "면접 질문 뱅크"
                  ? "bg-black text-white font-semibold shadow-xs"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <img
                src={micIcon}
                alt=""
                className={`h-4 w-4 ${
                  activeMenu === "면접 질문 뱅크"
                    ? "filter invert"
                    : "opacity-70"
                }`}
              />
              면접 질문 뱅크
            </button>

            <button
              type="button"
              onClick={() => onNavigate?.("과제 · 역량맵")}
              className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2.5 text-xs font-medium transition cursor-pointer ${
                activeMenu === "과제 · 역량맵"
                  ? "bg-black text-white font-semibold shadow-xs"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <img
                  src={fileTextIcon}
                  alt=""
                  className={`h-4 w-4 ${
                    activeMenu === "과제 · 역량맵"
                      ? "filter invert"
                      : "opacity-70"
                  }`}
                />
                과제 · 역량맵
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  activeMenu === "과제 · 역량맵"
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {assignmentCount}
              </span>
            </button>
          </div>
        </div>

        <div>
          <p className="px-2 pb-2 text-[10px] font-semibold text-gray-400">
            기록
          </p>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => onNavigate?.("업무일지")}
              className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-xs font-medium transition cursor-pointer ${
                activeMenu === "업무일지"
                  ? "bg-black text-white font-semibold shadow-xs"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <img
                src={clipboardIcon}
                alt=""
                className={`h-4 w-4 ${
                  activeMenu === "업무일지" ? "filter invert" : "opacity-70"
                }`}
              />
              업무일지
            </button>

            <button
              type="button"
              onClick={() => onNavigate?.("주간 리포트")}
              className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-xs font-medium transition cursor-pointer ${
                activeMenu === "주간 리포트"
                  ? "bg-black text-white font-semibold shadow-xs"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <img
                src={trendingUpIcon}
                alt=""
                className={`h-4 w-4 ${
                  activeMenu === "주간 리포트" ? "filter invert" : "opacity-70"
                }`}
              />
              주간 리포트
            </button>
          </div>
        </div>

        <div>
          <p className="px-2 pb-2 text-[10px] font-semibold text-gray-400">
            관리
          </p>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => onNavigate?.("팀원 관리")}
              className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-xs font-medium transition cursor-pointer ${
                activeMenu === "팀원 관리"
                  ? "bg-black text-white font-semibold shadow-xs"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <img
                src={usersIcon}
                alt=""
                className={`h-4 w-4 ${
                  activeMenu === "팀원 관리" ? "filter invert" : "opacity-70"
                }`}
              />
              팀원 관리
            </button>
          </div>
        </div>
      </div>

      {/* User Profile */}
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
