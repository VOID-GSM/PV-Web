import { apiRequest, queryString } from "./client";

export type NoticeScope = "ALL" | "BOARD" | "ACTIVITY" | "TARGET";

export interface NoticeCreateRequest {
  scope: NoticeScope;
  boardId?: number;
  activityId?: number;
  generationIds?: number[];
  majors?: string[];
  title: string;
  content: string;
}

export interface NoticeItem {
  id: number;
  title: string;
  content?: string;
  scope: NoticeScope;
  authorId: number;
  authorName?: string;
  createdAt: string;
  read?: boolean;
}

export interface NoticeListResponse {
  items: NoticeItem[];
  nextCursor?: number;
}

export function getNotices(activityId?: number, size = 50) {
  return apiRequest<NoticeListResponse>(
    `/notices${queryString({ activityId, size })}`,
  );
}

export function getNotice(noticeId: number) {
  return apiRequest<NoticeItem>(`/notices/${noticeId}`);
}

export function createNotice(body: NoticeCreateRequest) {
  return apiRequest<NoticeItem>("/notices", {
    method: "POST",
    body,
  });
}
