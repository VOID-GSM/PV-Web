import React, { useState } from "react";
import type { BoardFilter, MilestoneItem } from "../../types/calendar";

interface RightPanelProps {
  boardFilters?: BoardFilter[];
  milestones?: MilestoneItem[];
  onToggleFilter?: (id: string) => void;
  onAddMilestone?: (title: string, date: string) => void;
  onApplyMilestonesToCalendar?: () => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  boardFilters = [
    { id: "1", name: "빛가람 경진대회", color: "#3b82f6", checked: true },
    { id: "2", name: "안끊겨 프로젝트", color: "#10b981", checked: true },
    { id: "3", name: "9기 → 10기 과제", color: "#8b5cf6", checked: true },
    { id: "4", name: "포폴 피드백 모임", color: "#14b8a6", checked: true },
    { id: "5", name: "개인 일정", color: "#ec4899", checked: false },
  ],
  milestones = [],
  onToggleFilter,
  onAddMilestone,
  onApplyMilestonesToCalendar,
}) => {
  const [selectedDDay, setSelectedDDay] = useState<string>("D-7");
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");

  const [milestoneError, setMilestoneError] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTitle.trim() && !newDate) {
      setMilestoneError("마일스톤 이름과 날짜를 모두 입력해 주세요.");
      return;
    }
    if (!newTitle.trim()) {
      setMilestoneError("마일스톤 이름을 입력해 주세요.");
      return;
    }
    if (!newDate) {
      setMilestoneError("날짜를 선택해 주세요.");
      return;
    }

    setMilestoneError(null);
    onAddMilestone?.(newTitle.trim(), newDate);
    setNewTitle("");
    setNewDate("");
  };

  return (
    <div className="flex w-80 flex-col space-y-5 shrink-0 select-none overflow-y-auto">
      {/* 1. 보드 필터 */}
      <div className="rounded-3xl bg-white p-5 shadow-xs">
        <h3 className="text-xs font-bold text-gray-900 mb-3">보드 필터</h3>
        <div className="space-y-2.5">
          {boardFilters.map((filter) => (
            <label
              key={filter.id}
              className="flex items-center justify-between text-xs font-semibold text-gray-700 cursor-pointer hover:text-black transition"
            >
              <span className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: filter.color }}
                />
                {filter.name}
              </span>
              <input
                type="checkbox"
                checked={filter.checked}
                onChange={() => onToggleFilter?.(filter.id)}
                className="rounded border-gray-300 text-black focus:ring-black cursor-pointer"
              />
            </label>
          ))}
        </div>
      </div>

      {/* 2. D-day 알림 단계 */}
      <div className="rounded-3xl bg-white p-5 shadow-xs">
        <h3 className="text-xs font-bold text-gray-900">D-day 알림 단계</h3>
        <p className="text-[11px] text-gray-400 mt-0.5 mb-3">
          보드별로 다르게 설정할 수 있습니다
        </p>

        <div className="flex flex-wrap gap-2">
          {(["D-7", "D-3", "D-1", "당일", "D-14"] as const).map((dday) => (
            <button
              key={dday}
              type="button"
              onClick={() => setSelectedDDay(dday)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                selectedDDay === dday
                  ? "border-2 border-black bg-white text-gray-900"
                  : "border border-gray-200 bg-white text-gray-400 hover:border-gray-400"
              }`}
            >
              {dday}
            </button>
          ))}
        </div>
      </div>

      {/* 3. 마감 역산 마일스톤 */}
      <div className="flex-1 rounded-3xl bg-white p-5 shadow-xs flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-bold text-gray-900">
            마감 역산 마일스톤
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
            주요 마감일을 기준으로 자동 제안된 마일스톤 목록입니다.
          </p>

          {/* 입력 폼 */}
          <form onSubmit={handleAdd} className="mt-4 space-y-2">
            <input
              type="text"
              placeholder="마일스톤 입력"
              value={newTitle}
              onChange={(e) => {
                setNewTitle(e.target.value);
                if (milestoneError) setMilestoneError(null);
              }}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-black transition"
            />
            <div className="flex gap-2">
              <input
                type="date"
                value={newDate}
                onChange={(e) => {
                  setNewDate(e.target.value);
                  if (milestoneError) setMilestoneError(null);
                }}
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-black transition"
              />
              <button
                type="submit"
                className="rounded-xl bg-black px-4 py-2 text-xs font-bold text-white hover:bg-gray-800 transition cursor-pointer"
              >
                추가
              </button>
            </div>

            {/* 입력 오류 알림 문구 */}
            {milestoneError && (
              <p className="text-[11px] font-semibold text-red-500 flex items-center gap-1 mt-1">
                <svg
                  className="h-3.5 w-3.5 shrink-0 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                {milestoneError}
              </p>
            )}
          </form>

          {/* 목록 표시 */}
          <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
            {milestones.length === 0 ? (
              <p className="text-xs text-gray-400 py-3 text-center">
                등록된 마일스톤이 없습니다.
              </p>
            ) : (
              milestones.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-2xl bg-gray-50/80 p-3 text-xs"
                >
                  <div>
                    <p className="font-bold text-gray-900">{m.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{m.date}</p>
                  </div>
                  <span
                    className={`rounded-lg px-2.5 py-1 text-[10px] font-bold ${
                      m.status === "확정"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {m.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
          >
            수정
          </button>
          <button
            type="button"
            onClick={onApplyMilestonesToCalendar}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-black py-2.5 text-xs font-bold text-white hover:bg-gray-800 transition cursor-pointer"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>캘린더에 반영</span>
          </button>
        </div>
      </div>
    </div>
  );
};
