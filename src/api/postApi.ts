import { apiRequest, queryString } from "./client";

export interface ApiPostSummary {
  id: number;
  authorId: number;
  authorName: string | null;
  activityId?: number;
  sessionId?: number;
  questionId?: number;
  title: string;
  createdAt: string;
}

export interface ApiPost extends ApiPostSummary {
  content: string;
  updatedAt?: string;
}

export interface PostSearchCondition {
  activityId?: number;
  sessionId?: number;
  author?: "me" | string;
  from?: string;
  to?: string;
  validRange?: boolean;
}

export interface PostCompareCondition {
  sessionId?: number;
  questionId?: number;
  exactlyOne?: boolean;
}

export interface PageResult<T> {
  content: T[];
  page?: {
    size?: number;
    number?: number;
    totalElements?: number;
    totalPages?: number;
  };
}

export interface PostCreateRequest {
  activityId?: number;
  sessionId?: number;
  questionId?: number;
  title: string;
  content: string;
  linked?: boolean;
}

export interface PostUpdateRequest {
  title?: string;
  content?: string;
  notEmpty?: boolean;
  notBlankIfPresent?: boolean;
}

export function getPosts(
  cond: PostSearchCondition = { validRange: false },
  page = 0,
  size = 20,
) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  // 백엔드에서 직접 받는 파라미터
  if (cond.activityId !== undefined) {
    params.set("activityId", String(cond.activityId));
  }

  if (cond.sessionId !== undefined) {
    params.set("sessionId", String(cond.sessionId));
  }

  // 그 외 검색 조건
  Object.entries(cond).forEach(([key, value]) => {
    if (
      key === "activityId" ||
      key === "sessionId" ||
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return;
    }

    params.set(`cond.${key}`, String(value));
  });

  return apiRequest<PageResult<ApiPostSummary>>(`/posts?${params.toString()}`);
}

export function getPost(postId: number) {
  return apiRequest<ApiPost>(`/posts/${postId}`);
}

export function createPost(body: PostCreateRequest) {
  return apiRequest<ApiPost>("/posts", {
    method: "POST",
    body,
  });
}

export function updatePost(postId: number, body: PostUpdateRequest) {
  return apiRequest<ApiPost>(`/posts/${postId}`, {
    method: "PATCH",
    body,
  });
}

export function deletePost(postId: number) {
  return apiRequest<void>(`/posts/${postId}`, {
    method: "DELETE",
  });
}

export function comparePosts(cond: PostCompareCondition = {}) {
  return apiRequest<ApiPost[]>(
    `/posts/compare${queryString({
      sessionId: cond.sessionId,
      questionId: cond.questionId,
      exactlyOne: cond.exactlyOne,
    })}`,
  );
}
