import { api } from "./client";
import type { Major } from "./interviews";

// ⚠ 팀 번호: 서버에 "내 팀 번호" 조회 API가 없어서 팀이 하나라고 보고 1로 둔다 (백엔드 확인 중)
export const TEAM_ID = 1;

// ─────────────────────────────────────────────
// 1) 대시보드 (팀원별 통계)
// ─────────────────────────────────────────────

export interface DashboardMember {
  memberId: number;
  name: string;
  generation: number;
  // 참여 보드 수, 이번 주 마감 수, 과부하 여부
  boardCount: number;
  weeklyDeadlineCount: number;
  overloaded: boolean;
  // 출석률·과제 제출률 (기록이 없으면 null일 수 있다)
  attendanceRate: number | null;
  assignmentSubmissionRate: number | null;
}

export interface Dashboard {
  weekStart: string;
  weekEnd: string;
  overloadedMemberCount: number;
  members: DashboardMember[];
}

// 팀 대시보드 — GET /home/dashboard
export const getDashboard = async () => {
  const { data } = await api.get<Dashboard>("/home/dashboard");
  return data;
};

// ─────────────────────────────────────────────
// 2) 초대 링크
// ─────────────────────────────────────────────

// 만든 초대 링크
export interface InviteCreated {
  inviteId: number;
  code: string;
  // 만료 없음이면 null
  expiresAt: string | null;
  // 무제한이면 null
  maxUses: number | null;
}

// 초대 링크 만들기 — POST /auth/teams/{teamId}/invites
// (목록을 불러오는 API는 없다)
export const createInvite = async (body: { expiresAt?: string; maxUses?: number }) => {
  const { data } = await api.post<InviteCreated>(`/auth/teams/${TEAM_ID}/invites`, body);
  return data;
};

// 초대 링크 폐기 — DELETE /auth/teams/{teamId}/invites/{inviteId}
export const deleteInvite = async (inviteId: number) => {
  await api.delete(`/auth/teams/${TEAM_ID}/invites/${inviteId}`);
};

// ─────────────────────────────────────────────
// 3) 입장 요청 · 승인 모드
// ─────────────────────────────────────────────

export interface JoinRequestItem {
  requestId: number;
  name: string;
  generation: number;
  majors: Major[];
  requestedAt: string;
}

// 입장 요청 목록 — GET /auth/teams/{teamId}/join-requests
export const getJoinRequests = async () => {
  const { data } = await api.get<JoinRequestItem[]>(`/auth/teams/${TEAM_ID}/join-requests`);
  return data;
};

// 입장 요청 승인 — PATCH /auth/join-requests/{requestId} (거절 API는 없다)
export const approveJoinRequest = async (requestId: number) => {
  await api.patch(`/auth/join-requests/${requestId}`);
};

// 부장 승인 모드 켜기/끄기 — PATCH /auth/teams/{teamId}/settings
export const updateTeamSettings = async (approvalRequired: boolean) => {
  await api.patch(`/auth/teams/${TEAM_ID}/settings`, { approvalRequired });
};