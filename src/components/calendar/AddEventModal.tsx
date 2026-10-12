import React, { useState } from "react";
import type { CalendarEvent, EventType } from "../../types/calendar";
import checkCircleIcon from "../../assets/icons/check-circle.svg";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (event: CalendarEvent) => void;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  onAddEvent,
}) => {
  const [type, setType] = useState<EventType | "">("");
  const [title, setTitle] = useState("");
  const [board, setBoard] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !type || !date) return;

    onAddEvent({
      id: Date.now().toString(),
      title,
      type: type as EventType,
      board: board || "기본 보드",
      date,
      time,
      isMyEvent: true,
    });

    setTitle("");
    setType("");
    setBoard("");
    setDate("");
    setTime("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
      <div className="w-[480px] rounded-3xl bg-white p-7 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">일정 추가</h3>
            <p className="mt-0.5 text-xs text-gray-400">
              보드와 유형을 고르면 D-day 알림 단계가 자동으로 적용됩니다
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700">
              일정 유형
            </label>
            <div className="mt-2 flex gap-2">
              {(["마감", "회의", "활동", "개인 일정"] as EventType[]).map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setType(item)}
                    className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      type === item
                        ? "border-black bg-white text-black font-bold"
                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {type === item && (
                      <img src={checkCircleIcon} alt="" className="h-3 w-3" />
                    )}
                    {item}
                  </button>
                ),
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">
              제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="일정 제목을 입력하세요"
              className="mt-1.5 w-full rounded-xl border border-gray-300 p-3 text-xs outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">
              보드
            </label>
            <input
              type="text"
              value={board}
              onChange={(e) => setBoard(e.target.value)}
              placeholder="보드 이름 입력"
              className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs outline-none focus:border-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700">
                날짜
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 p-2.5 text-xs outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700">
                시간
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 p-2.5 text-xs outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="rounded-xl bg-black px-5 py-2 text-xs font-medium text-white hover:bg-gray-800"
            >
              일정 추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
