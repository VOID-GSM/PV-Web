// ===== 업무일지에서 쓰는 고정 값과 타입 =====

// 지금 로그인한 나 (서버 연결 전이라 고정 값)
export const ME = "동키";

// 보드 하나의 모양. name: 이름, dotColor: 이름 앞 작은 점 색
export type Board = {
  name: string;
  dotColor: string;
};

// 보드 목록. 실제로는 캘린더에서 만든 보드를 받아와야 해서 빈 상태로 시작한다
// Board[]: 빈 배열이어도 안에 Board 모양이 들어간다는 걸 TypeScript에게 알려준다
export const BOARDS: Board[] = [];

// 일지 템플릿 항목 3개
export const TEMPLATES = ["오늘 한 일", "내일 할 일", "막힌 점"];

// 위쪽 탭 3개
export const WORKLOG_TABS = ["팀 전체", "내 일지", "보드별 모아보기"];

// 기간 드롭다운 항목
export const PERIOD_OPTIONS = ["이번 주", "이번 달", "전체"];

// 댓글 하나의 모양
export type WorklogComment = {
  id: number;
  author: string;
  content: string;
};

// 일지 하나의 모양
export type Worklog = {
  id: number;
  author: string;
  // "2026-10-26" 모양
  date: string;
  // "22:10" 모양
  time: string;
  boards: string[];
  isPublic: boolean;
  // 템플릿 이름 → 내용
  contents: Record<string, string>;
  comments: WorklogComment[];
};

// 작성 창에서 "올리기"를 눌렀을 때 넘겨주는 값
export type NewWorklog = {
  date: string;
  boards: string[];
  isPublic: boolean;
  contents: Record<string, string>;
};