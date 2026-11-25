import React, { useEffect, useState } from "react";
import alertIcon from "../../assets/icons/alert.svg";
import checkCircleIcon from "../../assets/icons/check-circle.svg";
import { getGenerations, type Generation } from "../../api/activityApi";

export interface ActivityFormData {
  title: string;
  type: string;
  generationIds: number[];
  departments: string[];
  memberCount: string;
  startDate: string;
  endDate: string;
  repeatRule: string;
  topicMode: "투표형" | "지정형";
  voteTime: string;
  confirmMode: "스터디장 승인" | "선착순";
  discordEnabled: boolean;
}

interface CreateActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSuccess?: (activityData: ActivityFormData) => void;
}

const MIN_CAPACITY = 1;
const MAX_CAPACITY = 200;

const DEPARTMENTS = ["Front-end", "Back-end", "DevOps", "Design"];

export const CreateActivityModal: React.FC<CreateActivityModalProps> = ({
  isOpen,
  onClose,
  onCreateSuccess,
}) => {
  const [type, setType] = useState("스터디");
  const [title, setTitle] = useState("");
  const [generationIds, setGenerationIds] = useState<number[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [memberCount, setMemberCount] = useState("");
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
  const [discordEnabled, setDiscordEnabled] = useState(false);
  const [error, setError] = useState("");

  const [generations, setGenerations] = useState<Generation[]>([]);
  const [isLoadingGenerations, setIsLoadingGenerations] = useState(false);

  // 기수 목록 조회
  useEffect(() => {
    let cancelled = false;

    getGenerations()
      .then((data) => {
        if (!cancelled) {
          setGenerations(data);
        }
      })
      .catch((err: unknown) => {
        console.error("기수 목록 조회 실패:", err);
        if (!cancelled) {
          setError("기수 목록을 불러오지 못했습니다.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingGenerations(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // 모달을 새로 열 때 폼 초기화
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);

    if (isOpen) {
      setType("스터디");
      setTitle("");
      setGenerationIds([]);
      setDepartments([]);
      setMemberCount("");
      setDiscordEnabled(false);
      setStartDate("");
      setEndDate("");
      setRepeatRule("매주 수요일 16:00 · 전공동아리 시간");
      setTopicMode("투표형");
      setVoteTime("회차 3일 전");
      setConfirmMode("스터디장 승인");
      setError("");
    }
  }

  if (!isOpen) return null;

  const isVoteMode = topicMode === "투표형";

  const toggleGeneration = (id: number) => {
    setGenerationIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleDept = (department: string) => {
    setDepartments((prev) =>
      prev.includes(department)
        ? prev.filter((item) => item !== department)
        : [...prev, department],
    );
  };

  const validate = () => {
    if (!title.trim()) return "활동명을 입력해 주세요.";

    const count = Number(memberCount);

    if (
      !Number.isInteger(count) ||
      count < MIN_CAPACITY ||
      count > MAX_CAPACITY
    ) {
      return `모집 인원은 ${MIN_CAPACITY}~${MAX_CAPACITY}명 사이 숫자로 입력해 주세요.`;
    }

    if (!startDate) return "시작일을 선택해 주세요.";
    if (!endDate) return "종료일을 선택해 주세요.";
    if (endDate < startDate) return "종료일은 시작일 이후여야 합니다.";

    return "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const message = validate();

    if (message) {
      setError(message);
      return;
    }

    onCreateSuccess?.({
      title: title.trim(),
      type,
      generationIds,
      departments,
      memberCount,
      startDate,
      endDate,
      repeatRule,
      topicMode,
      voteTime,
      confirmMode,
      discordEnabled,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-pretendard select-none">
      <div className="relative max-h-[90vh] w-full max-w-[620px] overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
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
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          <div>
            <label className="mb-2 block font-bold text-gray-700">
              활동 유형
            </label>

            <div className="flex flex-wrap gap-2">
              {["스터디", "면접 준비", "포폴 피드백", "기타"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setType(item)}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-2 font-semibold transition ${
                    type === item
                      ? "border-black bg-black text-white"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {type === item && (
                    <img
                      src={checkCircleIcon}
                      alt=""
                      className="h-3.5 w-3.5 invert"
                    />
                  )}
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block font-bold text-gray-700">활동명</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder="예: React 심화 스터디"
              className="w-full rounded-xl border border-gray-300 p-3 text-sm font-semibold outline-none focus:border-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block font-bold text-gray-700">
                대상 기수
              </label>

              <div className="flex flex-wrap gap-2">
                {generations.map((generation) => (
                  <button
                    key={generation.id}
                    type="button"
                    onClick={() => toggleGeneration(generation.id)}
                    className={`cursor-pointer rounded-full border px-3.5 py-1.5 font-semibold ${
                      generationIds.includes(generation.id)
                        ? "border-black bg-white text-black ring-1 ring-black"
                        : "border-gray-200 text-gray-500"
                    }`}
                  >
                    {generation.number}기
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setGenerationIds([])}
                  className={`cursor-pointer rounded-full border px-3.5 py-1.5 font-semibold ${
                    generationIds.length === 0
                      ? "border-black bg-white text-black ring-1 ring-black"
                      : "border-gray-200 text-gray-500"
                  }`}
                >
                  전체
                </button>
              </div>

              {isLoadingGenerations && (
                <p className="mt-2 text-[10px] text-gray-400">
                  기수 목록을 불러오는 중...
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block font-bold text-gray-700">
                대상 전공
              </label>
              <div className="flex flex-wrap gap-2">
                {DEPARTMENTS.map((department) => (
                  <button
                    key={department}
                    type="button"
                    onClick={() => toggleDept(department)}
                    className={`cursor-pointer rounded-full border px-3.5 py-1.5 font-semibold ${
                      departments.includes(department)
                        ? "border-black bg-white text-black ring-1 ring-black"
                        : "border-gray-200 text-gray-500"
                    }`}
                  >
                    {department}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-2 block font-bold text-gray-700">
                모집 인원
              </label>
              <input
                type="number"
                min={MIN_CAPACITY}
                max={MAX_CAPACITY}
                value={memberCount}
                onChange={(e) => setMemberCount(e.target.value)}
                placeholder="예: 6"
                className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block font-bold text-gray-700">
                시작일
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white p-2.5 font-medium outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block font-bold text-gray-700">
                종료일
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white p-2.5 font-medium outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block font-bold text-gray-700">
              반복 규칙
            </label>
            <select
              value={repeatRule}
              onChange={(e) => setRepeatRule(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white p-3 outline-none focus:border-black"
            >
              <option>매주 수요일 16:00 · 전공동아리 시간</option>
              <option>매주 목요일 18:00</option>
              <option>격주 금요일 15:00</option>
            </select>
          </div>

          <div className="flex gap-2.5 rounded-2xl border border-blue-100 bg-blue-50 p-4 leading-relaxed text-blue-700">
            <img src={alertIcon} alt="" className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-bold">기본값이 자동으로 채워졌습니다</p>
              <p className="mt-0.5 text-[11px] opacity-80">
                시험 기간처럼 진행이 어려운 주는 해당 회차를 휴강·일정 변경으로
                바꾸면 자동 공지됩니다.
              </p>
            </div>
          </div>

          <div>
            <label className="mb-2 block font-bold text-gray-700">
              주제 결정 방식
            </label>

            <div className="grid grid-cols-2 gap-3">
              {(["투표형", "지정형"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTopicMode(mode)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    topicMode === mode
                      ? "border-black bg-white ring-2 ring-black"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <span className="font-bold text-gray-900">{mode}</span>
                  <p className="mt-1.5 text-[11px] leading-tight text-gray-500">
                    {mode === "투표형"
                      ? "회차 N일 전 투표가 자동으로 열리고 최다 득표 주제가 확정됩니다"
                      : "회차 N일 전 스터디장에게 주제 입력 알림이 갑니다"}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className={isVoteMode ? "grid grid-cols-2 gap-4" : ""}>
            {isVoteMode && (
              <div>
                <label className="mb-2 block font-bold text-gray-700">
                  투표 개설 시점
                </label>
                <input
                  type="text"
                  value={voteTime}
                  onChange={(e) => setVoteTime(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-black"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block font-bold text-gray-700">
                참여 확정 방식
              </label>
              <div className="flex items-center gap-4 pt-2">
                <label className="flex cursor-pointer items-center gap-2 font-bold text-gray-800">
                  <input
                    type="radio"
                    name="confirm"
                    checked={confirmMode === "스터디장 승인"}
                    onChange={() => setConfirmMode("스터디장 승인")}
                    className="accent-black"
                  />
                  스터디장 승인
                </label>

                <label className="flex cursor-pointer items-center gap-2 font-medium text-gray-500">
                  <input
                    type="radio"
                    name="confirm"
                    checked={confirmMode === "선착순"}
                    onChange={() => setConfirmMode("선착순")}
                    className="accent-black"
                  />
                  선착순
                </label>
              </div>
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-4 transition hover:bg-gray-50">
            <input
              type="checkbox"
              checked={discordEnabled}
              onChange={(e) => setDiscordEnabled(e.target.checked)}
              className="h-4 w-4 accent-black"
            />
            <span className="flex flex-col gap-1">
              <span className="font-bold text-gray-800">
                디스코드로 모집 공지 전송
              </span>
              <span className="text-[11px] text-gray-500">
                체크하면 활동 개설 시 디스코드에도 알림을 전송합니다.
              </span>
            </span>
          </label>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 font-semibold text-red-600">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between border-t border-gray-100 pt-5">
            <span className="text-[11px] text-gray-400">
              개설하면 대상 기수·전공 팀원에게 모집 공지가 발송됩니다
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-xl border border-gray-200 px-5 py-2.5 font-bold text-gray-600 transition hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="submit"
                className="cursor-pointer rounded-xl bg-black px-5 py-2.5 font-bold text-white transition hover:bg-gray-800"
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
