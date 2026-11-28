import { api } from "./client";
import type { Major } from "./interviews";

// ─────────────────────────────────────────────
// 1) 서버가 쓰는 값들 (api-docs.json에서 확인 완료)
// ─────────────────────────────────────────────

// 목록 종류: 받은 과제 / 낸 과제
export type AssignmentListType = "RECEIVED" | "CREATED";

// 대상 종류: 전체 / 전공 / 개인 지정
export type TargetType = "ALL" | "MAJOR" | "MEMBER";

// 제출 상태: 제출됨 / 통과 / 재제출 요청 (아직 안 냈으면 null)
// "지각"은 상태가 아니라 late(true/false)로 따로 온다
export type SubmissionStatus = "SUBMITTED" | "PASSED" | "RESUBMIT_REQUESTED";

// ─────────────────────────────────────────────
// 2) 서버와 주고받는 데이터 모양
// ─────────────────────────────────────────────

// 목록에 나오는 과제 하나
export interface AssignmentSummary {
  id: number;
  title: string;
  // "2026-10-30T11:46:54.700Z" 모양 (세계 시각)
  deadline: string;
  targetType: TargetType;
  authorId: number;
  authorName: string;
  // 받은 과제일 때: 내 제출 상태, 내가 늦게 냈는지 (아직 안 냈으면 null)
  mySubmissionStatus?: SubmissionStatus | null;
  myLate?: boolean | null;
  // 낸 과제일 때: 제출한 사람 수
  submissionCount?: number | null;
}

// 과제 목록 응답 (페이지 정보가 content 옆에 바로 붙어 있다)
export interface AssignmentPage {
  content: AssignmentSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// 과제 상세 (설명·대상 전공·연결 역량까지)
export interface AssignmentDetail {
  id: number;
  title: string;
  description: string;
  deadline: string;
  targetType: TargetType;
  targetMajors: Major[];
  targetMemberIds: number[];
  fileKeys: string[];
  skills: { id: number; name: string }[];
  authorId: number;
  authorName: string;
  createdAt: string;
}

// 과제 출제할 때 보낼 것
export interface AssignmentCreateRequest {
  // 최대 200자
  title: string;
  // 최대 5000자
  description: string;
  // 세계 시각(ISO) 모양. 지금보다 미래여야 한다
  deadline: string;
  targetType: TargetType;
  // targetType이 MAJOR일 때
  targetMajors: Major[];
  // targetType이 MEMBER일 때: 이름이 아니라 회원 번호
  targetMemberIds: number[];
  // 첨부 파일 (최대 10개, 아직 업로드 기능이 없어서 빈 배열)
  fileKeys: string[];
  // 연결할 역량 항목 번호들 (최대 20개)
  skillIds: number[];
}

// 제출 현황의 받는 사람 한 명
export interface SubmissionStatusItem {
  memberId: number;
  memberName: string;
  submitted: boolean;
  status: SubmissionStatus | null;
  late: boolean;
  // 제출물 번호 (안 냈으면 null)
  submissionId: number | null;
  submittedAt: string | null;
}

// 제출 현황 (출제자·부장만 볼 수 있다)
export interface SubmissionStatusSummary {
  assignmentId: number;
  total: number;
  submittedCount: number;
  notSubmittedCount: number;
  lateCount: number;
  passedCount: number;
  resubmitRequestedCount: number;
  items: SubmissionStatusItem[];
}

// 제출물 하나
export interface Submission {
  id: number;
  assignmentId: number;
  submitterId: number;
  submitterName: string;
  status: SubmissionStatus;
  late: boolean;
  // 텍스트 제출 내용
  content: string | null;
  fileKeys: string[];
  githubUrl: string | null;
  // 통과·재제출 요청할 때 남긴 피드백
  feedback: string | null;
  submittedAt: string;
  lastSubmittedAt: string | null;
  reviewedAt: string | null;
}

// 제출·재제출할 때 보낼 것 (셋 중 쓰는 것만)
export interface SubmissionRequest {
  // 최대 10000자
  content?: string;
  fileKeys?: string[];
  // "https://github.com/..." 모양만 가능
  githubUrl?: string;
}

// ─────────────────────────────────────────────
// 3) 과제 요청 함수
// ─────────────────────────────────────────────

// 과제 목록 — GET /assignments?type=&page=&size=
export const getAssignments = async (type: AssignmentListType, page = 0, size = 50) => {
  const { data } = await api.get<AssignmentPage>("/assignments", { params: { type, page, size } });
  return data;
};

// 과제 상세 — GET /assignments/{id}
export const getAssignment = async (assignmentId: number) => {
  const { data } = await api.get<AssignmentDetail>(`/assignments/${assignmentId}`);
  return data;
};

// 과제 출제 — POST /assignments (부장·선배만, 아니면 403 / 응답 내용 없음)
export const createAssignment = async (body: AssignmentCreateRequest) => {
  await api.post("/assignments", body);
};

// ─────────────────────────────────────────────
// 4) 제출 요청 함수
// ─────────────────────────────────────────────

// 제출 현황 — GET /assignments/{id}/submissions (출제자·부장만)
export const getSubmissionStatus = async (assignmentId: number) => {
  const { data } = await api.get<SubmissionStatusSummary>(`/assignments/${assignmentId}/submissions`);
  return data;
};

// 제출물 상세 — GET /assignments/{id}/submissions/{submissionId}
export const getSubmission = async (assignmentId: number, submissionId: number) => {
  const { data } = await api.get<Submission>(`/assignments/${assignmentId}/submissions/${submissionId}`);
  return data;
};

// 제출 — POST /assignments/{id}/submissions (마감 지나면 late=true로 저장)
export const submitAssignment = async (assignmentId: number, body: SubmissionRequest) => {
  const { data } = await api.post<Submission>(`/assignments/${assignmentId}/submissions`, body);
  return data;
};

// 재제출 — PATCH /assignments/{id}/submissions/{submissionId}
export const resubmitAssignment = async (assignmentId: number, submissionId: number, body: SubmissionRequest) => {
  await api.patch(`/assignments/${assignmentId}/submissions/${submissionId}`, body);
};

// 통과 — POST .../{submissionId}/pass (피드백은 선택)
export const passSubmission = async (assignmentId: number, submissionId: number, comment?: string) => {
  await api.post(`/assignments/${assignmentId}/submissions/${submissionId}/pass`, comment ? { comment } : {});
};

// 재제출 요청 — POST .../{submissionId}/request-resubmission (피드백 필수)
export const requestResubmission = async (assignmentId: number, submissionId: number, comment: string) => {
  await api.post(`/assignments/${assignmentId}/submissions/${submissionId}/request-resubmission`, { comment });
};