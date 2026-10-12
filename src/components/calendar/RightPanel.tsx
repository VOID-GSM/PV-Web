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
  // D-day 알림 단계 토글 상태
  const [selectedDDays, setSelectedDDays] = useState<string[]>([
    "D-7",
    "D-3",
    "D-1",
    "당일",
  ]);

  // 마일스톤 수정 모드
  const [isEditingMilestone, setIsEditingMilestone] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");

  const toggleDDay = (tag: string) => {
    setSelectedDDays((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleCreateMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate) return;
    onAddMilestone(newTitle, newDate);
    setNewTitle("");
    setNewDate("");
    setIsEditingMilestone(false);
  };

  return (
    <aside className="w-72 space-y-4 select-none shrink-0">
      {/* 1. 보드 필터 */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h3 className="text-xs font-bold text-gray-900">보드 필터</h3>

        {boardFilters.length === 0 ? (
          <p className="mt-3 text-xs text-gray-400">등록된 보드가 없습니다.</p>
        ) : (
          <div className="mt-3 space-y-2.5">
            {boardFilters.map((filter) => (
              <label
                key={filter.id}
                className="flex items-center justify-between text-xs cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filter.checked}
                    onChange={() => onToggleFilter(filter.id)}
                    className="h-4 w-4 rounded border-gray-300 accent-black cursor-pointer"
                  />
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: filter.color }}
                  />
                  <span className="font-medium text-gray-800">
                    {filter.name}
                  </span>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 2. D-day 알림 단계 (버튼 클릭 반응형) */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h3 className="text-xs font-bold text-gray-900">D-day 알림 단계</h3>
        <p className="mt-0.5 text-[10px] text-gray-400">
          보드별로 다르게 설정할 수 있습니다
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {["D-7", "D-3", "D-1", "당일", "D-14"].map((tag) => {
            const isSelected = selectedDDays.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleDDay(tag)}
                className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold transition ${
                  isSelected
                    ? "border-black bg-black text-white"
                    : "border-gray-200 text-gray-400 hover:border-gray-400"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. 마감 역산 마일스톤 */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h3 className="text-xs font-bold text-gray-900">마감 역산 마일스톤</h3>
        <p className="mt-0.5 text-[10px] text-gray-400 leading-snug">
          마감일을 기준으로 자동 제안됩니다.
        </p>

        {isEditingMilestone ? (
          <form onSubmit={handleCreateMilestone} className="mt-3 space-y-2">
            <input
              type="text"
              placeholder="마일스톤 제목 (예: 1차 개발)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-200 p-2 text-xs outline-none"
            />
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full rounded-lg border border-gray-200 p-2 text-xs outline-none"
            />
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setIsEditingMilestone(false)}
                className="flex-1 rounded-lg border border-gray-200 py-1 text-xs"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg bg-black text-white py-1 text-xs"
              >
                추가
              </button>
            </div>
          </form>
        ) : (
          <>
            {milestones.length === 0 ? (
              <p className="mt-3 text-xs text-gray-400">
                설정된 마일스톤이 없습니다.
              </p>
            ) : (
              <div className="mt-3 space-y-2.5">
                {milestones.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-gray-400">{item.date}</p>
                    </div>

                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${
                        item.status === "확정"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex gap-2 pt-2 border-t border-gray-50">
              <button
                type="button"
                onClick={() => setIsEditingMilestone(true)}
                className="flex-1 rounded-xl border border-gray-200 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                수정
              </button>
              <button
                type="button"
                onClick={onApplyMilestonesToCalendar}
                className="flex-1 rounded-xl bg-black py-1.5 text-xs font-medium text-white hover:bg-gray-800 transition"
              >
                캘린더에 반영
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};
