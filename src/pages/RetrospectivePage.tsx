import { useCallback, useState } from "react";
import { Header } from "../components/layout/Header";
import Toast from "../components/common/Toast";
import BoardEndList, { type BoardItem } from "../components/retrospective/BoardEndList";
import KptForm from "../components/retrospective/KptForm";
import RetroArchive from "../components/retrospective/RetroArchive";
import { type KptKey, type Retrospective } from "../constants/retrospective";
// ★ 서버 연동
import { useBoards } from "../hooks/useWorklogs";
import { useCloseBoard, useRetrospectives, useUpdateMyRetrospective } from "../hooks/useRetrospectives";
import type { Board } from "../apis/boards";
import type { Retrospective as ServerRetrospective } from "../apis/retrospectives";
import { getErrorMessage } from "../apis/client";
import { tokenStorage } from "../apis/tokenStorage";

// ─────────────────────────────────────────────
// ★ KPT 세 칸 ↔ 서버 글 하나 바꾸기
// ─────────────────────────────────────────────

// 화면 KPT 이름표 ↔ 글 속 제목
const KPT_HEADINGS: Record<KptKey, string> = { keep: "Keep", problem: "Problem", tryText: "Try" };

// 세 칸 → 서버에 보낼 글
// → "## Keep\nA\n\n## Problem\nB\n\n## Try\nC"
function toServerContent(values: Record<KptKey, string>): string {
  return (Object.keys(KPT_HEADINGS) as KptKey[])
    .map((key) => `## ${KPT_HEADINGS[key]}\n${values[key]}`)
    .join("\n\n");
}

// 서버 글 → 세 칸 (위와 반대). 제목이 없는 글은 통째로 Keep에 넣는다
function toKpt(content: string): Record<KptKey, string> {
  const result: Record<KptKey, string> = { keep: "", problem: "", tryText: "" };
  // ( )가 있어서 제목도 결과에 들어간다 → ["", "Keep", "A", "Problem", "B", ...]
  const parts = content.split(/^## (.+)$/m);
  if (parts.length === 1) {
    result.keep = content.trim();
    return result;
  }
  for (let i = 1; i < parts.length; i += 2) {
    const title = parts[i].trim();
    // 제목("Keep") → 이름표("keep")
    const key = (Object.keys(KPT_HEADINGS) as KptKey[]).find((k) => KPT_HEADINGS[k] === title);
    if (key) result[key] = (parts[i + 1] ?? "").trim();
  }
  return result;
}

// "2026-10-30" → "10/30"
const toMonthDay = (date: string) => {
  const [, month, day] = date.split("-");
  return `${Number(month)}/${Number(day)}`;
};

// 서버 보드 → 보드 목록 부품 모양
function toBoardItem(b: Board): BoardItem {
  return {
    id: b.id,
    name: b.name,
    color: b.color,
    period: `${toMonthDay(b.startDate)} ~ ${toMonthDay(b.endDate)}`,
    isEnded: b.status === "CLOSED",
  };
}

// 서버 회고 → 화면 회고 (아직 안 쓴 회고는 null)
function toPageRetro(r: ServerRetrospective, boardName: string): Retrospective | null {
  if (!r.content || r.content.trim() === "") return null;
  return {
    id: r.retrospectiveId,
    boardName,
    author: r.memberName,
    // 서버가 작성 날짜를 주지 않아서 비워둔다
    date: "",
    ...toKpt(r.content),
  };
}

type ToastState = { id: number; message: string; type: "success" | "info" };

export default function RetrospectivePage() {
  // ★ 서버 데이터
  const boardsQuery = useBoards();
  const closeBoard = useCloseBoard();
  const updateMyRetro = useUpdateMyRetrospective();
  const myId = tokenStorage.getMemberId();

  // 선택된 보드 번호 (null이면 선택 안 됨)
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (message: string, type: "success" | "info" = "info") => {
    setToast((prev) => ({ id: (prev?.id ?? 0) + 1, message, type }));
  };
  const closeToast = useCallback(() => setToast(null), []);

  const boards = (boardsQuery.data ?? []).map(toBoardItem);
  const selectedBoard = boards.find((b) => b.id === selectedBoardId) ?? null;
  const isEnded = selectedBoard?.isEnded ?? false;

  // ★ 종료된 보드를 골랐을 때만 회고 목록을 불러온다 (진행 중이면 서버가 거절해서)
  const retrosQuery = useRetrospectives(selectedBoard && isEnded ? selectedBoard.id : null);
  const serverRetros = retrosQuery.data ?? [];

  // 내가 이미 썼는지 (내 번호 + 내용 있음)
  const hasMyRetro = serverRetros.some((r) => r.memberId === myId && r.content && r.content.trim() !== "");

  // 아카이브에 보여줄 회고 (내용이 있는 것만)
  const boardRetros = serverRetros
    .map((r) => toPageRetro(r, selectedBoard?.name ?? ""))
    .filter((r): r is Retrospective => r !== null);

  // 보드 종료: 한 번 더 확인받고 서버에 요청
  const handleEnd = (boardId: number) => {
    const board = boards.find((b) => b.id === boardId);
    if (!board) return;
    // window.confirm: 확인/취소 창. 공통 확인 창(ConfirmModal)으로는 나중에 한꺼번에 바꾼다
    const ok = window.confirm(`"${board.name}" 보드를 종료할까요?\n참여자에게 KPT 회고 양식이 생성됩니다.`);
    if (!ok) return;
    closeBoard.mutate(boardId, {
      onSuccess: () => {
        // 종료한 보드를 바로 선택해서 회고를 쓸 수 있게
        setSelectedBoardId(boardId);
        showToast(`"${board.name}" 보드를 종료했습니다`, "success");
      },
      // 부장이 아니면 403, 이미 종료됐으면 409
      onError: (error) => showToast(getErrorMessage(error)),
    });
  };

  // 회고 제출 → 서버에 저장
  const handleSubmit = (values: Record<KptKey, string>) => {
    if (selectedBoardId === null) return;
    updateMyRetro.mutate(
      { boardId: selectedBoardId, content: toServerContent(values) },
      {
        onSuccess: () => showToast("회고를 제출했습니다", "success"),
        // 이 보드의 마감 담당자가 아니면 회고 칸이 없어서 서버가 거절할 수 있다
        onError: (error) => showToast(getErrorMessage(error)),
      }
    );
  };

  // 오른쪽 칸 내용
  const renderMain = () => {
    if (!selectedBoard) {
      return (
        <p className="rounded-lg border border-dashed bg-white py-16 text-center text-sm text-neutral-400">
          왼쪽에서 보드를 선택하세요
        </p>
      );
    }
    if (!isEnded) {
      return (
        <div className="rounded-lg border border-dashed bg-white py-16 text-center">
          <p className="text-sm text-neutral-500">아직 진행 중인 보드입니다</p>
          <p className="mt-1 text-xs text-neutral-400">보드를 종료하면 KPT 회고를 작성할 수 있습니다</p>
          <button
            onClick={() => handleEnd(selectedBoard.id)}
            disabled={closeBoard.isPending}
            className="mt-4 rounded bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            {closeBoard.isPending ? "종료 중..." : "보드 종료 처리"}
          </button>
        </div>
      );
    }
    if (retrosQuery.isPending) {
      return <p className="rounded-lg bg-white py-16 text-center text-sm text-neutral-400">회고를 불러오는 중...</p>;
    }
    if (retrosQuery.isError) {
      return (
        <p className="rounded-lg bg-white py-16 text-center text-sm text-red-500">
          {getErrorMessage(retrosQuery.error)}
        </p>
      );
    }
    return (
      <>
        {hasMyRetro ? (
          <p className="rounded-lg bg-green-50 px-5 py-4 text-sm text-green-700">이 보드의 회고를 제출했습니다</p>
        ) : (
          // key: 보드가 바뀌면 입력칸을 새로 비우기 위해
          <KptForm key={selectedBoard.id} boardName={selectedBoard.name} onSubmit={handleSubmit} />
        )}
        <RetroArchive retros={boardRetros} />
      </>
    );
  };

  return (
    <div className="flex min-h-full flex-col">
      <Header title="회고" subtitle="보드를 종료하면 KPT 회고가 생성됩니다 · 보드 기록과 함께 보관" />

      <div className="flex flex-col gap-4 p-6 lg:flex-row">
        {/* 왼쪽: 보드 목록 */}
        <aside className="w-full self-start lg:w-80">
          {boardsQuery.isPending ? (
            <p className="rounded-lg bg-white py-8 text-center text-xs text-neutral-400">보드를 불러오는 중...</p>
          ) : boardsQuery.isError ? (
            <p className="rounded-lg bg-white py-8 text-center text-xs text-red-500">
              {getErrorMessage(boardsQuery.error)}
            </p>
          ) : (
            <BoardEndList
              boards={boards}
              selectedBoardId={selectedBoardId}
              onSelect={setSelectedBoardId}
              onEnd={handleEnd}
              endingBoardId={closeBoard.isPending ? (closeBoard.variables ?? null) : null}
            />
          )}
        </aside>

        {/* 오른쪽: 선택한 보드의 회고 */}
        <main className="flex min-w-0 flex-1 flex-col gap-4">{renderMain()}</main>
      </div>

      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={closeToast} />}
    </div>
  );
}