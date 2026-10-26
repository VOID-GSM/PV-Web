// src/components/calendar/EventDetailModal.tsx
import React from "react";

import alertIcon from "../../assets/icons/alert.svg";
import calendarIcon from "../../assets/icons/calendar.svg";
import clipboardIcon from "../../assets/icons/clipboard.svg";
import targetIcon from "../../assets/icons/target.svg";
import usersIcon from "../../assets/icons/users.svg";
import editIcon from "../../assets/icons/edit.svg";
import checkCircleIcon from "../../assets/icons/check-circle.svg";
import clockIcon from "../../assets/icons/clock.svg";
import type { CalendarEvent } from "../../types/calendar";

interface EventDetailModalProps {
  event?: CalendarEvent;
  isOpen?: boolean;
  onClose: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  isOpen = true,
  onClose,
  onDelete,
  onEdit,
}) => {
  {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-pretendard select-none">
        <div className="relative w-full max-w-[560px] max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-start justify-between pb-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                기획서 최종 제출
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                마감 · 2026년 9월 24일 (목) 23:59
              </p>

              {/* Badges */}
              <div className="flex items-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  빛가람 경진대회
                </span>
                <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-[11px] font-bold text-white">
                  마감
                </span>
                <span className="rounded-full bg-amber-100 text-amber-700 text-[11px] font-bold px-2.5 py-0.5">
                  D-2
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="mt-4 space-y-4 text-xs">
            {/* Detail Items List (SVG 아이콘 적용) */}
            <div className="space-y-2.5 rounded-2xl bg-gray-50/70 p-4 border border-gray-100/80">
              {/* 일시 */}
              <div className="flex items-center gap-3">
                <span className="w-20 font-bold text-gray-400 flex items-center gap-1.5">
                  <img
                    src={calendarIcon}
                    alt=""
                    className="h-3.5 w-3.5 opacity-50"
                  />
                  <span>일시</span>
                </span>
                <span className="font-semibold text-gray-800">
                  2026년 9월 24일 (목) 23:59 · 종일 아님
                </span>
              </div>

              {/* 보드 */}
              <div className="flex items-center gap-3">
                <span className="w-20 font-bold text-gray-400 flex items-center gap-1.5">
                  <img
                    src={clipboardIcon}
                    alt=""
                    className="h-3.5 w-3.5 opacity-50"
                  />
                  <span>보드</span>
                </span>
                <span className="font-semibold text-gray-800">
                  빛가람 경진대회 (10/20 최종 마감)
                </span>
              </div>

              {/* 마일스톤 */}
              <div className="flex items-center gap-3">
                <span className="w-20 font-bold text-gray-400 flex items-center gap-1.5">
                  <img
                    src={targetIcon}
                    alt=""
                    className="h-3.5 w-3.5 opacity-50"
                  />
                  <span>마일스톤</span>
                </span>
                <span className="font-semibold text-gray-800">
                  기획서 작성 — 마감 역산으로 자동 제안된 일정
                </span>
              </div>

              {/* 담당자 */}
              <div className="flex items-center gap-3">
                <span className="w-20 font-bold text-gray-400 flex items-center gap-1.5">
                  <img
                    src={usersIcon}
                    alt=""
                    className="h-3.5 w-3.5 opacity-50"
                  />
                  <span>담당자</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-0.5 font-semibold text-gray-800 border border-gray-200">
                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-black text-[8px] font-bold text-white">
                      동
                    </span>
                    <span>동키</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-0.5 font-semibold text-gray-800 border border-gray-200">
                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-black text-[8px] font-bold text-white">
                      김
                    </span>
                    <span>김지유</span>
                  </span>
                </div>
              </div>

              {/* 만든 사람 */}
              <div className="flex items-center gap-3">
                <span className="w-20 font-bold text-gray-400 flex items-center gap-1.5">
                  <img
                    src={editIcon}
                    alt=""
                    className="h-3.5 w-3.5 opacity-50"
                  />
                  <span>만든 사람</span>
                </span>
                <span className="font-semibold text-gray-800">
                  이하늘 (부장) · 9월 12일
                </span>
              </div>
            </div>

            {/* Description Text */}
            <div className="rounded-2xl border border-gray-100 p-4 text-gray-600 leading-relaxed">
              발표 심사에 제출할 기획서 최종본. 10/20 최종 마감에서 역산해 자동
              제안된 중간 마감입니다.
            </div>

            {/* 알림 발송 현황 */}
            <div>
              <label className="block font-bold text-gray-700 mb-2">
                알림 발송 현황
              </label>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-600">
                  <img src={checkCircleIcon} alt="" className="h-3 w-3" />
                  <span>D-7 발송완료</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-600">
                  <img src={checkCircleIcon} alt="" className="h-3 w-3" />
                  <span>D-3 발송완료</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-500">
                  <img src={clockIcon} alt="" className="h-3 w-3 opacity-50" />
                  <span>D-1 예정 9/23</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-500">
                  <img src={clockIcon} alt="" className="h-3 w-3 opacity-50" />
                  <span>당일 예정 9/24</span>
                </span>
              </div>
            </div>

            {/* Warning Box (SVG 사용) */}
            <div className="flex gap-3 rounded-2xl bg-amber-50/80 p-4 border border-amber-200/60 text-amber-900">
              <img
                src={alertIcon}
                alt=""
                className="h-4 w-4 shrink-0 mt-0.5 text-amber-600"
              />
              <div>
                <p className="font-bold">같은 날 다른 마감이 있습니다</p>
                <p className="mt-0.5 text-[11px] text-amber-700/90 leading-relaxed">
                  비동기 처리 실습 과제(9/24 23:59) — 동키, 김지유가 두 일정
                  모두 담당입니다.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
              <span className="text-[11px] text-gray-400">
                변경하면 담당자와 보드 참여자에게 알림이 갑니다
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onDelete) onDelete();
                    onClose();
                  }}
                  className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700 transition cursor-pointer"
                >
                  일정 삭제
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onEdit) onEdit();
                    onClose();
                  }}
                  className="rounded-xl bg-black px-5 py-2 font-bold text-white hover:bg-gray-800 transition cursor-pointer"
                >
                  수정하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default EventDetailModal;
