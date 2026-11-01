import { apiRequest, queryString } from "./client";
export type CommentTargetType = "NOTE" | "SUBMISSION" | "WORKLOG";
export interface ApiComment {
  id: number; authorId: number; content: string; createdAt: string; updatedAt?: string;
  anchor?: { blockIndex: number; startOffset: number; endOffset: number; quotedText?: string };
}
export function getComments(targetType: CommentTargetType, targetId: number) {
  return apiRequest<ApiComment[]>(`/comments${queryString({ targetType, targetId })}`);
}
export function createComment(body: { targetType: CommentTargetType; targetId: number; content: string; anchor?: { blockIndex: number; startOffset: number; endOffset: number } }) {
  return apiRequest<ApiComment>("/comments", { method: "POST", body });
}
export function updateComment(commentId: number, content: string) {
  return apiRequest<ApiComment>(`/comments/${commentId}`, { method: "PATCH", body: { content } });
}
export function deleteComment(commentId: number) {
  return apiRequest<void>(`/comments/${commentId}`, { method: "DELETE" });
}
export function getMyFeedbackRequests() {
  return apiRequest<ApiComment[]>("/comments/feedback-requests/me");
}
export function completeFeedbackRequest(requestId: number) {
  return apiRequest<void>(`/comments/feedback-requests/${requestId}/complete`, { method: "POST" });
}
