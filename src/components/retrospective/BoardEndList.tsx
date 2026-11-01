// ★ 보드 하나의 모양 (페이지가 서버 보드를 이 모양으로 바꿔서 넘겨준다)
export type BoardItem = {
  id: number;
  name: string;
  // 서버가 주는 색 코드 (예: "#3B82F6")
  color: string;
  // "9/1 ~ 10/20" 모양의 기간
  period: string;
  // 종료된 보드인지
  isEnded: boolean;
};

type BoardEndListProps = {
  // ★ 상수 대신 페이지에서 보드 목록을 받는다
  boards: BoardItem[];
  // 지금 선택된 보드 번호 (null이면 선택 안 됨)
  selectedBoardId: number | null;
  onSelect: (boardId: number) => void;
  onEnd: (boardId: number) => void;
  // 종료 처리 중인 보드 번호 (그 버튼만 "종료 중..."으로)
  endingBoardId: number | null;
};

export default function BoardEndList({
  boards,
  selectedBoardId,
  onSelect,
  onEnd,
  endingBoardId,
}: BoardEndListProps) {
  return (
    <section className="rounded-lg bg-white p-5">
      <h2 className="font-bold">보드</h2>
      <p className="mt-1 text-xs text-neutral-400">보드를 종료하면 참여자 모두에게 KPT 회고 양식이 생성됩니다</p>

      {/* 보드가 없으면 안내 문구 */}
      {boards.length === 0 ? (
        <p className="mt-4 rounded border border-dashed py-8 text-center text-xs text-neutral-400">
          등록된 보드가 없습니다
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {boards.map((board) => {
            const isSelected = selectedBoardId === board.id;
            return (
              <li key={board.id}>
                {/* 선택된 보드는 검은 테두리 */}
                <div
                  className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-3 ${
                    isSelected ? "border-black" : "border-neutral-100"
                  }`}
                >
                  <button onClick={() => onSelect(board.id)} className="min-w-0 flex-1 text-left">
                    <p className="flex items-center gap-1.5 text-sm font-medium">
                      {/* ★ 서버 색 코드는 className으로 못 써서 style로 칠한다 */}
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: board.color }} />
                      <span className="truncate">{board.name}</span>
                    </p>
                    <p className="mt-0.5 text-[11px] text-neutral-400">{board.period}</p>
                  </button>

                  {/* 종료됐으면 배지, 아니면 종료 처리 버튼 */}
                  {board.isEnded ? (
                    <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-500">
                      종료됨
                    </span>
                  ) : (
                    <button
                      onClick={() => onEnd(board.id)}
                      disabled={endingBoardId === board.id}
                      className="shrink-0 rounded border px-2 py-1 text-[11px] disabled:opacity-40"
                    >
                      {endingBoardId === board.id ? "종료 중..." : "종료 처리"}
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