import { api } from "./client";

// 내 재입장 코드 (GET /auth/members/me/re-entry-link 응답)
export interface ReEntryCode {
  code: string;
}

// 재발급 결과 (POST /auth/members/{memberId}/re-entry-links 응답)
export interface ReEntryCodeIssued {
  memberId: number;
  code: string;
}

// 내 재입장 코드 불러오기 — GET /auth/members/me/re-entry-link
export const getMyReEntryCode = async () => {
  const { data } = await api.get<ReEntryCode>("/auth/members/me/re-entry-link");
  return data;
};

// 재입장 코드 재발급 — POST /auth/members/{memberId}/re-entry-links
// 보내는 내용 없이 주소에 회원 번호만 넣는다 (부장 권한일 가능성이 큼)
export const issueReEntryCode = async (memberId: number) => {
  const { data } = await api.post<ReEntryCodeIssued>(`/auth/members/${memberId}/re-entry-links`);
  return data;
};