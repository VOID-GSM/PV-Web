import React, { useState } from "react";
import type { CalendarEvent, EventType } from "../../types/calendar";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (newEvent: CalendarEvent) => void;
}

interface FormErrors {
  title?: string;
  board?: string;
  date?: string;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  onAddEvent,
}) => {
  const [type, setType] = useState<EventType>("활동");
  const [title, setTitle] = useState("");
  const [board, setBoard] = useState("");
  const [date, setDate] = useState("2026-10-15");
  const [time, setTime] = useState("");

  // 경고 메시지 및 에러 상태
  const [errors, setErrors] = useState<FormErrors>({});

  if (!isOpen) return null;

  // 모달 닫을 때 상태 초기화
  const handleClose = () => {
    setTitle("");
    setBoard("");
    setDate("2026-10-15");
    setTime("");
    setType("활동");
    setErrors({});
    onClose();
  };

  // 일정 추가 버튼 클릭 시 검증
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: FormErrors = {};

    if (!title.trim()) {
      newErrors.title = "일정 제목을 입력해 주세요.";
    }
    if (!board.trim()) {
      newErrors.board = "보드 이름을 입력해 주세요.";
    }
    if (!date) {
      newErrors.date = "날짜를 선택해 주세요.";
    }

    // 에러가 하나라도 있으면 추가 중단 및 경고 표시
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 유효성 검사 통과 시 일정 추가
    onAddEvent({
      id: Date.now().toString(),
      title: title.trim(),
      type,
      board: board.trim(),
      date,
      time: time || undefined,
      isMyEvent: true,
    });

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs select-none">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">일정 추가</h2>
            <p className="mt-1 text-xs text-gray-400">
              보드와 유형을 고르면 D-day 알림 단계가 자동으로 적용됩니다
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition cursor-pointer"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* 일정 유형 */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              일정 유형
            </label>
            <div className="flex gap-2">
              {(["마감", "회의", "활동", "개인 일정"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                    type === t
                      ? "border-2 border-black bg-white text-gray-900 shadow-2xs"
                      : "border border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {type === t && (
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
                  )}
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* 제목 입력 */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              제목
            </label>
            <input
              type="text"
              placeholder="일정 제목을 입력하세요"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title)
                  setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              className={`h-11 w-full rounded-2xl px-4 text-xs outline-none transition ${
                errors.title
                  ? "border-2 border-red-500 bg-red-50/20 text-gray-900 placeholder:text-red-300"
                  : "border border-gray-200 bg-white placeholder:text-gray-400 focus:border-black"
              }`}
            />
            {errors.title && (
              <p className="mt-1.5 text-[11px] font-semibold text-red-500 flex items-center gap-1">
                <span>⚠️</span> {errors.title}
              </p>
            )}
          </div>

          {/* 보드 입력 */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              보드
            </label>
            <input
              type="text"
              placeholder="보드 이름 입력"
              value={board}
              onChange={(e) => {
                setBoard(e.target.value);
                if (errors.board)
                  setErrors((prev) => ({ ...prev, board: undefined }));
              }}
              className={`h-11 w-full rounded-2xl px-4 text-xs outline-none transition ${
                errors.board
                  ? "border-2 border-red-500 bg-red-50/20 text-gray-900 placeholder:text-red-300"
                  : "border border-gray-200 bg-white placeholder:text-gray-400 focus:border-black"
              }`}
            />
            {errors.board && (
              <p className="mt-1.5 text-[11px] font-semibold text-red-500 flex items-center gap-1">
                <span>⚠️</span> {errors.board}
              </p>
            )}
          </div>

          {/* 날짜 및 시간 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                날짜
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (errors.date)
                    setErrors((prev) => ({ ...prev, date: undefined }));
                }}
                className={`h-11 w-full rounded-2xl px-4 text-xs outline-none transition ${
                  errors.date
                    ? "border-2 border-red-500 bg-red-50/20 text-gray-900"
                    : "border border-gray-200 bg-white focus:border-black"
                }`}
              />
              {errors.date && (
                <p className="mt-1.5 text-[11px] font-semibold text-red-500 flex items-center gap-1">
                  <span>⚠️</span> {errors.date}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                시간
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-11 w-full rounded-2xl border border-gray-200 bg-white px-4 text-xs outline-none focus:border-black transition"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="h-10 rounded-xl border border-gray-200 px-5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="h-10 rounded-xl bg-black px-5 text-xs font-bold text-white hover:bg-gray-800 transition cursor-pointer shadow-xs"
            >
              일정 추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
