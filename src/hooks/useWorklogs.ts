import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createWorklog,
  createWorklogComment,
  deleteComment,
  deleteWorklog,
  getWorklogComments,
  getWorklogs,
  updateWorklog,
  type WorklogUpdateRequest,
} from "../apis/worklogs";
import { getBoards } from "../apis/boards";

// 창고 이름표
export const worklogKeys = {
  all: ["worklogs"] as const,
  list: ["worklogs", "list"] as const,
  comments: (worklogId: number) => ["worklogs", "comments", worklogId] as const,
};
export const boardKeys = { all: ["boards"] as const };

// ─────────────────────────────────────────────
// 업무일지 목록 (보드 필터는 화면에서 한다)
// ─────────────────────────────────────────────
export function useWorklogs() {
  return useQuery({
    queryKey: worklogKeys.list,
    queryFn: () => getWorklogs(),
  });
}

// 작성 / 수정 / 삭제 → 성공하면 목록을 다시 불러온다
export function useCreateWorklog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWorklog,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: worklogKeys.list }),
  });
}

export function useUpdateWorklog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: WorklogUpdateRequest }) => updateWorklog(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: worklogKeys.list }),
  });
}

export function useDeleteWorklog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteWorklog,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: worklogKeys.list }),
  });
}

// ─────────────────────────────────────────────
// 댓글 (펼친 일지만 불러온다)
// ─────────────────────────────────────────────
export function useWorklogComments(worklogId: number | null) {
  return useQuery({
    queryKey: worklogKeys.comments(worklogId ?? 0),
    queryFn: () => getWorklogComments(worklogId!),
    // 일지를 펼쳤을 때만 요청
    enabled: worklogId !== null,
  });
}

export function useCreateWorklogComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ worklogId, content }: { worklogId: number; content: string }) =>
      createWorklogComment(worklogId, content),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: worklogKeys.comments(variables.worklogId) }),
  });
}

export function useDeleteComment(worklogId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteComment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: worklogKeys.comments(worklogId) }),
  });
}

// ─────────────────────────────────────────────
// 보드 목록 (보드 태그·필터용)
// ─────────────────────────────────────────────
export function useBoards() {
  return useQuery({
    queryKey: boardKeys.all,
    queryFn: getBoards,
  });
}