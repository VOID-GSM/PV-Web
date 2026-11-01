import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMembers, grantRole, removeRole, updateMember, type MemberUpdateRequest, type Role } from "../apis/members";
import {
  approveJoinRequest,
  createInvite,
  deleteInvite,
  getDashboard,
  getJoinRequests,
  updateTeamSettings,
} from "../apis/team";
import { issueReEntryCode } from "../apis/auth";
// 내 프로필 이름표 (내 정보가 바뀌면 같이 새로고침)
import { memberKeys } from "./useMembers";

// 창고 이름표
export const teamKeys = {
  all: ["team"] as const,
  members: ["team", "members"] as const,
  dashboard: ["team", "dashboard"] as const,
  joinRequests: ["team", "join-requests"] as const,
};

// ─────────────────────────────────────────────
// 불러오기
// ─────────────────────────────────────────────
export function useTeamMembers() {
  return useQuery({ queryKey: teamKeys.members, queryFn: getMembers });
}

export function useDashboard() {
  return useQuery({ queryKey: teamKeys.dashboard, queryFn: getDashboard });
}

export function useJoinRequests() {
  return useQuery({ queryKey: teamKeys.joinRequests, queryFn: getJoinRequests });
}

// 팀 데이터가 바뀌면 팀 관련 전부 + 내 프로필을 다시 불러온다
function useInvalidateTeam() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: teamKeys.all });
    queryClient.invalidateQueries({ queryKey: memberKeys.me });
  };
}

// ─────────────────────────────────────────────
// 팀원 정보·역할
// ─────────────────────────────────────────────
export function useUpdateMember() {
  const invalidate = useInvalidateTeam();
  return useMutation({
    mutationFn: ({ memberId, body }: { memberId: number; body: MemberUpdateRequest }) => updateMember(memberId, body),
    onSuccess: invalidate,
  });
}

export function useGrantRole() {
  const invalidate = useInvalidateTeam();
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: number; role: Role }) => grantRole(memberId, role),
    onSuccess: invalidate,
  });
}

export function useRemoveRole() {
  const invalidate = useInvalidateTeam();
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: number; role: Role }) => removeRole(memberId, role),
    onSuccess: invalidate,
  });
}

// 재입장 링크 발급 (다시 불러올 데이터 없음)
export function useIssueReEntryLink() {
  return useMutation({ mutationFn: issueReEntryCode });
}

// ─────────────────────────────────────────────
// 초대 링크 · 입장 요청 · 승인 모드
// ─────────────────────────────────────────────
export function useCreateInvite() {
  return useMutation({ mutationFn: createInvite });
}

export function useDeleteInvite() {
  return useMutation({ mutationFn: deleteInvite });
}

export function useApproveJoinRequest() {
  const invalidate = useInvalidateTeam();
  return useMutation({ mutationFn: approveJoinRequest, onSuccess: invalidate });
}

export function useUpdateTeamSettings() {
  return useMutation({ mutationFn: updateTeamSettings });
}