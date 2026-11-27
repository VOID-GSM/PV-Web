import { useState } from "react";
// ☆ BOARDS(빈 목록) 대신 서버 보드를 받는다
import { TEMPLATES, type NewWorklog } from "../../constants/worklog";
import WorklogWriteModal, { type BoardOption } from "./WorklogWriteModal";

type WorklogQuickWriteProps = {
  // 작성 창에서 올린 일지를 페이지로 넘겨주는 함수
  onSubmit: (data: NewWorklog) => void;
  // ☆ 고를 수 있는 서버 보드들
  boards: BoardOption[];
  // ☆ 바로 열기 신호: 값이 새로 바뀌면 작성 창을 연다 (헤더 "업무일지 쓰기"에서 온다)
  openRequestKey?: string | null;
  // ☆ 작성 창이 닫힐 때 페이지에 알린다 (헤더 쪽지를 지우려고)
  onModalClose?: () => void;
};

export default function WorklogQuickWrite({ onSubmit, boards, openRequestKey, onModalClose }: WorklogQuickWriteProps) {
  const [checkedTemplates, setCheckedTemplates] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [selectedBoards, setSelectedBoards] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // ☆ 마지막으로 처리한 바로 열기 신호
  const [seenOpenKey, setSeenOpenKey] = useState<string | null>(null);

  // ☆ 새 신호가 오면 작성 창 열기 (useEffect 대신 그리는 중에 확인: 이 프로젝트 ESLint 규칙)
  if (openRequestKey && openRequestKey !== seenOpenKey) {
    setSeenOpenKey(openRequestKey);
    setIsModalOpen(true);
  }

  const toggleTemplate = (template: string) => {
    if (checkedTemplates.includes(template)) {
      setCheckedTemplates(checkedTemplates.filter((t) => t !== template));
    } else {
      setCheckedTemplates([...checkedTemplates, template]);
    }
  };

  // ☆ 보드는 하나만 (서버 규칙). 같은 걸 다시 누르면 해제
  const toggleBoard = (boardName: string) => {
    setSelectedBoards((prev) => (prev[0] === boardName ? [] : [boardName]));
  };

  // ☆ 작성 창 닫기 + 페이지에 알리기
  const closeModal = () => {
    setIsModalOpen(false);
    onModalClose?.();
  };

  // 작성 창에서 올렸을 때: 페이지로 넘기고, 이 카드의 선택값은 다시 비운다
  const handleSubmit = (data: NewWorklog) => {
    onSubmit(data);
    setCheckedTemplates([]);
    setSelectedBoards([]);
    setIsPublic(false);
  };

  return (
    <>
      <section className="rounded-lg border-2 border-black bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">오늘의 일지 쓰기</h2>
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px]">선택 사항</span>
        </div>
        <p className="mt-1 text-xs text-neutral-400">
          쓰고 싶을 때만 쓰면 됩니다. 작성 알림이나 미작성 체크는 없습니다.
        </p>

        {/* 템플릿 */}
        <div className="mt-4 rounded bg-neutral-50 p-3">
          <p className="text-xs text-neutral-500">템플릿</p>
          <div className="mt-2 flex flex-col gap-2">
            {TEMPLATES.map((template) => (
              <label key={template} className="flex items-center gap-2 text-sm">
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

        {/* 공개 토글 */}
        <div className="mt-3 flex items-center justify-between gap-3 rounded bg-neutral-100 p-3">
          <div>
            <p className="text-sm font-medium">팀 전체에 공개</p>
            <p className="text-[11px] text-neutral-500">
              비공개 글은 본인만 볼 수 있고 주간 리포트에서도 제외됩니다
            </p>
          </div>
          <button
            type="button"
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

        {/* 보드 태그 */}
        <p className="mt-4 text-xs text-neutral-500">보드 태그 (하나 선택)</p>
        {/* ☆ 서버 보드가 없으면 안내 문구, 있으면 태그 버튼들 */}
        {boards.length === 0 ? (
          <p className="mt-2 rounded border border-dashed py-4 text-center text-xs text-neutral-400">
            등록된 보드가 없습니다
          </p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {boards.map((board) => (
              <button
                key={board.id}
                type="button"
                onClick={() => toggleBoard(board.name)}
                className={`flex items-center gap-1.5 rounded border px-2 py-1 text-xs ${
                  selectedBoards.includes(board.name)
                    ? "border-black font-semibold"
                    : "border-neutral-200 text-neutral-500"
                }`}
              >
                {/* ☆ 서버 보드 색 점 */}
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: board.color }} />
                {board.name}
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="mt-5 w-full rounded bg-black py-2.5 text-sm font-semibold text-white"
        >
          일지 작성하기
        </button>
      </section>

      {isModalOpen && (
        <WorklogWriteModal
          onClose={closeModal}
          onSubmit={handleSubmit}
          initialTemplates={checkedTemplates}
          initialBoards={selectedBoards}
          initialPublic={isPublic}
          boards={boards}
        />
      )}
    </>
  );
}