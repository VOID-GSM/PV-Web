import type { ActivitySummary } from "../../api/activityApi";

interface ActivitySwitcherProps {
  activities: ActivitySummary[];
  currentId: number;
  onSelect: (id: number) => void;
}

const statusLabel = (status?: string) =>
  status === "RECRUITING" ? "모집 중" : status === "ENDED" ? "종료" : null;

export default function ActivitySwitcher({
  activities,
  currentId,
  onSelect,
}: ActivitySwitcherProps) {
  if (activities.length <= 1) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 font-pretendard select-none">
      {activities.map((activity) => {
        const active = activity.id === currentId;
        const label = statusLabel(activity.status);
        return (
          <button
            key={activity.id}
            type="button"
            onClick={() => onSelect(activity.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition cursor-pointer ${
              active
                ? "border-black bg-black text-white"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span>{activity.name}</span>
            {label && (
              <span
                className={`text-[10px] ${active ? "text-gray-300" : "text-gray-400"}`}
              >
                {label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
