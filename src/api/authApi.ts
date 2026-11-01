import { apiRequest } from "./client";
import type { Major } from "./activityApi";

export interface InviteInfo {
  teamId: number;
  teamName: string;
  approvalRequired: boolean;
  code: string;
  generations: { id: number; number: number }[];
  majors: Major[];
}
export interface JoinRequestResponse {
  memberId: number;
  status: "PENDING" | "JOINED";
  accessToken?: string;
  refreshToken?: string;
}
export function getInvite(inviteCode: string) {
  return apiRequest<InviteInfo>(
    `/auth/invites/${encodeURIComponent(inviteCode)}`,
  );
}
export function createJoinRequest(
  inviteCode: string,
  body: { name: string; generationId: number; majors: Major[] },
) {
  return apiRequest<JoinRequestResponse>(
    `/auth/invites/${encodeURIComponent(inviteCode)}/members`,
    { method: "POST", body },
  );
}
export function createTeamInvite(
  teamId: number,
  body: { expiresAt?: string; maxUses?: number } = {},
) {
  return apiRequest<{
    inviteId: number;
    code: string;
    expiresAt: string;
    maxUses: number;
  }>(`/auth/teams/${teamId}/invites`, { method: "POST", body });
}
export function getReEntryLink() {
  return apiRequest<{ code: string }>("/auth/members/me/re-entry-link");
}
export function reEntryLink(code: string) {
  return apiRequest<JoinRequestResponse>(
    `/auth/re-entry/${encodeURIComponent(code)}`,
    { method: "POST" },
  );
}
export function createReEntryLink(memberId: number) {
  return apiRequest<{ memberId: number; code: string }>(
    `/auth/members/${memberId}/re-entry-links`,
    { method: "POST" },
  );
}
