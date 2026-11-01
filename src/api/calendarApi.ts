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
}
export interface BoardCreateRequest {
  name: string;
  type: "PROJECT" | "CONTEST";
  color: string;
  startDate: string;
  endDate: string;
  alertDays: number[];
}

export function getCalendarEvents(from: string, to: string, boardIds?: number[], mine = false) {
  const params = new URLSearchParams({ from, to, mine: String(mine) });
  boardIds?.forEach((id) => params.append("boardIds", String(id)));
  return apiRequest<ApiCalendarEvent[]>(`/calendar?${params.toString()}`);
}
export function createCalendarEvent(body: EventWriteRequest) {
  return apiRequest<ApiCalendarEvent>("/calendar/events", { method: "POST", body });
}
export function updateCalendarEvent(eventId: number, body: Partial<EventWriteRequest>) {
  return apiRequest<ApiCalendarEvent>(`/calendar/events/${eventId}`, { method: "PATCH", body });
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
  return apiRequest<{ board: ApiBoard; participants: unknown[]; deadlines: unknown[] }>(`/boards/${boardId}`);
}
export function updateBoard(boardId: number, body: Partial<BoardCreateRequest>) {
  return apiRequest<ApiBoard>(`/boards/${boardId}`, { method: "PATCH", body });
}
export function deleteBoard(boardId: number) {
  return apiRequest<void>(`/boards/${boardId}`, { method: "DELETE" });
}
export function getCalendarConflicts(from: string, to: string) {
  return apiRequest<unknown[]>(`/calendar/conflicts${queryString({ from, to })}`);
}
