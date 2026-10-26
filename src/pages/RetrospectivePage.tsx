import { useState } from "react";
import { Header } from "../components/layout/Header";
import BoardEndList from "../components/retrospective/BoardEndList";
import KptForm from "../components/retrospective/KptForm";
import RetroArchive from "../components/retrospective/RetroArchive";
import { ME, type KptKey, type Retrospective } from "../constants/retrospective";

// Date를 "2026-10-26" 모양으로
const formatDate = (d: Date) => d.toLocaleDateString("sv-SE");

export default function RetrospectivePage() {
  // 종료 처리된 보드들. 처음엔 없음
  const [endedBoards, setEndedBoards] = useState<string[]>([]);
  // 선택된 보드. 처음엔 선택 안 됨
  const [selectedBoard, setSelectedBoard] = useState("");
  // 작성된 회고들. 처음엔 비어 있음
  const [retros, setRetros] = useState<Retrospective[]>([]);

  // 보드 종료 처리: 한 번 더 확인받고 종료
  const handleEnd = (boardName: string) => {
    // window.confirm: 확인/취소 창을 띄운다. 취소를 누르면 false
    const ok = window.confirm(
      `"${boardName}" 보드를 종료할까요?\n참여자 모두에게 KPT 회고 양식이 생성됩니다.`
    );
    if (!ok) return;
    setEndedBoards([...endedBoards, boardName]);
    // 종료한 보드를 바로 선택해서 회고를 쓸 수 있게
    setSelectedBoard(boardName);
  };

  // 회고 제출
  const handleSubmit = (values: Record<KptKey, string>) => {
    const newRetro: Retrospective = {
      id: Date.now(),
      boardName: selectedBoard,
      author: ME,
      date: formatDate(new Date()),
      ...values,
    };
    setRetros([newRetro, ...retros]);
  };

  // 선택한 보드의 회고들, 그중 내가 쓴 회고
  const boardRetros = retros.filter((r) => r.boardName === selectedBoard);
  const hasMyRetro = boardRetros.some((r) => r.author === ME);
  const isEnded = endedBoards.includes(selectedBoard);

  return (
    <div className="flex min-h-full flex-col">
      <Header title="회고" subtitle="보드를 종료하면 KPT 회고가 생성됩니다 · 보드 기록과 함께 보관" />

      <div className="flex flex-col gap-4 p-6 lg:flex-row">
        {/* 왼쪽: 보드 목록 */}
        <aside className="w-full self-start lg:w-80">
          <BoardEndList
            endedBoards={endedBoards}
            selectedBoard={selectedBoard}
            onSelect={setSelectedBoard}
            onEnd={handleEnd}
          />
        </aside>

        {/* 오른쪽: 선택한 보드의 회고 */}
        <main className="flex min-w-0 flex-1 flex-col gap-4">
          {selectedBoard === "" ? (
            // 1) 보드를 아직 안 고름
            <p className="rounded-lg border border-dashed bg-white py-16 text-center text-sm text-neutral-400">
              왼쪽에서 보드를 선택하세요
            </p>
          ) : !isEnded ? (
            // 2) 아직 진행 중인 보드
            <div className="rounded-lg border border-dashed bg-white py-16 text-center">
              <p className="text-sm text-neutral-500">아직 진행 중인 보드입니다</p>
              <p className="mt-1 text-xs text-neutral-400">
                보드를 종료하면 KPT 회고를 작성할 수 있습니다
              </p>
              <button
                onClick={() => handleEnd(selectedBoard)}
                className="mt-4 rounded bg-black px-4 py-2 text-sm font-semibold text-white"
              >
                보드 종료 처리
              </button>
            </div>
          ) : (
            // 3) 종료된 보드: 내 회고를 아직 안 썼으면 작성 칸, 썼으면 완료 안내
            <>
              {hasMyRetro ? (
                <p className="rounded-lg bg-green-50 px-5 py-4 text-sm text-green-700">
                  ✓ 이 보드의 회고를 제출했습니다
                </p>
              ) : (
                // key: 보드가 바뀌면 입력칸을 새로 비우기 위해
                <KptForm key={selectedBoard} boardName={selectedBoard} onSubmit={handleSubmit} />
              )}
              <RetroArchive retros={boardRetros} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}