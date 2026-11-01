import { apiRequest } from "./client";

export interface HomeTodoItem {
  type: "TOPIC_INPUT" | "ASSIGNMENT_SUBMIT" | "FEEDBACK_GIVE" | "TOPIC_VOTE" | "ABSENCE_APPROVE";
  typeLabel: string;
  targetId: number;
  targetName: string;
  description: string;
  dueAt?: string;
  overdue: boolean;
}
export interface HomeTodosResponse {
  date: string;
  totalCount: number;
  counts: Record<string, number>;
  items: HomeTodoItem[];
}
export interface DashboardMember {
  memberId: number;
  name: string;
  generation: number;
  boardCount: number;
  weeklyDeadlineCount: number;
  overloaded: boolean;
  presentCount: number;
  excusedCount: number;
  absentCount: number;
  attendanceRate: number;
  dueAssignmentCount: number;
  submittedAssignmentCount: number;
  assignmentSubmissionRate: number;
}
export interface DashboardResponse {
  weekStart: string;
  weekEnd: string;
  overloadedMemberCount: number;
  members: DashboardMember[];
}
export function getHomeTodos() {
  return apiRequest<HomeTodosResponse>("/home/todos");
}
export function getHomeDashboard() {
  return apiRequest<DashboardResponse>("/home/dashboard");
}
