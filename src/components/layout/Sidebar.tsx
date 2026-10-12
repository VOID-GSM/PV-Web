import logoWhite from "../../assets/images/logo-white.png";
import homeIcon from "../../assets/icons/home.svg";
import calendarIcon from "../../assets/icons/calendar.svg";
import bellIcon from "../../assets/icons/bell.svg";
import bookIcon from "../../assets/icons/book.svg";
import micIcon from "../../assets/icons/mic.svg";
import fileTextIcon from "../../assets/icons/file-text.svg";
import clipboardIcon from "../../assets/icons/clipboard.svg";
import barChartIcon from "../../assets/icons/bar-chart.svg";
import usersIcon from "../../assets/icons/users.svg";
import settingsIcon from "../../assets/icons/settings.svg";

export const Sidebar = () => {
  return (
    <aside className="flex h-screen w-60 flex-col bg-[#0d0d0d] px-4 py-5 text-white select-none shrink-0">
      {/* Logo */}
      <div className="mb-6 px-2">
        <img src={logoWhite} alt="VOID" className="h-5 object-contain" />
      </div>

      {/* Nav Menu */}
      <div className="flex-1 space-y-6 overflow-y-auto text-[13px]">
        {/* 워크스페이스 */}
        <div>
          <p className="px-2 pb-2 text-[10px] font-semibold tracking-wider text-[#555]">
            워크스페이스
          </p>
          <div className="space-y-1">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-[#888] hover:bg-[#1a1a1a] hover:text-white"
            >
              <span className="flex items-center gap-2.5">
                <img src={homeIcon} alt="" className="h-4 w-4 opacity-70" />
                오늘 할 일
              </span>
              <span className="rounded-full bg-[#222] px-1.5 py-0.5 text-[10px] text-[#aaa]">
                0
              </span>
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-lg bg-[#1a1a1a] px-2.5 py-2 font-medium text-white"
            >
              <img src={calendarIcon} alt="" className="h-4 w-4 filter invert" />
              통합 캘린더
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[#888] hover:bg-[#1a1a1a] hover:text-white"
            >
              <img src={bellIcon} alt="" className="h-4 w-4 opacity-70" />
              활동
            </button>
          </div>
        </div>

        {/* 학습 */}
        <div>
          <p className="px-2 pb-2 text-[10px] font-semibold tracking-wider text-[#555]">
            학습
          </p>
          <div className="space-y-1">
            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[#888] hover:bg-[#1a1a1a] hover:text-white"
            >
              <img src={bookIcon} alt="" className="h-4 w-4 opacity-70" />
              정리글 아카이브
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[#888] hover:bg-[#1a1a1a] hover:text-white"
            >
              <img src={micIcon} alt="" className="h-4 w-4 opacity-70" />
              면접 질문 뱅크
            </button>

            <button
              type="button"
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-[#888] hover:bg-[#1a1a1a] hover:text-white"
            >
              <span className="flex items-center gap-2.5">
                <img src={fileTextIcon} alt="" className="h-4 w-4 opacity-70" />
                과제 · 역량맵
              </span>
            </button>
          </div>
        </div>

        {/* 기록 */}
        <div>
          <p className="px-2 pb-2 text-[10px] font-semibold tracking-wider text-[#555]">
            기록
          </p>
          <div className="space-y-1">
            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[#888] hover:bg-[#1a1a1a] hover:text-white"
            >
              <img src={clipboardIcon} alt="" className="h-4 w-4 opacity-70" />
              업무일지
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[#888] hover:bg-[#1a1a1a] hover:text-white"
            >
              <img src={barChartIcon} alt="" className="h-4 w-4 opacity-70" />
              주간 리포트
            </button>
          </div>
        </div>

        {/* 관리 */}
        <div>
          <p className="px-2 pb-2 text-[10px] font-semibold tracking-wider text-[#555]">
            관리
          </p>
          <div className="space-y-1">
            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[#888] hover:bg-[#1a1a1a] hover:text-white"
            >
              <img src={usersIcon} alt="" className="h-4 w-4 opacity-70" />
              팀원 관리
            </button>
          </div>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="mt-auto border-t border-[#222] pt-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-black">
              ME
            </div>
            <div>
              <p className="text-xs font-semibold text-white">내 프로필</p>
              <p className="text-[10px] text-[#666]">Front-end</p>
            </div>
          </div>
          <button type="button" className="p-1 text-[#666] hover:text-white">
            <img src={settingsIcon} alt="설정" className="h-4 w-4 filter invert opacity-60" />
          </button>
        </div>
      </div>
    </aside>
  );
};