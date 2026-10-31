import { apiRequest, queryString } from "./client";

export type Major = "FRONTEND" | "BACKEND" | "DEVOPS" | "DESIGN";
export type ActivityType = "STUDY" | "INTERVIEW" | "PORTFOLIO";
export type ActivityStatus = "RECRUITING" | "ONGOING" | "ENDED";
export interface ActivitySummary {
  id: number; name: string; type: ActivityType; typeLabel?: string;
  recruitMode: "FIRST_COME" | "APPROVAL"; recruitModeLabel?: string;
  status: ActivityStatus; statusLabel?: string; capacity: number;
  memberCount: number; startDate: string; endDate: string;
}
export interface ActivityDetail {
  summary: ActivitySummary;
  description?: string;
  targetMajors?: Major[];
  targetGenerations?: { id: number; number: number }[];
  topicMode?: "VOTE" | "ASSIGNED";
  topicModeLabel?: string;
  repeatDayOfWeek?: string;
  repeatTime?: string;
  topicOpenDaysBefore?: number;
  members?: ActivityMember[];
  upcomingSessions?: ActivitySession[];
}
export interface ActivityMember { memberId: number; name: string; role?: string; }
export interface ActivitySession { id: number; sessionNo?: number; sessionDate?: string; sessionTime?: string; topic?: string; status?: "SCHEDULED" | "CANCELLED" | "DONE"; statusLabel?: string; votingOpen?: boolean; date?: string; title?: string; description?: string; }
export interface ActivityCreateRequest {
  type: ActivityType; name: string; description?: string; targetMajors?: Major[];
  targetGenerationIds?: number[]; capacity: number; startDate: string; endDate: string;
  repeatDayOfWeek?: string; repeatTime?: string; recruitMode: "FIRST_COME" | "APPROVAL";
  topicMode: "VOTE" | "ASSIGNED"; topicOpenDaysBefore?: number;
}
export interface TopicCandidate { id: number; title: string; proposerId: number; proposerName: string; voteCount: number; voted: boolean; }
export interface ActivityApplication { id: number; memberId: number; name: string; status: string; statusLabel: string; createdAt: string; }

export function getActivities(filters: { type?: ActivityType; major?: Major; generationId?: number; status?: ActivityStatus } = {}) {
  return apiRequest<ActivitySummary[]>(`/activities${queryString(filters as Record<string, string | number | boolean | undefined>)}`);
}
export function createActivity(body: ActivityCreateRequest) {
  return apiRequest<ActivitySummary>("/activities", { method: "POST", body });
}
export function getActivity(activityId: number) {
  return apiRequest<ActivityDetail>(`/activities/${activityId}`);
}
export function updateActivity(activityId: number, body: Partial<ActivityCreateRequest>) {
  return apiRequest<void>(`/activities/${activityId}`, { method: "PATCH", body });
}
export function deleteActivity(activityId: number) {
  return apiRequest<void>(`/activities/${activityId}`, { method: "DELETE" });
}
export function getActivitySessions(activityId: number) {
  return apiRequest<ActivitySession[]>(`/activities/${activityId}/sessions`);
}
export function getActivityMembers(activityId: number) {
  return apiRequest<ActivityMember[]>(`/activities/${activityId}/members`);
}
export function getTopicCandidates(activityId: number, sessionId: number) {
  return apiRequest<TopicCandidate[]>(`/activities/${activityId}/sessions/${sessionId}/topic-candidates`);
}
export function proposeTopicCandidate(activityId: number, sessionId: number, title: string) {
  return apiRequest<TopicCandidate>(`/activities/${activityId}/sessions/${sessionId}/topic-candidates`, { method: "POST", body: { title } });
}
export function voteTopicCandidate(activityId: number, sessionId: number, candidateId: number) {
  return apiRequest<void>(`/activities/${activityId}/sessions/${sessionId}/topic-candidates/${candidateId}/votes`, { method: "POST" });
}
export function cancelTopicVote(activityId: number, sessionId: number, candidateId: number) {
  return apiRequest<void>(`/activities/${activityId}/sessions/${sessionId}/topic-candidates/${candidateId}/votes/me`, { method: "DELETE" });
}
export function getActivityApplications(activityId: number) {
  return apiRequest<ActivityApplication[]>(`/activities/${activityId}/applications`);
}
export function applyToActivity(activityId: number) {
  return apiRequest<ActivityApplication>(`/activities/${activityId}/applications`, { method: "POST" });
}
export function cancelActivityApplication(activityId: number) {
  return apiRequest<void>(`/activities/${activityId}/applications/me`, { method: "DELETE" });
}
export function approveActivityApplication(activityId: number, applicationId: number) {
  return apiRequest<void>(`/activities/${activityId}/applications/${applicationId}/approve`, { method: "POST" });
}
export function rejectActivityApplication(activityId: number, applicationId: number) {
  return apiRequest<void>(`/activities/${activityId}/applications/${applicationId}/reject`, { method: "POST" });
}
