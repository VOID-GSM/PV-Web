// src/components/modals/CreateActivityModal.tsx
import React, { useState } from "react";

import alertIcon from "../../assets/icons/alert.svg";
import checkCircleIcon from "../../assets/icons/check-circle.svg";

export interface ActivityFormData {
  title: string;
  type: string;
  generations: string[];
  departments: string[];
  memberCount: string;
  startDate: string;
  endDate: string;
  repeatRule: string;
  topicMode: "투표형" | "지정형";
  voteTime: string;
  confirmMode: "스터디장 승인" | "선착순";
}

interface CreateActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSuccess?: (activityData: ActivityFormData) => void;
}

export const CreateActivityModal: React.FC<CreateActivityModalProps> = ({
  isOpen,
  onClose,
  onCreateSuccess,
}) => {
  const [type, setType] = useState("스터디");
  const [title, setTitle] = useState("");
  const [generations, setGenerations] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [memberCount, setMemberCount] = useState("");

  // 시작일 / 종료일 분리 및 날짜 선택 지원
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [repeatRule, setRepeatRule] = useState(
    "매주 수요일 16:00 · 전공동아리 시간",
  );
  const [topicMode, setTopicMode] = useState<"투표형" | "지정형">("투표형");
  const [voteTime, setVoteTime] = useState("회차 3일 전");
  const [confirmMode, setConfirmMode] = useState<"스터디장 승인" | "선착순">(
    "스터디장 승인",
  );

  // 렌더링 단계 폼 초기화
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setType("스터디");
      setTitle("");
      setGenerations([]);
      setDepartments([]);
      setMemberCount("");
      setStartDate("");
      setEndDate("");
      setRepeatRule("매주 수요일 16:00 · 전공동아리 시간");
      setTopicMode("투표형");
      setVoteTime("회차 3일 전");
      setConfirmMode("스터디장 승인");
    }
  }

  if (!isOpen) return null;

  const toggleGen = (g: string) => {
    setGenerations((prev) =>
      prev.includes(g) ? prev.filter((item) => item !== g) : [...prev, g],
    );
  };

  const toggleDept = (d: string) => {
    setDepartments((prev) =>
      prev.includes(d) ? prev.filter((item) => item !== d) : [...prev, d],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onCreateSuccess) {
      onCreateSuccess({
        title,
        type,
        generations,
        departments,
        memberCount,
        startDate,
        endDate,
        repeatRule,
        topicMode,
        voteTime,
        confirmMode,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-pretendard select-none">
      <div className="relative w-full max-w-[620px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">활동 개설</h2>
            <p className="mt-1 text-xs text-gray-400">
              스터디 · 면접 준비 · 포폴 피드백 같은 자체 활동을 만듭니다
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

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* 활동 유형 */}
          <div>
            <label className="block font-bold text-gray-700 mb-2">
              활동 유형
            </label>
            <div className="flex gap-2">
              {["스터디", "면접 준비", "포폴 피드백", "기타"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setType(item)}
                  className={`px-4 py-2 rounded-full font-semibold border flex items-center gap-1.5 transition cursor-pointer ${
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

          {/* 활동명 */}
          <div>
            <label className="block font-bold text-gray-700 mb-2">활동명</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 text-sm font-semibold outline-none focus:border-black"
              placeholder="예: React 심화 스터디"
            />
          </div>

          {/* 대상 기수 & 대상 전공 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-2">
                대상 기수
              </label>
              <div className="flex flex-wrap gap-2">
                {["9기", "10기", "전체"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGen(g)}
                    className={`px-3.5 py-1.5 rounded-full font-semibold border cursor-pointer ${
                      generations.includes(g)
                        ? "border-black bg-white text-black font-bold ring-1 ring-black"
                        : "border-gray-200 text-gray-500"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-2">
                대상 전공
              </label>
              <div className="flex flex-wrap gap-2">
                {["Front-end", "Back-end", "DevOps", "Design"].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDept(d)}
                    className={`px-3.5 py-1.5 rounded-full font-semibold border cursor-pointer ${
                      departments.includes(d)
                        ? "border-black bg-white text-black font-bold ring-1 ring-black"
                        : "border-gray-200 text-gray-500"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 모집 인원 & 기간 설정 (시작일/종료일) */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-2">
                모집 인원
              </label>
              <input
                type="text"
                value={memberCount}
                onChange={(e) => setMemberCount(e.target.value)}
                placeholder="예: 6명"
                className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-2">
                시작일
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-2.5 outline-none focus:border-black font-medium bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-2">
                종료일
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-2.5 outline-none focus:border-black font-medium bg-white"
              />
            </div>
          </div>

          {/* 반복 규칙 */}
          <div>
            <label className="block font-bold text-gray-700 mb-2">
              반복 규칙
            </label>
            <select
              value={repeatRule}
              onChange={(e) => setRepeatRule(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-black bg-white"
            >
              <option>매주 수요일 16:00 · 전공동아리 시간</option>
              <option>매주 목요일 18:00</option>
              <option>격주 금요일 15:00</option>
            </select>
          </div>

          {/* 기본값 안내 박스 */}
          <div className="flex gap-2.5 rounded-2xl bg-blue-50 p-4 text-blue-700 leading-relaxed border border-blue-100">
            <img
              src={alertIcon}
              alt=""
              className="h-4 w-4 shrink-0 mt-0.5 text-blue-600"
            />
            <div>
              <p className="font-bold">기본값이 자동으로 채워졌습니다</p>
              <p className="mt-0.5 text-[11px] opacity-80">
                시험 기간처럼 진행이 어려운 주는 해당 회차를 휴강·일정 변경으로
                바꾸면 자동 공지됩니다.
              </p>
            </div>
          </div>

          {/* 주제 결정 방식 */}
          <div>
            <label className="block font-bold text-gray-700 mb-2">
              주제 결정 방식
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setTopicMode("투표형")}
                className={`cursor-pointer rounded-2xl border p-4 transition ${
                  topicMode === "투표형"
                    ? "border-black bg-white ring-2 ring-black"
                    : "border-gray-200 bg-gray-50 text-gray-500"
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <span
                    className={`h-3.5 w-3.5 rounded-full border border-black flex items-center justify-center ${topicMode === "투표형" ? "bg-black" : "bg-white"}`}
                  >
                    {topicMode === "투표형" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </span>
                  <span>투표형</span>
                </div>
                <p className="mt-1.5 text-[11px] text-gray-500 leading-tight">
                  회차 N일 전 투표가 자동으로 열리고 최다 득표 주제가 확정됩니다
                </p>
              </div>

              <div
                onClick={() => setTopicMode("지정형")}
                className={`cursor-pointer rounded-2xl border p-4 transition ${
                  topicMode === "지정형"
                    ? "border-black bg-white ring-2 ring-black"
                    : "border-gray-200 bg-gray-50 text-gray-500"
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <span
                    className={`h-3.5 w-3.5 rounded-full border border-black flex items-center justify-center ${topicMode === "지정형" ? "bg-black" : "bg-white"}`}
                  >
                    {topicMode === "지정형" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </span>
                  <span>지정형</span>
                </div>
                <p className="mt-1.5 text-[11px] text-gray-500 leading-tight">
                  회차 N일 전 스터디장에게 주제 입력 알림이 갑니다
                </p>
              </div>
            </div>
          </div>

          {/* 투표 개설 시점 & 참여 확정 방식 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-2">
                투표 개설 시점
              </label>
              <input
                type="text"
                value={voteTime}
                onChange={(e) => setVoteTime(e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-2">
                참여 확정 방식
              </label>
              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800">
                  <input
                    type="radio"
                    name="confirm"
                    checked={confirmMode === "스터디장 승인"}
                    onChange={() => setConfirmMode("스터디장 승인")}
                    className="accent-black"
                  />
                  <span>스터디장 승인</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-500">
                  <input
                    type="radio"
                    name="confirm"
                    checked={confirmMode === "선착순"}
                    onChange={() => setConfirmMode("선착순")}
                    className="accent-black"
                  />
                  <span>선착순</span>
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 pt-5 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">
              개설하면 대상 기수·전공 팀원에게 모집 공지가 발송됩니다
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-200 px-5 py-2.5 font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                className="rounded-xl bg-black px-5 py-2.5 font-bold text-white hover:bg-gray-800 transition cursor-pointer"
              >
                활동 개설
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateActivityModal;
