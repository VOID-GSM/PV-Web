import React from "react";
import type { CalendarEvent } from "../../types/calendar";
import clockIcon from "../../assets/icons/clock.svg";
import folderIcon from "../../assets/icons/folder.svg";
import usersIcon from "../../assets/icons/users.svg";

interface EventDetailModalProps {
  event: CalendarEvent;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  onDelete,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
      <div className="w-[460px] rounded-3xl bg-white p-7 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
            <p className="mt-1 text-xs text-gray-400">
              {event.type} · {event.date} {event.time}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Info Rows */}
        <div className="mt-6 space-y-3 border-t border-gray-100 pt-4 text-xs text-gray-600">
          <div className="flex items-center gap-3">
            <img src={clockIcon} alt="" className="h-4 w-4 opacity-50" />
            <span className="font-semibold text-gray-500 w-12">일시</span>
            <span className="text-gray-800">
              {event.date} {event.time || ""}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <img src={folderIcon} alt="" className="h-4 w-4 opacity-50" />
            <span className="font-semibold text-gray-500 w-12">보드</span>
            <span className="text-gray-800">{event.board}</span>
          </div>

          {event.assignees && event.assignees.length > 0 && (
            <div className="flex items-center gap-3">
              <img src={usersIcon} alt="" className="h-4 w-4 opacity-50" />
              <span className="font-semibold text-gray-500 w-12">담당자</span>
              <span className="text-gray-800">
                {event.assignees.join(", ")}
              </span>
            </div>
          )}
        </div>

        {event.description && (
          <div className="mt-4 rounded-xl bg-gray-50 p-3.5 text-xs text-gray-600 leading-relaxed">
            {event.description}
          </div>
        )}

        {/* Action Footer */}
        <div className="mt-6 flex items-center justify-end gap-2 border-t border-gray-100 pt-4">
          {onDelete && (
            <button
              type="button"
              onClick={() => {
                onDelete(event.id);
                onClose();
              }}
              className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
            >
              일정 삭제
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-black px-5 py-2 text-xs font-semibold text-white hover:bg-gray-800"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
