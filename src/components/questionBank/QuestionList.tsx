import { useState } from "react";
import { getCategoryBadge, type Answer, type Question } from "../../constants/questionBank";
// ☆ 그룹 삭제 확인 창
import ConfirmModal from "../common/ConfirmModal";

// ☆ 그룹 하나 (페이지가 서버 그룹을 넘겨준다)
export type GroupOption = { id: number; name: string };

type QuestionListProps = {
  questions: Question[];
  answers: Answer[];
  // 내 이름 (가짜 ME 대신. "내 답변 있음" 표시에 사용)
  myName: string;
  // 선택된 질문 번호 (null이면 선택 안 됨)
  selectedId: number | null;
  onSelect: (id: number) => void;
  // ☆ 그룹들과 그룹마다 질문 수 (전공·카테고리 필터를 적용한 개수)
  groups: GroupOption[];
  groupCounts: Record<number, number>;
  // ☆ 고른 그룹 (null이면 전체)
  selectedGroupId: number | null;
  onSelectGroup: (groupId: number | null) => void;
  // ☆ 그룹 만들기 / 이름 바꾸기 / 지우기
  onCreateGroup: (name: string) => void;
  onRenameGroup: (groupId: number, name: string) => void;
  onDeleteGroup: (groupId: number) => void;
};

// 그룹 이름 최대 글자 수
const MAX_GROUP_NAME = 30;

export default function QuestionList({
  questions,
  answers,
  myName,
  selectedId,
  onSelect,
  groups,
  groupCounts,
  selectedGroupId,
  onSelectGroup,
  onCreateGroup,
  onRenameGroup,
  onDeleteGroup,
}: QuestionListProps) {
  // ☆ 새 그룹 입력칸이 열려 있는지 / 입력한 이름
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  // ☆ 이름 바꾸는 중인지 / 바꿀 이름
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameText, setRenameText] = useState("");
  // ☆ 삭제 확인 창이 열려 있는지
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) ?? null;

  // ☆ 새 그룹 저장 (빈 이름은 무시)
  const submitCreate = () => {
    const name = newName.trim();
    if (name !== "") onCreateGroup(name);
    setNewName("");
    setIsCreating(false);
  };

  // ☆ 이름 바꾸기 저장 (그대로거나 비었으면 그냥 닫기)
  const submitRename = () => {
    const name = renameText.trim();
    if (selectedGroup && name !== "" && name !== selectedGroup.name) {
      onRenameGroup(selectedGroup.id, name);
    }
    setIsRenaming(false);
  };

  // ☆ 칩 하나 모양 (고른 칩은 검은 배경)
  const chipClass = (active: boolean) =>
    `shrink-0 rounded-full border px-2.5 py-1 text-[11px] ${
      active ? "border-black bg-black text-white" : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
    }`;

  // ☆ 전체 질문 수 (그룹 칩 숫자를 모두 더한 것)
  const totalCount = Object.values(groupCounts).reduce((sum, n) => sum + n, 0);

  return (
    <section className="rounded-lg bg-white">
      {/* ☆ 그룹 칩 줄 */}
      <div className="border-b px-4 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button type="button" onClick={() => onSelectGroup(null)} className={chipClass(selectedGroupId === null)}>
            전체 {totalCount}
          </button>
          {groups.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => {
                onSelectGroup(g.id);
                setIsRenaming(false);
              }}
              className={chipClass(selectedGroupId === g.id)}
            >
              {g.name} {groupCounts[g.id] ?? 0}
            </button>
          ))}
          {!isCreating && (
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="shrink-0 rounded-full border border-dashed border-neutral-300 px-2.5 py-1 text-[11px] text-neutral-500 hover:bg-neutral-50"
            >
              + 그룹
            </button>
          )}
        </div>

        {/* ☆ 새 그룹 이름 입력 */}
        {isCreating && (
          <div className="mt-2 flex gap-1.5">
            <input
              autoFocus
              value={newName}
              maxLength={MAX_GROUP_NAME}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                // Enter로 저장, Esc로 취소 (한글 조합 중에는 무시)
                if (e.key === "Enter" && !e.nativeEvent.isComposing) submitCreate();
                if (e.key === "Escape") setIsCreating(false);
              }}
              placeholder="새 그룹 이름 (예: React)"
              className="min-w-0 flex-1 rounded border px-2 py-1 text-xs"
            />
            <button type="button" onClick={submitCreate} className="shrink-0 rounded bg-black px-2.5 text-[11px] text-white">
              추가
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setNewName("");
              }}
              className="shrink-0 px-1.5 text-[11px] text-neutral-500"
            >
              취소
            </button>
          </div>
        )}

        {/* ☆ 고른 그룹 관리 (이름 바꾸기 · 삭제) */}
        {selectedGroup &&
          (isRenaming ? (
            <div className="mt-2 flex gap-1.5">
              <input
                autoFocus
                value={renameText}
                maxLength={MAX_GROUP_NAME}
                onChange={(e) => setRenameText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) submitRename();
                  if (e.key === "Escape") setIsRenaming(false);
                }}
                className="min-w-0 flex-1 rounded border px-2 py-1 text-xs"
              />
              <button type="button" onClick={submitRename} className="shrink-0 rounded bg-black px-2.5 text-[11px] text-white">
                저장
              </button>
              <button
                type="button"
                onClick={() => setIsRenaming(false)}
                className="shrink-0 px-1.5 text-[11px] text-neutral-500"
              >
                취소
              </button>
            </div>
          ) : (
            <div className="mt-2 flex items-center gap-3 text-[11px] text-neutral-500">
              <span className="font-semibold text-neutral-700">{selectedGroup.name}</span>
              <button
                type="button"
                onClick={() => {
                  setRenameText(selectedGroup.name);
                  setIsRenaming(true);
                }}
                className="hover:text-black"
              >
                이름 바꾸기
              </button>
              <button type="button" onClick={() => setIsDeleteOpen(true)} className="text-red-500 hover:text-red-600">
                삭제
              </button>
            </div>
          ))}
      </div>

      <div className="flex items-center justify-between border-b px-4 py-3">
        <p className="text-xs font-semibold text-neutral-500">
          {/* ☆ 고른 그룹 이름 */}
          {selectedGroup ? `${selectedGroup.name} 질문` : "질문 목록"}
        </p>
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px]">{questions.length}개</span>
      </div>

      {questions.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <p className="text-sm text-neutral-500">등록된 질문이 없습니다</p>
          <p className="mt-1 text-xs text-neutral-400">'질문 추가'로 첫 질문을 등록해 보세요</p>
        </div>
      ) : (
        <ul>
          {questions.map((q) => {
            // 이 질문에 달린 답변 수, 그중 내 답변이 있는지
            const questionAnswers = answers.filter((a) => a.questionId === q.id);
            // 내 이름이 비어 있으면(아직 못 불러옴) "내 답변 있음"을 띄우지 않는다
            const hasMine = myName !== "" && questionAnswers.some((a) => a.author === myName);
            return (
              <li key={q.id} className="border-b last:border-b-0">
                <button
                  type="button"
                  onClick={() => onSelect(q.id)}
                  // 선택된 질문은 회색 배경
                  className={`w-full px-4 py-3 text-left ${
                    selectedId === q.id ? "bg-neutral-100" : "hover:bg-neutral-50"
                  }`}
                >
                  <p className="text-sm font-medium">{q.title}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`rounded px-1.5 py-0.5 text-[11px] ${getCategoryBadge(q.category)}`}>
                      {q.category}
                    </span>
                    <span className="text-[11px] text-neutral-400">답변 {questionAnswers.length}개</span>
                    {hasMine && <span className="ml-auto text-[11px] text-green-600">내 답변 있음</span>}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* ☆ 그룹 삭제 확인 창 */}
      {isDeleteOpen && selectedGroup && (
        <ConfirmModal
          title={`'${selectedGroup.name}' 그룹을 삭제할까요?`}
          message="삭제하면 되돌릴 수 없습니다. 그룹 안의 질문이 어떻게 되는지는 서버 규칙을 따릅니다."
          confirmLabel="삭제"
          danger
          onConfirm={() => {
            onDeleteGroup(selectedGroup.id);
            setIsDeleteOpen(false);
          }}
          onCancel={() => setIsDeleteOpen(false)}
        />
      )}
    </section>
  );
}