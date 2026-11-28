import React, { useState } from "react";
import type { BoardFilter, MilestoneItem } from "../../types/calendar";
import type { BoardCreateRequest } from "../../api/calendarApi";

interface RightPanelProps {
  boardFilters?: BoardFilter[];
  milestones?: MilestoneItem[];
  canCreateBoard?: boolean;
  onCreateBoard?: (request: BoardCreateRequest) => Promise<void>;
  onToggleFilter?: (id: string) => void;
  onAddMilestone?: (title: string, date: string, description?: string) => void;
  onApplyMilestonesToCalendar?: () => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  boardFilters = [],
  milestones = [],
  canCreateBoard = false,
  onCreateBoard,
  onToggleFilter,
  onAddMilestone,
  onApplyMilestonesToCalendar,
}) => {
  const [selectedDDay, setSelectedDDay] = useState<string>("D-7");
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const [milestoneError, setMilestoneError] = useState<string | null>(null);
  const [isBoardCreateOpen, setIsBoardCreateOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardType, setNewBoardType] = useState<"PROJECT" | "CONTEST">("PROJECT");
  const [newBoardColor, setNewBoardColor] = useState("#3b82f6");
  const [newBoardStartDate, setNewBoardStartDate] = useState(() => new Date().toLocaleDateString("sv-SE"));
  const [newBoardEndDate, setNewBoardEndDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date.toLocaleDateString("sv-SE");
  });
  const [newBoardAlertDays, setNewBoardAlertDays] = useState<number[]>([7, 3, 1, 0]);
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [boardCreateError, setBoardCreateError] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTitle.trim() && !newDate) {
      setMilestoneError("마일스톤 이름과 날짜를 모두 입력해 주세요.");
      return;
    }
    if (!newTitle.trim()) {
      setMilestoneError("마일스톤 이름을 입력해 주세요.");
      return;
    }
    if (!newDate) {
      setMilestoneError("날짜를 선택해 주세요.");
      return;
    }

    setMilestoneError(null);
    onAddMilestone?.(newTitle.trim(), newDate, newDescription.trim());
    setNewDescription("");
    setNewTitle("");
    setNewDate("");
  };

  const toggleBoardAlertDay = (day: number) => {
    setNewBoardAlertDays((previous) =>
      previous.includes(day) ? previous.filter((item) => item !== day) : [...previous, day],
    );
  };

  const handleCreateBoard = async (event: React.FormEvent) => {
    event.preventDefault();
    setBoardCreateError("");

    if (!newBoardName.trim()) {
      setBoardCreateError("보드 이름을 입력해 주세요.");
      return;
    }
    if (!newBoardStartDate || !newBoardEndDate) {
      setBoardCreateError("시작일과 종료일을 모두 선택해 주세요.");
      return;
    }
    if (newBoardEndDate < newBoardStartDate) {
      setBoardCreateError("종료일은 시작일 이후여야 합니다.");
      return;
    }
    if (!onCreateBoard) {
      setBoardCreateError("보드 생성 기능을 사용할 수 없습니다.");
      return;
    }

    try {
      setIsCreatingBoard(true);
      await onCreateBoard({
        name: newBoardName.trim(),
        type: newBoardType,
        color: newBoardColor,
        startDate: newBoardStartDate,
        endDate: newBoardEndDate,
        alertDays: [...newBoardAlertDays].sort((a, b) => b - a),
      });
      setNewBoardName("");
      setNewBoardType("PROJECT");
      setNewBoardColor("#3b82f6");
      setNewBoardAlertDays([7, 3, 1, 0]);
      setIsBoardCreateOpen(false);
    } catch (error) {
      setBoardCreateError(
        error instanceof Error ? error.message : "보드를 생성하지 못했습니다.",
      );
    } finally {
      setIsCreatingBoard(false);
    }
  };

  return (
    <div className="flex w-80 flex-col space-y-5 shrink-0 select-none overflow-y-auto">
      <div className="rounded-3xl bg-white p-5 shadow-xs">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-xs font-bold text-gray-900">보드 필터</h3>
          {canCreateBoard && (
            <button
              type="button"
              onClick={() => {
                setIsBoardCreateOpen((open) => !open);
                setBoardCreateError("");
              }}
              className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-[10px] font-bold text-gray-700 transition hover:bg-gray-50"
            >
              {isBoardCreateOpen ? "닫기" : "+ 보드 생성"}
            </button>
          )}
        </div>

        {canCreateBoard && isBoardCreateOpen && (
          <form onSubmit={handleCreateBoard} className="mb-4 space-y-3 rounded-2xl border border-gray-100 bg-gray-50 p-3">
            <div>
              <label htmlFor="calendar-new-board-name" className="mb-1 block text-[11px] font-bold text-gray-700">보드 이름</label>
              <input
                id="calendar-new-board-name"
                value={newBoardName}
                onChange={(event) => setNewBoardName(event.target.value)}
                maxLength={100}
                placeholder="예: 2026 프로젝트"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-black"
              />
            </div>
            <div>
              <label htmlFor="calendar-new-board-type" className="mb-1 block text-[11px] font-bold text-gray-700">보드 유형</label>
              <select
                id="calendar-new-board-type"
                value={newBoardType}
                onChange={(event) => setNewBoardType(event.target.value as "PROJECT" | "CONTEST")}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-black"
              >
                <option value="PROJECT">프로젝트</option>
                <option value="CONTEST">대회</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="calendar-new-board-start" className="mb-1 block text-[11px] font-bold text-gray-700">시작일</label>
                <input id="calendar-new-board-start" type="date" value={newBoardStartDate} onChange={(event) => setNewBoardStartDate(event.target.value)} className="w-full min-w-0 rounded-lg border border-gray-200 bg-white px-2 py-2 text-[10px] outline-none focus:border-black" />
              </div>
              <div>
                <label htmlFor="calendar-new-board-end" className="mb-1 block text-[11px] font-bold text-gray-700">종료일</label>
                <input id="calendar-new-board-end" type="date" min={newBoardStartDate || undefined} value={newBoardEndDate} onChange={(event) => setNewBoardEndDate(event.target.value)} className="w-full min-w-0 rounded-lg border border-gray-200 bg-white px-2 py-2 text-[10px] outline-none focus:border-black" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="calendar-new-board-color" className="text-[11px] font-bold text-gray-700">보드 색상</label>
              <input id="calendar-new-board-color" type="color" value={newBoardColor} onChange={(event) => setNewBoardColor(event.target.value)} className="h-8 w-12 cursor-pointer rounded border border-gray-200 bg-white p-1" />
            </div>
            <div>
              <p className="mb-2 text-[11px] font-bold text-gray-700">D-day 알림</p>
              <div className="flex flex-wrap gap-1.5">
                {([{ label: "D-14", value: 14 }, { label: "D-7", value: 7 }, { label: "D-3", value: 3 }, { label: "D-1", value: 1 }, { label: "당일", value: 0 }] as const).map((item) => (
                  <button key={item.value} type="button" onClick={() => toggleBoardAlertDay(item.value)} className={`rounded-full border px-2 py-1 text-[10px] font-bold ${newBoardAlertDays.includes(item.value) ? "border-black bg-black text-white" : "border-gray-200 bg-white text-gray-500"}`}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            {boardCreateError && <p role="alert" className="text-[11px] font-semibold text-red-600">{boardCreateError}</p>}
            <button type="submit" disabled={isCreatingBoard} className="w-full rounded-xl bg-black py-2.5 text-xs font-bold text-white transition hover:bg-gray-800 disabled:opacity-50">
              {isCreatingBoard ? "생성 중..." : "보드 생성하기"}
            </button>
          </form>
        )}
        <div className="space-y-2.5">
          {boardFilters.length === 0 && (
            <p className="text-[11px] leading-relaxed text-gray-400">
              일정을 추가하면 해당 보드가 여기에 표시됩니다.
            </p>
          )}
          {boardFilters.map((filter) => (
            <label
              key={filter.id}
              className="flex items-center justify-between text-xs font-semibold text-gray-700 cursor-pointer hover:text-black transition"
            >
              <span className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: filter.color }}
                />
                {filter.name}
              </span>
              <input
                type="checkbox"
                checked={filter.checked}
                onChange={() => onToggleFilter?.(filter.id)}
                className="rounded border-gray-300 text-black focus:ring-black cursor-pointer"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-xs">
        <h3 className="text-xs font-bold text-gray-900">D-day 알림 단계</h3>
        <p className="text-[11px] text-gray-400 mt-0.5 mb-3">
          보드별로 다르게 설정할 수 있습니다
        </p>

        <div className="flex flex-wrap gap-2">
          {(["D-14", "D-7", "D-3", "D-1", "당일"] as const).map((dday) => (
            <button
              key={dday}
              type="button"
              onClick={() => setSelectedDDay(dday)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                selectedDDay === dday
                  ? "border-2 border-black bg-white text-gray-900"
                  : "border border-gray-200 bg-white text-gray-400 hover:border-gray-400"
              }`}
            >
              {dday}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 rounded-3xl bg-white p-5 shadow-xs flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-bold text-gray-900">
            마감 역산 마일스톤
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
            주요 마감일을 기준으로 자동 제안된 마일스톤 목록입니다.
          </p>

          <form onSubmit={handleAdd} className="mt-4 space-y-2">
            <input
              type="text"
              placeholder="마일스톤 입력"
              value={newTitle}
              onChange={(e) => {
                setNewTitle(e.target.value);
                if (milestoneError) setMilestoneError(null);
              }}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-black transition"
            />
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="상세 일정 또는 메모 (선택)"
              rows={2}
              className="w-full resize-y rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-black transition"
            />
            <div className="flex gap-2">
              <input
                type="date"
                value={newDate}
                onChange={(e) => {
                  setNewDate(e.target.value);
                  if (milestoneError) setMilestoneError(null);
                }}
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-black transition"
              />
              <button
                type="submit"
                className="rounded-xl bg-black px-4 py-2 text-xs font-bold text-white hover:bg-gray-800 transition cursor-pointer"
              >
                추가
              </button>
            </div>

            {milestoneError && (
              <p className="text-[11px] font-semibold text-red-500 flex items-center gap-1 mt-1">
                <svg
                  className="h-3.5 w-3.5 shrink-0 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                {milestoneError}
              </p>
            )}
          </form>

          <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
            {milestones.length === 0 ? (
              <p className="text-xs text-gray-400 py-3 text-center">
                등록된 마일스톤이 없습니다.
              </p>
            ) : (
              milestones.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-2xl bg-gray-50/80 p-3 text-xs"
                >
                  <div>
                    <p className="font-bold text-gray-900">{m.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{m.date}</p>
                    {m.description && <p className="mt-1 max-w-[190px] whitespace-pre-wrap break-words text-[10px] text-gray-500">{m.description}</p>}
                  </div>
                  <span
                    className={`rounded-lg px-2.5 py-1 text-[10px] font-bold ${
                      m.status === "확정"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {m.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
          >
            수정
          </button>
          <button
            type="button"
            onClick={onApplyMilestonesToCalendar}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-black py-2.5 text-xs font-bold text-white hover:bg-gray-800 transition cursor-pointer"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>캘린더에 반영</span>
          </button>
        </div>
      </div>
    </div>
  );
};
