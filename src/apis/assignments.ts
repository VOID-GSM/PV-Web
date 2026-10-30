import { api } from "./client";
import type { Major } from "./interviews";

// ─────────────────────────────────────────────
// 1) 서버가 쓰는 값들 (Swagger Schemas에서 확인 완료)
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

// 과제 출제할 때 보낼 것
export interface AssignmentCreateRequest {
  // 최대 200자
  title: string;
  // 최대 5000자
  description: string;
  // 세계 시각(ISO) 모양으로 보낸다
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

// 제출물 하나 (제출 현황·내 제출물에서 사용)
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
  // 재제출 요청할 때 남긴 피드백
  feedback: string | null;
  submittedAt: string;
  lastSubmittedAt: string | null;
  reviewedAt: string | null;
}

// ─────────────────────────────────────────────
// 3) 실제로 서버에 요청하는 함수들
// ─────────────────────────────────────────────

// 과제 목록 — GET /assignments?type=&page=&size=
export const getAssignments = async (type: AssignmentListType, page = 0, size = 50) => {
  const { data } = await api.get<AssignmentPage>("/assignments", {
    params: { type, page, size },
  });
  return data;
};

// 과제 출제 — POST /assignments (부장·선배만, 아니면 403)
// 응답 내용이 없어서(200 OK만) 아무것도 돌려주지 않는다
export const createAssignment = async (body: AssignmentCreateRequest) => {
  await api.post("/assignments", body);
};