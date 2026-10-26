import { useState } from "react";
import { BOARDS, TEMPLATES, type NewWorklog } from "../../constants/worklog";

// 작성 창에서는 "자유 형식"까지 4개
const MODAL_TEMPLATES = [...TEMPLATES, "자유 형식"];

// 입력칸 아래 안내 문구
const HINTS: Record<string, string> = {
  "오늘 한 일": "한 줄로만 써도 괜찮습니다",
  "막힌 점": "공개 글의 막힌 점에는 다른 팀원이 댓글로 도와줄 수 있습니다",
};

// 한 칸 최대 글자 수
const MAX_LENGTH = 2000;

type WorklogWriteModalProps = {
  onClose: () => void;
  onSubmit: (data: NewWorklog) => void;
  initialTemplates: string[];
  initialBoards: string[];
  initialPublic: boolean;
};

export default function WorklogWriteModal({
  onClose,
  onSubmit,
  initialTemplates,
  initialBoards,
  initialPublic,
}: WorklogWriteModalProps) {
  const [date, setDate] = useState("");
  const [isPublic, setIsPublic] = useState(initialPublic);
  const [selectedBoards, setSelectedBoards] = useState<string[]>(initialBoards);
  const [checkedTemplates, setCheckedTemplates] = useState<string[]>(initialTemplates);
  const [contents, setContents] = useState<Record<string, string>>({});

  const toggleBoard = (boardName: string) => {
    if (selectedBoards.includes(boardName)) {
      setSelectedBoards(selectedBoards.filter((b) => b !== boardName));
    } else {
      setSelectedBoards([...selectedBoards, boardName]);
    }
  };

  const toggleTemplate = (template: string) => {
    if (checkedTemplates.includes(template)) {
      setCheckedTemplates(checkedTemplates.filter((t) => t !== template));
    } else {
      setCheckedTemplates([...checkedTemplates, template]);
    }
  };

  const handleContentChange = (template: string, value: string) => {
    setContents({ ...contents, [template]: value });
  };

  // 체크된 칸 중 하나라도 글이 있는지
  const hasContent = checkedTemplates.some((t) => (contents[t] ?? "").trim() !== "");

  // 넘겨줄 값 만들기: 체크했고 글이 있는 항목만 담는다
  const buildData = (publicFlag: boolean): NewWorklog => {
    const filled: Record<string, string> = {};
    checkedTemplates.forEach((t) => {
      const text = (contents[t] ?? "").trim();
      if (text !== "") {
        filled[t] = text;
      }
    });
    return { date, boards: selectedBoards, isPublic: publicFlag, contents: filled };
  };

  const handleSavePrivate = () => {
    onSubmit(buildData(false));
    onClose();
  };

  const handleSubmit = () => {
    onSubmit(buildData(isPublic));
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="scrollbar-hide max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-xl bg-white"
      >
        {/* ===== 머리 ===== */}
        <div className="flex items-start justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-lg font-bold">오늘의 업무일지</h2>
            <p className="mt-1 text-xs text-neutral-400">
              쓰고 싶을 때만 쓰면 됩니다 · 작성 알림이나 미작성 체크는 없습니다
            </p>
          </div>
          <button onClick={onClose} className="text-xl text-neutral-400">
            ×
          </button>
        </div>

        {/* ===== 몸통 ===== */}
        <div className="flex flex-col gap-5 px-6 py-5">
          {/* 날짜 + 공개 범위 */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium">날짜</p>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded border px-3 py-2 text-sm"
              />
              <p className="mt-1 text-[11px] text-neutral-400">비워두면 오늘 날짜로 저장됩니다</p>
            </div>
            <div>
              <p className="text-xs font-medium">공개 범위</p>
              <div className="mt-1 flex items-center justify-between rounded border px-3 py-2">
                <span className="text-sm">팀 전체 공개</span>
                <button
                  onClick={() => setIsPublic(!isPublic)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                    isPublic ? "bg-black" : "bg-neutral-200"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
                      isPublic ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* 보드 태그 */}
          <div>
            <div className="flex justify-between">
              <p className="text-xs font-medium">보드 태그</p>
              <p className="text-[11px] text-neutral-400">복수 선택</p>
            </div>
            {/* ★ 보드가 없으면 안내 문구 */}
            {BOARDS.length === 0 ? (
              <p className="mt-2 rounded border border-dashed py-4 text-center text-xs text-neutral-400">
                등록된 보드가 없습니다
              </p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-2">
                {BOARDS.map((board) => {
                  const isSelected = selectedBoards.includes(board.name);
                  return (
                    <button
                      key={board.name}
                      onClick={() => toggleBoard(board.name)}
                      className={`rounded-full border px-3 py-1.5 text-xs ${
                        isSelected ? "border-black font-semibold" : "border-neutral-200 text-neutral-500"
                      }`}
                    >
                      {isSelected && "✓ "}
                      {board.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 템플릿 체크 */}
          <div>
            <div className="flex justify-between">
              <p className="text-xs font-medium">템플릿</p>
              <p className="text-[11px] text-neutral-400">필요한 항목만 켜면 됩니다</p>
            </div>
            <div className="mt-2 flex flex-wrap gap-4">
              {MODAL_TEMPLATES.map((template) => (
                <label key={template} className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={checkedTemplates.includes(template)}
                    onChange={() => toggleTemplate(template)}
                    className="h-4 w-4 accent-black"
                  />
                  {template}
                </label>
              ))}
            </div>
          </div>

          {/* 체크한 템플릿마다 입력칸 */}
          {checkedTemplates.length === 0 ? (
            <p className="rounded border border-dashed py-6 text-center text-xs text-neutral-400">
              템플릿을 하나 이상 선택하면 입력칸이 나타납니다
            </p>
          ) : (
            MODAL_TEMPLATES.filter((t) => checkedTemplates.includes(t)).map((template) => {
              const value = contents[template] ?? "";
              return (
                <div key={template}>
                  <p className="text-xs font-medium">{template}</p>
                  <textarea
                    value={value}
                    onChange={(e) => handleContentChange(template, e.target.value)}
                    maxLength={MAX_LENGTH}
                    rows={3}
                    className="mt-1 w-full resize-none rounded border px-3 py-2 text-sm"
                  />
                  <div className="flex justify-between gap-2 text-[11px] text-neutral-400">
                    <span>{HINTS[template] ?? ""}</span>
                    <span className="shrink-0">
                      {value.length} / {MAX_LENGTH}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ===== 바닥 ===== */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4">
          <p className="text-[11px] text-neutral-400">
            비공개로 저장하면 본인만 볼 수 있고 주간 리포트에서도 제외됩니다
          </p>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={handleSavePrivate}
              disabled={!hasContent}
              className="rounded border px-4 py-2 text-sm disabled:opacity-40"
            >
              비공개로 저장
            </button>
            <button
              onClick={handleSubmit}
              disabled={!hasContent}
              className="rounded bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              일지 올리기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}