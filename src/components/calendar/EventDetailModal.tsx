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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs select-none">
      <div className="w-[460px] max-w-lg rounded-3xl bg-white p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <span className="mb-2 inline-block rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700">
              {event.type}
            </span>
            <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Info Rows */}
        <div className="mt-5 space-y-3 border-t border-gray-100 pt-4 text-xs text-gray-600">
          <div className="flex items-center gap-3">
            <img src={clockIcon} alt="" className="h-4 w-4 opacity-50" />
            <span className="w-12 font-semibold text-gray-500">일시</span>
            <span className="text-gray-800">
              {event.date} {event.time || ""}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <img src={folderIcon} alt="" className="h-4 w-4 opacity-50" />
            <span className="w-12 font-semibold text-gray-500">보드</span>
            <span className="text-gray-800">{event.board}</span>
          </div>

          {event.assignees && event.assignees.length > 0 && (
            <div className="flex items-center gap-3">
              <img src={usersIcon} alt="" className="h-4 w-4 opacity-50" />
              <span className="w-12 font-semibold text-gray-500">담당자</span>
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
              className="rounded-xl border border-red-200 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition cursor-pointer"
            >
              일정 삭제
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-black px-5 py-2 text-xs font-bold text-white hover:bg-gray-800 transition cursor-pointer shadow-2xs"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};