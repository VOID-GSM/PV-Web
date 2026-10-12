import React, { useState, useRef, useEffect } from "react";
import searchIcon from "../../assets/icons/search.svg";
import bellIcon from "../../assets/icons/bell.svg";
import plusIcon from "../../assets/icons/plus.svg";
import calendarIcon from "../../assets/icons/calendar.svg";
import bookIcon from "../../assets/icons/book.svg";
import fileTextIcon from "../../assets/icons/file-text.svg";
import clipboardIcon from "../../assets/icons/clipboard.svg";
import micIcon from "../../assets/icons/mic.svg";
import usersIcon from "../../assets/icons/users.svg";

interface HeaderProps {
  onOpenAddModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddModal }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 드롭다운 외부 클릭 시 닫히는 이벤트
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenAddModal = () => {
    setIsDropdownOpen(false);
    if (onOpenAddModal) onOpenAddModal();
  };

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-gray-100 bg-white px-8 shrink-0 relative z-30">
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

        {/* Bell Notification Button */}
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 transition hover:bg-gray-200"
        >
          <img src={bellIcon} alt="알림" className="h-4 w-4 opacity-70" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-red-500" />
        </button>

        {/* Create Button & Dropdown Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex h-9 items-center gap-1.5 rounded-xl bg-black px-4 text-xs font-medium text-white hover:bg-gray-800 transition cursor-pointer"
          >
            <img src={plusIcon} alt="" className="h-3.5 w-3.5 filter invert" />
            <span>새로 만들기</span>
          </button>

          {/* 새로 만들기 팝오버 드롭다운 메뉴 */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl z-50 text-xs select-none animate-in fade-in zoom-in-95 duration-100">
              {/* 1. 새로 만들기 섹션 */}
              <div className="px-3 py-1.5 text-[11px] font-medium text-gray-400">
                새로 만들기
              </div>
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="flex w-full items-center gap-3 rounded-xl bg-gray-100 px-3 py-2 font-semibold text-gray-900 transition hover:bg-gray-200"
                >
                  <img
                    src={calendarIcon}
                    alt=""
                    className="h-4 w-4 opacity-80"
                  />
                  <span>일정 추가</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  <img src={bookIcon} alt="" className="h-4 w-4 opacity-70" />
                  <span>활동 개설</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  <img src={bellIcon} alt="" className="h-4 w-4 opacity-70" />
                  <span>공지 보내기</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  <img
                    src={clipboardIcon}
                    alt=""
                    className="h-4 w-4 opacity-70"
                  />
                  <span>과제 출제</span>
                </button>
              </div>

              {/* 2. 내 기록 섹션 */}
              <div className="mt-2 border-t border-gray-100 pt-2 px-3 pb-1 text-[11px] font-medium text-gray-400">
                내 기록
              </div>
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  <img
                    src={fileTextIcon}
                    alt=""
                    className="h-4 w-4 opacity-70"
                  />
                  <span>정리글 작성</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  <img
                    src={clipboardIcon}
                    alt=""
                    className="h-4 w-4 opacity-70"
                  />
                  <span>업무일지 쓰기</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  <img src={micIcon} alt="" className="h-4 w-4 opacity-70" />
                  <span>면접 답변 남기기</span>
                </button>
              </div>

              {/* 3. 기타 관리 섹션 */}
              <div className="mt-2 border-t border-gray-100 pt-2 space-y-0.5">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  <img
                    src={fileTextIcon}
                    alt=""
                    className="h-4 w-4 opacity-70"
                  />
                  <span>보드 만들기</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  <img src={usersIcon} alt="" className="h-4 w-4 opacity-70" />
                  <span>초대 링크 만들기</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  <img src={plusIcon} alt="" className="h-4 w-4 opacity-70" />
                  <span>노션에서 가져오기</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
