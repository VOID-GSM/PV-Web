export type EventType = "마감" | "회의" | "활동" | "개인 일정";

export interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  board: string;
  date: string; // YYYY-MM-DD
  time?: string;
  endDate?: string;
  isAllDay?: boolean;
  assignees?: string[];
  creator?: string;
  createdDate?: string;
  milestone?: string;
  description?: string;
  dDayAlerts?: string[];
  hasConflict?: boolean;
  conflictText?: string;
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
