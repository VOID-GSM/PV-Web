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
  tags?: string[];
}

export interface ApiPost extends ApiPostSummary {
  content: string;
  updatedAt?: string;
  tags?: string[];
}

export interface PostSearchCondition {
  activityId?: number;
  sessionId?: number;
  author?: "me" | string;
  from?: string;
  to?: string;
  validRange?: boolean;
  tag?: string;
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
  tags?: string[];
}

export interface PostUpdateRequest {
  title?: string;
  content?: string;
  notEmpty?: boolean;
  notBlankIfPresent?: boolean;
  tags?: string[];
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

    // 백엔드 태그 검색은 cond.tag가 아니라 ?tag=값을 사용한다.
    if (key === "tag") {
      params.set("tag", String(value));
      return;
    }

    params.set(`cond.${key}`, String(value));
  });

  return apiRequest<PageResult<ApiPostSummary>>(`/posts?${params.toString()}`);
}

export function getPost(postId: number) {
  return apiRequest<ApiPost>(`/posts/${postId}`);
}

/** 아카이브 태그 필터에 사용할 서버 등록 태그 목록 */
export function getPostTags() {
  return apiRequest<string[]>("/posts/tags");
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
