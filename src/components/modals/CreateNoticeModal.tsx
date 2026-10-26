// src/components/modals/CreateNoticeModal.tsx
import React, { useState } from "react";

import bellIcon from "../../assets/icons/bell.svg";
import messageIcon from "../../assets/icons/message.svg";

interface CreateNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateNoticeModal: React.FC<CreateNoticeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [targetRange, setTargetRange] = useState("이 활동 참여자");

  // 세부 범위 선택 상태
  const [selectedGenerations, setSelectedGenerations] = useState<string[]>([
    "9기",
  ]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([
    "Front-end",
  ]);
  const [selectedBoard, setSelectedBoard] = useState("빛가람 경진대회");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [webPush, setWebPush] = useState(true);
  const [discord, setDiscord] = useState(true);
  const [readCheck, setReadCheck] = useState(true);
  const [scheduled, setScheduled] = useState(false);

  // 렌더링 단계 폼 초기화 (ESLint 에러 방지)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setTargetRange("이 활동 참여자");
      setSelectedGenerations(["9기"]);
      setSelectedDepartments(["Front-end"]);
      setSelectedBoard("빛가람 경진대회");
      setTitle("");
      setContent("");
      setWebPush(true);
      setDiscord(true);
      setReadCheck(true);
      setScheduled(false);
    }
  }

  if (!isOpen) return null;

  const toggleGen = (g: string) => {
    setSelectedGenerations((prev) =>
      prev.includes(g) ? prev.filter((item) => item !== g) : [...prev, g],
    );
  };

  const toggleDept = (d: string) => {
    setSelectedDepartments((prev) =>
      prev.includes(d) ? prev.filter((item) => item !== d) : [...prev, d],
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-pretendard select-none">
      <div className="relative w-full max-w-[580px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">공지 보내기</h2>
            <p className="mt-1 text-xs text-gray-400">
              범위를 고르면 받을 사람 수가 바로 계산됩니다
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

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onClose();
          }}
          className="space-y-5 pt-4 text-xs"
        >
          {/* 공지 범위 */}
          <div>
            <label className="block font-bold text-gray-700 mb-2">
              공지 범위
            </label>
            <div className="space-y-2">
              {[
                "팀 전체",
                "특정 보드 참여자",
                "이 활동 참여자",
                "특정 기수 · 전공",
              ].map((range) => (
                <div key={range}>
                  <div
                    onClick={() => setTargetRange(range)}
                    className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition ${
                      targetRange === range
                        ? "border-black bg-white ring-2 ring-black font-bold text-gray-900"
                        : "border-gray-200 bg-gray-50 text-gray-600"
                    }`}
                  >
                    <span
                      className={`h-3.5 w-3.5 rounded-full border border-black flex items-center justify-center ${targetRange === range ? "bg-black" : "bg-white"}`}
                    >
                      {targetRange === range && (
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </span>
                    <span>{range}</span>
                  </div>

                  {/* 1. 특정 보드 참여자 선택 시 보드 선택 드롭다운 */}
                  {targetRange === "특정 보드 참여자" &&
                    range === "특정 보드 참여자" && (
                      <div className="mt-2.5 ml-2 p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                        <label className="block font-bold text-gray-700 text-[11px]">
                          보드 선택
                        </label>
                        <select
                          value={selectedBoard}
                          onChange={(e) => setSelectedBoard(e.target.value)}
                          className="w-full rounded-xl border border-gray-300 p-2.5 bg-white font-medium outline-none focus:border-black"
                        >
                          <option value="빛가람 경진대회">
                            빛가람 경진대회
                          </option>
                          <option value="인공지능 프로젝트">
                            인공지능 프로젝트
                          </option>
                          <option value="React 심화 스터디">
                            React 심화 스터디
                          </option>
                        </select>
                      </div>
                    )}

                  {/* 2. 특정 기수 · 전공 선택 시 칩 선택 옵션 */}
                  {targetRange === "특정 기수 · 전공" &&
                    range === "특정 기수 · 전공" && (
                      <div className="mt-2.5 ml-2 p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                        <div>
                          <span className="block font-bold text-gray-700 text-[11px] mb-1.5">
                            기수 선택
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {["9기", "10기", "전체"].map((g) => (
                              <button
                                key={g}
                                type="button"
                                onClick={() => toggleGen(g)}
                                className={`px-3 py-1 rounded-full font-semibold border cursor-pointer ${
                                  selectedGenerations.includes(g)
                                    ? "border-black bg-white text-black font-bold ring-1 ring-black"
                                    : "border-gray-200 bg-white text-gray-500"
                                }`}
                              >
                                {g}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="block font-bold text-gray-700 text-[11px] mb-1.5">
                            전공 선택
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {["Front-end", "Back-end", "DevOps", "Design"].map(
                              (d) => (
                                <button
                                  key={d}
                                  type="button"
                                  onClick={() => toggleDept(d)}
                                  className={`px-3 py-1 rounded-full font-semibold border cursor-pointer ${
                                    selectedDepartments.includes(d)
                                      ? "border-black bg-white text-black font-bold ring-1 ring-black"
                                      : "border-gray-200 bg-white text-gray-500"
                                  }`}
                                >
                                  {d}
                                </button>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                </div>
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
              placeholder="예: 5회차 주제 확정 — 상태관리 라이브러리 비교"
              className="w-full rounded-xl border border-gray-300 p-3 font-semibold outline-none focus:border-black"
            />
          </div>

          {/* 내용 */}
          <div>
            <label className="block font-bold text-gray-700 mb-1.5">내용</label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="공지할 내용을 작성해주세요."
              className="w-full rounded-2xl border border-gray-200 p-3.5 outline-none focus:border-black leading-relaxed"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>마크다운을 지원합니다</span>
              <span>{content.length} / 2000</span>
            </div>
          </div>

          {/* 알림 채널 */}
          <div>
            <label className="block font-bold text-gray-700 mb-2">
              알림 채널
            </label>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3.5 border border-gray-100">
                <div className="flex items-center gap-2">
                  <img src={bellIcon} alt="" className="h-4 w-4 opacity-70" />
                  <div>
                    <p className="font-bold text-gray-900">웹 푸시 (PWA)</p>
                    <p className="text-[10px] text-gray-400">
                      앱을 설치한 팀원에게 즉시 발송
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={webPush}
                  onChange={(e) => setWebPush(e.target.checked)}
                  className="h-5 w-5 accent-black cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3.5 border border-gray-100">
                <div className="flex items-center gap-2">
                  <img
                    src={messageIcon}
                    alt=""
                    className="h-4 w-4 opacity-70"
                  />
                  <div>
                    <p className="font-bold text-gray-900">디스코드 웹훅</p>
                    <p className="text-[10px] text-gray-400">
                      #전공동아리 채널에 함께 게시
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={discord}
                  onChange={(e) => setDiscord(e.target.checked)}
                  className="h-5 w-5 accent-black cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <label className="flex items-center gap-2 rounded-xl border border-gray-200 p-3 cursor-pointer bg-gray-50/50">
                <input
                  type="checkbox"
                  checked={readCheck}
                  onChange={(e) => setReadCheck(e.target.checked)}
                  className="accent-black"
                />
                <div>
                  <p className="font-bold text-gray-800">읽음 확인 사용</p>
                  <p className="text-[10px] text-gray-400">
                    안 읽은 사람에게만 다시 보낼 수 있습니다
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-gray-200 p-3 cursor-pointer bg-gray-50/50">
                <input
                  type="checkbox"
                  checked={scheduled}
                  onChange={(e) => setScheduled(e.target.checked)}
                  className="accent-black"
                />
                <div>
                  <p className="font-bold text-gray-800">예약 발송</p>
                  <p className="text-[10px] text-gray-400">
                    원하는 시각에 자동으로 보냅니다
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">
              보낸 뒤에도 읽음 현황에서 안 읽은 사람을 확인할 수 있습니다
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-200 px-4 py-2 font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                미리보기
              </button>
              <button
                type="submit"
                className="rounded-xl bg-black px-5 py-2 font-bold text-white hover:bg-gray-800 transition cursor-pointer"
              >
                공지 보내기
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNoticeModal;
