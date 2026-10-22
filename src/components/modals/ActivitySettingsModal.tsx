// src/components/modals/ActivitySettingsModal.tsx
import { useState } from "react";

export interface ActivityInfo {
  title: string;
  statusTag: string;
  categoryTag: string;
  scheduleText: string;
  periodText: string;
  ruleText: string;
  leaderName: string;
  averageAttendance: string;
}

interface ActivitySettingsModalProps {
  activityInfo: ActivityInfo;
  onClose: () => void;
  onSubmit: (updated: ActivityInfo) => void;
}

export default function ActivitySettingsModal({
  activityInfo,
  onClose,
  onSubmit,
}: ActivitySettingsModalProps) {
  const [formData, setFormData] = useState<ActivityInfo>({ ...activityInfo });

  const handleChange = (field: keyof ActivityInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-pretendard">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* 모달 헤더 */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-bold text-gray-900">활동 설정</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-1"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              활동 제목
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="예: React 심화 스터디"
              className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                모집 상태
              </label>
              <input
                type="text"
                value={formData.statusTag}
                onChange={(e) => handleChange("statusTag", e.target.value)}
                placeholder="예: 모집 완료 / 진행 중"
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                카테고리/대상
              </label>
              <input
                type="text"
                value={formData.categoryTag}
                onChange={(e) => handleChange("categoryTag", e.target.value)}
                placeholder="예: Front-end 대상"
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              일정 안내
            </label>
            <input
              type="text"
              value={formData.scheduleText}
              onChange={(e) => handleChange("scheduleText", e.target.value)}
              placeholder="예: 매주 수요일 16:00 · 전공동아리 시간"
              className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              진행 기간
            </label>
            <input
              type="text"
              value={formData.periodText}
              onChange={(e) => handleChange("periodText", e.target.value)}
              placeholder="예: 2026.09.02 ~ 2026.12.17 (총 14회차)"
              className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              주제 결정 및 규칙
            </label>
            <input
              type="text"
              value={formData.ruleText}
              onChange={(e) => handleChange("ruleText", e.target.value)}
              placeholder="예: 주제 결정: 투표형 · 회차 3일 전 자동 개설"
              className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-black"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-black text-white rounded-xl text-xs font-semibold hover:bg-gray-800 transition"
            >
              설정 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
