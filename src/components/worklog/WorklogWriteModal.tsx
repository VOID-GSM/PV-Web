import { useState } from "react";
import { BOARDS, TEMPLATES } from "../../constants/worklog";

// 작성 창에서는 "자유 형식"까지 4개를 고를 수 있다
// [...TEMPLATES, "자유 형식"]: 기존 3개 뒤에 하나를 붙인 새 배열
const MODAL_TEMPLATES = [...TEMPLATES, "자유 형식"];

// 입력칸 아래에 보여줄 안내 문구 (항목마다 다르다)
// Record<string, string>: "글자 이름표 → 글자 값" 모양의 객체라는 타입
const HINTS: Record<string, string> = {
  "오늘 한 일": "한 줄로만 써도 괜찮습니다",
  "막힌 점": "공개 글의 막힌 점에는 다른 팀원이 댓글로 도와줄 수 있습니다",
};

// 한 칸에 쓸 수 있는 최대 글자 수
const MAX_LENGTH = 2000;

// 바깥(WorklogQuickWrite)에서 받을 값
type WorklogWriteModalProps = {
  // 창 닫기 함수
  onClose: () => void;
  // 오른쪽 카드에서 미리 골라둔 값들 (창을 열 때 처음 값으로 쓴다)
  initialTemplates: string[];
  initialBoards: string[];
  initialPublic: boolean;
};

export default function WorklogWriteModal({
  onClose,
  initialTemplates,
  initialBoards,
  initialPublic,
}: WorklogWriteModalProps) {
  // 날짜. 처음엔 비어 있음
  const [date, setDate] = useState("");
  // 공개 여부. 오른쪽 카드에서 고른 값으로 시작
  const [isPublic, setIsPublic] = useState(initialPublic);
  // 선택된 보드들
  const [selectedBoards, setSelectedBoards] = useState<string[]>(initialBoards);
  // 체크된 템플릿들
  const [checkedTemplates, setCheckedTemplates] = useState<string[]>(initialTemplates);
  // 템플릿마다 입력한 내용. 예: { "오늘 한 일": "기획서 작성", "막힌 점": "..." }
  const [contents, setContents] = useState<Record<string, string>>({});

  // 보드 태그 켜고 끄기 (설정 페이지 전공 선택과 같은 방식)
  const toggleBoard = (boardName: string) => {
    if (selectedBoards.includes(boardName)) {
      setSelectedBoards(selectedBoards.filter((b) => b !== boardName));
    } else {
      setSelectedBoards([...selectedBoards, boardName]);
    }
  };

  // 템플릿 체크 켜고 끄기
  const toggleTemplate = (template: string) => {
    if (checkedTemplates.includes(template)) {
      setCheckedTemplates(checkedTemplates.filter((t) => t !== template));
    } else {
      setCheckedTemplates([...checkedTemplates, template]);
    }
  };

  // 입력칸에 글자를 칠 때. 어떤 템플릿 칸인지(template)와 입력한 글자(value)를 받는다
  const handleContentChange = (template: string, value: string) => {
    // 기존 내용은 그대로 두고(...contents), 이 템플릿 칸만 새 글자로 바꾼다
    // [template]: 변수 template에 들어 있는 글자를 이름표로 쓴다는 뜻
    setContents({ ...contents, [template]: value });
  };

  // 체크된 칸 중 하나라도 글자가 있는지
  // some: 배열 중 조건에 맞는 게 하나라도 있으면 true
  // trim(): 앞뒤 띄어쓰기를 지운다 (띄어쓰기만 친 건 빈 칸으로 친다)
  const hasContent = checkedTemplates.some((t) => (contents[t] ?? "").trim() !== "");

  // 비공개로 저장
  const handleSavePrivate = () => {
    alert("비공개로 저장했습니다");
    onClose();
  };

  // 일지 올리기
  const handleSubmit = () => {
    alert(isPublic ? "팀 전체에 공개로 올렸습니다" : "비공개로 올렸습니다");
    onClose();
  };

  return (
    // 어두운 배경 (설정 페이지 노션 창과 같은 구조)
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      {/* 흰 창. 안쪽 클릭은 배경까지 전달되지 않게 막는다 */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-[560px] overflow-y-auto rounded-xl bg-white"
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
          {/* 날짜 + 공개 범위를 2칸으로 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium">날짜</p>
              {/* type="date": 누르면 달력이 뜨는 날짜 입력칸 */}
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <p className="text-xs font-medium">공개 범위</p>
              <div className="mt-1 flex items-center justify-between rounded border px-3 py-2">
                <span className="text-sm">팀 전체 공개</span>
                {/* 토글 (오른쪽 카드와 같은 모양) */}
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
            <div className="mt-2 flex flex-wrap gap-2">
              {BOARDS.map((board) => {
                // 이 보드가 선택돼 있는지 미리 계산해 둔다 (아래에서 두 번 쓰니까)
                const isSelected = selectedBoards.includes(board.name);
                return (
                  <button
                    key={board.name}
                    onClick={() => toggleBoard(board.name)}
                    className={`rounded-full border px-3 py-1.5 text-xs ${
                      isSelected ? "border-black font-semibold" : "border-neutral-200 text-neutral-500"
                    }`}
                  >
                    {/* 선택되면 이름 앞에 ✓ 표시 */}
                    {isSelected && "✓ "}
                    {board.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 템플릿 체크 */}
          <div>
            <div className="flex justify-between">
              <p className="text-xs font-medium">템플릿</p>
              <p className="text-[11px] text-neutral-400">필요한 항목만 켜면 됩니다</p>
            </div>
            <div className="mt-2 flex flex-wrap gap-4">
              {MODAL_TEMPLATES.map((template) => (
                <label key={template} className="flex cursor-pointer items-center gap-1.5 text-sm">
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

          {/* 체크된 템플릿마다 입력칸. 아무것도 체크 안 했으면 안내 문구 */}
          {checkedTemplates.length === 0 ? (
            <p className="rounded border border-dashed py-6 text-center text-xs text-neutral-400">
              템플릿을 하나 이상 선택하면 입력칸이 나타납니다
            </p>
          ) : (
            // 체크한 순서가 아니라 항상 같은 순서로 보이게 MODAL_TEMPLATES 기준으로 돈다
            MODAL_TEMPLATES.filter((t) => checkedTemplates.includes(t)).map((template) => {
              // 이 칸에 지금 들어 있는 글자. 아직 안 썼으면 빈 글자
              const value = contents[template] ?? "";
              return (
                <div key={template}>
                  <p className="text-xs font-medium">{template}</p>
                  {/* textarea: 여러 줄을 쓸 수 있는 입력칸, rows: 기본 높이(줄 수) */}
                  <textarea
                    value={value}
                    onChange={(e) => handleContentChange(template, e.target.value)}
                    // maxLength: 이 글자 수 이상은 입력되지 않게 막는다
                    maxLength={MAX_LENGTH}
                    rows={3}
                    // resize-none: 오른쪽 아래 모서리로 크기 조절 못 하게
                    className="mt-1 w-full resize-none rounded border px-3 py-2 text-sm"
                  />
                  {/* 아래 줄: 왼쪽 안내 문구, 오른쪽 글자 수 */}
                  <div className="flex justify-between text-[11px] text-neutral-400">
                    {/* 안내 문구가 없는 항목은 빈 칸 */}
                    <span>{HINTS[template] ?? ""}</span>
                    <span>
                      {value.length} / {MAX_LENGTH}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ===== 바닥 ===== */}
        <div className="flex items-center justify-between gap-3 border-t px-6 py-4">
          <p className="text-[11px] text-neutral-400">
            비공개로 저장하면 본인만 볼 수 있고 주간 리포트에서도 제외됩니다
          </p>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={handleSavePrivate}
              // 쓴 내용이 없으면 못 누르게
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