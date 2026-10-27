import React from "react";
import type { CalendarEvent } from "../../types/calendar";

interface EventDetailModalProps {
  event: CalendarEvent;
  onClose: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

const formatDate = (date: string) => {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "short" });
};

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, onClose, onDelete, onEdit }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-pretendard">
    <div className="relative max-h-[92vh] w-full max-w-[560px] overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl">
      <div className="flex items-start justify-between border-b border-gray-100 pb-4">
        <div className="min-w-0 pr-4">
          <h2 className="break-words text-xl font-bold text-gray-900">{event.title}</h2>
          <p className="mt-1 text-xs text-gray-400">{event.type} · {formatDate(event.date)}{event.time ? ` · ${event.time}` : ""}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-600">{event.board || "일반 보드"}</span>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-600">{event.type}</span>
            {event.completed && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600">완료</span>}
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="닫기" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">✕</button>
      </div>
      <div className="mt-5 space-y-4 text-xs">
        <div className="space-y-3 rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
          <div className="flex gap-3"><span className="w-20 shrink-0 font-bold text-gray-400">일시</span><span className="font-semibold text-gray-800">{formatDate(event.date)}{event.time ? ` · ${event.time}` : ""}</span></div>
          <div className="flex gap-3"><span className="w-20 shrink-0 font-bold text-gray-400">보드</span><span className="font-semibold text-gray-800">{event.board || "일반 보드"}</span></div>
          <div className="flex gap-3"><span className="w-20 shrink-0 font-bold text-gray-400">담당자</span><span className="font-semibold text-gray-800">{event.assignees?.length ? event.assignees.join(", ") : "담당자 미지정"}</span></div>
        </div>
        {event.description ? <div className="rounded-2xl border border-gray-100 p-4 leading-relaxed text-gray-600 whitespace-pre-wrap">{event.description}</div> : <p className="rounded-2xl border border-gray-100 p-4 text-gray-400">등록된 상세 설명이 없습니다.</p>}
        <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
          <span className="text-[11px] text-gray-400">수정 내용은 현재 브라우저에 저장됩니다.</span>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={onDelete} className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white transition hover:bg-red-700">일정 삭제</button>
            <button type="button" onClick={onEdit} className="rounded-xl bg-black px-5 py-2 font-bold text-white transition hover:bg-gray-800">수정하기</button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default EventDetailModal;
