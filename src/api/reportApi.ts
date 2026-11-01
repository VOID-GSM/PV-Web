import { apiRequest, queryString } from "./client";
export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  content: string;
  generatedAt: string;
}
export function getWeeklyReport(date?: string) {
  return apiRequest<WeeklyReport>(`/reports/weekly${queryString({ date })}`);
}
export function generateWeeklyReport(date?: string) {
  return apiRequest<WeeklyReport>(`/reports/weekly/generate${queryString({ date })}`, { method: "POST" });
}
