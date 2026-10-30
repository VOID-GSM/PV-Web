import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAssignment,
  getAssignments,
  getSubmissionStatus,
  passSubmission,
  requestResubmission,
  resubmitAssignment,
  submitAssignment,
  type AssignmentListType,
  type SubmissionRequest,
} from "../apis/assignments";
import { createSkill, getMySkills, getSkills, saveMyScores } from "../apis/skills";

// 창고 이름표
export const assignmentKeys = {
  all: ["assignments"] as const,
  list: (type: AssignmentListType) => ["assignments", "list", type] as const,
  status: (assignmentId: number) => ["assignments", "status", assignmentId] as const,
};
export const skillKeys = {
  all: ["skills"] as const,
  list: ["skills", "list"] as const,
  mine: ["skills", "me"] as const,
};

// ─────────────────────────────────────────────
// 과제 목록 / 출제
// ─────────────────────────────────────────────
export function useAssignments(type: AssignmentListType) {
  return useQuery({
    queryKey: assignmentKeys.list(type),
    queryFn: () => getAssignments(type),
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAssignment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assignmentKeys.all }),
  });
}

// ─────────────────────────────────────────────
// 제출 현황 (과제를 골랐고, 내가 출제자·부장일 때만)
// ─────────────────────────────────────────────
export function useSubmissionStatus(assignmentId: number | null, enabled = true) {
  return useQuery({
    queryKey: assignmentKeys.status(assignmentId ?? 0),
    queryFn: () => getSubmissionStatus(assignmentId!),
    enabled: assignmentId !== null && enabled,
  });
}

// ─────────────────────────────────────────────
// 제출 / 재제출 → 과제 목록(내 제출 상태)을 다시 불러온다
// ─────────────────────────────────────────────
export function useSubmitAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ assignmentId, body }: { assignmentId: number; body: SubmissionRequest }) =>
      submitAssignment(assignmentId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assignmentKeys.all }),
  });
}

export function useResubmitAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      assignmentId,
      submissionId,
      body,
    }: {
      assignmentId: number;
      submissionId: number;
      body: SubmissionRequest;
    }) => resubmitAssignment(assignmentId, submissionId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assignmentKeys.all }),
  });
}

// ─────────────────────────────────────────────
// 통과 / 재제출 요청 → 제출 현황·목록·역량 점수를 다시 불러온다
// ─────────────────────────────────────────────
type ReviewVariables = { assignmentId: number; submissionId: number; comment: string };

export function usePassSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ assignmentId, submissionId, comment }: ReviewVariables) =>
      passSubmission(assignmentId, submissionId, comment || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
      // 통과하면 역량 기록이 생기니까 역량도 다시
      queryClient.invalidateQueries({ queryKey: skillKeys.all });
    },
  });
}

export function useRequestResubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ assignmentId, submissionId, comment }: ReviewVariables) =>
      requestResubmission(assignmentId, submissionId, comment),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assignmentKeys.all }),
  });
}

// ─────────────────────────────────────────────
// 역량맵
// ─────────────────────────────────────────────
export function useSkills() {
  return useQuery({ queryKey: skillKeys.list, queryFn: () => getSkills() });
}

export function useMySkills() {
  return useQuery({ queryKey: skillKeys.mine, queryFn: getMySkills });
}

export function useCreateSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSkill,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: skillKeys.all }),
  });
}

export function useSaveMyScores() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveMyScores,
    // 서버가 저장 결과(내 역량 전체)를 돌려주니까 창고에 바로 넣는다
    onSuccess: (mine) => queryClient.setQueryData(skillKeys.mine, mine),
  });
}