import { apiRequest } from "./client";
export interface Absence {
  id: number; sessionId: number; activityId: number; memberId: number; reason: string;
  status: "REQUESTED" | "APPROVED" | "REJECTED"; rejectComment?: string; createdAt: string;
}
export interface Attendance {
  memberId: number; status: "PENDING" | "PRESENT" | "EXCUSED" | "ABSENT"; checkedAt?: string;
}
export function getPendingAbsences() { return apiRequest<Absence[]>("/attendance/absences"); }
export function requestAbsence(sessionId: number, reason: string) {
  return apiRequest<Absence>("/attendance/absences", { method: "POST", body: { sessionId, reason } });
}
export function approveAbsence(absenceId: number) {
  return apiRequest<Absence>(`/attendance/absences/${absenceId}/approve`, { method: "POST" });
}
export function rejectAbsence(absenceId: number, comment: string) {
  return apiRequest<Absence>(`/attendance/absences/${absenceId}/reject`, { method: "POST", body: { comment } });
}
export function getSessionAttendance(sessionId: number) {
  return apiRequest<Attendance[]>(`/attendance/sessions/${sessionId}`);
}
export function checkIn(sessionId: number, code?: string) {
  return apiRequest<Attendance>(`/attendance/sessions/${sessionId}/check-in`, { method: "POST", body: code ? { code } : {} });
}
export function getMemberAttendanceStats(memberId: number) {
  return apiRequest<unknown[]>(`/attendance/stats/members/${memberId}`);
}
export function getActivityAttendanceStats(activityId: number) {
  return apiRequest<unknown[]>(`/attendance/stats/activities/${activityId}`);
}
