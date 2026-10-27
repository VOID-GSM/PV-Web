import { apiRequest, queryString } from "./client";

export interface ApiPostSummary {
  id: number; authorId: number; activityId?: number; sessionId?: number;
  questionId?: number; title: string; createdAt: string;
}
export interface ApiPost extends ApiPostSummary {
  content: string; updatedAt?: string;
}
export interface PostSearchCondition {
  activityId?: number; sessionId?: number; author?: "me" | string;
  from?: string; to?: string; validRange?: boolean;
}
export interface PostCompareCondition { sessionId?: number; questionId?: number; exactlyOne?: boolean; }
export interface PageResult<T> { content: T[]; page?: { size?: number; number?: number; totalElements?: number; totalPages?: number }; }
export interface PostCreateRequest { sessionId?: number; questionId?: number; title: string; content: string; linked?: boolean; }
export interface PostUpdateRequest { title?: string; content?: string; notEmpty?: boolean; notBlankIfPresent?: boolean; }

export function getPosts(cond: PostSearchCondition = { validRange: false }, page = 0, size = 20) {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  Object.entries(cond).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") params.set(`cond.${key}`, String(value));
  });
  return apiRequest<PageResult<ApiPostSummary>>(`/posts?${params.toString()}`);
}
export function getPost(postId: number) { return apiRequest<ApiPost>(`/posts/${postId}`); }
export function createPost(body: PostCreateRequest) { return apiRequest<ApiPost>("/posts", { method: "POST", body }); }
export function updatePost(postId: number, body: PostUpdateRequest) { return apiRequest<ApiPost>(`/posts/${postId}`, { method: "PATCH", body }); }
export function deletePost(postId: number) { return apiRequest<void>(`/posts/${postId}`, { method: "DELETE" }); }
export function comparePosts(cond: PostCompareCondition = {}) {
  return apiRequest<ApiPost[]>(`/posts/compare${queryString(Object.fromEntries(Object.entries(cond).map(([key, value]) => [`cond.${key}`, value])) as Record<string, string | number | boolean | undefined>)}`);
}
