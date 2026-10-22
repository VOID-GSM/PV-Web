// src/components/modals/ArticleDetailModal.tsx
import { useState } from "react";

interface Article {
  id: number;
  round: string;
  title: string;
  author: string;
  date: string;
  comments: number;
  content?: string;
}

interface ArticleDetailModalProps {
  article: Article;
  onClose: () => void;
}

// 마크다운 파싱 및 렌더링 컴포넌트
function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split("\n");

  // 인라인 서식 (**강조**, *기울임*, `코드`) 파싱
  const parseInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-bold text-gray-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <em key={index} className="italic text-gray-800">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={index}
            className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded font-mono text-[11px]"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-2 text-xs text-gray-800 leading-relaxed font-pretendard">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={idx} className="text-sm font-bold text-gray-900 mt-3 mb-1">
              {parseInline(trimmed.replace(/^###\s+/, ""))}
            </h3>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h2
              key={idx}
              className="text-base font-bold text-gray-900 mt-4 mb-1 border-b border-gray-200 pb-1"
            >
              {parseInline(trimmed.replace(/^##\s+/, ""))}
            </h2>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h1
              key={idx}
              className="text-lg font-extrabold text-gray-900 mt-4 mb-2 border-b border-gray-200 pb-1"
            >
              {parseInline(trimmed.replace(/^#\s+/, ""))}
            </h1>
          );
        }
        if (trimmed.startsWith("> ")) {
          return (
            <blockquote
              key={idx}
              className="border-l-4 border-gray-300 pl-3 italic text-gray-600 my-2"
            >
              {parseInline(trimmed.replace(/^>\s+/, ""))}
            </blockquote>
          );
        }
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <li key={idx} className="list-disc ml-5 my-0.5">
              {parseInline(trimmed.replace(/^[-*]\s+/, ""))}
            </li>
          );
        }
        if (trimmed === "") {
          return <div key={idx} className="h-2" />;
        }
        return <p key={idx}>{parseInline(line)}</p>;
      })}
    </div>
  );
}

export default function ArticleDetailModal({
  article,
  onClose,
}: ArticleDetailModalProps) {
  const [commentInput, setCommentInput] = useState("");
  const [commentList, setCommentList] = useState<string[]>([]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setCommentList((prev) => [...prev, commentInput.trim()]);
    setCommentInput("");
  };

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/20 z-40 transition-opacity"
      />

      {/* 우측 사이드 슬라이드 패널 */}
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl z-50 border-l border-gray-200 flex flex-col font-pretendard">
        {/* 헤더 */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50/70">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-black text-white text-[11px] rounded font-bold">
              {article.round}
            </span>
            <span className="text-xs text-gray-500">
              작성자: {article.author} · {article.date}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 p-1.5 rounded-lg transition"
            title="닫기"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 본문 영역 */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          <h2 className="text-lg font-bold text-gray-900 leading-snug">
            {article.title}
          </h2>

          <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-200 min-h-[200px]">
            {article.content && article.content.trim() ? (
              <MarkdownRenderer content={article.content} />
            ) : (
              <span className="text-gray-400 text-xs italic">
                작성된 상세 내용이 없습니다.
              </span>
            )}
          </div>

          {/* 피드백/댓글 영역 */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
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
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
              피드백 ({commentList.length + article.comments}개)
            </h3>

            <div className="space-y-2">
              {commentList.map((c, i) => (
                <div
                  key={i}
                  className="p-2.5 bg-gray-100/80 rounded-lg text-xs text-gray-700"
                >
                  <span className="font-bold text-gray-900 mr-2">나:</span>
                  {c}
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="피드백이나 질문을 남겨보세요..."
                className="flex-1 p-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-black"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition"
              >
                등록
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
