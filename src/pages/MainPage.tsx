import React from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import type { CalendarEvent } from "../types/calendar";

interface MainPageProps {
  events: CalendarEvent[];
  onNavigate: (menu: string) => void;
  onOpenAddModal: () => void;
}

export const MainPage: React.FC<MainPageProps> = ({
  events,
  onNavigate,
  onOpenAddModal,
}) => {
  const todayStr = new Date().toISOString().split("T")[0];

  // 실제 데이터 연산 (초기 상태: 0개)
  const todayTasks = events.filter((e) => e.date === todayStr);
  const upcomingDeadlines = events.filter((e) => e.type === "마감");
  const activities = events.filter((e) => e.type === "활동");
  const assignmentCount = events.filter(
    (e) => e.type === "마감" || e.type === "활동",
  ).length;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f7f7f8]">
      {/* Sidebar - activeMenu="오늘 할 일", 실시간 수치 바인딩 */}
      <Sidebar
        activeMenu="오늘 할 일"
        todayTaskCount={todayTasks.length}
        assignmentCount={assignmentCount}
        onNavigate={onNavigate}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
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

        {/* Dashboard Content */}
        <main className="flex flex-1 gap-6 overflow-y-auto p-6">
          {/* Left Main Section */}
          <div className="flex flex-1 flex-col space-y-6 min-w-0">
            {/* Top Stat Cards (동적 수치) */}
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
                  <span className="text-[11px] font-medium text-red-500">
                    건
                  </span>
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
                  <span className="text-2xl font-extrabold text-gray-900">
                    {assignmentCount}
                  </span>
                  <span className="text-[11px] font-medium text-amber-600">
                    건
                  </span>
                </div>
              </div>
            </div>

            {/* 오늘 할 일 영역 */}
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
                      <div>
                        <p className="text-xs font-bold text-gray-900">
                          {task.title}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {task.board} · {task.date}
                        </p>
                      </div>
                      <span className="rounded-lg bg-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                        {task.type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 이번 주 활동 영역 */}
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

          {/* Right Side Panel */}
          <div className="w-80 shrink-0 space-y-5">
            {/* 다가오는 마감 카드 */}
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
    </div>
  );
};
