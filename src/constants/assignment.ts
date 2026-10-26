// ===== 과제·역량 맵에서 쓰는 고정 값, 타입, 도우미 함수 =====

// 지금 로그인한 나 (서버 연결 전이라 고정 값)
export const ME = "동키";
export const MY_GENERATION = "10기";

// 팀원 하나의 모양
export type Member = { name: string; generation: string; majors: string[] };

// 팀원 목록. 서버 연결 전이라 나만 있다
export const MEMBERS: Member[] = [{ name: ME, generation: MY_GENERATION, majors: ["Front-end"] }];

export const GENERATIONS = ["9기", "10기"];
export const MAJORS = ["Front-end", "Back-end", "DevOps", "Design"];
export const ASSIGNMENT_TABS = ["역량 맵", "과제 목록", "제출 현황", "내 제출물"];
export const SUBMIT_TYPES = ["텍스트", "파일 첨부", "GitHub 링크"];

// 출제 대상 칩에서 쓰는 특별한 값
export const TARGET_ALL = "10기 전체";
export const TARGET_PERSONAL = "개인 지정";

export const MAX_DESCRIPTION = 2000;

// 역량 항목 (예: React 상태관리 / Front-end)
export type Skill = { id: number; name: string; major: string };

// 과제
export type Assignment = {
  id: number;
  title: string;
  description: string;
  // 연결한 역량 항목 (임시 저장이면 비어 있을 수 있다)
  skillId: number | null;
  // "2026-10-30T23:59" 모양 (날짜·시간 입력칸 값)
  deadline: string;
  // 고른 대상 칩들 (10기 전체 / 전공 / 개인 지정)
  targets: string[];
  // 개인 지정으로 고른 사람들
  personalTargets: string[];
  submitTypes: string[];
  remind: boolean;
  author: string;
  isDraft: boolean;
};

// 출제 창에서 넘겨주는 값 (번호·출제자·임시저장 여부는 페이지가 채운다)
export type AssignmentForm = Omit<Assignment, "id" | "author" | "isDraft">;

export type SubmissionStatus = "제출" | "지각 제출" | "재제출 요청" | "통과";

export type Feedback = { id: number; author: string; content: string; date: string };

// 제출물
export type Submission = {
  id: number;
  assignmentId: number;
  author: string;
  // 텍스트 / 파일 첨부 / GitHub 링크
  type: string;
  content: string;
  // "2026-10-26 14:28" 모양
  submittedAt: string;
  status: SubmissionStatus;
  feedbacks: Feedback[];
};

// 상태별 배지 색
export const STATUS_BADGE: Record<SubmissionStatus | "미제출", string> = {
  제출: "bg-green-50 text-green-700",
  "지각 제출": "bg-amber-50 text-amber-700",
  "재제출 요청": "bg-blue-50 text-blue-700",
  통과: "bg-black text-white",
  미제출: "bg-red-50 text-red-600",
};

// 과제를 받는 사람들 (10기 중에서 대상 조건에 맞는 사람)
export const getRecipients = (targets: string[], personalTargets: string[]) =>
  MEMBERS.filter(
    (m) =>
      m.generation === "10기" &&
      (targets.includes(TARGET_ALL) ||
        m.majors.some((major) => targets.includes(major)) ||
        personalTargets.includes(m.name))
  );

// 마감까지 남은 날 수 (0이면 오늘, 음수면 지남)
export const getDaysLeft = (deadline: string) =>
  Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

// 남은 날 수 → "D-3" / "D-day" / "마감"
export const formatDday = (days: number) => (days > 0 ? `D-${days}` : days === 0 ? "D-day" : "마감");

// "2026-10-30T23:59" → "2026-10-30 23:59"
export const formatDeadline = (deadline: string) => deadline.replace("T", " ");

// 지금 시각 → "2026-10-26 14:28"
export const nowString = () => {
  const d = new Date();
  return `${d.toLocaleDateString("sv-SE")} ${d.toTimeString().slice(0, 5)}`;
};

// 점수(1~5) → 칸 색 (점수가 높을수록 진한 파랑)
export const scoreColor = (score: number | undefined) => {
  if (score === undefined) return "bg-neutral-50 text-neutral-300";
  return ["", "bg-blue-50", "bg-blue-100", "bg-blue-200", "bg-blue-400 text-white", "bg-blue-600 text-white"][score];
};

// 평균 점수 → 막대 색 (낮으면 빨강, 높으면 초록)
export const averageColor = (avg: number) =>
  avg < 2.5 ? "bg-red-500" : avg < 3 ? "bg-amber-500" : avg < 3.4 ? "bg-black" : "bg-green-600";