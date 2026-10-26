// src/components/modals/AbsenceRequestModal.tsx
import React, { useState } from "react";
import Dropdown from "../common/Dropdown";
import alertIcon from "../../assets/icons/alert.svg";

interface AbsenceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const sessionOptions = [
  "5회차 · 2026년 9월 23일 (수) 16:00 - React 심화 스터디 · 상태관리 라이브러리 비교",
  "6회차 · 2026년 9월 30일 (수) 16:00 - React 심화 스터디",
];

export const AbsenceRequestModal: React.FC<AbsenceRequestModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [session, setSession] = useState(sessionOptions[0]);
  const [reason, setReason] = useState("");
  const [plan, setPlan] = useState("");

  // useEffect 대신 렌더링 단계에서 폼 초기화
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setSession(sessionOptions[0]);
      setReason("");
      setPlan("");
    }
  }

  if (!isOpen) return null;

  // ... 이하 동일

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 작성 완료 처리 후 모달 닫기
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-pretendard select-none">
      <div className="relative w-full max-w-[560px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">불참 요청</h2>
            <p className="mt-1 text-xs text-gray-400">
              스터디장 또는 부장이 승인하면 "승인 불참"으로 기록됩니다
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

        <form onSubmit={handleSubmit} className="space-y-5 pt-4 text-xs">
          {/* 경고 박스 */}
          <div className="flex gap-3 rounded-2xl bg-amber-50 p-4 border border-amber-200/60 text-amber-900">
            <img
              src={alertIcon}
              alt=""
              className="h-4 w-4 shrink-0 mt-0.5 text-amber-600"
            />
            <div>
              <p className="font-bold">
                요청 없이 빠지면 무단 불참으로 기록됩니다
              </p>
              <p className="mt-0.5 text-[11px] text-amber-700">
                무단 불참이 반복되면 스터디장과 부장에게 자동으로 알림이 갑니다.
              </p>
            </div>
          </div>

          {/* 불참할 회차 (공통 Dropdown 컴포넌트 적용) */}
          <div>
            <label className="block font-bold text-gray-700 mb-1.5">
              불참할 회차
            </label>
            <Dropdown
              options={sessionOptions}
              value={session}
              onChange={setSession}
            />
          </div>

          {/* 불참 사유 */}
          <div>
            <label className="block font-bold text-gray-700 mb-1.5">
              불참 사유
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 p-3.5 font-medium outline-none focus:border-black leading-relaxed"
              placeholder="승인 여부를 판단할 수 있게 구체적으로 적어주세요"
            />
            <div className="text-right text-[10px] text-gray-400 mt-1">
              {reason.length} / 2000
            </div>
          </div>

          {/* 대체 계획 */}
          <div>
            <label className="block font-bold text-gray-700 mb-1.5">
              대체 계획 (선택)
            </label>
            <input
              type="text"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              placeholder="예: 정리글은 기한 내 제출하고, 녹화본으로 따라잡겠습니다"
              className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-black"
            />
          </div>

          {/* 승인 요청 받는 사람 */}
          <div>
            <label className="block font-bold text-gray-700 mb-2">
              승인 요청 받는 사람
            </label>
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-800 border border-gray-200">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                  김
                </span>
                <span>김지유</span>
                <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[9px] text-gray-600">
                  스터디장
                </span>
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-800 border border-gray-200">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                  이
                </span>
                <span>이하늘</span>
                <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[9px] text-gray-600">
                  부장
                </span>
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">
              승인 결과는 알림으로 바로 전달됩니다
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
                불참 요청 보내기
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AbsenceRequestModal;
