export type EventType = "마감" | "회의" | "활동" | "개인 일정";
export type ViewMode = "월간" | "주간" | "타임라인";

export interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  board: string;
  date: string; // YYYY-MM-DD
  time?: string;
  endDate?: string;
  assignees?: string[];
  description?: string;
  isMyEvent?: boolean;
  completed?: boolean;
  // ★ 보드 마감일 때: 어느 보드의 마감인지 (보드 번호)
  boardId?: number;
  // ★ 보드 마감일 때: 담당자 회원 번호들 (assignees는 화면에 보여줄 이름)
  assigneeIds?: number[];
}

export interface BoardFilter {
  id: string;
  name: string;
  color: string;
  checked: boolean;
}

export interface MilestoneItem {
  id: string;
  title: string;
  date: string;
  description?: string;
  status: "확정" | "제안";
}