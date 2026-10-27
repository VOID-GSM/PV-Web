// src/pages/ArticleEditorPage.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Dropdown from "../components/common/Dropdown";
import { ArrowLeftIcon } from "../components/icons/ArrowLeftIcon";
import MarkdownPreview from "../components/common/MarkdownPreview";
import {
  clearArticleDraft,
  getArticleDraft,
  getArticles,
  saveArticle,
  saveArticleDraft,
} from "../utils/articles";
import type { ArticleDraft } from "../utils/articles";
import { createPost, getPost, updatePost } from "../api/postApi";
import {
  getActivities,
  getActivitySessions,
  type ActivitySummary,
} from "../api/activityApi";

const defaultRoundOptions = ["회차 선택", "1회차", "2회차", "3회차", "4회차"];
const memberOptions = ["지정할 팀원 선택", "등록된 팀원 없음"];

export default function ArticleEditorPage() {
  const navigate = useNavigate();
  const editId = new URLSearchParams(window.location.search).get("edit");

  const [initialDraft] = useState(() => getArticleDraft());
  const [initialArticle] = useState(() =>
    editId
      ? (getArticles().find((article) => article.id === editId) ?? null)
      : null,
  );
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [title, setTitle] = useState(
    initialArticle?.title ?? initialDraft?.title ?? "",
  );
  const [activity, setActivity] = useState(
    initialArticle?.activity ?? initialDraft?.activity ?? "활동 선택",
  );
  const [round, setRound] = useState(
    initialArticle?.round ?? initialDraft?.round ?? "회차 선택",
  );
  const [content, setContent] = useState(
    initialArticle?.content ?? initialDraft?.content ?? "",
  );
  const [feedbackOption, setFeedbackOption] = useState<
    "common" | "all" | "custom" | "none"
  >(initialArticle?.feedbackOption ?? initialDraft?.feedbackOption ?? "none");
  const [selectedMember, setSelectedMember] = useState(
    initialArticle?.selectedMember ??
      initialDraft?.selectedMember ??
      "지정할 팀원 선택",
  );
  const [tags, setTags] = useState<string[]>(
    initialArticle?.tags ?? initialDraft?.tags ?? [],
  );
  const [tagInput, setTagInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [apiActivities, setApiActivities] = useState<ActivitySummary[]>([]);
  const [availableRounds, setAvailableRounds] =
    useState<string[]>(defaultRoundOptions);
  const [sessionIdByRound, setSessionIdByRound] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    let cancelled = false;
    getActivities()
      .then((activities) => {
        if (!cancelled) setApiActivities(activities);
      })
      .catch((error: unknown) => console.error("활동 목록 조회 실패:", error));
    return () => {
      cancelled = true;
    };
  }, []);

  const handleActivityChange = async (name: string) => {
    setActivity(name);
    setRound("회차 선택");
    setAvailableRounds(defaultRoundOptions);
    setSessionIdByRound({});
    const selected = apiActivities.find((item) => item.name === name);
    if (!selected) return;
    try {
      const sessions = await getActivitySessions(selected.id);
      const labels = sessions.map((session) => `${session.sessionNo}회차`);
      setAvailableRounds(["회차 선택", ...labels]);
      setSessionIdByRound(
        Object.fromEntries(
          sessions.map((session) => [`${session.sessionNo}회차`, session.id]),
        ),
      );
    } catch (error) {
      console.error("활동 회차 조회 실패:", error);
      alert(
        error instanceof Error
          ? error.message
          : "활동 회차를 불러오지 못했습니다.",
      );
    }
  };

  useEffect(() => {
    if (!editId || !/^\\d+$/.test(editId)) return;
    let cancelled = false;
    getPost(Number(editId))
      .then(async (post) => {
        if (cancelled) return;
        setTitle(post.title);
        setContent(post.content);
        if (post.activityId) {
          const activities = await getActivities();
          const matchedActivity = activities.find(
            (item) => item.id === post.activityId,
          );
          if (matchedActivity) {
            setActivity(matchedActivity.name);
            const sessions = await getActivitySessions(matchedActivity.id);
            setAvailableRounds([
              "회차 선택",
              ...sessions.map((session) => `${session.sessionNo}회차`),
            ]);
            setSessionIdByRound(
              Object.fromEntries(
                sessions.map((session) => [
                  `${session.sessionNo}회차`,
                  session.id,
                ]),
              ),
            );
            const matchedSession = sessions.find(
              (session) => session.id === post.sessionId,
            );
            if (matchedSession) setRound(`${matchedSession.sessionNo}회차`);
          }
        }
      })
      .catch((error: unknown) => {
        console.error("정리글 조회 실패:", error);
        if (!cancelled)
          alert(
            error instanceof Error
              ? error.message
              : "수정할 정리글을 불러오지 못했습니다.",
          );
      });
    return () => {
      cancelled = true;
    };
  }, [editId]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const currentDraft: ArticleDraft = {
    title,
    activity,
    round,
    content,
    tags,
    feedbackOption,
    selectedMember,
  };

  const handleSaveDraft = () => {
    saveArticleDraft(currentDraft);
    alert("임시 저장했습니다. 이 브라우저에서 다시 이어 쓸 수 있어요.");
  };

  const applyMarkdown = (before: string, after = before, linePrefix = "") => {
    const textarea = contentRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end);
    let replacement;
    let selectionStart = start;
    let selectionEnd = start;

    if (linePrefix) {
      const lineStart = content.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
      const lineEndFound = content.indexOf("\n", end);
      const lineEnd = lineEndFound === -1 ? content.length : lineEndFound;
      const lines = content.slice(lineStart, lineEnd);
      replacement = lines
        .split("\n")
        .map((line) => `${linePrefix}${line}`)
        .join("\n");
      setContent(
        content.slice(0, lineStart) + replacement + content.slice(lineEnd),
      );
      selectionStart = lineStart;
      selectionEnd = lineStart + replacement.length;
    } else {
      replacement = `${before}${selected || "텍스트"}${after}`;
      setContent(content.slice(0, start) + replacement + content.slice(end));
      selectionStart = start + before.length;
      selectionEnd = selectionStart + (selected || "텍스트").length;
    }
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(selectionStart, selectionEnd);
    });
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      alert("본문을 입력해주세요.");
      return;
    }
    if (isSaving) return;
    setIsSaving(true);
    try {
      const response =
        editId && /^\\d+$/.test(editId)
          ? await updatePost(Number(editId), { title: title.trim(), content })
          : await createPost({
              title: title.trim(),
              content,
              sessionId: sessionIdByRound[round],
            });
      saveArticle({
        id: String(response.id),
        title: response.title,
        activity,
        round,
        tags,
        date: (
          response.createdAt || new Date().toLocaleDateString("sv-SE")
        ).slice(0, 10),
        author: String(response.authorId),
        commentsCount: initialArticle?.commentsCount ?? 0,
        content: response.content,
        feedbackOption,
        selectedMember,
      });
      clearArticleDraft();
      alert(editId ? "정리글을 수정했습니다." : "정리글을 발행했습니다.");
      navigate("/archive");
    } catch (error) {
      console.error("정리글 저장 실패:", error);
      alert(
        error instanceof Error
          ? error.message
          : "정리글을 저장하지 못했습니다.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#f8f9fa] overflow-hidden font-pretendard">
      {/* 상단 네비게이션 헤더 */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/archive")}
            className="text-xs font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1 transition"
          >
            <ArrowLeftIcon />
            <span>아카이브로</span>
          </button>
          <div className="h-4 w-px bg-gray-200" />

          <Dropdown
            options={["활동 선택", ...apiActivities.map((item) => item.name)]}
            value={activity}
            onChange={handleActivityChange}
          />
          <Dropdown
            options={availableRounds}
            value={round}
            onChange={setRound}
          />

          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-bold rounded">
            팀 전체 공개 (고정)
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition flex items-center gap-1.5"
          >
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
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span>미리보기</span>
          </button>
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 transition"
          >
            임시 저장
          </button>
          <button
            onClick={handlePublish}
            className="px-4 py-1.5 bg-black text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition flex items-center gap-1.5"
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
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            <span>발행하기</span>
          </button>
        </div>
      </header>

      {/* 에디터 메인 컨텐츠 영역 */}
      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* 에디터 창 */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                className="w-full text-base font-extrabold text-gray-900 focus:outline-none"
              />
            </div>

            {/* 마크다운 툴바 */}
            <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/60 flex justify-between items-center text-xs text-gray-600">
              <div className="flex items-center gap-2 font-bold">
                <button
                  type="button"
                  onClick={() => applyMarkdown("# ", "", "# ")}
                  className="p-1 hover:bg-gray-200 rounded text-xs"
                >
                  H1
                </button>
                <button
                  type="button"
                  onClick={() => applyMarkdown("## ", "", "## ")}
                  className="p-1 hover:bg-gray-200 rounded text-xs"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => applyMarkdown("**", "**")}
                  className="p-1 hover:bg-gray-200 rounded font-serif italic text-xs"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => applyMarkdown("*", "*")}
                  className="p-1 hover:bg-gray-200 rounded text-xs"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const url = window.prompt(
                      "링크 주소를 입력하세요 (https://로 시작)",
                    );
                    if (url && /^https?:\/\//i.test(url))
                      applyMarkdown("[", `](${url})`);
                    else if (url)
                      alert("http:// 또는 https:// 주소를 입력해주세요.");
                  }}
                  className="p-1 hover:bg-gray-200 rounded text-xs"
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
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const url = window.prompt(
                      "이미지 주소를 입력하세요 (https://로 시작)",
                    );
                    if (url && /^https?:\/\//i.test(url))
                      applyMarkdown("![", `](${url})`);
                    else if (url)
                      alert("http:// 또는 https:// 주소를 입력해주세요.");
                  }}
                  className="p-1 hover:bg-gray-200 rounded text-xs"
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
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>
              <span className="text-[10px] text-gray-400 font-mono">
                Markdown
              </span>
            </div>

            <textarea
              ref={contentRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 작성하세요 (마크다운 지원)"
              className="flex-1 p-5 text-xs font-mono text-gray-800 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* 실시간 미리보기 창 */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden shadow-sm">
            <div className="p-3.5 border-b border-gray-100 bg-gray-50/60 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-700">미리보기</span>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 font-bold rounded text-[10px]">
                실시간
              </span>
            </div>
            <div className="flex-1 p-5 overflow-y-auto space-y-3">
              {title ? (
                <h1 className="text-lg font-extrabold text-gray-900">
                  {title}
                </h1>
              ) : (
                <p className="text-xs text-gray-300 italic">
                  제목이 표시됩니다.
                </p>
              )}
              {content ? (
                <MarkdownPreview
                  content={content}
                  className="text-xs font-pretendard"
                />
              ) : (
                <p className="text-xs text-gray-300 italic">
                  작성한 본문 내용이 실시간으로 미리보기됩니다.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 우측 피드백 및 옵션 설정 패널 */}
        <div className="w-80 bg-white rounded-2xl border border-gray-200 p-5 flex flex-col justify-between shrink-0 shadow-sm overflow-y-auto space-y-5">
          <div className="space-y-5">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-900">피드백 요청</h3>
              <p className="text-[11px] text-gray-400 leading-snug">
                발행과 동시에 알림이 발송되고, 지정한 팀원이 내 글을 함께
                검토합니다.
              </p>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2.5 p-2.5 border rounded-xl text-xs font-semibold cursor-pointer hover:bg-gray-50 transition border-gray-200">
                  <input
                    type="radio"
                    name="feedback"
                    checked={feedbackOption === "common"}
                    onChange={() => setFeedbackOption("common")}
                    className="accent-black"
                  />
                  <span>공통 전공 팀원</span>
                </label>

                <label className="flex items-center gap-2.5 p-2.5 border rounded-xl text-xs font-semibold cursor-pointer hover:bg-gray-50 transition border-gray-200">
                  <input
                    type="radio"
                    name="feedback"
                    checked={feedbackOption === "all"}
                    onChange={() => setFeedbackOption("all")}
                    className="accent-black"
                  />
                  <span>팀원 전체</span>
                </label>

                {/* 특정 팀원 지정 라디오 + 서브 지정 드롭다운 UI */}
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-2.5 p-2.5 border rounded-xl text-xs font-semibold cursor-pointer transition ${
                      feedbackOption === "custom"
                        ? "border-black bg-gray-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="feedback"
                      checked={feedbackOption === "custom"}
                      onChange={() => setFeedbackOption("custom")}
                      className="accent-black"
                    />
                    <span>특정 팀원 지정</span>
                  </label>

                  {/* 특정 팀원 지정 선택 시 아래에 동적 노출되는 UI */}
                  {feedbackOption === "custom" && (
                    <div className="pl-3 pr-1 pt-1 space-y-1.5 animate-in fade-in duration-150">
                      <Dropdown
                        options={memberOptions}
                        value={selectedMember}
                        onChange={setSelectedMember}
                      />
                      <p className="text-[10px] text-gray-400 pl-1">
                        * 등록된 팀원이 없을 경우 지정할 수 없습니다.
                      </p>
                    </div>
                  )}
                </div>

                <label className="flex items-center gap-2.5 p-2.5 border rounded-xl text-xs font-semibold cursor-pointer border-black bg-gray-50 transition">
                  <input
                    type="radio"
                    name="feedback"
                    checked={feedbackOption === "none"}
                    onChange={() => setFeedbackOption("none")}
                    className="accent-black"
                  />
                  <span>요청하지 않음</span>
                </label>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100">
              <h3 className="text-xs font-bold text-gray-900">태그</h3>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-[11px] font-semibold rounded-md flex items-center gap-1"
                  >
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5 pt-1">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="태그 입력"
                  className="flex-1 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-black"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition"
                >
                  + 추가
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-gray-100">
            <div className="p-3 bg-amber-50 rounded-xl text-[11px] text-amber-800 leading-snug flex items-start gap-1.5">
              <svg
                className="w-4 h-4 text-amber-600 shrink-0 mt-0.5"
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
              <span>
                모든 정리글은 팀 전체에 공개됩니다. 내용이 정제되었는지 확인해
                주세요.
              </span>
            </div>

            <button
              onClick={handlePublish}
              className="w-full py-2.5 bg-black text-white font-bold text-xs rounded-xl hover:bg-gray-800 transition flex items-center justify-center gap-1.5"
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
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              <span>발행하기</span>
            </button>
          </div>
        </div>
      </div>
      {showPreviewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="정리글 미리보기"
        >
          <div className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-bold text-gray-900">
                발행 전 미리보기
              </h2>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="rounded-lg px-2 py-1 text-gray-500 hover:bg-gray-100"
                aria-label="미리보기 닫기"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-6">
              <h1 className="mb-5 text-2xl font-extrabold text-gray-900">
                {title || "제목이 표시됩니다."}
              </h1>
              <MarkdownPreview content={content} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
