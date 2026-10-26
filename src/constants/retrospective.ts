// ===== 회고 페이지에서 쓰는 고정 값과 타입 =====

// 지금 로그인한 나 (서버 연결 전이라 고정 값)
export const ME = "동키";

// 보드 하나의 모양
export type RetroBoard = {
  name: string;
  dotColor: string;
  // "9/1 ~ 10/20" 모양의 기간
  period: string;
};

// 보드 목록. 실제로는 캘린더에서 만든 보드를 받아와야 해서 빈 상태로 시작한다
export const RETRO_BOARDS: RetroBoard[] = [];

// KPT 세 칸의 이름표
export type KptKey = "keep" | "problem" | "tryText";

// KPT 세 칸의 글자와 색
export const KPT_FIELDS: {
  key: KptKey;
  label: string;
  description: string;
  color: string;
  bg: string;
}[] = [
  { key: "keep", label: "Keep", description: "잘했던 점, 다음에도 유지할 것", color: "text-green-600", bg: "bg-green-50" },
  { key: "problem", label: "Problem", description: "아쉬웠던 점, 문제였던 것", color: "text-red-600", bg: "bg-red-50" },
  { key: "tryText", label: "Try", description: "다음 프로젝트에서 시도해 볼 것", color: "text-blue-600", bg: "bg-blue-50" },
];

// 회고 하나의 모양
export type Retrospective = {
  id: number;
  boardName: string;
  author: string;
  // "2026-10-26" 모양
  date: string;
  keep: string;
  problem: string;
  tryText: string;
};