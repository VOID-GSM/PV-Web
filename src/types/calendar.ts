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
  status: "확정" | "제안";
}
