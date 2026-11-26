import React, { useEffect, useState } from "react";
import { MAJOR_LABEL } from "../../apis/interviews";
import type {
  ActivityDetail,
  ActivityStatus,
  ActivityUpdateRequest,
  Major,
} from "../../api/activityApi";
import { getGenerations, type Generation } from "../../api/generationApi";
import {
  formatActivityPeriod,
  formatActivitySchedule,
  formatTopicRule,
} from "../../utils/activitySchedule";

interface ActivitySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: ActivityDetail | null;
  onSave: (changes: ActivityUpdateRequest) => Promise<boolean>;
  onDelete: () => void;
}

const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 2000;
const MIN_CAPACITY = 1;
const MAX_CAPACITY = 200;

const MAJOR_KEYS = Object.keys(MAJOR_LABEL) as Major[];

const STATUS_OPTIONS: { value: ActivityStatus; label: string }[] = [
  { value: "RECRUITING", label: "모집 중" },
  { value: "ONGOING", label: "진행 중" },
  { value: "ENDED", label: "종료" },
];

export const ActivitySettingsModal: React.FC<ActivitySettingsModalProps> = ({
  isOpen,
  onClose,
  activity,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState("");
  const [majors, setMajors] = useState<Major[]>([]);
  const [generationIds, setGenerationIds] = useState<number[]>([]);
  const [status, setStatus] = useState<ActivityStatus>("RECRUITING");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [generations, setGenerations] = useState<Generation[]>([]);

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
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // 모달을 열거나 다른 활동을 선택하면 입력값 초기화
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevActivityId, setPrevActivityId] = useState<number | null>(
    activity?.summary.id ?? null,
  );

  if (
    isOpen &&
    activity &&
    (!prevIsOpen || prevActivityId !== activity.summary.id)
  ) {
    setPrevIsOpen(true);
    setPrevActivityId(activity.summary.id);

    setName(activity.summary.name);
    setDescription(activity.description ?? "");
    setCapacity(String(activity.summary.capacity));
    setMajors(activity.targetMajors ?? []);
    setGenerationIds(
      activity.targetGenerations?.map((generation) => generation.id) ?? [],
    );
    setStatus(activity.summary.status);
    setError("");
    setIsSaving(false);
  }

  if (!isOpen && prevIsOpen) {
    setPrevIsOpen(false);
  }

  if (!isOpen || !activity) return null;

  const toggleMajor = (major: Major) => {
    setMajors((prev) =>
      prev.includes(major)
        ? prev.filter((item) => item !== major)
        : [...prev, major],
    );
  };

  const toggleGeneration = (id: number) => {
    setGenerationIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const validate = () => {
    if (!name.trim()) return "활동 이름을 입력해 주세요.";

    if (name.trim().length > MAX_NAME_LENGTH) {
      return `활동 이름은 ${MAX_NAME_LENGTH}자까지 입력할 수 있습니다.`;
    }

    if (description.trim().length > MAX_DESCRIPTION_LENGTH) {
      return `활동 설명은 ${MAX_DESCRIPTION_LENGTH}자까지 입력할 수 있습니다.`;
    }

    const count = Number(capacity);

    if (
      !Number.isInteger(count) ||
      count < MIN_CAPACITY ||
      count > MAX_CAPACITY
    ) {
      return `모집 인원은 ${MIN_CAPACITY}~${MAX_CAPACITY}명 사이 숫자로 입력해 주세요.`;
    }

    return "";
  };

  const buildChanges = (): ActivityUpdateRequest => {
    const changes: ActivityUpdateRequest = {};

    if (name.trim() !== activity.summary.name) {
      changes.name = name.trim();
    }

    if (description.trim() !== (activity.description ?? "").trim()) {
      changes.description = description.trim();
    }

    if (Number(capacity) !== activity.summary.capacity) {
      changes.capacity = Number(capacity);
    }

    const originalMajors = activity.targetMajors ?? [];

    if (
      majors.length !== originalMajors.length ||
      majors.some((major) => !originalMajors.includes(major))
    ) {
      changes.targetMajors = majors;
    }

    // 서버가 내려준 기수 ID와 비교하고, 변경된 경우 정확한 필드명으로 전송한다.
    // 선택을 모두 해제한 경우 빈 배열을 보내 기존 대상 기수 제한을 해제한다.
    const originalGenerationIds =
      activity.targetGenerations?.map((generation) => generation.id) ?? [];
    const selectedTargetGenerationIds = [...new Set(generationIds)].filter(
      (id) => Number.isInteger(id) && id > 0,
    );
    const sameGenerationIds =
      selectedTargetGenerationIds.length === originalGenerationIds.length &&
      selectedTargetGenerationIds.every((id) => originalGenerationIds.includes(id));

    if (!sameGenerationIds) {
      changes.targetGenerationIds = selectedTargetGenerationIds;
    }

    if (status !== activity.summary.status) {
      changes.status = status;
    }

    return changes;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const message = validate();

    if (message) {
      setError(message);
      return;
    }

    const changes = buildChanges();

    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      const ok = await onSave(changes);

      if (ok) {
        onClose();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "활동 설정을 저장하지 못했습니다.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const generationText =
    activity.targetGenerations && activity.targetGenerations.length > 0
      ? activity.targetGenerations
          .map((generation) => `${generation.number}기`)
          .join(", ")
      : "제한 없음";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-pretendard select-none">
      <div className="scrollbar-hide relative max-h-[90vh] w-full max-w-[520px] overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">활동 설정</h2>
            <p className="mt-1 text-xs text-gray-400">바꾼 항목만 저장됩니다</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4 text-xs">
          <div>
            <label className="mb-1 block font-bold text-gray-700">
              활동 이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={MAX_NAME_LENGTH}
              placeholder="예: React 심화 스터디"
              className="w-full rounded-xl border border-gray-200 p-3 font-semibold outline-none focus:border-black"
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="font-bold text-gray-700">활동 설명</label>
              <span className="text-[10px] text-gray-400">
                {description.length} / {MAX_DESCRIPTION_LENGTH}
              </span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={MAX_DESCRIPTION_LENGTH}
              rows={4}
              placeholder="활동 소개, 진행 방식 등을 적어 주세요."
              className="w-full resize-none rounded-xl border border-gray-200 p-3 leading-relaxed outline-none focus:border-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block font-bold text-gray-700">
                모집 인원
              </label>
              <input
                type="number"
                min={MIN_CAPACITY}
                max={MAX_CAPACITY}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-black"
              />
              <p className="mt-1 text-[10px] text-gray-400">
                현재 참여 {activity.summary.memberCount}명
              </p>
            </div>

            <div>
              <label className="mb-1 block font-bold text-gray-700">상태</label>
              <div className="flex gap-1.5">
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStatus(option.value)}
                    className={`flex-1 cursor-pointer rounded-xl border px-2 py-2.5 font-semibold transition ${
                      status === option.value
                        ? "border-black bg-black text-white"
                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="font-bold text-gray-700">대상 전공</label>
              <span className="text-[10px] text-gray-400">
                선택하지 않으면 전공 제한이 없어요
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {MAJOR_KEYS.map((major) => (
                <button
                  key={major}
                  type="button"
                  onClick={() => toggleMajor(major)}
                  className={`cursor-pointer rounded-full border px-3.5 py-1.5 font-semibold transition ${
                    majors.includes(major)
                      ? "border-black bg-white font-bold text-black ring-1 ring-black"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {MAJOR_LABEL[major]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="font-bold text-gray-700">대상 기수</label>
              <span className="text-[10px] text-gray-400">
                선택하지 않으면 전체 기수
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {generations.map((generation) => (
                <button
                  key={generation.id}
                  type="button"
                  onClick={() => toggleGeneration(generation.id)}
                  className={`cursor-pointer rounded-full border px-3.5 py-1.5 font-semibold transition ${
                    generationIds.includes(generation.id)
                      ? "border-black bg-white font-bold text-black ring-1 ring-black"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {generation.number}기
                </button>
              ))}

              <button
                type="button"
                onClick={() => setGenerationIds([])}
                className={`cursor-pointer rounded-full border px-3.5 py-1.5 font-semibold transition ${
                  generationIds.length === 0
                    ? "border-black bg-white font-bold text-black ring-1 ring-black"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                전체
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="font-bold text-gray-700">개설 후 바꿀 수 없는 항목</p>
            <dl className="mt-3 space-y-2 text-gray-600">
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-gray-400">진행 기간</dt>
                <dd className="font-medium">
                  {formatActivityPeriod(activity.summary)}
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-gray-400">요일 · 시간</dt>
                <dd className="font-medium">
                  {formatActivitySchedule(activity)}
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-gray-400">주제 방식</dt>
                <dd className="font-medium">{formatTopicRule(activity)}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-gray-400">기존 대상 기수</dt>
                <dd className="font-medium">{generationText}</dd>
              </div>
            </dl>
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 font-semibold text-red-600">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onDelete}
              disabled={isSaving}
              className="cursor-pointer rounded-xl border border-red-200 px-4 py-2 font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              활동 삭제
            </button>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="cursor-pointer rounded-xl border border-gray-200 px-4 py-2 font-bold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
              >
                취소
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="cursor-pointer rounded-xl bg-black px-5 py-2 font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? "저장 중..." : "설정 저장"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivitySettingsModal;
