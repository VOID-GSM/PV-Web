import { useState } from "react";
import Dropdown from "../common/Dropdown";
import { CATEGORIES, MAJORS } from "../../constants/questionBank";

type QuestionAddModalProps = {
  onAdd: (data: { title: string; major: string; category: string }) => void;
  onClose: () => void;
};

export default function QuestionAddModal({ onAdd, onClose }: QuestionAddModalProps) {
  // 처음엔 전부 비어 있음
  const [title, setTitle] = useState("");
  const [major, setMajor] = useState("");
  const [category, setCategory] = useState("");

  // 빠진 항목
  const missing = [
    title.trim() === "" ? "질문" : "",
    major === "" ? "전공" : "",
    category === "" ? "카테고리" : "",
  ].filter(Boolean);
  const canAdd = missing.length === 0;

  const handleAdd = () => {
    onAdd({ title: title.trim(), major, category });
    onClose();
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[480px] rounded-xl bg-white">
        <div className="flex items-start justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-lg font-bold">질문 추가</h2>
            <p className="mt-1 text-xs text-neutral-400">이번 주 공통 질문으로 질문 뱅크에 쌓입니다</p>
          </div>
          <button onClick={onClose} className="text-xl text-neutral-400">
            ×
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          <div>
            <p className="text-xs font-medium">
              질문 <span className="text-red-500">*</span>
            </p>
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              rows={2}
              maxLength={200}
              placeholder="예) 가상 DOM은 왜 필요한가요?"
              className="mt-1 w-full resize-none rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <p className="text-xs font-medium">
              전공 <span className="text-red-500">*</span>
            </p>
            <div className="mt-1">
              <Dropdown options={MAJORS} value={major} onChange={setMajor} />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium">
              카테고리 <span className="text-red-500">*</span>
            </p>
            <div className="mt-2 flex gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setCategory(c.name)}
                  className={`rounded-full border px-4 py-1.5 text-sm ${
                    category === c.name ? "border-black font-semibold" : "border-neutral-200 text-neutral-500"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t px-6 py-4">
          {canAdd ? (
            <p className="text-xs text-neutral-400">추가한 질문은 모든 팀원에게 보입니다</p>
          ) : (
            <p className="text-xs text-red-500">{missing.join(", ")}을(를) 입력해 주세요</p>
          )}
          <button
            onClick={handleAdd}
            disabled={!canAdd}
            className="shrink-0 rounded bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            추가하기
          </button>
        </div>
      </div>
    </div>
  );
}