// src/pages/ArchivePage.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Dropdown from "../components/common/Dropdown";
import MarkdownPreview from "../components/common/MarkdownPreview";
import { getArticles, saveArticles } from "../utils/articles";
import type { Article } from "../types/article";
import { deletePost, getPost, getPosts } from "../api/postApi";
import { createComment, getComments } from "../api/commentApi";

interface Comment {
  id: number;
  author: string;
  date: string;
  badge?: string;
  text: string;
}

const activityFilterOptions = ["활동 선택", "등록된 활동 없음"];
const periodFilterOptions = ["기간 선택", "전체"];

export default function ArchivePage() {
  const navigate = useNavigate();

  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [noticeTab, setNoticeTab] = useState<"all" | "unread" | "mention">(
    "all",
  ); // 알림 탭 상태

  const [selectedTab, setSelectedTab] = useState<
    "all" | "my" | "compare" | "feedback"
  >("all");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("활동 선택");
  const [selectedPeriod, setSelectedPeriod] = useState("기간 선택");

  const [articles, setArticles] = useState<Article[]>(() => getArticles());
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(
    null,
  );
  const selectedArticle =
    articles.find((article) => article.id === selectedArticleId) ?? null;
  const filteredArticles = articles.filter((article) =>
    `${article.title} ${article.content} ${article.activity} ${(article.tags ?? []).join(" ")}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase().trim()),
  );
  const [commentList, setCommentList] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const noticeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    getPosts({}, 0, 50)
      .then(async (response) => {
        const summaries = response.content ?? [];
        const loaded = await Promise.all(
          summaries.map(async (summary): Promise<Article> => {
            try {
              const post = await getPost(summary.id);
              return {
                id: String(post.id),
                title: post.title,
                activity: post.activityId
                  ? `활동 ${post.activityId}`
                  : "활동 미지정",
                round: post.sessionId ? `${post.sessionId}회차` : "회차 미지정",
                tags: [],
                date: (post.createdAt || summary.createdAt || "").slice(0, 10),
                author: String(post.authorId),
                commentsCount: 0,
                content: post.content,
                feedbackOption: "none",
              };
            } catch {
              return {
                id: String(summary.id),
                title: summary.title,
                activity: summary.activityId
                  ? `활동 ${summary.activityId}`
                  : "활동 미지정",
                round: summary.sessionId
                  ? `${summary.sessionId}회차`
                  : "회차 미지정",
                tags: [],
                date: (summary.createdAt || "").slice(0, 10),
                author: String(summary.authorId),
                commentsCount: 0,
                content: "",
                feedbackOption: "none",
              };
            }
          }),
        );
        if (!cancelled) {
          setArticles(loaded);
          saveArticles(loaded);
        }
      })
      .catch((error: unknown) => {
        console.error("정리글 목록 조회 실패:", error);
        if (!cancelled)
          alert(
            error instanceof Error
              ? error.message
              : "정리글을 불러오지 못했습니다.",
          );
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedArticleId || !/^\d+$/.test(selectedArticleId)) {
      return;
    }
    let cancelled = false;
    getComments("NOTE", Number(selectedArticleId))
      .then((comments) => {
        if (!cancelled)
          setCommentList(
            comments.map((comment) => ({
              id: comment.id,
              author: `회원 ${comment.authorId}`,
              date: (comment.createdAt || "").slice(0, 16).replace("T", " "),
              text: comment.content,
            })),
          );
      })
      .catch((error: unknown) => {
        console.error("정리글 댓글 조회 실패:", error);
        if (!cancelled) setCommentList([]);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedArticleId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsCreateMenuOpen(false);
      }
      if (noticeRef.current && !noticeRef.current.contains(e.target as Node)) {
        setIsNoticeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newComment.trim() ||
      !selectedArticleId ||
      !/^\d+$/.test(selectedArticleId)
    )
      return;
    try {
      const created = await createComment({
        targetType: "NOTE",
        targetId: Number(selectedArticleId),
        content: newComment.trim(),
      });
      setCommentList((prev) => [
        ...prev,
        {
          id: created.id,
          author: `회원 ${created.authorId}`,
          date: (created.createdAt || "").slice(0, 16).replace("T", " "),
          text: created.content,
        },
      ]);
      setNewComment("");
    } catch (error) {
      console.error("정리글 댓글 작성 실패:", error);
      alert(
        error instanceof Error ? error.message : "댓글을 작성하지 못했습니다.",
      );
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (!window.confirm("이 정리글을 삭제할까요?")) return;
    if (!/^\d+$/.test(articleId)) {
      alert("서버에 저장된 정리글 ID가 올바르지 않습니다.");
      return;
    }
    try {
      await deletePost(Number(articleId));
      const nextArticles = articles.filter(
        (article) => article.id !== articleId,
      );
      saveArticles(nextArticles);
      setArticles(nextArticles);
      setSelectedArticleId(null);
    } catch (error) {
      console.error("정리글 삭제 실패:", error);
      alert(
        error instanceof Error
          ? error.message
          : "정리글을 삭제하지 못했습니다.",
      );
    }
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

          {/* 알람 버튼 및 1번 디자인 전용 팝업 */}
          <div className="relative" ref={noticeRef}>
            <button
              onClick={() => setIsNoticeOpen((prev) => !prev)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition relative"
              aria-label="알림 목록 보기"
            >
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

            {/* 1번 사진의 알림 팝업 디자인 적용 */}
            {isNoticeOpen && (
              <div className="absolute right-0 top-11 w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 p-5 z-50 animate-in fade-in duration-100">
                {/* 헤더: 알림 + 안 읽음 배지 + 모두 읽음 */}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-gray-900">
                      알림
                    </span>
                    <span className="bg-[#ef4444] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      안 읽음 0
                    </span>
                  </div>
                  <button className="text-xs text-gray-400 hover:text-gray-600 font-medium">
                    모두 읽음
                  </button>
                </div>

                {/* 탭: 전체 / 안 읽음 / 멘션 */}
                <div className="flex gap-4 border-b border-gray-100 text-xs font-bold text-gray-400">
                  <button
                    onClick={() => setNoticeTab("all")}
                    className={`pb-2 transition relative ${
                      noticeTab === "all"
                        ? "text-gray-900 border-b-2 border-black"
                        : "hover:text-gray-600"
                    }`}
                  >
                    전체
                  </button>
                  <button
                    onClick={() => setNoticeTab("unread")}
                    className={`pb-2 transition relative ${
                      noticeTab === "unread"
                        ? "text-gray-900 border-b-2 border-black"
                        : "hover:text-gray-600"
                    }`}
                  >
                    안 읽음
                  </button>
                  <button
                    onClick={() => setNoticeTab("mention")}
                    className={`pb-2 transition relative ${
                      noticeTab === "mention"
                        ? "text-gray-900 border-b-2 border-black"
                        : "hover:text-gray-600"
                    }`}
                  >
                    멘션
                  </button>
                </div>

                {/* 본문: 알림 없음 메시지 */}
                <div className="py-12 text-center text-xs font-medium text-gray-400">
                  새로운 알림이 없습니다.
                </div>

                {/* 푸터: 디스코드 안내 + 알림 설정 */}
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-[11px] text-gray-400">
                  <span>디스코드에서도 함께 받고 있습니다</span>
                  <button className="font-bold text-gray-800 hover:text-black">
                    알림 설정
                  </button>
                </div>
              </div>
            )}
          </div>

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
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 16.5 18c-1.746 0-3.332.477-4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
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
                      navigate("/editor");
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
            onClick={() => navigate("/editor")}
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

      {/* 메인 3열 레이아웃 */}
      <div className="flex-1 flex overflow-hidden p-6 gap-5">
        <div className="w-80 bg-white rounded-2xl border border-gray-200 flex flex-col shrink-0 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-800">
              목록 {articles.length}개
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {filteredArticles.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a2 2 0 01.707.293l5.414 5.414a2 2 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="text-xs font-medium text-gray-400">
                  {searchTerm
                    ? "검색 결과가 없습니다."
                    : "작성된 정리글이 없습니다."}
                </p>
                <button
                  onClick={() => navigate("/editor")}
                  className="mt-3 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-200"
                >
                  + 첫 정리글 작성하기
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredArticles.map((article) => (
                  <button
                    key={article.id}
                    type="button"
                    onClick={() => setSelectedArticleId(article.id)}
                    className={`w-full rounded-xl border p-3 text-left transition ${selectedArticleId === article.id ? "border-black bg-gray-50" : "border-gray-100 hover:border-gray-300 hover:bg-gray-50"}`}
                  >
                    <span className="block truncate text-xs font-bold text-gray-900">
                      {article.title}
                    </span>
                    <span className="mt-1 block text-[10px] text-gray-400">
                      {article.activity} · {article.round}
                    </span>
                    <span className="mt-2 block text-[10px] text-gray-400">
                      {article.date} · {article.author}
                    </span>
                    {article.tags?.length > 0 && (
                      <span className="mt-2 flex flex-wrap gap-1">
                        {article.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500"
                          >
                            #{tag}
                          </span>
                        ))}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden shadow-sm">
          {selectedArticle ? (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-5 flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {selectedArticle.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-xl font-extrabold text-gray-900">
                    {selectedArticle.title}
                  </h2>
                  <p className="mt-2 text-[11px] text-gray-400">
                    {selectedArticle.author} · {selectedArticle.date} ·{" "}
                    {selectedArticle.activity} · {selectedArticle.round}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/editor?edit=${encodeURIComponent(selectedArticle.id)}`,
                      )
                    }
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteArticle(selectedArticle.id)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    삭제
                  </button>
                </div>
              </div>
              <MarkdownPreview content={selectedArticle.content} />
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center space-y-3 p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-100 bg-gray-50 text-gray-300">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18h9c1.746 0 3.332.477 4.5 1.253v-13C19.832 5.477 18.246 5 16.5 5S13.168 5.477 12 6.253"
                  />
                </svg>
              </div>
              <p className="text-xs font-semibold text-gray-400">
                왼쪽 목록에서 정리글을 선택해 주세요.
              </p>
            </div>
          )}
        </div>

        <div className="w-80 bg-white rounded-2xl border border-gray-200 flex flex-col shrink-0 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-900">
              피드백 {commentList.length}
            </span>
          </div>

          <div className="p-4 flex-1 overflow-y-auto">
            {commentList.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center">
                <p className="text-xs text-gray-400 font-medium">
                  피드백 내역이 없습니다.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {commentList.map((comment) => (
                  <div key={comment.id} className="rounded-xl bg-gray-50 p-3">
                    <p className="text-[10px] font-semibold text-gray-500">
                      {comment.author} · {comment.date}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-xs text-gray-800">
                      {comment.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
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
