import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Dropdown from "../components/common/Dropdown";
import { ACTIVITY_OPTIONS } from "../constants/activity";

const roundOptions = ["회차 선택", "1회차", "2회차", "3회차", "4회차"];
const memberOptions = ["지정할 팀원 선택", "등록된 팀원 없음"];

type FeedbackOption = "common" | "all" | "custom" | "none";

export default function ArticleEditorPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [activity, setActivity] = useState("활동 선택");
  const [round, setRound] = useState("회차 선택");
  const [content, setContent] = useState("");
  const [feedbackOption, setFeedbackOption] = useState<FeedbackOption>("none");
  const [selectedMember, setSelectedMember] = useState("지정할 팀원 선택");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = () => {
    const newTag = tagInput.trim();

    if (newTag && !tags.includes(newTag)) {
      setTags((previous) => [...previous, newTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((previous) => previous.filter((tag) => tag !== tagToRemove));
  };

  const handlePublish = () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    alert("정리글이 발행되었습니다.");
    navigate("/archive");
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#f8f9fa] font-pretendard">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/archive")}
            className="flex items-center gap-1 text-xs font-semibold text-gray-500 transition hover:text-gray-900"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            아카이브로
          </button>

          <div className="h-5 w-px bg-gray-200" />

          <Dropdown
            options={[...ACTIVITY_OPTIONS]}
            value={activity}
            onChange={setActivity}
          />

          <Dropdown options={roundOptions} value={round} onChange={setRound} />

          <span className="rounded bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-600">
            팀 전체 공개
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => alert("임시 저장 기능은 아직 연결되지 않았습니다.")}
            className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            임시 저장
          </button>
          <button
            type="button"
            onClick={handlePublish}
            className="rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800"
          >
            발행하기
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-5 lg:flex-row">
        <section className="flex min-h-[420px] min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-4">
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="제목을 입력하세요"
              className="w-full text-base font-extrabold text-gray-900 outline-none"
            />
          </div>

          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/60 px-4 py-3">
            <span className="text-xs font-bold text-gray-600">본문 작성</span>
            <span className="font-mono text-[10px] text-gray-400">
              Markdown
            </span>
          </div>

          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="배운 내용을 작성하세요."
            className="min-h-[300px] flex-1 resize-none p-5 text-sm leading-relaxed text-gray-800 outline-none"
          />
        </section>

        <section className="flex w-full shrink-0 flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:w-80">
          <div>
            <h2 className="text-sm font-bold text-gray-900">피드백 요청</h2>
            <p className="mt-1 text-xs leading-5 text-gray-400">
              글을 함께 검토할 팀원을 선택할 수 있습니다.
            </p>
          </div>

          <div className="space-y-2">
            {(
              [
                ["common", "공통 전공 팀원"],
                ["all", "팀원 전체"],
                ["custom", "특정 팀원 지정"],
                ["none", "요청하지 않음"],
              ] as [FeedbackOption, string][]
            ).map(([value, label]) => (
              <label
                key={value}
                className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-xs font-semibold transition ${
                  feedbackOption === value
                    ? "border-black bg-gray-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="feedback"
                  value={value}
                  checked={feedbackOption === value}
                  onChange={() => setFeedbackOption(value)}
                  className="accent-black"
                />
                {label}
              </label>
            ))}
          </div>

          {feedbackOption === "custom" && (
            <Dropdown
              options={memberOptions}
              value={selectedMember}
              onChange={setSelectedMember}
            />
          )}

          <div className="border-t border-gray-100 pt-4">
            <h2 className="text-sm font-bold text-gray-900">태그</h2>

            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    aria-label={`${tag} 태그 삭제`}
                    className="text-gray-400 hover:text-gray-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="태그 입력"
                className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-gray-400"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200"
              >
                추가
              </button>
            </div>
          </div>

          <div className="mt-auto rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
            발행하기 전에 제목과 본문을 확인해주세요.
          </div>

          <button
            type="button"
            onClick={handlePublish}
            className="w-full rounded-xl bg-black py-3 text-xs font-bold text-white transition hover:bg-gray-800"
          >
            발행하기
          </button>
        </section>
      </div>
    </div>
  );
}
