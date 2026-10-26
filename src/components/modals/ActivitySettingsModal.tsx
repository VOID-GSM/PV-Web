// src/components/modals/ActivitySettingsModal.tsx
import React, { useState } from "react";

interface ActivitySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: {
    title: string;
    schedule: string;
    period: string;
    rule: string;
  }) => void;
}

export const ActivitySettingsModal: React.FC<ActivitySettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState("");
  const [schedule, setSchedule] = useState("");
  const [period, setPeriod] = useState("");
  const [rule, setRule] = useState("");

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setTitle("");
      setSchedule("");
      setPeriod("");
      setRule("");
    }
  }

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave({ title, schedule, period, rule });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-pretendard select-none">
      <div className="relative w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">활동 설정</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              활동 제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: React 심화 스터디"
              className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-black font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              일정 안내
            </label>
            <input
              type="text"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              placeholder="예: 매주 수요일 16:00 · 전공동아리 시간"
              className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              진행 기간
            </label>
            <input
              type="text"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="예: 2026.09.02 ~ 2026.12.17"
              className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              주제 결정 및 규칙
            </label>
            <input
              type="text"
              value={rule}
              onChange={(e) => setRule(e.target.value)}
              placeholder="예: 주제 결정: 투표형 · 회차 3일 전 자동 개설"
              className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-black"
            />
          </div>

          <div className="border-t border-gray-100 pt-4 flex justify-end gap-2">
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
              설정 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivitySettingsModal;
