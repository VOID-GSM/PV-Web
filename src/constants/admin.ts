// ===== 부장 대시보드(팀원 관리)에서 쓰는 고정 값, 타입, 도우미 함수 =====

export const ME = "동키";
export const MAJORS = ["Front-end", "Back-end", "DevOps", "Design"];

// 역할 목록 (한 사람이 여러 개 가질 수 있다. 아무것도 없으면 "팀원")
export const ROLE_OPTIONS = ["부장", "스터디장", "출제자", "활동장"];

// 처음 기수 목록 (부장이 추가할 수 있다)
export const INITIAL_GENERATIONS = ["9기", "10기"];

// 초대 링크 옵션
export const EXPIRY_OPTIONS = ["1일", "7일", "30일", "만료 없음"];
export const USAGE_OPTIONS = ["1회", "5회", "15회", "무제한"];
export const ENTRY_GENERATION_ANY = "입장 시 선택";

export const INVITE_BASE = "void.gsm/join/";
export const REENTRY_BASE = "void.gsm/reentry/";

// 팀원
export type Member = {
  id: number;
  name: string;
  generation: string;
  majors: string[];
  roles: string[];
  isActive: boolean;
  // 참여 보드 수, 이번 주 마감 수
  boards: number;
  weeklyDeadlines: number;
  // 출석률·과제 제출률(%). 기록이 없으면 null
  attendance: number | null;
  submissionRate: number | null;
};

// 처음 팀원 목록. 서버 연결 전이라 나만 있다
export const INITIAL_MEMBERS: Member[] = [
  {
    id: 1,
    name: ME,
    generation: "10기",
    majors: ["Front-end"],
    roles: [],
    isActive: true,
    boards: 0,
    weeklyDeadlines: 0,
    attendance: null,
    submissionRate: null,
  },
];

// 초대 링크
export type InviteLink = {
  id: number;
  code: string;
  // "2026-10-28" 모양. 만료 없음이면 null
  expiresAt: string | null;
  // 남은 사용 횟수. 무제한이면 null
  remainingUses: number | null;
  defaultGeneration: string;
};

// 입장 요청
export type JoinRequest = {
  id: number;
  name: string;
  generation: string;
  majors: string[];
  requestedAt: string;
};

// 초대 링크 모달에서 넘겨주는 값
export type InviteForm = {
  expiry: string;
  usage: string;
  defaultGeneration: string;
  requireApproval: boolean;
};

// 이번 주 마감이 이 개수 이상이면 과부하
export const OVERLOAD_THRESHOLD = 3;

// Date → "2026-10-26" (한국 시간 기준)
export const formatDate = (d: Date) => d.toLocaleDateString("sv-SE");

// "2026-10-28" → "10/28"
export const formatMonthDay = (date: string) => {
  const [, month, day] = date.split("-");
  return `${Number(month)}/${Number(day)}`;
};

// 무작위 코드 만들기 (헷갈리는 0, o, 1, l 은 뺐다)
export const randomCode = (length: number) => {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

// "9기", "10기", "11기"를 숫자 순서로 정렬
export const sortGenerations = (list: string[]) =>
  [...list].sort((a, b) => parseInt(a) - parseInt(b));

// 출석률 막대 색 (낮으면 빨강)
export const attendanceColor = (rate: number) =>
  rate < 70 ? "bg-red-500" : rate < 80 ? "bg-amber-500" : "bg-green-600";

// 과제 제출률 막대 색 (낮으면 노랑)
export const submissionColor = (rate: number) => (rate < 70 ? "bg-amber-500" : "bg-black");