import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAssignment, getAssignments, type AssignmentListType } from "../apis/assignments";

// 창고 이름표
export const assignmentKeys = {
  all: ["assignments"] as const,
  // 받은 과제 / 낸 과제 목록
  list: (type: AssignmentListType) => ["assignments", "list", type] as const,
};

// ─────────────────────────────────────────────
// 과제 목록 불러오기 (받은 과제 또는 낸 과제)
// ─────────────────────────────────────────────
export function useAssignments(type: AssignmentListType) {
  return useQuery({
    queryKey: assignmentKeys.list(type),
    queryFn: () => getAssignments(type),
  });
}

// ─────────────────────────────────────────────
// 과제 출제
// ─────────────────────────────────────────────
export function useCreateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAssignment,
    // 출제에 성공하면 과제 목록들을 다시 불러온다
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assignmentKeys.all }),
  });
}