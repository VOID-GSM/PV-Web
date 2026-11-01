import { api } from "./client";
// 전공 값은 면접 질문 쪽에서 이미 만들어 둔 것을 같이 쓴다
import type { Major } from "./interviews";

// ─────────────────────────────────────────────
// 1) 서버가 쓰는 값들
// ─────────────────────────────────────────────

// 역할 (한 사람이 여러 개 가질 수 있다)
export type Role = "MANAGER" | "LEADER" | "SENIOR" | "MEMBER";

// ⚠ 화면 글자 ↔ 서버 역할 (백엔드 확인 전 가정. 사이드바도 LEADER를 부장으로 쓴다)
export const ROLE_LABEL: Record<Role, string> = {
  LEADER: "부장",
  MANAGER: "운영진",
  SENIOR: "선배",
  MEMBER: "팀원",
};

// 팀원 상태: 승인 대기 / 가입됨
export type MemberStatus = "PENDING" | "JOINED" | "INACTIVE";

// ─────────────────────────────────────────────
// 2) 서버와 주고받는 데이터 모양
// ─────────────────────────────────────────────

// 팀원 정보 (GET /members, GET·PATCH /members/me 응답)
export interface Member {
  memberId: number;
  name: string;
  // 서버 내부에서 쓰는 기수 번호
  generationId: number;
  // 실제 기수 숫자 (10 → 화면에는 "10기")
  generation: number;
  majors: Major[];
  roles: Role[];
  status: MemberStatus;
}

// 내 프로필 수정할 때 보낼 것 (PATCH /members/me)
export interface MyProfileUpdateRequest {
  name?: string;
  majors?: Major[];
}

// 팀원 정보 수정할 때 보낼 것 (POST /members/{id}, 부장만)
export interface MemberUpdateRequest {
  name?: string;
  // 기수는 숫자(10)가 아니라 서버 기수 번호(generationId)로 보낸다
  generationId?: number;
  majors?: Major[];
}

// ─────────────────────────────────────────────
// 3) 내 프로필
// ─────────────────────────────────────────────

// 내 프로필 불러오기 — GET /members/me
export const getMyProfile = async () => {
  const { data } = await api.get<Member>("/members/me");
  return data;
};

// 내 프로필 수정 — PATCH /members/me
export const updateMyProfile = async (body: MyProfileUpdateRequest) => {
  const { data } = await api.patch<Member>("/members/me", body);
  return data;
};

// ─────────────────────────────────────────────
// 4) 팀원 관리 (부장)
// ─────────────────────────────────────────────

// 팀원 목록 — GET /members
export const getMembers = async () => {
  const { data } = await api.get<Member[]>("/members");
  return data;
};

// 팀원 정보 수정 — POST /members/{memberId} (주의: PATCH가 아니라 POST)
export const updateMember = async (memberId: number, body: MemberUpdateRequest) => {
  const { data } = await api.post<Member>(`/members/${memberId}`, body);
  return data;
};

// 역할 주기 — POST /members/{memberId}/roles
export const grantRole = async (memberId: number, role: Role) => {
  await api.post(`/members/${memberId}/roles`, { role });
};

// 역할 빼기 — DELETE /members/{memberId}/roles/{role}
// 팀의 마지막 부장(LEADER)을 빼면 서버가 409로 거절한다
export const removeRole = async (memberId: number, role: Role) => {
  await api.delete(`/members/${memberId}/roles/${role}`);
};