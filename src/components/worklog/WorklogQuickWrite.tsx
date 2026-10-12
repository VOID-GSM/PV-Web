import { useState } from "react";
import { BOARDS, TEMPLATES } from "../../constants/worklog";
// ★ 방금 만든 작성 창을 가져온다
import WorklogWriteModal from "./WorklogWriteModal";

export default function WorklogQuickWrite() {
  const [checkedTemplates, setCheckedTemplates] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [selectedBoards, setSelectedBoards] = useState<string[]>([]);
  // ★ 작성 창이 열려 있는지. 처음엔 닫힘
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleTemplate = (template: string) => {
    if (checkedTemplates.includes(template)) {
      setCheckedTemplates(checkedTemplates.filter((t) => t !== template));
    } else {
      setCheckedTemplates([...checkedTemplates, template]);
    }
  };

  const toggleBoard = (boardName: string) => {
    if (selectedBoards.includes(boardName)) {
      setSelectedBoards(selectedBoards.filter((b) => b !== boardName));
    } else {
      setSelectedBoards([...selectedBoards, boardName]);
    }
  };

  return (
    // ★ <> </>: 카드와 작성 창 두 개를 한 번에 돌려주려고 감싸는 빈 껍데기
    <>
      <section className="rounded-lg border-2 border-black bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">오늘의 일지 쓰기</h2>
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px]">선택 사항</span>
        </div>
        <p className="mt-1 text-xs text-neutral-400">
          쓰고 싶을 때만 쓰면 됩니다. 작성 알림이나 미작성 체크는 없습니다.
        </p>

        <div className="mt-4 rounded bg-neutral-50 p-3">
          <p className="text-xs text-neutral-500">템플릿</p>
          <div className="mt-2 flex flex-col gap-2">
            {TEMPLATES.map((template) => (
              <label key={template} className="flex cursor-pointer items-center gap-2 text-sm">
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

        <div className="mt-3 flex items-center justify-between gap-3 rounded bg-neutral-100 p-3">
          <div>
            <p className="text-sm font-medium">팀 전체에 공개</p>
            <p className="text-[11px] text-neutral-500">
              비공개 글은 본인만 볼 수 있고 주간 리포트에서도 제외됩니다
            </p>
          </div>
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

        <p className="mt-4 text-xs text-neutral-500">보드 태그</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {BOARDS.map((board) => (
            <button
              key={board.name}
              onClick={() => toggleBoard(board.name)}
              className={`flex items-center gap-1.5 rounded border px-2 py-1 text-xs ${
                selectedBoards.includes(board.name)
                  ? "border-black font-semibold"
                  : "border-neutral-200 text-neutral-500"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${board.dotColor}`} />
              {board.name}
            </button>
          ))}
        </div>

        <button
          // ★ 누르면 작성 창을 연다
          onClick={() => setIsModalOpen(true)}
          className="mt-5 w-full rounded bg-black py-2.5 text-sm font-semibold text-white"
        >
          일지 작성하기
        </button>
      </section>

      {/* ★ 열려 있을 때만 작성 창을 그린다 */}
      {/* 여기서 고른 템플릿·보드·공개 여부를 처음 값으로 넘겨준다 */}
      {isModalOpen && (
        <WorklogWriteModal
          onClose={() => setIsModalOpen(false)}
          initialTemplates={checkedTemplates}
          initialBoards={selectedBoards}
          initialPublic={isPublic}
        />
      )}
    </>
  );
}