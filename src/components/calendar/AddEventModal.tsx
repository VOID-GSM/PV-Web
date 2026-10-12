import React from "react";
import type {
  CalendarEvent,
  BoardFilter,
  MilestoneItem,
} from "../../types/calendar";

interface RightPanelProps {
  events: CalendarEvent[];
  boardFilters: BoardFilter[];
  milestones?: MilestoneItem[];
  onToggleFilter: (id: string) => void;
  onSelectEvent: (event: CalendarEvent) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  boardFilters,
  onToggleFilter,
}) => {
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
                    className="h-4 w-4 rounded border-gray-300 accent-black"
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

      {/* 2. D-day 알림 단계 */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h3 className="text-xs font-bold text-gray-900">D-day 알림 단계</h3>
        <p className="mt-0.5 text-[10px] text-gray-400">
          보드별로 다르게 설정할 수 있습니다
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {["D-7", "D-3", "D-1", "당일", "D-14"].map((tag, i) => (
            <span
              key={tag}
              className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                i < 4
                  ? "border-black text-black"
                  : "border-gray-200 text-gray-400"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* 3. 마감 역산 마일스톤 */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h3 className="text-xs font-bold text-gray-900">마감 역산 마일스톤</h3>
        <p className="mt-0.5 text-[10px] text-gray-400 leading-snug">
          빛가람 경진대회 최종 마감 기준으로 자동 제안됩니다.
        </p>

        <div className="mt-3 space-y-2.5">
          <p className="text-xs text-gray-400">설정된 마일스톤이 없습니다.</p>
        </div>

        <div className="mt-4 flex gap-2 pt-2 border-t border-gray-50">
          <button
            type="button"
            className="flex-1 rounded-xl border border-gray-200 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            수정
          </button>
          <button
            type="button"
            className="flex-1 rounded-xl bg-black py-1.5 text-xs font-medium text-white hover:bg-gray-800"
          >
            캘린더에 반영
          </button>
        </div>
      </div>
    </aside>
  );
};
