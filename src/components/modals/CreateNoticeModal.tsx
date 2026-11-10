import React, { useState } from "react";
import { createNotice, type NoticeScope } from "../../api/noticeApi";

import bellIcon from "../../assets/icons/bell.svg";
import messageIcon from "../../assets/icons/message.svg";

interface CreateNoticeModalProps {
  isOpen: boolean;
  activityId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const majorMap: Record<string, string> = {
  "Front-end": "FRONTEND",
  "Back-end": "BACKEND",
  DevOps: "DEVOPS",
  Design: "DESIGN",
};

const scopeMap: Record<string, NoticeScope> = {
  "팀 전체": "ALL",
  "특정 보드 참여자": "BOARD",
  "이 활동 참여자": "ACTIVITY",
  "특정 기수 · 전공": "TARGET",
};

const CreateNoticeModal: React.FC<CreateNoticeModalProps> = ({
  isOpen,
  activityId,
  onClose,
  onSuccess,
}) => {
  const [targetRange, setTargetRange] = useState("이 활동 참여자");
  const [selectedGenerations, setSelectedGenerations] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [webPush, setWebPush] = useState(true);
  const [discord, setDiscord] = useState(true);
  const [readCheck, setReadCheck] = useState(true);
  const [scheduled, setScheduled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const toggleGeneration = (generation: string) => {
    setSelectedGenerations((prev) =>
      prev.includes(generation)
        ? prev.filter((item) => item !== generation)
        : [...prev, generation],
    );
  };

  const toggleDepartment = (department: string) => {
    setSelectedDepartments((prev) =>
      prev.includes(department)
        ? prev.filter((item) => item !== department)
        : [...prev, department],
    );
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setTargetRange("이 활동 참여자");
    setSelectedGenerations([]);
    setSelectedDepartments([]);
    setTitle("");
    setContent("");
    setErrorMessage("");
    setWebPush(true);
    setDiscord(true);
    setReadCheck(true);
    setScheduled(false);
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      setErrorMessage("공지 제목을 입력해 주세요.");
      return;
    }

    if (!content.trim()) {
      setErrorMessage("공지 내용을 입력해 주세요.");
      return;
    }

    if (title.trim().length > 100) {
      setErrorMessage("제목은 100자 이내로 입력해 주세요.");
      return;
    }

    if (content.trim().length > 5000) {
      setErrorMessage("내용은 5000자 이내로 입력해 주세요.");
      return;
    }

    if (scheduled) {
      setErrorMessage("예약 발송은 아직 지원하지 않습니다.");
      return;
    }

    if (targetRange === "특정 기수 · 전공") {
      setErrorMessage(
        "기수별 대상 ID 연결이 필요합니다. 현재는 활동 전체 공지를 이용해 주세요.",
      );
      return;
    }

    if (targetRange === "특정 보드 참여자") {
      setErrorMessage(
        "보드 ID 연결이 필요합니다. 현재는 활동 전체 공지를 이용해 주세요.",
      );
      return;
    }

    const body = {
      scope: scopeMap[targetRange],
      activityId: targetRange === "이 활동 참여자" ? activityId : undefined,
      title: title.trim(),
      content: content.trim(),
    };

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      await createNotice(body);

      // ★ alert 삭제: 성공 안내는 부모(Header)가 onSuccess에서 토스트로 띄운다
      onSuccess();
      handleClose();
    } catch (error) {
      console.error("공지 생성 실패:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "공지사항을 등록하지 못했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-pretendard">
      <div className="relative w-full max-w-[580px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">공지 보내기</h2>
            <p className="mt-1 text-xs text-gray-400">
              공지 범위와 내용을 작성해 주세요.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4 text-xs">
          <div>
            <label className="mb-2 block font-bold text-gray-700">
              공지 범위
            </label>

            <div className="space-y-2">
              {Object.keys(scopeMap).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setTargetRange(range)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${
                    targetRange === range
                      ? "border-black bg-white ring-1 ring-black font-bold"
                      : "border-gray-200 bg-gray-50 text-gray-600"
                  }`}
                >
                  <span
                    className={`h-3.5 w-3.5 rounded-full border border-black ${
                      targetRange === range ? "bg-black" : "bg-white"
                    }`}
                  />
                  {range}
                </button>
              ))}
            </div>
          </div>

          {targetRange === "특정 기수 · 전공" && (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 space-y-3">
              <div>
                <p className="mb-2 font-bold">기수 선택</p>
                <div className="flex gap-2">
                  {["9기", "10기"].map((generation) => (
                    <button
                      key={generation}
                      type="button"
                      onClick={() => toggleGeneration(generation)}
                      className={`rounded-full border px-3 py-1 ${
                        selectedGenerations.includes(generation)
                          ? "border-black bg-white font-bold"
                          : "border-gray-200 bg-white text-gray-500"
                      }`}
                    >
                      {generation}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 font-bold">전공 선택</p>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(majorMap).map((department) => (
                    <button
                      key={department}
                      type="button"
                      onClick={() => toggleDepartment(department)}
                      className={`rounded-full border px-3 py-1 ${
                        selectedDepartments.includes(department)
                          ? "border-black bg-white font-bold"
                          : "border-gray-200 bg-white text-gray-500"
                      }`}
                    >
                      {department}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block font-bold text-gray-700">제목</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={100}
              placeholder="공지 제목을 입력해 주세요."
              className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-black"
            />
            <p className="mt-1 text-right text-[10px] text-gray-400">
              {title.length} / 100
            </p>
          </div>

          <div>
            <label className="mb-1.5 block font-bold text-gray-700">내용</label>
            <textarea
              rows={5}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={5000}
              placeholder="공지할 내용을 작성해 주세요."
              className="w-full rounded-2xl border border-gray-200 p-3.5 outline-none focus:border-black"
            />
            <p className="mt-1 text-right text-[10px] text-gray-400">
              {content.length} / 5000
            </p>
          </div>

          <div>
            <label className="mb-2 block font-bold text-gray-700">
              알림 채널
            </label>

            <div className="space-y-2">
              <label className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3.5">
                <span className="flex items-center gap-2">
                  <img src={bellIcon} alt="" className="h-4 w-4" />
                  <span className="font-bold">웹 푸시 (PWA)</span>
                </span>
                <input
                  type="checkbox"
                  checked={webPush}
                  onChange={(event) => setWebPush(event.target.checked)}
                  className="h-5 w-5 accent-black"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3.5">
                <span className="flex items-center gap-2">
                  <img src={messageIcon} alt="" className="h-4 w-4" />
                  <span className="font-bold">디스코드 웹훅</span>
                </span>
                <input
                  type="checkbox"
                  checked={discord}
                  onChange={(event) => setDiscord(event.target.checked)}
                  className="h-5 w-5 accent-black"
                />
              </label>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 rounded-xl border border-gray-200 p-3">
                <input
                  type="checkbox"
                  checked={readCheck}
                  onChange={(event) => setReadCheck(event.target.checked)}
                  className="accent-black"
                />
                읽음 확인 사용
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-gray-200 p-3">
                <input
                  type="checkbox"
                  checked={scheduled}
                  onChange={(event) => setScheduled(event.target.checked)}
                  className="accent-black"
                />
                예약 발송
              </label>
            </div>
          </div>

          {errorMessage && (
            <p className="rounded-xl bg-red-50 p-3 text-xs text-red-600">
              {errorMessage}
            </p>
          )}

          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-xl border border-gray-200 px-4 py-2 font-bold text-gray-600"
            >
              취소
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-black px-5 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "등록 중..." : "공지 보내기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNoticeModal;