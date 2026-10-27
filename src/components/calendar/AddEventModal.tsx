// src/components/calendar/AddEventModal.tsx
import React, { useState } from "react";
import type { CalendarEvent } from "../../types/calendar";

import alertIcon from "../../assets/icons/alert.svg";
import calendarIcon from "../../assets/icons/calendar.svg";
import clockIcon from "../../assets/icons/clock.svg";
import plusIcon from "../../assets/icons/plus.svg";
import checkCircleIcon from "../../assets/icons/check-circle.svg";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent?: (newEvent: CalendarEvent) => void;
  initialEvent?: CalendarEvent | null;
  onUpdateEvent?: (updatedEvent: CalendarEvent) => void;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  onAddEvent,
  initialEvent = null,
  onUpdateEvent,
}) => {
  const [type, setType] = useState<"마감" | "회의" | "활동" | "개인 일정">(
    initialEvent?.type ?? "마감",
  );
  const [title, setTitle] = useState(initialEvent?.title ?? "");
  const [board, setBoard] = useState(initialEvent?.board ?? "");
  const [repeat, setRepeat] = useState("반복 없음");
  const [date, setDate] = useState(initialEvent?.date ?? "");
  const [time, setTime] = useState(initialEvent?.time ?? "");
  const [endDate, setEndDate] = useState(initialEvent?.endDate ?? "");
  const [assignees, setAssignees] = useState<string[]>(initialEvent?.assignees ?? []);
  const [alerts, setAlerts] = useState<string[]>([]);

  // useEffect 대신 렌더링 단계에서 isOpen 상태 변화를 감지해 폼 초기화 (ESLint 에러 방지)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setType(initialEvent?.type ?? "마감");
      setTitle(initialEvent?.title ?? "");
      setBoard(initialEvent?.board ?? "");
      setRepeat("반복 없음");
      setDate(initialEvent?.date ?? "");
      setTime(initialEvent?.time ?? "");
      setEndDate(initialEvent?.endDate ?? "");
      setAssignees(initialEvent?.assignees ?? []);
      setAlerts([]);
    }
  }

  if (!isOpen) return null;

  // ... 이하 동일

  const toggleAlert = (level: string) => {
    setAlerts((prev) =>
      prev.includes(level)
        ? prev.filter((item) => item !== level)
        : [...prev, level],
    );
  };

  const removeAssignee = (name: string) => {
    setAssignees((prev) => prev.filter((item) => item !== name));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !board.trim()) return;
    const eventData: CalendarEvent = {
      ...(initialEvent ?? { id: Date.now().toString() }),
      title: title.trim(),
      type,
      board: board.trim(),
      date: date || new Date().toLocaleDateString("sv-SE"),
      time: time || "00:00",
      endDate: endDate || undefined,
      assignees,
      isMyEvent: true,
    };
    if (initialEvent) onUpdateEvent?.(eventData);
    else onAddEvent?.(eventData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-pretendard select-none">
      <div className="relative w-full max-w-[560px] max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{initialEvent ? "일정 수정" : "일정 추가"}</h2>
            <p className="mt-1 text-xs text-gray-400">
              보드와 유형을 고르면 D-day 알림 단계가 자동으로 적용됩니다
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* 일정 유형 */}
          <div>
            <label className="block font-bold text-gray-700 mb-2">
              일정 유형
            </label>
            <div className="flex gap-2">
              {(["마감", "회의", "활동", "개인 일정"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setType(item)}
                  className={`px-3.5 py-1.5 rounded-full font-semibold border flex items-center gap-1 transition cursor-pointer ${
                    type === item
                      ? "border-black bg-black text-white"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {type === item && (
                    <img
                      src={checkCircleIcon}
                      alt=""
                      className="h-3.5 w-3.5 filter invert"
                    />
                  )}
                  <span>{item}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 제목 */}
          <div>
            <label className="block font-bold text-gray-700 mb-1.5">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 text-sm font-semibold outline-none focus:border-black"
              placeholder="예: 기획서 최종 제출"
            />
          </div>

          {/* 보드 & 반복 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1.5">
                보드
              </label>
              <input
                type="text"
                value={board}
                onChange={(e) => setBoard(e.target.value)}
                required
                placeholder="새 보드 이름 입력"
                className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-black bg-white font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1.5">
                반복
              </label>
              <select
                value={repeat}
                onChange={(e) => setRepeat(e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-black bg-white font-medium"
              >
                <option value="반복 없음">반복 없음</option>
                <option value="매주 반복">매주 반복</option>
                <option value="매월 반복">매월 반복</option>
              </select>
            </div>
          </div>

          {/* 날짜 / 시간 / 종료 */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1.5">
                날짜
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="2026-09-24"
                className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-black font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1.5">
                시간
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="23:59"
                  className="w-full rounded-xl border border-gray-200 p-3 pr-8 outline-none focus:border-black font-medium"
                />
                <img
                  src={clockIcon}
                  alt=""
                  className="absolute right-3 h-4 w-4 opacity-40 pointer-events-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1.5">
                종료
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="당일"
                  className="w-full rounded-xl border border-gray-200 p-3 pr-8 outline-none focus:border-black font-medium"
                />
                <img
                  src={calendarIcon}
                  alt=""
                  className="absolute right-3 h-4 w-4 opacity-40 pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* 담당자 */}
          <div>
            <label className="block font-bold text-gray-700 mb-2">담당자</label>
            <div className="flex flex-wrap items-center gap-2">
              {assignees.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-800"
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white">
                    {name[0]}
                  </span>
                  <span>{name}</span>
                  <button
                    type="button"
                    onClick={() => removeAssignee(name)}
                    className="text-gray-400 hover:text-gray-600 ml-0.5 cursor-pointer"
                  >
                    ✕
                  </button>
                </span>
              ))}
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-300 px-3 py-1 font-semibold text-gray-500 hover:bg-gray-50 transition cursor-pointer"
              >
                <img src={plusIcon} alt="" className="h-3 w-3 opacity-60" />
                <span>팀원 추가</span>
              </button>
            </div>
          </div>

          {/* D-day 알림 단계 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-bold text-gray-700">D-day 알림 단계</label>
              <span className="text-[10px] text-gray-400">복수 선택</span>
            </div>
            <div className="flex gap-2">
              {["D-7", "D-3", "D-1", "당일"].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => toggleAlert(level)}
                  className={`px-3.5 py-1.5 rounded-full font-semibold border transition cursor-pointer ${
                    alerts.includes(level)
                      ? "border-black bg-white text-black font-bold ring-1 ring-black"
                      : "border-gray-200 text-gray-400 hover:bg-gray-50"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* 알림 박스 */}
          <div className="flex gap-3 rounded-2xl bg-amber-50/80 p-4 border border-amber-200/60 text-amber-900">
            <img
              src={alertIcon}
              alt=""
              className="h-4 w-4 shrink-0 mt-0.5 text-amber-600"
            />
            <div>
              <p className="font-bold">마감 알림이 자동 등록됩니다</p>
              <p className="mt-0.5 text-[11px] text-amber-700/90 leading-relaxed">
                선택한 D-day 단계에 따라 담당 팀원에게 알림 메시지가 발송됩니다.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">
              추가하면 담당자와 모든 팀원에게 알림이 갑니다
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-200 px-4 py-2 font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                className="rounded-xl bg-black px-5 py-2 font-bold text-white hover:bg-gray-800 transition cursor-pointer"
              >
                일정 추가
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventModal;
