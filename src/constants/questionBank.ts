// ===== 면접 질문 뱅크에서 쓰는 고정 값, 타입, 도우미 함수 =====

// 지금 로그인한 나 (서버 연결 전이라 고정 값)
export const ME = "동키";
export const MY_GENERATION = "10기";

// 전공 목록
export const MAJORS = ["Front-end", "Back-end", "DevOps", "Design"];

// 카테고리 목록. badge: 배지 색
export const CATEGORIES = [
  { name: "기술", badge: "bg-blue-50 text-blue-600" },
  { name: "인성", badge: "bg-green-50 text-green-600" },
  { name: "프로젝트", badge: "bg-orange-50 text-orange-600" },
];

// 카테고리 이름으로 배지 색 찾기 (못 찾으면 회색)
export const getCategoryBadge = (name: string) =>
  CATEGORIES.find((c) => c.name === name)?.badge ?? "bg-neutral-100 text-neutral-600";

// 위쪽 탭 4개
export const QB_TABS = ["질문 목록", "내 답변", "랜덤 모의면접", "기수별 아카이브"];

// 모의면접 한 질문당 제한 시간(초)
export const ANSWER_TIME_LIMIT = 120;
// 모의면접 한 번에 뽑는 최대 질문 수
export const MAX_SESSION_QUESTIONS = 10;
// 답변 최대 글자 수
export const MAX_ANSWER_LENGTH = 2000;

// 질문 하나의 모양
export type Question = {
  id: number;
  title: string;
  major: string;
  category: string;
  // "10월 4주차" 모양
  week: string;
};

// 답변 하나의 모양
export type Answer = {
  id: number;
  questionId: number;
  author: string;
  generation: string;
  // "2026-10-26" 모양
  date: string;
  content: string;
  // ★를 누른 사람들
  likedBy: string[];
};

// 모의면접 기록 상태
export type PracticeStatus = "저장됨" | "말로 연습" | "시간 초과" | "건너뜀";

// 연습 기록 하나의 모양
export type PracticeRecord = {
  id: number;
  questionTitle: string;
  category: string;
  date: string;
  // 걸린 시간(초)
  seconds: number;
  status: PracticeStatus;
};

// 상태별 배지 색
export const STATUS_BADGE: Record<PracticeStatus, string> = {
  저장됨: "bg-green-50 text-green-700",
  "말로 연습": "bg-blue-50 text-blue-700",
  "시간 초과": "bg-orange-50 text-orange-700",
  건너뜀: "bg-neutral-100 text-neutral-500",
};

// 초 → "02:00" 모양
export const formatTimer = (total: number) => {
  const m = Math.floor(total / 60);
  const s = total % 60;
  // padStart(2, "0"): 한 자리면 앞에 0을 붙인다 (5 → "05")
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

// 초 → "1분 52초" 모양
export const formatDuration = (total: number) => `${Math.floor(total / 60)}분 ${total % 60}초`;

// Date → "2026-10-26" 모양 (한국 시간 기준)
export const formatDate = (d: Date) => d.toLocaleDateString("sv-SE");