import React, { useState } from "react";
import type { BoardFilter, MilestoneItem } from "../../types/calendar";

interface RightPanelProps {
  boardFilters: BoardFilter[];
  milestones: MilestoneItem[];
  onToggleFilter: (id: string) => void;
  onAddMilestone: (title: string, date: string) => void;
  onApplyMilestonesToCalendar: () => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  boardFilters,
  milestones,
  onToggleFilter,
  onAddMilestone,
  onApplyMilestonesToCalendar,
}) => {
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;
    onAddMilestone(newTitle.trim(), newDate);
    setNewTitle("");
    setNewDate("");
  };

  return (
    <div className="flex w-72 flex-col space-y-5 shrink-0 select-none">
      {/* 보드별 필터 */}
      <div className="rounded-3xl bg-white p-5 shadow-xs">
        <h3 className="text-xs font-bold text-gray-900 mb-3">보드 필터</h3>
        {boardFilters.length === 0 ? (
          <p className="text-xs text-gray-400">등록된 보드가 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {boardFilters.map((filter) => (
              <label
                key={filter.id}
                className="flex items-center justify-between text-xs font-medium text-gray-700 cursor-pointer hover:text-black transition"
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
                  onChange={() => onToggleFilter(filter.id)}
                  className="rounded text-black focus:ring-black cursor-pointer"
                />
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 마일스톤 제안 패널 */}
      <div className="flex-1 rounded-3xl bg-white p-5 shadow-xs flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-bold text-gray-900">마일스톤 제안</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">
            팀원들과 함께 확정할 주요 일정
          </p>

          {/* 제안 폼 */}
          <form onSubmit={handleAdd} className="mt-4 space-y-2">
            <input
              type="text"
              placeholder="마일스톤 입력"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-black"
            />
            <div className="flex gap-2">
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="flex-1 rounded-xl border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-black"
              />
              <button
                type="submit"
                className="rounded-xl bg-black px-3 py-1.5 text-xs font-bold text-white hover:bg-gray-800 transition cursor-pointer"
              >
                추가
              </button>
            </div>
          </form>

          {/* 마일스톤 리스트 */}
          <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
            {milestones.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-xl bg-gray-50 p-2.5 text-xs"
              >
                <div>
                  <p className="font-semibold text-gray-800">{m.title}</p>
                  <p className="text-[10px] text-gray-400">{m.date}</p>
                </div>
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                    m.status === "확정"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 캘린더에 일괄 반영 버튼 */}
        <button
          type="button"
          onClick={onApplyMilestonesToCalendar}
          className="mt-4 w-full rounded-xl border border-gray-200 py-2 text-xs font-bold text-gray-800 hover:bg-gray-50 transition cursor-pointer"
        >
          캘린더에 일괄 적용
        </button>
      </div>
    </div>
  );
};
