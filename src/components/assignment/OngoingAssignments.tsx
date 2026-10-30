import { formatDday, formatDeadline, getDaysLeft, type Assignment } from "../../constants/assignment";

type OngoingAssignmentsProps = {
  // 마감 전 과제들
  assignments: Assignment[];
  // ★ 과제 번호 → 제출한 사람 수 (서버가 알려준 값. 내가 낸 과제만 있다)
  submittedCounts: Record<number, number>;
  onSelect: (assignmentId: number) => void;
};

export default function OngoingAssignments({ assignments, submittedCounts, onSelect }: OngoingAssignmentsProps) {
  return (
    <section className="rounded-lg bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">진행 중 과제</h2>
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px]">{assignments.length}건</span>
      </div>

      {assignments.length === 0 ? (
        <p className="mt-4 rounded border border-dashed py-8 text-center text-xs text-neutral-400">
          진행 중인 과제가 없습니다
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {assignments.map((a) => {
            const days = getDaysLeft(a.deadline);
            const submitted = submittedCounts[a.id];
            return (
              <li key={a.id}>
                <button onClick={() => onSelect(a.id)} className="w-full rounded-lg bg-neutral-50 p-3 text-left">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold">{a.title}</p>
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] ${
                        days <= 2 ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {formatDday(days)}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-neutral-400">
                    출제 {a.author} · 마감 {formatDeadline(a.deadline)}
                    {/* 내가 낸 과제면 제출 인원도 */}
                    {submitted !== undefined && ` · ${submitted}명 제출`}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}