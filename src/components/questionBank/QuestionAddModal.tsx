import { useState } from "react";
import Dropdown from "../common/Dropdown";
import { CATEGORIES, MAJORS } from "../../constants/questionBank";
// ☆ 그룹 모양 (질문 목록과 같은 것)
import type { GroupOption } from "./QuestionList";

type QuestionAddModalProps = {
  // ☆ groupId: 어느 그룹에 넣을지 (서버 주소에 들어간다)
  onAdd: (data: { title: string; major: string; category: string; groupId: number }) => void;
  onClose: () => void;
  // ☆ 고를 수 있는 그룹들 / 처음에 골라져 있을 그룹 (지금 보고 있는 그룹)
  groups: GroupOption[];
  initialGroupId: number | null;
};

export default function QuestionAddModal({ onAdd, onClose, groups, initialGroupId }: QuestionAddModalProps) {
  // 처음엔 전부 비어 있음
  const [title, setTitle] = useState("");
  const [major, setMajor] = useState("");
  const [category, setCategory] = useState("");
  // ☆ 고른 그룹 이름 (지금 보고 있는 그룹 → 없으면 첫 그룹)
  const [groupName, setGroupName] = useState(
    () => groups.find((g) => g.id === initialGroupId)?.name ?? groups[0]?.name ?? ""
  );

  // ☆ 고른 그룹 이름 → 번호
  const selectedGroup = groups.find((g) => g.name === groupName);

  // 빠진 항목
  const missing = [
    title.trim() === "" ? "질문" : "",
    // ☆ 그룹도 꼭 골라야 한다
    !selectedGroup ? "그룹" : "",
    major === "" ? "전공" : "",
    category === "" ? "카테고리" : "",
  ].filter(Boolean);
  const canAdd = missing.length === 0;

  const handleAdd = () => {
    if (!selectedGroup) return;
    onAdd({ title: title.trim(), major, category, groupId: selectedGroup.id });
    onClose();
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[480px] rounded-xl bg-white">
        <div className="flex items-start justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-lg font-bold">질문 추가</h2>
            <p className="mt-1 text-xs text-neutral-400">고른 그룹에 질문이 쌓입니다</p>
          </div>
          <button type="button" onClick={onClose} className="text-xl text-neutral-400">
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
          {/* ☆ 그룹 고르기 */}
          <div>
            <p className="text-xs font-medium">
              그룹 <span className="text-red-500">*</span>
            </p>
            <div className="mt-1">
              {groups.length === 0 ? (
                <p className="rounded border border-dashed px-3 py-2 text-xs text-neutral-400">
                  질문 목록 위 "+ 그룹"으로 그룹을 먼저 만들어 주세요
                </p>
              ) : (
                <Dropdown options={groups.map((g) => g.name)} value={groupName} onChange={setGroupName} />
              )}
            </div>
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
                  type="button"
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
            type="button"
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