// src/components/modals/ArticleDetailModal.tsx
import React, { useState } from "react";

export interface ArticleDetailData {
  id: string;
  session: string;
  author: string;
  date: string;
  title: string;
  content: string;
  feedbacks: { id: string; author: string; text: string; date: string }[];
}

interface ArticleDetailModalProps {
  article: ArticleDetailData | null;
  onClose: () => void;
  onAddFeedback?: (articleId: string, feedbackText: string) => void;
}

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({
  article,
  onClose,
  onAddFeedback,
}) => {
  const [feedbackText, setFeedbackText] = useState("");

  if (!article) return null;

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedbackText.trim() && onAddFeedback) {
      onAddFeedback(article.id, feedbackText);
      setFeedbackText("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 font-pretendard select-none animate-in fade-in duration-150">
      <div className="w-full max-w-[480px] h-full bg-white shadow-2xl flex flex-col justify-between p-6 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600">
                {article.session}
              </span>
              <span className="text-xs text-gray-400">
                작성자: {article.author} · {article.date}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Article Title & Content */}
          <div className="mt-4 space-y-3">
            <h2 className="text-lg font-extrabold text-gray-900">
              {article.title}
            </h2>
            <div className="rounded-2xl bg-gray-50/70 p-4 text-xs text-gray-700 leading-relaxed min-h-[140px] whitespace-pre-wrap">
              {article.content}
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="mt-6 border-t border-gray-100 pt-4 flex-1 flex flex-col justify-between overflow-hidden">
          <div>
            <h3 className="text-xs font-bold text-gray-800 mb-2">
              💬 피드백 ({article.feedbacks.length}개)
            </h3>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {article.feedbacks.length === 0 ? (
                <p className="text-center text-[11px] text-gray-400 py-6">
                  등록된 피드백이 없습니다.
                </p>
              ) : (
                article.feedbacks.map((fb) => (
                  <div
                    key={fb.id}
                    className="rounded-xl bg-gray-50 p-3 text-xs space-y-1"
                  >
                    <div className="flex justify-between items-center text-[10px] text-gray-400 font-semibold">
                      <span className="text-gray-800">{fb.author}</span>
                      <span>{fb.date}</span>
                    </div>
                    <p className="text-gray-700 leading-normal">{fb.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleFeedbackSubmit}
            className="flex items-center gap-2 pt-3"
          >
            <input
              type="text"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="피드백이나 질문을 남겨주세요..."
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-black"
            />
            <button
              type="submit"
              className="rounded-xl bg-black px-4 py-2 text-xs font-bold text-white hover:bg-gray-800 transition cursor-pointer"
            >
              등록
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetailModal;
