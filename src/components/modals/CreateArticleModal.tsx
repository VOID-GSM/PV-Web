// src/components/modals/CreateArticleModal.tsx
import React, { useState } from "react";

// mode 타입에 "journal", "interview" 추가
export type ArticleModalMode =
  | "article"
  | "assignment"
  | "journal"
  | "interview";

interface CreateArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: ArticleModalMode;
  onSubmitSuccess?: (data: {
    session: string;
    title: string;
    content: string;
    mode: ArticleModalMode;
  }) => void;
}

const sessionOptions = [
  "1회차 · React 기본 개념 및 컴포넌트",
  "2회차 · 컴포넌트 설계와 합성 패턴",
  "3회차 · 비동기 상태와 React Query 기본",
  "4회차 · React 렌더링 최적화와 메모이제이션",
  "5회차 · 상태관리 라이브러리 비교",
];

export const CreateArticleModal: React.FC<CreateArticleModalProps> = ({
  isOpen,
  onClose,
  mode = "article",
  onSubmitSuccess,
}) => {
  const [session, setSession] = useState(sessionOptions[0]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [activeTab, setActiveTab] = useState<"Write" | "Preview">("Write");

  // 렌더링 단계 폼 초기화 (ESLint 에러 방지)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setSession(sessionOptions[0]);
      setTitle("");
      setContent("");
      setActiveTab("Write");
    }
  }

  if (!isOpen) return null;

  // 모드별 타이틀 및 Placeholder 설정
  const getModalMeta = () => {
    switch (mode) {
      case "assignment":
        return {
          headerTitle: "과제 출제하기",
          titlePlaceholder: "과제 제목을 입력해 주세요",
          contentPlaceholder: "과제 내용 및 제출 가이드를 작성해 주세요",
          submitButtonText: "과제 출제하기",
        };
      case "journal":
        return {
          headerTitle: "업무일지 작성하기",
          titlePlaceholder: "오늘의 업무 일지 제목을 입력해 주세요",
          contentPlaceholder: "오늘 진행한 업무 내용 및 회고를 작성해 주세요",
          submitButtonText: "업무일지 저장",
        };
      case "interview":
        return {
          headerTitle: "면접 답변 남기기",
          titlePlaceholder: "면접 질문 또는 주제를 입력해 주세요",
          contentPlaceholder:
            "질문에 대한 내 답변과 핵심 키워드를 작성해 주세요",
          submitButtonText: "답변 남기기",
        };
      case "article":
      default:
        return {
          headerTitle: "정리글 작성하기",
          titlePlaceholder: "제목을 입력해 주세요",
          contentPlaceholder:
            "학습한 내용을 자유롭게 정리해 주세요 (마크다운 지원)",
          submitButtonText: "작성 완료",
        };
    }
  };

  const meta = getModalMeta();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmitSuccess && title.trim()) {
      onSubmitSuccess({
        session,
        title,
        content,
        mode,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-pretendard select-none">
      <div className="relative w-full max-w-[640px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {meta.headerTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
          {/* 회차 선택 & 제목 */}
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-4">
              <label className="block font-bold text-gray-700 mb-1.5">
                회차 선택
              </label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-3 font-semibold outline-none focus:border-black bg-white"
              >
                {sessionOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt.split(" · ")[0]}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-8">
              <label className="block font-bold text-gray-700 mb-1.5">
                제목
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={meta.titlePlaceholder}
                className="w-full rounded-xl border border-gray-300 p-3 font-semibold outline-none focus:border-black"
              />
            </div>
          </div>

          {/* 에디터 탭 (Write / Preview) */}
          <div>
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <div className="flex gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab("Write")}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    activeTab === "Write"
                      ? "bg-black text-white"
                      : "text-gray-400 hover:text-gray-700"
                  }`}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("Preview")}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    activeTab === "Preview"
                      ? "bg-black text-white"
                      : "text-gray-400 hover:text-gray-700"
                  }`}
                >
                  Preview
                </button>
              </div>

              {/* 간단 툴바 안내 */}
              <span className="text-[10px] text-gray-400 font-medium">
                H1 B I Quotes Code Link 지원
              </span>
            </div>

            <div className="mt-2">
              {activeTab === "Write" ? (
                <textarea
                  rows={10}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={meta.contentPlaceholder}
                  className="w-full rounded-2xl border border-gray-200 p-4 text-xs outline-none focus:border-black leading-relaxed"
                />
              ) : (
                <div className="min-h-[220px] rounded-2xl border border-gray-100 bg-gray-50/60 p-4 text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {content.trim() ? content : "작성된 내용이 없습니다."}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 pt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-5 py-2.5 font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="rounded-xl bg-black px-6 py-2.5 font-bold text-white hover:bg-gray-800 transition cursor-pointer"
            >
              {meta.submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateArticleModal;
