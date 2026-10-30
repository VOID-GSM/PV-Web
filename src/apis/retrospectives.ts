import { api } from "./client";

// 회고 하나 (그 보드에 참여한 팀원 한 명의 회고)
export interface Retrospective {
  retrospectiveId: number;
  memberId: number;
  memberName: string;
  // 아직 안 썼으면 비어 있을 수 있다
  content: string | null;
}

// 보드의 회고 목록 — GET /retrospectives/boards/{boardId}
// 종료된 보드만 가능 (진행 중이면 서버가 400으로 거절)
// 보드를 종료하면 마감 담당자마다 회고 칸이 자동으로 생긴다
export const getRetrospectives = async (boardId: number) => {
  const { data } = await api.get<Retrospective[]>(`/retrospectives/boards/${boardId}`);
  return data;
};

// 내 회고 작성·수정 — PATCH /retrospectives/boards/{boardId}/me
// 처음 쓰는 것도 수정과 같은 요청 (빈 칸을 채우는 방식)
export const updateMyRetrospective = async (boardId: number, content: string) => {
  await api.patch(`/retrospectives/boards/${boardId}/me`, { content });
};

// 보드 종료 — POST /boards/{boardId}/close
// 이미 종료됐으면 409
export const closeBoard = async (boardId: number) => {
  await api.post(`/boards/${boardId}/close`);
};