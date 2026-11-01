import { api } from "./client";
// 전공 값은 면접 질문 쪽에서 이미 만들어 둔 것을 같이 쓴다
import type { Major } from "./interviews";

// ─────────────────────────────────────────────
// 1) 서버가 쓰는 값들 (Swagger에서 확인)
// ─────────────────────────────────────────────

// 역할 (한 사람이 여러 개 가질 수 있다)
export type Role = "MANAGER" | "LEADER" | "SENIOR" | "MEMBER";

// 팀원 상태: 승인 대기 / 가입됨 / 비활성
export type MemberStatus = "PENDING" | "JOINED" | "INACTIVE";

// ─────────────────────────────────────────────
// 2) 서버와 주고받는 데이터 모양
// ─────────────────────────────────────────────

// 서버가 보내주는 팀원 정보 (GET /members/me, PATCH /members/me 응답)
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
// ? : 바꾸고 싶은 것만 보내도 된다 (일부만 고치기 = PATCH)
// 기수는 여기서 못 바꾼다 (부장만 팀원 관리에서 변경)
export interface MyProfileUpdateRequest {
  name?: string;
  majors?: Major[];
}

// ─────────────────────────────────────────────
// 3) 실제로 서버에 요청하는 함수들
// ─────────────────────────────────────────────

// 내 프로필 불러오기 — GET /members/me
// 서버가 토큰을 보고 "나"를 알아서, 회원 번호를 안 보내도 된다
export const getMyProfile = async () => {
  const { data } = await api.get<Member>("/members/me");
  return data;
};

// 내 프로필 수정 — PATCH /members/me
// 수정된 내 정보를 돌려준다
export const updateMyProfile = async (body: MyProfileUpdateRequest) => {
  const { data } = await api.patch<Member>("/members/me", body);
  return data;
};