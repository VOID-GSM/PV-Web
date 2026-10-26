import { RETRO_BOARDS } from "../../constants/retrospective";

type BoardEndListProps = {
  // 종료 처리된 보드 이름들
  endedBoards: string[];
  // 지금 선택된 보드 ("" 이면 선택 안 됨)
  selectedBoard: string;
  onSelect: (boardName: string) => void;
  onEnd: (boardName: string) => void;
};

export default function BoardEndList({
  endedBoards,
  selectedBoard,
  onSelect,
  onEnd,
}: BoardEndListProps) {
  return (
    <section className="rounded-lg bg-white p-5">
      <h2 className="font-bold">보드</h2>
      <p className="mt-1 text-xs text-neutral-400">
        보드를 종료하면 참여자 모두에게 KPT 회고 양식이 생성됩니다
      </p>

      {/* ★ 보드가 없으면 안내 문구 */}
      {RETRO_BOARDS.length === 0 ? (
        <p className="mt-4 rounded border border-dashed py-8 text-center text-xs text-neutral-400">
          등록된 보드가 없습니다
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {RETRO_BOARDS.map((board) => {
            const isEnded = endedBoards.includes(board.name);
            const isSelected = selectedBoard === board.name;
            return (
              <li key={board.name}>
                {/* 선택된 보드는 검은 테두리 */}
                <div
                  className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-3 ${
                    isSelected ? "border-black" : "border-neutral-100"
                  }`}
                >
                  <button
                    onClick={() => onSelect(board.name)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="flex items-center gap-1.5 text-sm font-medium">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${board.dotColor}`} />
                      <span className="truncate">{board.name}</span>
                    </p>
                    <p className="mt-0.5 text-[11px] text-neutral-400">{board.period}</p>
                  </button>

                  {/* 종료됐으면 배지, 아니면 종료 처리 버튼 */}
                  {isEnded ? (
                    <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-500">
                      종료됨
                    </span>
                  ) : (
                    <button
                      onClick={() => onEnd(board.name)}
                      className="shrink-0 rounded border px-2 py-1 text-[11px]"
                    >
                      종료 처리
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}