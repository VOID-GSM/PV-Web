// ===== 회고 페이지에서 쓰는 고정 값과 타입 =====

// 지금 로그인한 나 (서버 연결 전이라 고정 값)
export const ME = "동키";

// 회고를 쓸 수 있는 보드 목록
export const RETRO_BOARDS = [
  { name: "빛가람 경진대회", dotColor: "bg-blue-600", period: "9/1 ~ 10/20" },
  { name: "안끊겨 프로젝트", dotColor: "bg-green-600", period: "9/8 ~ 11/30" },
  { name: "React 심화", dotColor: "bg-blue-400", period: "9/3 ~ 10/29" },
  { name: "포폴 피드백", dotColor: "bg-teal-500", period: "9/10 ~ 10/31" },
];

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