import { apiRequest, queryString } from "./client";

export interface ApiCalendarEvent {
  id: number;
  type: "DEADLINE" | "MEETING" | "ACTIVITY" | "PERSONAL";
  title: string;
  memo?: string;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
  boardId?: number;
  activityId?: number;
  // 개인 일정의 완료 여부 (마감·활동 일정은 항상 false)
  completed?: boolean;
  // ★ 담당자 회원 번호들 (백엔드 assigneeIds 변경. 개인 일정·활동 회차는 [])
  assigneeIds?: number[];
}
export interface ApiBoard {
  id: number;
  name: string;
  type: "PROJECT" | "CONTEST";
  color: string;
  startDate: string;
  endDate: string;
  dDay?: number;
  alertDays?: number[];
  status?: "ACTIVE" | "CLOSED";
}
export interface EventWriteRequest {
  title: string;
  memo?: string;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
  // 수정(PATCH) 때만 사용. 값이 없으면 서버는 완료 상태를 바꾸지 않는다.
  completed?: boolean;
}
export interface BoardCreateRequest {
  name: string;
  type: "PROJECT" | "CONTEST";
  color: string;
  startDate: string;
  endDate: string;
  alertDays: number[];
}

// ★ 보드 마감 만들기 요청 (POST /boards/{boardId}/deadlines)
export interface DeadlineCreateRequest {
  // 마감 이름 (예: "기획서")
  name: string;
  // 마감일 "2026-11-30"
  date: string;
  // 담당자 회원 번호들 (최대 20명, 없으면 [])
  assigneeIds: number[];
  // 상세 설명 (선택)
  description?: string;
}

// ★ 마감 담당자 한 명
export interface ApiDeadlineAssignee {
  memberId: number;
  name: string;
}

// ★ 서버가 돌려주는 보드 마감
export interface ApiDeadline {
  id: number;
  name: string;
  date: string;
  description?: string;
  assignees?: ApiDeadlineAssignee[];
}

export function getCalendarEvents(
  from: string,
  to: string,
  boardIds?: number[],
  mine = false,
) {
  const params = new URLSearchParams({ from, to, mine: String(mine) });
  boardIds?.forEach((id) => params.append("boardIds", String(id)));
  return apiRequest<ApiCalendarEvent[]>(`/calendar?${params.toString()}`);
}
export function createCalendarEvent(body: EventWriteRequest) {
  return apiRequest<ApiCalendarEvent>("/calendar/events", {
    method: "POST",
    body,
  });
}
export function updateCalendarEvent(
  eventId: number,
  body: Partial<EventWriteRequest>,
) {
  return apiRequest<ApiCalendarEvent>(`/calendar/events/${eventId}`, {
    method: "PATCH",
    body,
  });
}
export function deleteCalendarEvent(eventId: number) {
  return apiRequest<void>(`/calendar/events/${eventId}`, { method: "DELETE" });
}
export function getBoards() {
  return apiRequest<ApiBoard[]>("/boards");
}
export function createBoard(body: BoardCreateRequest) {
  return apiRequest<ApiBoard>("/boards", { method: "POST", body });
}
export function getBoard(boardId: number) {
  return apiRequest<{
    board: ApiBoard;
    participants: unknown[];
    deadlines: unknown[];
  }>(`/boards/${boardId}`);
}
export function updateBoard(
  boardId: number,
  body: Partial<BoardCreateRequest>,
) {
  return apiRequest<ApiBoard>(`/boards/${boardId}`, { method: "PATCH", body });
}
export function deleteBoard(boardId: number) {
  return apiRequest<void>(`/boards/${boardId}`, { method: "DELETE" });
}

// ★ 보드에 마감 만들기 (부장만, 아니면 서버가 403)
export function createDeadline(boardId: number, body: DeadlineCreateRequest) {
  return apiRequest<ApiDeadline>(`/boards/${boardId}/deadlines`, {
    method: "POST",
    body,
  });
}

export function getCalendarConflicts(from: string, to: string) {
  return apiRequest<unknown[]>(
    `/calendar/conflicts${queryString({ from, to })}`,
  );
}