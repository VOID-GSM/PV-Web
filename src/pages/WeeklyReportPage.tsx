// src/pages/WeeklyReportPage.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Dropdown from "../components/common/Dropdown";

// 아카이브 페이지와 동일한 기간 옵션으로 수정
const periodOptions = ["기간: 최근 3개월", "기간: 최근 6개월", "기간: 전체"];

export default function WeeklyReportPage() {
  const navigate = useNavigate();

  // 드롭다운 및 모달 상태
  const [selectedPeriod, setSelectedPeriod] = useState("기간: 최근 3개월");
  const [excludePrivate, setExcludePrivate] = useState(true);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // 데이터 빈 상태 (초기화)
  const [hasData] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 드롭다운/모달 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsCreateMenuOpen(false);
      }
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setIsShareModalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 링크 복사 처리
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // PDF 다운로드 처리
  const handleDownloadPdf = () => {
    alert("리포트를 PDF 파일로 다운로드합니다.");
    setIsShareModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#f8f9fa] overflow-hidden font-pretendard">
      {/* 1. 상단 헤더 */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-lg font-extrabold text-gray-900">주간 리포트</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            생성된 리포트를 확인하고 팀원들과 공유할 수 있습니다.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="정리글 · 질문 · 팀원 검색"
              className="w-full pl-8 pr-3 py-1.5 bg-gray-100/80 rounded-lg text-xs focus:outline-none focus:bg-white border border-transparent focus:border-gray-300 transition"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute left-2.5 top-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>

          {/* 새로 만들기 버튼 드롭다운 */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
              className="px-4 py-2 bg-[#191f28] text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition flex items-center gap-1.5 shadow-sm"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>새로 만들기</span>
            </button>

            {isCreateMenuOpen && (
              <div className="absolute right-0 top-11 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 p-2.5 z-50 animate-in fade-in duration-100">
                <div className="text-[11px] font-bold text-gray-400 px-3 py-1.5">
                  새로 만들기
                </div>
                <div className="space-y-0.5">
                  <button
                    onClick={() => setIsCreateMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-xl transition"
                  >
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>일정 추가</span>
                  </button>
                  <button
                    onClick={() => setIsCreateMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-xl transition"
                  >
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 16.5 18c-1.747 0-3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    <span>활동 개설</span>
                  </button>
                </div>

                <div className="my-2 border-t border-gray-100" />

                <div className="text-[11px] font-bold text-gray-400 px-3 py-1.5">
                  내 기록
                </div>
                <div className="space-y-0.5">
                  <button
                    onClick={() => {
                      setIsCreateMenuOpen(false);
                      navigate("/archive/editor");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-xl transition"
                  >
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    <span>정리글 작성</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. 필터 및 컨트롤 바 */}
      <div className="bg-white border-b border-gray-200 px-8 py-3 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3 text-xs">
          {/* 아카이브 스타일 기간 드롭다운 */}
          <Dropdown
            options={periodOptions}
            value={selectedPeriod}
            onChange={setSelectedPeriod}
          />
          <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md font-semibold text-[11px]">
            AI 자동 생성
          </span>
          <label className="flex items-center gap-2 cursor-pointer text-gray-600 font-medium select-none ml-1">
            <input
              type="checkbox"
              checked={excludePrivate}
              onChange={(e) => setExcludePrivate(e.target.checked)}
              className="accent-black rounded"
            />
            <span>비공개 업무일지 제외</span>
          </label>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <button className="px-3.5 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>다시 생성</span>
          </button>

          {/* 팀에 공유 버튼 & 공유 옵션 팝오버 (PDF 다운로드 / 링크 공유) */}
          <div className="relative" ref={shareRef}>
            <button
              onClick={() => setIsShareModalOpen(!isShareModalOpen)}
              className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition flex items-center gap-1.5 shadow-sm"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              <span>팀에 공유</span>
            </button>

            {/* 공유 옵션 모달 */}
            {isShareModalOpen && (
              <div className="absolute right-0 top-11 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in duration-100 space-y-1">
                <div className="text-[11px] font-bold text-gray-400 px-3 py-1.5">
                  리포트 공유 옵션
                </div>

                {/* PDF 다운로드 옵션 */}
                <button
                  onClick={handleDownloadPdf}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-xl transition"
                >
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div className="flex flex-col text-left">
                    <span>PDF 다운로드</span>
                    <span className="text-[10px] font-normal text-gray-400">
                      파일 형태로 저장합니다
                    </span>
                  </div>
                </button>

                {/* 링크 복사/공유 옵션 */}
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-xl transition"
                >
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  <div className="flex flex-col text-left">
                    <span>{copySuccess ? "링크 복사 완료!" : "링크 공유"}</span>
                    <span className="text-[10px] font-normal text-gray-400">
                      팀원 공유 링크를 복사합니다
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. 메인 콘텐츠 대시보드 */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* 상단: 이번 주 팀 요약 배너 */}
        <div className="bg-[#191f28] text-white rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-amber-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <h2 className="text-sm font-bold tracking-wide">
                이번 주 팀 요약
              </h2>
            </div>
            <span className="text-[11px] text-gray-400">
              공개 업무일지 0건 · 활동 기록 0건 · 과제 0건 · 출석 데이터 기준
            </span>
          </div>

          <div className="text-xs text-gray-300 leading-relaxed font-normal">
            {!hasData ? (
              <p className="text-gray-400 italic">
                생성된 팀 요약이 없습니다. 업무일지와 활동 데이터를 바탕으로
                요약을 생성해 보세요.
              </p>
            ) : null}
          </div>
        </div>

        {/* 하단: 2열 레이아웃 */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold text-gray-900">
                보드별 진행 상황
              </h3>
              {!hasData ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  진행 중인 보드가 없습니다.
                </div>
              ) : null}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold text-gray-900">
                이번 주 스터디 주제와 기록
              </h3>
              {!hasData ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  기록된 스터디 주제가 없습니다.
                </div>
              ) : null}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold text-gray-900">
                종료 예정 보드 회고
              </h3>
              <p className="text-[11px] text-gray-400 leading-snug">
                보드를 "종료" 처리하면 KPT 템플릿이 자동 생성되고 참여자
                전원에게 작성 요청이 갑니다.
              </p>
              {!hasData ? (
                <div className="py-6 text-center text-xs text-gray-400 border-t border-gray-100">
                  종료 예정인 보드가 없습니다.
                </div>
              ) : null}
              <button className="w-full py-2.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-semibold text-gray-700 transition flex items-center justify-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 01-2-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <span>회고 미리 열어두기</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-5 shadow-sm">
              <h3 className="text-xs font-bold text-gray-900">이번 주 지표</h3>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-600 font-medium">출석률</span>
                  <span className="font-extrabold text-gray-900">0%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-0" />
                </div>
                <p className="text-[10px] text-gray-400">
                  참석 0 · 승인 불참 0 · 무단 0
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-600 font-medium">과제 제출률</span>
                  <span className="font-extrabold text-gray-900">0%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-0" />
                </div>
                <p className="text-[10px] text-gray-400">
                  제출 0 · 지각 0 · 미제출 0
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-600 font-medium">정리글 작성</span>
                  <span className="font-extrabold text-gray-900">0건</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-black h-full w-0" />
                </div>
                <p className="text-[10px] text-gray-400">
                  목표 0건 · 지난주 0건
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-600 font-medium">피드백 활동</span>
                  <span className="font-extrabold text-gray-900">0건</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full w-0" />
                </div>
                <p className="text-[10px] text-gray-400">
                  인라인 0 · 전체 댓글 0
                </p>
              </div>
            </div>

            <div className="bg-amber-50/60 rounded-2xl border border-amber-200/80 p-5 space-y-3 shadow-sm">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                <svg
                  className="w-4 h-4 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>다음 주 주의 사항</span>
              </div>
              {!hasData ? (
                <p className="text-xs text-amber-800/70 italic">
                  주의 사항이 없습니다.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
