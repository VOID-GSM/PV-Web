import { useNavigate, useLocation } from "react-router-dom";
import React from "react";
// ★ 내 정보: 설정 화면과 같은 창고(TanStack Query)를 쓴다
// → 서버 요청은 한 번만, 설정에서 이름을 바꾸면 사이드바도 바로 바뀐다
import { useMyProfile } from "../../hooks/useMembers";
import { MAJOR_LABEL } from "../../apis/interviews";

import logo from "../../assets/images/logo.svg";
import homeIcon from "../../assets/icons/home.svg";
import calendarIcon from "../../assets/icons/calendar.svg";
import bookIcon from "../../assets/icons/book.svg";
import micIcon from "../../assets/icons/mic.svg";
import fileTextIcon from "../../assets/icons/file-text.svg";
import clipboardIcon from "../../assets/icons/clipboard.svg";
import trendingUpIcon from "../../assets/icons/trending-up.svg";
import usersIcon from "../../assets/icons/users.svg";

// 입장할 때 이 기기에 저장해 둔 프로필 (친구 코드)
interface InviteProfile {
  name?: string;
  generation?: string;
  departments?: string[];
}

// 저장된 입장 프로필 꺼내기 (없거나 못 읽으면 빈 값)
const getInviteProfile = (): InviteProfile => {
  try {
    const saved = localStorage.getItem("pvweb:invite-profile:v1");
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

export interface SidebarProps {
  activeMenu?: string;
  todayTaskCount?: number;
  assignmentCount?: number;
  onNavigate?: (menu: string) => void;
}

const MENU_TO_PATH: Record<string, string> = {
  "오늘 할 일": "/today",
  "통합 캘린더": "/calendar",
  활동: "/activity",
  "정리글 아카이브": "/archive",
  "주간 리포트": "/weekly-report",
  "팀원 관리": "/members",
};

const PATH_TO_MENU: Record<string, string> = {
  "/today": "오늘 할 일",
  "/calendar": "통합 캘린더",
  "/activity": "활동",
  "/archive": "정리글 아카이브",
  "/weekly-report": "주간 리포트",
  "/members": "팀원 관리",
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeMenu,
  todayTaskCount = 0,
  assignmentCount = 0,
  onNavigate,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // ★ 서버의 내 정보 (이름·기수·전공·역할)
  const profileQuery = useMyProfile();
  const me = profileQuery.data;
  // ★ 서버 정보가 오기 전에 잠깐 보여줄 기기 저장 프로필
  const saved = getInviteProfile();

  // 부장(LEADER)이면 팀원 관리 메뉴를 보여준다
  const isLeader = me?.roles.includes("LEADER") ?? false;

  // ★ 아래 프로필 글자: 서버 정보가 있으면 서버, 없으면 기기 저장, 그것도 없으면 "사용자"
  const displayName = me?.name ?? (saved.name?.trim() || "사용자");
  const displaySub = me
    ? `${me.generation}기 · ${me.majors.map((m) => MAJOR_LABEL[m]).join(", ")}`
    : [saved.generation, saved.departments?.join(", ")].filter(Boolean).join(" · ");

  const currentActiveMenu =
    activeMenu || PATH_TO_MENU[location.pathname] || "오늘 할 일";

  const handleMenuClick = (menuName: string) => {
    if (onNavigate) {
      onNavigate(menuName);
      return;
    }

    const targetPath = MENU_TO_PATH[menuName];
    if (targetPath) {
      navigate(targetPath);
    }
  };

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-gray-100 bg-white px-4 py-5 font-pretendard select-none">
      <div className="mb-6 flex items-center gap-2.5 px-2">
        <img src={logo} alt="" className="h-6 w-auto object-contain" />
        <span className="font-sans text-xl font-black tracking-wider text-gray-900">
          VOID
        </span>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto text-[13px]">
        <div>
          <p className="px-2 pb-2 text-[10px] font-semibold text-gray-400">
            워크스페이스
          </p>

          <div className="space-y-1">
            <button
              type="button"
              onClick={() => handleMenuClick("오늘 할 일")}
              className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2.5 text-xs font-medium transition ${
                currentActiveMenu === "오늘 할 일"
                  ? "bg-black font-semibold text-white shadow-xs"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <img
                  src={homeIcon}
                  alt=""
                  className={`h-4 w-4 ${
                    currentActiveMenu === "오늘 할 일"
                      ? "filter invert"
                      : "opacity-70"
                  }`}
                />
                오늘 할 일
              </span>

              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  currentActiveMenu === "오늘 할 일"
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {todayTaskCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleMenuClick("통합 캘린더")}
              className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-xs font-medium transition ${
                currentActiveMenu === "통합 캘린더"
                  ? "bg-black font-semibold text-white shadow-xs"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <img
                src={calendarIcon}
                alt=""
                className={`h-4 w-4 ${
                  currentActiveMenu === "통합 캘린더"
                    ? "filter invert"
                    : "opacity-70"
                }`}
              />
              통합 캘린더
            </button>

            <button
              type="button"
              onClick={() => handleMenuClick("활동")}
              className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-xs font-medium transition ${
                currentActiveMenu === "활동"
                  ? "bg-black font-semibold text-white shadow-xs"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <img
                src={bookIcon}
                alt=""
                className={`h-4 w-4 ${
                  currentActiveMenu === "활동" ? "filter invert" : "opacity-70"
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
              onClick={() => handleMenuClick("정리글 아카이브")}
              className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-xs font-medium transition ${
                currentActiveMenu === "정리글 아카이브"
                  ? "bg-black font-semibold text-white shadow-xs"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <img
                src={bookIcon}
                alt=""
                className={`h-4 w-4 ${
                  currentActiveMenu === "정리글 아카이브"
                    ? "filter invert"
                    : "opacity-70"
                }`}
              />
              정리글 아카이브
            </button>

            <button
              type="button"
              onClick={() => handleMenuClick("면접 질문 뱅크")}
              className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-xs font-medium transition ${
                currentActiveMenu === "면접 질문 뱅크"
                  ? "bg-black font-semibold text-white shadow-xs"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <img
                src={micIcon}
                alt=""
                className={`h-4 w-4 ${
                  currentActiveMenu === "면접 질문 뱅크"
                    ? "filter invert"
                    : "opacity-70"
                }`}
              />
              면접 질문 뱅크
            </button>

            <button
              type="button"
              onClick={() => handleMenuClick("과제 · 역량맵")}
              className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2.5 text-xs font-medium transition ${
                currentActiveMenu === "과제 · 역량맵"
                  ? "bg-black font-semibold text-white shadow-xs"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <img
                  src={fileTextIcon}
                  alt=""
                  className={`h-4 w-4 ${
                    currentActiveMenu === "과제 · 역량맵"
                      ? "filter invert"
                      : "opacity-70"
                  }`}
                />
                과제 · 역량맵
              </span>

              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  currentActiveMenu === "과제 · 역량맵"
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
              onClick={() => handleMenuClick("업무일지")}
              className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-xs font-medium transition ${
                currentActiveMenu === "업무일지"
                  ? "bg-black font-semibold text-white shadow-xs"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <img
                src={clipboardIcon}
                alt=""
                className={`h-4 w-4 ${
                  currentActiveMenu === "업무일지"
                    ? "filter invert"
                    : "opacity-70"
                }`}
              />
              업무일지
            </button>

            <button
              type="button"
              onClick={() => handleMenuClick("주간 리포트")}
              className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-xs font-medium transition ${
                currentActiveMenu === "주간 리포트"
                  ? "bg-black font-semibold text-white shadow-xs"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <img
                src={trendingUpIcon}
                alt=""
                className={`h-4 w-4 ${
                  currentActiveMenu === "주간 리포트"
                    ? "filter invert"
                    : "opacity-70"
                }`}
              />
              주간 리포트
            </button>
          </div>
        </div>

        {isLeader && (
          <div>
            <p className="px-2 pb-2 text-[10px] font-semibold text-gray-400">
              관리
            </p>

            <div className="space-y-1">
              <button
                type="button"
                onClick={() => handleMenuClick("팀원 관리")}
                className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-xs font-medium transition ${
                  currentActiveMenu === "팀원 관리"
                    ? "bg-black font-semibold text-white shadow-xs"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <img
                  src={usersIcon}
                  alt=""
                  className={`h-4 w-4 ${
                    currentActiveMenu === "팀원 관리"
                      ? "filter invert"
                      : "opacity-70"
                  }`}
                />
                팀원 관리
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ★ 아래 프로필: 들어온 사람의 정보 (필터 버튼은 친구 코드처럼 뺐다) */}
      <div className="mt-auto border-t border-gray-100 pt-3">
        <div className="flex items-center px-1">
          <div className="flex min-w-0 items-center gap-2.5">
            {/* 이름 첫 글자 */}
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
              {displayName.charAt(0)}
            </div>

            {/* min-w-0 + truncate: 이름·전공이 길면 ...으로 줄인다 */}
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-gray-900">{displayName}</p>
              <p className="truncate text-[10px] text-gray-400">{displaySub}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;