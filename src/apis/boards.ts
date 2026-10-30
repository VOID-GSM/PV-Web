import { api } from "./client";

// 보드 하나 (캘린더의 프로젝트·대회)
export interface Board {
  id: number;
  name: string;
  type: "PROJECT" | "CONTEST";
  // 보드 색 (예: "#3B82F6")
  color: string;
  // "2026-10-30" 모양
  startDate: string;
  endDate: string;
  // 마감까지 남은 날
  dDay: number;
  alertDays: number[];
  // 진행 중 / 종료
  status: "ACTIVE" | "CLOSED";
}

// 보드 목록 — GET /boards
export const getBoards = async () => {
  const { data } = await api.get<Board[]>("/boards");
  return data;
};
