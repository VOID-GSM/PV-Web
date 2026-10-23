// src/components/modals/CreateArticleModal.tsx
import { useState } from "react";
import Dropdown from "../common/Dropdown";

interface CreateArticleModalProps {
  onClose: () => void;
  onSubmit: (article: {
    round: string;
    title: string;
    content: string;
  }) => void;
}

function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split("\n");

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
            className="bg-gray-200 text-red-600 px-1.5 py-0.5 rounded font-mono text-[11px]"
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

export default function CreateArticleModal({
  onClose,
  onSubmit,
}: CreateArticleModalProps) {
  const [round, setRound] = useState("1회차");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  const insertFormatting = (prefix: string, suffix: string = "") => {
    setContent((prev) => prev + `${prefix}텍스트${suffix}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("제목을 입력해 주세요.");
      return;
    }
    onSubmit({ round, title, content });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-pretendard">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-bold text-gray-900">정리글 작성하기</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-1"
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

        <form
          onSubmit={handleSubmit}
          className="p-6 flex-1 flex flex-col overflow-y-auto space-y-4"
        >
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                회차 선택
              </label>
              <Dropdown
                options={["1회차", "2회차", "3회차", "4회차", "5회차"]}
                value={round}
                onChange={setRound}
              />
            </div>
            <div className="col-span-3">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                정리글 제목
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력해 주세요."
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="border border-gray-300 rounded-xl overflow-hidden flex-1 flex flex-col bg-white">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/70 px-3 py-1.5">
              <div className="flex text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActiveTab("write")}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    activeTab === "write"
                      ? "bg-white text-gray-900 font-semibold shadow-sm border border-gray-200"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    activeTab === "preview"
                      ? "bg-white text-gray-900 font-semibold shadow-sm border border-gray-200"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Preview
                </button>
              </div>

              {activeTab === "write" && (
                <div className="flex items-center gap-1 text-gray-600 text-xs">
                  <button
                    type="button"
                    onClick={() => insertFormatting("# ")}
                    className="p-1.5 hover:bg-gray-200 rounded font-bold"
                    title="Heading"
                  >
                    H
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("**", "**")}
                    className="p-1.5 hover:bg-gray-200 rounded font-bold"
                    title="Bold"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("*", "*")}
                    className="p-1.5 hover:bg-gray-200 rounded italic font-serif"
                    title="Italic"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("> ")}
                    className="p-1.5 hover:bg-gray-200 rounded"
                    title="Quote"
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
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("`", "`")}
                    className="p-1.5 hover:bg-gray-200 rounded font-mono"
                    title="Code"
                  >
                    {"< >"}
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("[", "](url)")}
                    className="p-1.5 hover:bg-gray-200 rounded"
                    title="Link"
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
                </div>
              )}
            </div>

            {activeTab === "write" ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="학습한 내용을 자유롭게 작성해 보세요. (마크다운 형식을 지원합니다)"
                className="w-full h-64 p-4 text-xs font-mono focus:outline-none resize-none"
              />
            ) : (
              <div className="w-full h-64 p-4 text-xs overflow-y-auto bg-gray-50/50">
                {content.trim() ? (
                  <MarkdownRenderer content={content} />
                ) : (
                  <span className="text-gray-400 italic">
                    작성된 내용이 없습니다.
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-black text-white rounded-xl text-xs font-semibold hover:bg-gray-800 transition"
            >
              작성 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
