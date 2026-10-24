import React from "react";
import type { CalendarEvent } from "../../types/calendar";

interface EventDetailModalProps {
  event: CalendarEvent;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  onDelete,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs select-none">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700">
            {event.type}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-2">
          <h3 className="text-base font-bold text-gray-900">{event.title}</h3>
          <p className="text-xs text-gray-500">📌 보드: {event.board}</p>
          <p className="text-xs text-gray-500">
            📅 날짜: {event.date} {event.time ? `(${event.time})` : ""}
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              onDelete(event.id);
              onClose();
            }}
            className="rounded-xl border border-red-200 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition cursor-pointer"
          >
            삭제
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-black px-4 py-2 text-xs font-bold text-white hover:bg-gray-800 transition cursor-pointer"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
