// src/pages/ArchivePage.tsx
// ★ useCallback: 토스트 닫기 함수를 한 번만 만들어 두려고
import { useCallback, useState, useEffect } from "react";
// ☆ useSearchParams: 주소의 ?activityId=3 을 읽는다 (활동 화면에서 바로 열 수 있게)
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
// ★ 다른 화면과 같은 공통 헤더 (진짜 알림 · 새로 만들기 메뉴)
import { Header } from "../components/layout/Header";
import Dropdown from "../components/common/Dropdown";
import MarkdownPreview from "../components/common/MarkdownPreview";
// ★ 브라우저 alert 대신 쓸 토스트
import Toast from "../components/common/Toast";
import { getArticles, saveArticles } from "../utils/articles";
import type { Article } from "../types/article";
import {
  deletePost,
  getPost,
  getPosts,
  getPostTags,
  type ApiPostSummary,
  // ☆ 서버에 보낼 검색 조건 모양
  type PostSearchCondition,
} from "../api/postApi";
import { createComment, getComments } from "../api/commentApi";
// ☆ 진짜 활동 목록
import { getActivities, type ActivitySummary } from "../api/activityApi";
import { getMyProfile } from "../apis/members";

interface Comment {
  id: number;
  author: string;
  date: string;
  badge?: string;
  text: string;
}

type ArchiveTab = "all" | "my" | "feedback";

// ★ 토스트 하나의 모양 (id가 바뀌면 같은 문구여도 새로 뜬다)
type ToastState = { id: number; message: string; type: "success" | "info" };

// ☆ 활동 드롭다운 맨 위 "전체" 항목
const ALL_ACTIVITIES = "전체 활동";

// ★ 에러를 토스트 문구로 바꾸기 (Error면 그 메시지, 아니면 기본 문구)
const toErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

// ☆ 서버가 활동 목록을 배열로 주든 { content: [...] }로 주든 배열로 꺼낸다
const toActivityList = (data: unknown): ActivitySummary[] => {
  if (Array.isArray(data)) return data as ActivitySummary[];
  const content = (data as { content?: ActivitySummary[] } | null)?.content;
  return Array.isArray(content) ? content : [];
};

// ☆ 주소의 ?activityId=3 → 3 (없거나 숫자가 아니면 null)
const toActivityId = (value: string | null) => {
  const id = Number(value);
  return value && Number.isInteger(id) && id > 0 ? id : null;
};

export default function ArchivePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // ★ 가짜 알림 창·새로 만들기 메뉴 상태는 지웠다 (공통 Header가 대신한다)

  const [selectedTab, setSelectedTab] = useState<ArchiveTab>("all");

  const [searchTerm, setSearchTerm] = useState("");
  // ☆ 고른 활동 번호 (null이면 전체). 주소에 ?activityId가 있으면 그 활동으로 시작
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(
    () => toActivityId(searchParams.get("activityId")),
  );
  // ☆ 서버의 진짜 활동 목록 (드롭다운·활동 이름 표시용)
  const [activities, setActivities] = useState<ActivitySummary[]>([]);
  const [selectedTag, setSelectedTag] = useState("전체 태그");
  const [serverTags, setServerTags] = useState<string[]>([]);
  const [dateFilterMode, setDateFilterMode] = useState<"all" | "before" | "after" | "between">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [myMemberId, setMyMemberId] = useState<number | null>(null);

  const [articles, setArticles] = useState<Article[]>(() => getArticles());
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(
    null,
  );

  // ☆ 활동 번호 → 이름 표
  const activityNameById = new Map<number, string>(activities.map((a) => [a.id, a.name] as const));
  // ☆ 정리글의 활동 칸 글자: 숫자(활동 번호)면 진짜 이름으로, 아니면 그대로 ("활동 미지정" 등)
  const activityLabel = (value: string) =>
    /^\d+$/.test(value)
      ? (activityNameById.get(Number(value)) ?? `활동 ${value}`)
      : value;

  // ☆ 드롭다운에 보일 글자들 / 지금 고른 글자
  const activityOptions = [ALL_ACTIVITIES, ...activities.map((a) => a.name)];
  const selectedActivityName =
    selectedActivityId === null
      ? ALL_ACTIVITIES
      : (activityNameById.get(selectedActivityId) ?? ALL_ACTIVITIES);

  const selectedArticle =
    articles.find((article) => article.id === selectedArticleId) ?? null;

  const tagOptions: string[] = Array.from(
    new Set<string>([
      ...serverTags,
      ...articles.flatMap((article) => article.tags ?? []),
    ]),
  ).sort((a, b) => a.localeCompare(b, "ko"));
  const filteredArticles = articles.filter((article) => {
    const matchesSearch = `${article.title} ${article.content} ${activityLabel(article.activity)} ${(article.tags ?? []).join(" ")}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase().trim());
    const matchesTag = selectedTag === "전체 태그" || (article.tags ?? []).includes(selectedTag);
    const articleDate = (article.date ?? "").slice(0, 10);
    const matchesDate =
      dateFilterMode === "all" ||
      (dateFilterMode === "before" && Boolean(dateTo) && articleDate <= dateTo) ||
      (dateFilterMode === "after" && Boolean(dateFrom) && articleDate >= dateFrom) ||
      (dateFilterMode === "between" && Boolean(dateFrom) && Boolean(dateTo) && articleDate >= dateFrom && articleDate <= dateTo);
    return matchesSearch && matchesTag && matchesDate;
  });

  const [commentList, setCommentList] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  // ★ 지금 떠 있는 토스트 (null이면 안 보임)
  const [toast, setToast] = useState<ToastState | null>(null);
  const showToast = useCallback((message: string, type: "success" | "info" = "info") => {
    setToast((prev) => ({ id: (prev?.id ?? 0) + 1, message, type }));
  }, []);
  const closeToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    const navigationState = location.state as
      | { toastMessage?: string; toastType?: "success" | "info" }
      | null;
    if (!navigationState?.toastMessage) return;

    showToast(navigationState.toastMessage, navigationState.toastType ?? "success");
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
  }, [location.key, location.pathname, location.search, location.state, navigate, showToast]);

  useEffect(() => {
    let cancelled = false;
    getMyProfile()
      .then((profile) => {
        if (!cancelled) setMyMemberId(profile.memberId);
      })
      .catch((error: unknown) => console.error("내 회원 정보 조회 실패:", error));
    return () => { cancelled = true; };
  }, []);

  // 서버에 실제 등록된 태그를 필터 옵션으로 사용한다.
  useEffect(() => {
    let cancelled = false;
    getPostTags()
      .then((tags) => {
        if (!cancelled) setServerTags(Array.isArray(tags) ? tags : []);
      })
      .catch((error: unknown) => {
        // 서버 태그 조회에 실패하면 글 응답에 포함된 태그로 필터를 유지한다.
        console.error("태그 목록 조회 실패:", error);
      });
    return () => { cancelled = true; };
  }, []);

  // ☆ 활동 목록은 처음에 한 번만 불러온다 (못 불러와도 "전체 활동"만 보이고 화면은 그대로)
  useEffect(() => {
    let cancelled = false;

    getActivities()
      .then((data: unknown) => {
        if (!cancelled) setActivities(toActivityList(data));
      })
      .catch((error: unknown) => {
        console.error("활동 목록 조회 실패:", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    // ☆ 활동을 골랐으면 서버에 activityId를 같이 보낸다 (없으면 조건 없이 전체)
    const activityCondition: PostSearchCondition =
      selectedActivityId !== null ? { activityId: selectedActivityId } : {};

    const loadArticles = async () => {
      try {
        if (selectedTab === "feedback") {
          const localArticles = getArticles();

          if (!cancelled) {
            const feedbackArticles = localArticles.filter(
              (article) => article.feedbackOption !== "none",
            );

            setArticles(feedbackArticles);
            setSelectedArticleId(null);
            setCommentList([]);
          }

          return;
        }

        let loaded: Article[] = [];

        {
                    // ☆ 탭 조건(내가 쓴 글) + 활동 조건을 합친다
          const dateCondition: Pick<PostSearchCondition, "from" | "to"> =
            dateFilterMode === "before" && dateTo
              ? { to: dateTo }
              : dateFilterMode === "after" && dateFrom
                ? { from: dateFrom }
                : dateFilterMode === "between"
                  ? {
                      ...(dateFrom ? { from: dateFrom } : {}),
                      ...(dateTo ? { to: dateTo } : {}),
                    }
                  : {};

          const condition: PostSearchCondition = {
            ...activityCondition,
            ...dateCondition,
            ...(selectedTab === "my" ? { author: "me" as const } : {}),
            ...(selectedTag !== "전체 태그" ? { tag: selectedTag } : {}),
          };

          const response = await getPosts(condition, 0, 50);
          const summaries: ApiPostSummary[] = (response.content ?? []).filter((summary) => selectedTab !== "my" || (myMemberId !== null && summary.authorId === myMemberId));

          const localArticles = getArticles();
          const localMap = new Map(
            localArticles.map((article) => [article.id, article]),
          );

          loaded = await Promise.all(
            summaries.map(async (summary): Promise<Article> => {
              const localArticle = localMap.get(String(summary.id));

              try {
                const post = await getPost(summary.id);

                return {
                  id: String(post.id),
                  title: post.title,
                  // ☆ 활동 번호를 글자로 (보여줄 때 이름으로 바꾼다)
                  activity: post.activityId
                    ? String(post.activityId)
                    : "활동 미지정",
                  round: post.sessionId
                    ? `${post.sessionId}회차`
                    : "회차 미지정",
                  tags: Array.isArray(post.tags) ? post.tags : (summary.tags ?? localArticle?.tags ?? []),
                  date: (post.createdAt || summary.createdAt || "").slice(
                    0,
                    10,
                  ),
                  author: post.authorName ?? "알 수 없음",
                  commentsCount: localArticle?.commentsCount ?? 0,
                  content: post.content,
                  feedbackOption: localArticle?.feedbackOption ?? "none",
                  selectedMember: localArticle?.selectedMember,
                };
              } catch {
                return {
                  id: String(summary.id),
                  title: summary.title,
                  activity: summary.activityId
                    ? String(summary.activityId)
                    : "활동 미지정",
                  round: summary.sessionId
                    ? `${summary.sessionId}회차`
                    : "회차 미지정",
                  tags: summary.tags ?? localArticle?.tags ?? [],
                  date: (summary.createdAt || "").slice(0, 10),
                  author: summary.authorName ?? "알 수 없음",
                  commentsCount: localArticle?.commentsCount ?? 0,
                  content: localArticle?.content ?? "",
                  feedbackOption: localArticle?.feedbackOption ?? "none",
                  selectedMember: localArticle?.selectedMember,
                };
              }
            }),
          );
        }

        if (!cancelled) {
          setArticles(loaded);
          setSelectedArticleId(null);
          setCommentList([]);
        }
      } catch (error) {
        console.error("정리글 목록 조회 실패:", error);

        if (!cancelled) {
          setArticles([]);
          setSelectedArticleId(null);
          setCommentList([]);

          // ★ alert → 토스트
          showToast(toErrorMessage(error, "정리글을 불러오지 못했습니다."));
        }
      }
    };

    loadArticles();

    return () => {
      cancelled = true;
    };
    // ☆ 탭이나 고른 활동이 바뀌면 다시 불러온다
  }, [
    selectedTab,
    selectedActivityId,
    selectedTag,
    myMemberId,
    dateFilterMode,
    dateFrom,
    dateTo,
  ]);

  useEffect(() => {
    if (!selectedArticleId || !/^\d+$/.test(selectedArticleId)) {
      return;
    }

    let cancelled = false;

    getComments("NOTE", Number(selectedArticleId))
      .then((comments) => {
        if (!cancelled) {
          setCommentList(
            comments.map((comment) => ({
              id: comment.id,
              author: comment.authorName ?? "알 수 없음",
              date: (comment.createdAt || "").slice(0, 16).replace("T", " "),
              text: comment.content,
            })),
          );
        }
      })
      .catch((error: unknown) => {
        console.error("정리글 댓글 조회 실패:", error);
        if (!cancelled) setCommentList([]);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedArticleId]);

  // ★ 가짜 메뉴 바깥 클릭 감지 코드는 지웠다 (공통 Header가 직접 처리한다)

  // ☆ 활동 드롭다운에서 고르면 그 활동 번호로 바꾼다 ("전체 활동"이면 null)
  const handleActivityChange = (name: string) => {
    if (name === ALL_ACTIVITIES) {
      setSelectedActivityId(null);
      return;
    }
    const found = activities.find((a) => a.name === name);
    setSelectedActivityId(found ? found.id : null);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !newComment.trim() ||
      !selectedArticleId ||
      !/^\d+$/.test(selectedArticleId)
    ) {
      return;
    }

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
          author: created.authorName ?? "알 수 없음",
          date: (created.createdAt || "").slice(0, 16).replace("T", " "),
          text: created.content,
        },
      ]);

      setNewComment("");
    } catch (error) {
      console.error("정리글 댓글 작성 실패:", error);
      // ★ alert → 토스트
      showToast(toErrorMessage(error, "댓글을 작성하지 못했습니다."));
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (!window.confirm("이 정리글을 삭제할까요?")) return;

    if (!/^\d+$/.test(articleId)) {
      // ★ alert → 토스트
      showToast("서버에 저장된 정리글 ID가 올바르지 않습니다.");
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
      // ★ 성공 안내
      showToast("정리글을 삭제했습니다.", "success");
    } catch (error) {
      console.error("정리글 삭제 실패:", error);
      // ★ alert → 토스트
      showToast(toErrorMessage(error, "정리글을 삭제하지 못했습니다."));
    }
  };

  const handleTabChange = (tab: ArchiveTab) => {
    setSelectedTab(tab);
    setSearchTerm("");
    setSelectedArticleId(null);
    setCommentList([]);
  };

  const getEmptyMessage = () => {
    if (searchTerm) return "검색 결과가 없습니다.";
    // ☆ 활동을 골랐는데 없으면 그 안내
    if (selectedActivityId !== null && selectedTab !== "feedback") {
      return "이 활동의 정리글이 없습니다.";
    }

    switch (selectedTab) {
      case "all":
        return "작성된 정리글이 없습니다.";
      case "my":
        return "내가 작성한 정리글이 없습니다.";
      case "feedback":
        return "피드백 제안이 등록된 정리글이 없습니다.";
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#f8f9fa] overflow-hidden font-pretendard">
      {/* ★ 가짜 헤더 대신 공통 헤더 (진짜 알림 · 새로 만들기 메뉴) */}
      <Header
        title="정리글 아카이브"
        subtitle={`모든 정리글은 팀 전체에 공개됩니다 · 총 ${articles.length}개`}
      />

      <div className="bg-white border-b border-gray-200 px-6 py-3 flex flex-wrap justify-between items-center gap-3 shrink-0">
        <div className="flex gap-1.5 text-xs font-semibold">
          {(["all", "my", "feedback"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabChange(tab)}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                selectedTab === tab ? "bg-black text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              }`}
            >
              {{ all: "전체", my: "내가 쓴 정리글", feedback: "피드백 제안" }[tab]}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="정리글 검색"
            aria-label="정리글 검색"
            className="w-40 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs focus:outline-none focus:border-gray-400"
          />
          <Dropdown options={activityOptions} value={selectedActivityName} onChange={handleActivityChange} />
          <select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)} aria-label="태그 필터" className="rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs">
            <option value="전체 태그">전체 태그</option>
            {tagOptions.map((tag) => <option key={tag} value={tag}>#{tag}</option>)}
          </select>
          <select value={dateFilterMode} onChange={(e) => setDateFilterMode(e.target.value as typeof dateFilterMode)} aria-label="기간 필터" className="rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs">
            <option value="all">전체 기간</option>
            <option value="before">이 날짜 이전</option>
            <option value="after">이 날짜 이후</option>
            <option value="between">기간 사이</option>
          </select>
          {dateFilterMode === "before" && <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} aria-label="기준 날짜" className="rounded-lg border border-gray-200 px-2 py-2 text-xs" />}
          {dateFilterMode === "after" && <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} aria-label="기준 날짜" className="rounded-lg border border-gray-200 px-2 py-2 text-xs" />}
          {dateFilterMode === "between" && <>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} aria-label="시작 날짜" className="rounded-lg border border-gray-200 px-2 py-2 text-xs" />
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} aria-label="종료 날짜" className="rounded-lg border border-gray-200 px-2 py-2 text-xs" />
          </>}
          <button type="button" onClick={() => navigate("/editor")} className="rounded-lg bg-black px-3.5 py-2 text-xs font-semibold text-white hover:bg-gray-800">
            정리글 작성
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden p-6 gap-5">
        <div className="w-80 bg-white rounded-2xl border border-gray-200 flex flex-col shrink-0 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-800">
              {selectedTab === "all" && "전체 정리글"}
              {selectedTab === "my" && "내가 작성한 정리글"}
              {selectedTab === "feedback" && "피드백 제안"}{" "}
              {filteredArticles.length}개
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {selectedTab === "feedback" && (
              <div className="mb-3 rounded-xl bg-purple-50 p-3">
                <p className="text-xs font-bold text-purple-900">피드백 제안</p>
                <p className="mt-1 text-[11px] text-purple-700">
                  피드백 설정이 저장된 정리글만 표시합니다.
                </p>
              </div>
            )}

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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>

                <p className="text-xs font-medium text-gray-400">
                  {getEmptyMessage()}
                </p>

                {selectedTab !== "feedback" && (
                  <button
                    onClick={() => navigate("/editor")}
                    className="mt-3 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-200"
                  >
                    + 첫 정리글 작성하기
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredArticles.map((article) => (
                  <button
                    key={article.id}
                    type="button"
                    onClick={() => setSelectedArticleId(article.id)}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      selectedArticleId === article.id
                        ? "border-black bg-gray-50"
                        : "border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className="block truncate text-xs font-bold text-gray-900">
                      {article.title}
                    </span>

                    <span className="mt-1 block text-[10px] text-gray-400">
                      {/* ☆ 활동 진짜 이름 */}
                      {activityLabel(article.activity)} · {article.round}
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
                    {/* ☆ 활동 진짜 이름 */}
                    {activityLabel(selectedArticle.activity)} ·{" "}
                    {selectedArticle.round}
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

      {/* ★ 정리글 목록·댓글·삭제 결과 토스트 */}
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </div>
  );
}