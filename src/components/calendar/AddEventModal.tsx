// src/components/calendar/AddEventModal.tsx
import React, { useState } from "react";
// ★ 팀원 목록을 서버에서 불러오는 도구
import { useQuery } from "@tanstack/react-query";
import type { CalendarEvent } from "../../types/calendar";
import { getMembers } from "../../apis/members";
import { teamKeys } from "../../hooks/useTeam";

import alertIcon from "../../assets/icons/alert.svg";
import plusIcon from "../../assets/icons/plus.svg";
import checkCircleIcon from "../../assets/icons/check-circle.svg";

// ☆ 고른 담당자 한 명 (이름은 화면용, 번호는 서버용)
type PickedMember = { memberId: number | null; name: string };

interface AddEventModalProps {
  isOpen: boolean;
  canManageMeetings?: boolean;
  onClose: () => void;
  onAddEvent?: (newEvent: CalendarEvent) => void;
  initialEvent?: CalendarEvent | null;
  onUpdateEvent?: (updatedEvent: CalendarEvent) => void;
  // 새 일정을 만들 때 날짜 칸에 미리 넣어 둘 날짜 (캘린더에서 날짜를 눌렀을 때)
  initialDate?: string;
  // ☆ 마감을 걸 수 있는 보드 목록 (App이 부장일 때만 불러온다 → 있으면 부장)
  boards?: { id: number; name: string }[];
}

// 설명 최대 글자 수 (서버 memo 칸 길이)
const MAX_DESCRIPTION = 2000;
// ☆ 마감 담당자 최대 인원 (서버 규칙)
const MAX_ASSIGNEES = 20;

// ☆ 수정할 때: 기존 일정의 이름·번호 목록을 짝지어 고른 담당자로 만든다
const toPicked = (event: CalendarEvent | null): PickedMember[] =>
  (event?.assignees ?? []).map((name, index) => ({
    memberId: event?.assigneeIds?.[index] ?? null,
    name,
  }));

export const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  canManageMeetings = false,
  onClose,
  onAddEvent,
  initialEvent = null,
  onUpdateEvent,
  initialDate,
  boards = [],
}) => {
  const [type, setType] = useState<"마감" | "회의" | "활동" | "개인 일정">(
    initialEvent?.type ?? "마감",
  );
  const [title, setTitle] = useState(initialEvent?.title ?? "");
  const [board, setBoard] = useState(initialEvent?.board ?? "");
  // ☆ 마감일 때 고른 보드 번호 (없으면 null)
  const [boardId, setBoardId] = useState<number | null>(
    initialEvent?.boardId ?? null,
  );
  const [repeat, setRepeat] = useState("반복 없음");
  // 수정이면 그 일정 날짜, 새로 만들면 눌렀던 날짜, 둘 다 없으면 빈칸
  const [date, setDate] = useState(initialEvent?.date ?? initialDate ?? "");
  const [time, setTime] = useState(initialEvent?.time ?? "");
  const [endDate, setEndDate] = useState(initialEvent?.endDate ?? "");
  // 상세 설명 (서버에는 memo / 마감은 description으로 저장된다)
  const [description, setDescription] = useState(
    initialEvent?.description ?? "",
  );
  // ☆ 고른 담당자들 (이름 + 회원 번호)
  const [picked, setPicked] = useState<PickedMember[]>(() =>
    toPicked(initialEvent),
  );
  const [alerts, setAlerts] = useState<string[]>([]);
  // ★ 팀원 고르기 목록이 열려 있는지
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  // ☆ 저장을 눌렀을 때 빠진 칸 안내 (없으면 "")
  const [formError, setFormError] = useState("");

  // ☆ 보드 목록이 있으면 부장 → 마감을 보드에 등록할 수 있다
  const canMakeDeadline = canManageMeetings && boards.length > 0;
  // ☆ 지금 "보드 마감" 화면인지 (마감 + 부장)
  const isDeadlineMode = type === "마감" && canMakeDeadline;
  const isMeetingMode = type === "회의";
  const canPickMembers = isDeadlineMode || isMeetingMode;

  // ★ 팀원 목록: 고르기 목록을 열었을 때만 서버에 요청한다
  // (훅은 아래 "if (!isOpen) return null"보다 위에 있어야 해서 여기에 둔다)
  const membersQuery = useQuery({
    queryKey: teamKeys.members,
    queryFn: getMembers,
    enabled: isOpen && isPickerOpen,
  });
  // ☆ 가입된 팀원 중 아직 안 고른 사람만 (번호로 비교)
  const pickableMembers = (membersQuery.data ?? []).filter(
    (m) =>
      m.status === "JOINED" && !picked.some((p) => p.memberId === m.memberId),
  );

  // useEffect 대신 렌더링 단계에서 isOpen 상태 변화를 감지해 폼 초기화 (ESLint 에러 방지)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setType(initialEvent?.type ?? "마감");
      setTitle(initialEvent?.title ?? "");
      setBoard(initialEvent?.board ?? "");
      setBoardId(initialEvent?.boardId ?? null);
      setRepeat("반복 없음");
      setDate(initialEvent?.date ?? initialDate ?? "");
      setTime(initialEvent?.time ?? "");
      setEndDate(initialEvent?.endDate ?? "");
      setDescription(initialEvent?.description ?? "");
      setPicked(toPicked(initialEvent));
      setAlerts([]);
      // ★ 창을 다시 열면 팀원 목록은 닫힌 상태로
      setIsPickerOpen(false);
      setFormError("");
    }
  }

  if (!isOpen) return null;

  const toggleAlert = (level: string) => {
    setAlerts((prev) =>
      prev.includes(level)
        ? prev.filter((item) => item !== level)
        : [...prev, level],
    );
  };

  // ☆ 담당자 빼기 (몇 번째인지로 뺀다: 번호가 없는 옛 일정도 뺄 수 있게)
  const removeAssignee = (index: number) => {
    setPicked((prev) => prev.filter((_, i) => i !== index));
  };

  // ☆ 목록에서 팀원을 고르면 이름·번호를 같이 담고 목록을 닫는다
  const addAssignee = (memberId: number, name: string) => {
    setPicked((prev) =>
      prev.length >= MAX_ASSIGNEES ? prev : [...prev, { memberId, name }],
    );
    setIsPickerOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setFormError("제목을 입력해 주세요.");
      return;
    }

    if (isMeetingMode && !canManageMeetings) {
      setFormError("보드 회의 생성 및 수정은 부장만 할 수 있어요.");
      return;
    }

    if ((isDeadlineMode || isMeetingMode) && boardId === null) {
      setFormError(
        isMeetingMode
          ? "회의를 등록할 보드를 선택해 주세요."
          : "마감을 등록할 보드를 골라 주세요.",
      );
      return;
    }

    if (!isDeadlineMode && !isMeetingMode && !board.trim()) {
      setFormError("보드 이름을 입력해 주세요.");
      return;
    }

    const boardName =
      isDeadlineMode || isMeetingMode
        ? (boards.find((b) => b.id === boardId)?.name ?? "")
        : board.trim();

    const eventData: CalendarEvent = {
      ...(initialEvent ?? { id: Date.now().toString() }),
      title: title.trim(),
      type,
      board: boardName,
      date: date || new Date().toLocaleDateString("sv-SE"),
      time: time || undefined,
      endDate: endDate || undefined,
      description: description.trim(),
      // ☆ 화면용 이름 / 서버용 번호 (번호 없는 사람은 빼고)
      assignees: canPickMembers ? picked.map((p) => p.name) : [],



      assigneeIds: canPickMembers
        ? picked
            .map((p) => p.memberId)
            .filter((memberId): memberId is number => memberId !== null)
        : [],

      boardId:
        isDeadlineMode || isMeetingMode ? (boardId ?? undefined) : undefined,
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
            <h2 className="text-xl font-bold text-gray-900">
              {initialEvent ? "일정 수정" : "일정 추가"}
            </h2>
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
                  disabled={item === "회의" && !canManageMeetings}
                  key={item}
                  type="button"
                  onClick={() => {
                    if (item === "회의" && !canManageMeetings) return;
                    setType(item);
                    setFormError("");
                  }}
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

            {/* ☆ 부장이 아닌데 마감을 고르면 안내 */}
            {!initialEvent && type === "마감" && !canManageMeetings && (
              <p className="mt-2 text-[11px] text-gray-400">
                보드 마감은 부장만 등록할 수 있어요. 지금은 내 일정으로
                저장됩니다.
              </p>
            )}
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
              {isDeadlineMode || isMeetingMode ? (
                // ☆ 보드 마감: 서버 보드 목록에서 고르기
                <select
                  value={boardId ?? ""}
                  onChange={(e) =>
                    setBoardId(e.target.value ? Number(e.target.value) : null)
                  }
                  className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-black bg-white font-medium"
                >
                  <option value="">보드 선택</option>
                  {boards.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={board}
                  onChange={(e) => setBoard(e.target.value)}
                  placeholder="새 보드 이름 입력"
                  className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-black bg-white font-medium"
                />
              )}
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
              {/* ★ type="date": 누르면 달력이 뜨고, 값은 "2026-11-09" 모양으로 들어온다 */}
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-2.5 outline-none focus:border-black font-medium bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1.5">
                시간
              </label>
              {/* ★ type="time": 누르면 시간 고르기가 뜨고, 값은 "23:59" 모양 */}
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-2.5 outline-none focus:border-black font-medium bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1.5">
                종료
              </label>
              {/* ★ 종료일도 달력으로. min: 시작 날짜보다 앞은 못 고르게 */}
              <input
                type="date"
                value={endDate}
                min={date || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-2.5 outline-none focus:border-black font-medium bg-white"
              />
            </div>
          </div>

          {/* 상세 설명 */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="font-bold text-gray-700">상세 설명</label>
              <span className="text-[10px] text-gray-400">
                {description.length} / {MAX_DESCRIPTION}
              </span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={MAX_DESCRIPTION}
              placeholder={
                isDeadlineMode
                  ? "제출물, 제출 방법, 참고 자료 등을 적어 주세요 (선택)"
                  : "장소, 준비물, 참고 링크 등을 적어 주세요 (선택)"
              }
              className="w-full resize-none rounded-xl border border-gray-200 p-3 leading-relaxed outline-none focus:border-black"
            />
          </div>


          {canPickMembers && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="font-bold text-gray-700">
                  {isMeetingMode ? "참석자" : "담당자"}
                </label>
                <span className="text-[10px] text-gray-400">
                  {picked.length} / {MAX_ASSIGNEES}명
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {picked.map((p, index) => (
                  <span
                    key={`${p.memberId ?? "x"}-${index}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-800"
                  >
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white">
                      {p.name[0]}
                    </span>
                    <span>{p.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAssignee(index)}
                      className="text-gray-400 hover:text-gray-600 ml-0.5 cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                ))}

                {/* 팀원 추가 버튼 + 그 아래 뜨는 목록 (20명이 차면 숨김) */}
                {picked.length < MAX_ASSIGNEES && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsPickerOpen(!isPickerOpen)}
                      className="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-300 px-3 py-1 font-semibold text-gray-500 hover:bg-gray-50 transition cursor-pointer"
                    >
                      <img
                        src={plusIcon}
                        alt=""
                        className="h-3 w-3 opacity-60"
                      />
                      <span>팀원 추가</span>
                    </button>

                    {isPickerOpen && (
                      <div className="absolute left-0 z-10 mt-2 max-h-56 w-56 overflow-y-auto rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                        {membersQuery.isPending ? (
                          <p className="px-3 py-2 text-gray-400">
                            불러오는 중...
                          </p>
                        ) : membersQuery.isError ? (
                          <p className="px-3 py-2 text-red-500">
                            팀원 목록을 불러오지 못했습니다
                          </p>
                        ) : pickableMembers.length === 0 ? (
                          <p className="px-3 py-2 text-gray-400">
                            추가할 팀원이 없습니다
                          </p>
                        ) : (
                          pickableMembers.map((m) => (
                            <button
                              key={m.memberId}
                              type="button"
                              // ☆ 이름과 번호를 같이 담는다
                              onClick={() => addAssignee(m.memberId, m.name)}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-gray-50 cursor-pointer"
                            >
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white">
                                {m.name.charAt(0)}
                              </span>
                              <span className="font-semibold text-gray-800">
                                {m.name}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {m.generation}기
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* D-day 알림 단계 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-bold text-gray-700">D-day 알림 단계</label>
              <span className="text-[10px] text-gray-400">복수 선택</span>
            </div>
            <div className="flex gap-2">
              {["D-14", "D-7", "D-3", "D-1", "당일"].map((level) => (
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
              <p className="font-bold">
                {isMeetingMode ? "회의 참석자" : "마감 알림"}
              </p>
              <p className="mt-0.5 text-[11px] text-amber-700/90 leading-relaxed">
                {isMeetingMode
                  ? "선택한 팀원이 회의 참석자로 지정됩니다. 참석자는 최대 20명까지 선택할 수 있습니다."
                  : "선택한 D-day 단계에 따라 담당 팀원에게 알림 메시지가 발송됩니다."}
              </p>
            </div>
          </div>

          {/* ☆ 빠진 칸 안내 */}
          {formError && (
            <p className="rounded-xl bg-red-50 px-4 py-3 font-semibold text-red-600">
              {formError}
            </p>
          )}

          {/* Footer */}
          <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">
              {/* ★ 수정일 때는 수정 안내 */}
              {initialEvent
                ? "저장하면 일정이 바로 수정됩니다"
                : "추가하면 담당자와 모든 팀원에게 알림이 갑니다"}
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
                {/* ★ 수정일 때는 "저장" */}
                {initialEvent ? "저장" : "일정 추가"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventModal;
