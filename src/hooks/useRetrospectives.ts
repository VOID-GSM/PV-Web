import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { closeBoard, getRetrospectives, updateMyRetrospective } from "../apis/retrospectives";
// 보드 목록 이름표는 업무일지 훅에서 만든 걸 같이 쓴다
import { boardKeys } from "./useWorklogs";

// 창고 이름표
export const retrospectiveKeys = {
  all: ["retrospectives"] as const,
  byBoard: (boardId: number) => ["retrospectives", boardId] as const,
};

// ─────────────────────────────────────────────
// 보드의 회고 목록 (보드를 골랐을 때만)
// ─────────────────────────────────────────────
export function useRetrospectives(boardId: number | null) {
  return useQuery({
    queryKey: retrospectiveKeys.byBoard(boardId ?? 0),
    queryFn: () => getRetrospectives(boardId!),
    enabled: boardId !== null,
  });
}

// ─────────────────────────────────────────────
// 내 회고 작성·수정
// ─────────────────────────────────────────────
export function useUpdateMyRetrospective() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ boardId, content }: { boardId: number; content: string }) =>
      updateMyRetrospective(boardId, content),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: retrospectiveKeys.byBoard(variables.boardId) }),
  });
}

// ─────────────────────────────────────────────
// 보드 종료 → 보드 목록(진행 중/종료)과 회고 목록을 다시 불러온다
// ─────────────────────────────────────────────
export function useCloseBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: closeBoard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
      queryClient.invalidateQueries({ queryKey: retrospectiveKeys.all });
    },
  });
}