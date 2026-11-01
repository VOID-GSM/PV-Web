import React, { useEffect, useState } from "react";
import { Header } from "../components/layout/Header";
import type { CalendarEvent } from "../types/calendar";
import { getHomeTodos, getHomeDashboard, type HomeTodoItem, type DashboardResponse } from "../api/homeApi";

export interface MainPageProps {
  events?: CalendarEvent[];
  onNavigate?: (menu: string) => void;
  onOpenAddModal?: () => void;
  onToggleEvent?: (eventId: string) => void;
}

export const MainPage: React.FC<MainPageProps> = ({
  events = [],
  onOpenAddModal,
  onToggleEvent,
}) => {
  const [apiTodos, setApiTodos] = useState<HomeTodoItem[]>([]);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  useEffect(() => {
    let cancelled = false;
    getHomeTodos()
      .then((response) => { if (!cancelled) setApiTodos(response.items ?? []); })
      .catch((error: unknown) => console.error("오늘 할 일 API 조회 실패:", error));
    getHomeDashboard()
      .then((response) => { if (!cancelled) setDashboard(response); })
      .catch((error: unknown) => console.error("홈 대시보드 API 조회 실패:", error));
    return () => { cancelled = true; };
  }, []);

  const today = new Date();
  const todayStr = today.toLocaleDateString("sv-SE");
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + ((7 - today.getDay()) % 7));
  const weekStartStr = weekStart.toLocaleDateString("sv-SE");
  const weekEndStr = weekEnd.toLocaleDateString("sv-SE");

  const apiTodoEvents: CalendarEvent[] = apiTodos.map((todo) => ({
    id: `todo:${todo.type}:${todo.targetId}`,
    title: todo.targetName || todo.typeLabel,
    type: todo.overdue ? "마감" : "활동",
    board: todo.typeLabel || "할 일",
    date: todo.dueAt?.slice(0, 10) || todayStr,
    time: todo.dueAt?.slice(11, 16),
    description: todo.description,
    completed: false,
  }));
  const todayTasks = [
    ...events.filter((event) => event.date === todayStr),
    ...apiTodoEvents.filter((event) => event.date === todayStr),
  ];
  const upcomingDeadlines = events.filter(
    (event) => event.type === "마감" && event.date >= todayStr && event.date <= weekEndStr,
  );
  const activities = events.filter(
    (event) => event.type === "활동" && event.date >= weekStartStr && event.date <= weekEndStr,
  );

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden bg-[#f7f7f8]">
      {/* 상단 헤더 */}
      <Header
        title="오늘 할 일"
        subtitle={new Date().toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "long",
          day: "numeric",
          weekday: "long",
        })}
        onOpenAddModal={onOpenAddModal}
      />

      {/* 메인 콘텐츠 영역 */}
      <main className="flex flex-1 gap-6 overflow-y-auto p-6">
        <div className="flex flex-1 flex-col space-y-6 min-w-0">
          {/* 상단 요약 카드 4개 */}
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-2xs">
              <span className="text-xs font-medium text-gray-500">
                오늘 처리할 일
              </span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-gray-900">
                  {todayTasks.length}
                </span>
                <span className="text-[11px] text-gray-400">건</span>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-2xs">
              <span className="text-xs font-medium text-gray-500">
                이번 주 마감
              </span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-gray-900">
                  {upcomingDeadlines.length}
                </span>
                <span className="text-[11px] font-medium text-red-500">건</span>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-2xs">
              <span className="text-xs font-medium text-gray-500">
                이번 주 활동
              </span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-gray-900">
                  {activities.length}
                </span>
                <span className="text-[11px] font-medium text-emerald-600">
                  건
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-2xs">
              <span className="text-xs font-medium text-gray-500">
                과제 · 역량맵
              </span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-gray-900">{dashboard?.members.reduce((sum, member) => sum + member.dueAssignmentCount, 0) ?? 0}</span>
                <span className="text-[11px] font-medium text-amber-600">
                  건
                </span>
              </div>
            </div>
          </div>

          {/* 오늘 할 일 목록 */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  오늘 할 일
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  등록된 오늘 일정 목록입니다
                </p>
              </div>
            </div>

            {todayTasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400">
                등록된 오늘 할 일이 없습니다. 상단의 '새로 만들기'로 일정을
                추가해 보세요!
              </div>
            ) : (
              <div className="space-y-2.5">
                {todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-2xl border border-gray-50 bg-gray-50/50 p-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <input
                        type="checkbox"
                        aria-label={`${task.title} 완료`}
                        checked={Boolean(task.completed)}
                        disabled={task.id.startsWith("todo:")}
                        onChange={() => onToggleEvent?.(task.id)}
                        title={task.id.startsWith("todo:") ? "이 할 일의 완료 처리 API는 현재 명세에 없습니다." : "완료 상태 변경"}
                        className="h-4 w-4 shrink-0 cursor-pointer accent-black disabled:cursor-not-allowed disabled:opacity-40"
                      />
                      <div className="min-w-0">
                        <p className={`text-xs font-bold text-gray-900 ${task.completed ? "line-through text-gray-400" : ""}`}>
                          {task.title}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {task.board} · {task.date}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-lg bg-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                      {task.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 이번 주 활동 목록 */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-2xs">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                이번 주 활동
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                진행 중인 활동 모임 목록입니다
              </p>
            </div>

            {activities.length === 0 ? (
              <div className="py-10 text-center text-xs text-gray-400">
                등록된 이번 주 활동이 없습니다.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {activities.map((act) => (
                  <div
                    key={act.id}
                    className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-2xs"
                  >
                    <div>
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-600">
                        ● {act.board}
                      </span>
                      <p className="text-xs font-bold text-gray-900 mt-3">
                        {act.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 우측 사이드 패널 (다가오는 마감) */}
        <div className="w-80 shrink-0 space-y-5">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-2xs">
            <h3 className="text-xs font-bold text-gray-900">다가오는 마감</h3>
            {upcomingDeadlines.length === 0 ? (
              <p className="mt-4 text-xs text-gray-400">
                다가오는 마감 일정이 없습니다.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {upcomingDeadlines.map((dl) => (
                  <div
                    key={dl.id}
                    className="flex items-center justify-between border-b border-gray-50 pb-2.5"
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        {dl.title}
                      </p>
                      <p className="text-[10px] text-gray-400">{dl.date}</p>
                    </div>
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      {dl.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
