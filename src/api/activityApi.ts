import { apiRequest, queryString } from "./client";

export type Major = "FRONTEND" | "BACKEND" | "DEVOPS" | "DESIGN";
export type ActivityType = "STUDY" | "INTERVIEW" | "PORTFOLIO";
export type ActivityStatus = "RECRUITING" | "ONGOING" | "ENDED";
// 내 참여 신청 상태 (NONE: 신청하지 않음)
export type ApplicationStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED";
export interface ActivitySummary {
  id: number;
  name: string;
  type: ActivityType;
  typeLabel?: string;
  recruitMode: "FIRST_COME" | "APPROVAL";
  recruitModeLabel?: string;
  status: ActivityStatus;
  statusLabel?: string;
  capacity: number;
  memberCount: number;
  startDate: string;
  endDate: string;
  // 내가 이 활동에 참여 중인지 (목록·상세 모두 온다)
  isMember?: boolean;
  // 내 신청 상태 (서버에서 추가 예정. 아직 없으면 undefined)
  myApplicationStatus?: ApplicationStatus;
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
  discordEnabled?: boolean;
  // summary 안이 아니라 상세 바로 아래로 올 수도 있어서 둘 다 받아 둔다
  myApplicationStatus?: ApplicationStatus;
  members?: ActivityMember[];
  upcomingSessions?: ActivitySession[];
}
// role: LEADER(스터디장) / MEMBER
export interface ActivityMember {
  memberId: number;
  name: string;
  role?: string;
  roleLabel?: string;
  joinedAt?: string;
}
export interface ActivitySession {
  id: number;
  sessionNo?: number;
  sessionDate?: string;
  sessionTime?: string;
  topic?: string;
  status?: "SCHEDULED" | "CANCELLED" | "DONE";
  statusLabel?: string;
  votingOpen?: boolean;
  date?: string;
  title?: string;
  description?: string;
}
export interface ActivityCreateRequest {
  type: ActivityType;
  name: string;
  description?: string;
  targetMajors?: Major[];
  targetGenerationIds?: number[];
  capacity: number;
  startDate: string;
  endDate: string;
  repeatDayOfWeek?: string;
  repeatTime?: string;
  recruitMode: "FIRST_COME" | "APPROVAL";
  topicMode: "VOTE" | "ASSIGNED";
  topicOpenDaysBefore?: number;
  discordEnabled?: boolean;
}
// 활동 수정 (PATCH). 모두 선택 항목이고, 개설 후에는 아래 항목만 바꿀 수 있다.
// ⚠ startDate / endDate를 보내면 서버가 400을 준다. 요일·시간도 수정할 수 없다.
//   회차의 날짜·시간·주제는 PATCH /activities/{id}/sessions/{sessionId}로 바꾼다.
export interface ActivityUpdateRequest {
  name?: string; // 최대 100자
  description?: string; // 최대 2000자
  targetMajors?: Major[]; // 최대 10개
  targetGenerationIds?: number[]; // 최대 20개
  capacity?: number; // 1 ~ 200
  status?: ActivityStatus;
}
export interface TopicCandidate {
  id: number;
  title: string;
  proposerId: number;
  proposerName: string;
  voteCount: number;
  voted: boolean;
}
export interface ActivityApplication {
  id: number;
  memberId: number;
  name: string;
  status: string;
  statusLabel: string;
  createdAt: string;
}

export function getActivities(
  filters: {
    type?: ActivityType;
    major?: Major;
    generationId?: number;
    status?: ActivityStatus;
  } = {},
) {
  return apiRequest<ActivitySummary[]>(
    `/activities${queryString(filters as Record<string, string | number | boolean | undefined>)}`,
  );
}
export function createActivity(body: ActivityCreateRequest) {
  return apiRequest<ActivitySummary>("/activities", { method: "POST", body });
}
export function getActivity(activityId: number) {
  return apiRequest<ActivityDetail>(`/activities/${activityId}`);
}
export function updateActivity(
  activityId: number,
  body: ActivityUpdateRequest,
) {
  return apiRequest<void>(`/activities/${activityId}`, {
    method: "PATCH",
    body,
  });
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
  return apiRequest<TopicCandidate[]>(
    `/activities/${activityId}/sessions/${sessionId}/topic-candidates`,
  );
}
export function proposeTopicCandidate(
  activityId: number,
  sessionId: number,
  title: string,
) {
  return apiRequest<TopicCandidate>(
    `/activities/${activityId}/sessions/${sessionId}/topic-candidates`,
    { method: "POST", body: { title } },
  );
}
export function voteTopicCandidate(
  activityId: number,
  sessionId: number,
  candidateId: number,
) {
  return apiRequest<void>(
    `/activities/${activityId}/sessions/${sessionId}/topic-candidates/${candidateId}/votes`,
    { method: "POST" },
  );
}
export function cancelTopicVote(
  activityId: number,
  sessionId: number,
  candidateId: number,
) {
  return apiRequest<void>(
    `/activities/${activityId}/sessions/${sessionId}/topic-candidates/${candidateId}/votes/me`,
    { method: "DELETE" },
  );
}
export function getActivityApplications(activityId: number) {
  return apiRequest<ActivityApplication[]>(
    `/activities/${activityId}/applications`,
  );
}
export function applyToActivity(activityId: number) {
  return apiRequest<ActivityApplication>(
    `/activities/${activityId}/applications`,
    { method: "POST" },
  );
}
// 내 신청 취소 (이미 참여 중이면 활동 나가기도 된다. 스터디장은 409)
export function cancelActivityApplication(activityId: number) {
  return apiRequest<void>(`/activities/${activityId}/applications/me`, {
    method: "DELETE",
  });
}
export function approveActivityApplication(
  activityId: number,
  applicationId: number,
) {
  return apiRequest<void>(
    `/activities/${activityId}/applications/${applicationId}/approve`,
    { method: "POST" },
  );
}
export function rejectActivityApplication(
  activityId: number,
  applicationId: number,
) {
  return apiRequest<void>(
    `/activities/${activityId}/applications/${applicationId}/reject`,
    { method: "POST" },
  );
}
