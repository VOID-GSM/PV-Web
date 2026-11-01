import { api } from "./client";

// ─────────────────────────────────────────────
// 1) 서버가 쓰는 값들 (api-docs.json에서 확인)
// ─────────────────────────────────────────────

// 공개 범위: 팀 전체 공개 / 나만 보기
export type Visibility = "PUBLIC" | "PRIVATE";

// 업무일지 하나
export interface Worklog {
  id: number;
  authorId: number;
  authorName: string;
  // 보드 태그 (없으면 null)
  boardId: number | null;
  title: string;
  content: string;
  visibility: Visibility;
  // "2026-10-30T11:46:54.700Z" 모양
  createdAt: string;
  updatedAt: string;
}

// 업무일지 목록 응답 (페이지 정보가 page 안에 묶여서 온다)
export interface WorklogPage {
  content: Worklog[];
  page: { size: number; number: number; totalElements: number; totalPages: number };
}

// 작성할 때 보낼 것
export interface WorklogCreateRequest {
  // 최대 100자
  title: string;
  // 최대 10000자
  content: string;
  visibility: Visibility;
  // 보드 태그 (선택)
  boardId?: number;
}

// 수정할 때 보낼 것 (바꿀 것만)
export type WorklogUpdateRequest = Partial<Omit<WorklogCreateRequest, "boardId">>;

// 댓글 하나 (서버가 쓴 사람 이름은 안 주고 번호만 준다)
export interface Comment {
  id: number;
  authorId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// 2) 업무일지 요청 함수
// ─────────────────────────────────────────────

// 목록 — GET /worklogs?boardId=&page=&size=
// 비공개 글은 서버가 알아서 "내 것만" 보내준다
export const getWorklogs = async (boardId?: number, page = 0, size = 50) => {
  const { data } = await api.get<WorklogPage>("/worklogs", { params: { boardId, page, size } });
  return data;
};

// 작성 — POST /worklogs (응답 내용 없음)
export const createWorklog = async (body: WorklogCreateRequest) => {
  await api.post("/worklogs", body);
};

// 수정 — PATCH /worklogs/{id} (작성자만)
export const updateWorklog = async (id: number, body: WorklogUpdateRequest) => {
  await api.patch(`/worklogs/${id}`, body);
};

// 삭제 — DELETE /worklogs/{id} (작성자만)
export const deleteWorklog = async (id: number) => {
  await api.delete(`/worklogs/${id}`);
};

// ─────────────────────────────────────────────
// 3) 댓글 요청 함수 (업무일지용)
// ─────────────────────────────────────────────

// 댓글 목록 — GET /comments?targetType=WORKLOG&targetId=
export const getWorklogComments = async (worklogId: number) => {
  const { data } = await api.get<Comment[]>("/comments", {
    params: { targetType: "WORKLOG", targetId: worklogId },
  });
  return data;
};

// 댓글 작성 — POST /comments (최대 5000자)
export const createWorklogComment = async (worklogId: number, content: string) => {
  const { data } = await api.post<Comment>("/comments", {
    targetType: "WORKLOG",
    targetId: worklogId,
    content,
  });
  return data;
};

// 댓글 삭제 — DELETE /comments/{id}
export const deleteComment = async (commentId: number) => {
  await api.delete(`/comments/${commentId}`);
};  