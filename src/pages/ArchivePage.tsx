// src/pages/ArchivePage.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Dropdown from "../components/common/Dropdown";

interface Article {
  id: number;
  title: string;
  activity: string;
  round: string;
  tag: string;
  date: string;
  author: string;
  commentsCount: number;
  content: string;
}

interface Comment {
  id: number;
  author: string;
  date: string;
  badge?: string;
  text: string;
}

// 드롭다운 옵션 값 완전 초기화
const activityFilterOptions = ["활동 선택", "등록된 활동 없음"];
const periodFilterOptions = ["기간 선택", "전체"];

export default function ArchivePage() {
  const navigate = useNavigate();

  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    "all" | "my" | "compare" | "feedback"
  >("all");

  // 드롭다운 선택값 초기화
  const [selectedActivity, setSelectedActivity] = useState("활동 선택");
  const [selectedPeriod, setSelectedPeriod] = useState("기간 선택");

  // 초기화된 데이터 (빈 상태)
  const [articles] = useState<Article[]>([]);
  const [commentList, setCommentList] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsCreateMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const added: Comment = {
      id: Date.now(),
      author: "동키",
      date: "방금 전",
      text: newComment.trim(),
    };
    setCommentList((prev) => [...prev, added]);
    setNewComment("");
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#f8f9fa] overflow-hidden font-pretendard">
      {/* 상단 헤더 */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-lg font-extrabold text-gray-900">
            정리글 아카이브
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            모든 정리글은 팀 전체에 공개됩니다 · 총 {articles.length}개
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

          {/* 새로 만들기 드롭다운 */}
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
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    <span>활동 개설</span>
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
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                    <span>공지 보내기</span>
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span>과제 출제</span>
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
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002 2h2a2 2 0 002-2"
                      />
                    </svg>
                    <span>업무일지 쓰기</span>
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
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z"
                      />
                    </svg>
                    <span>면접 답변 남기기</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 필터 및 탭 바 */}
      <div className="bg-white border-b border-gray-200 px-8 py-3 flex justify-between items-center shrink-0">
        <div className="flex gap-1.5 text-xs font-semibold">
          <button
            onClick={() => setSelectedTab("all")}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              selectedTab === "all"
                ? "bg-black text-white"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setSelectedTab("my")}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              selectedTab === "my"
                ? "bg-black text-white"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            }`}
          >
            내가 쓴 정리글
          </button>
          <button
            onClick={() => setSelectedTab("compare")}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              selectedTab === "compare"
                ? "bg-black text-white"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            }`}
          >
            공통 주제 비교
          </button>
          <button
            onClick={() => setSelectedTab("feedback")}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              selectedTab === "feedback"
                ? "bg-black text-white"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            }`}
          >
            피드백 제안
          </button>
        </div>

        {/* 초기화된 드롭다운 적용 */}
        <div className="flex items-center gap-2">
          <Dropdown
            options={activityFilterOptions}
            value={selectedActivity}
            onChange={setSelectedActivity}
          />
          <Dropdown
            options={periodFilterOptions}
            value={selectedPeriod}
            onChange={setSelectedPeriod}
          />
          <button
            onClick={() => navigate("/archive/editor")}
            className="px-3.5 py-1.5 bg-black text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition flex items-center gap-1.5"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span>정리글 작성</span>
          </button>
        </div>
      </div>

      {/* 메인 3열 레이아웃 (데이터 빈 상태) */}
      <div className="flex-1 flex overflow-hidden p-6 gap-5">
        <div className="w-80 bg-white rounded-2xl border border-gray-200 flex flex-col shrink-0 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-800">
              목록 {articles.length}개
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center text-center">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-xs font-medium text-gray-400">
                작성된 정리글이 없습니다.
              </p>
              <button
                onClick={() => navigate("/archive/editor")}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition"
              >
                + 첫 정리글 작성하기
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden shadow-sm">
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <p className="text-xs font-semibold text-gray-400">
              왼쪽 목록에서 정리글을 선택해 주세요.
            </p>
          </div>
        </div>

        <div className="w-80 bg-white rounded-2xl border border-gray-200 flex flex-col shrink-0 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-900">
              피드백 {commentList.length}
            </span>
          </div>

          <div className="p-4 flex-1 overflow-y-auto flex flex-col items-center justify-center text-center">
            <p className="text-xs text-gray-400 font-medium">
              피드백 내역이 없습니다.
            </p>
          </div>

          <form
            onSubmit={handleAddComment}
            className="p-3 border-t border-gray-100 flex gap-2"
          >
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="피드백을 남겨주세요"
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-black transition"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-black text-white text-xs rounded-xl hover:bg-gray-800 transition flex items-center justify-center"
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
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
