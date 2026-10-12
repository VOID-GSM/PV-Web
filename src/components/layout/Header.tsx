import React from "react";
import searchIcon from "../../assets/icons/search.svg";
import bellIcon from "../../assets/icons/bell.svg";
import plusIcon from "../../assets/icons/plus.svg";

interface HeaderProps {
  onOpenAddModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddModal }) => {
  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-gray-100 bg-white px-8 shrink-0">
      <div>
        <h1 className="text-base font-bold text-gray-900">통합 캘린더</h1>
        <p className="text-[11px] text-gray-400">
          모든 보드의 마감·회의·활동을 한 화면에서
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative">
          <img
            src={searchIcon}
            alt=""
            className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 opacity-40"
          />
          <input
            type="text"
            placeholder="정리글·질문·팀원 검색"
            className="h-9 w-64 rounded-xl bg-gray-100 pl-8 pr-3 text-xs outline-none placeholder:text-gray-400 focus:bg-gray-50 focus:ring-1 focus:ring-black"
          />
        </div>

        {/* Bell Button */}
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 transition hover:bg-gray-200"
        >
          <img src={bellIcon} alt="알림" className="h-4 w-4 opacity-70" />
        </button>

        {/* Create Button */}
        <button
          type="button"
          onClick={onOpenAddModal}
          className="flex h-9 items-center gap-1.5 rounded-xl bg-black px-4 text-xs font-medium text-white hover:bg-gray-800 transition"
        >
          <img src={plusIcon} alt="" className="h-3.5 w-3.5 filter invert" />
          <span>새로 만들기</span>
        </button>
      </div>
    </header>
  );
};
