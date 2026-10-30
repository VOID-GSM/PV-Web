import { formatDday, formatDeadline, getDaysLeft, type Assignment } from "../../constants/assignment";

type AssignmentListProps = {
  assignments: Assignment[];
  // ★ 과제 번호 → 제출한 사람 수 (내가 낸 과제만 있다)
  submittedCounts: Record<number, number>;
  // 과제를 누르면 제출 현황으로
  onOpenStatus: (assignmentId: number) => void;
};

export default function AssignmentList({ assignments, submittedCounts, onOpenStatus }: AssignmentListProps) {
  if (assignments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-white py-16 text-center">
        <p className="text-sm text-neutral-500">출제된 과제가 없습니다</p>
        <p className="mt-1 text-xs text-neutral-400">오른쪽 위 '과제 출제'로 첫 과제를 내보세요</p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {assignments.map((a) => {
        const days = getDaysLeft(a.deadline);
        const submitted = submittedCounts[a.id];
        return (
          <li key={a.id}>
            <button onClick={() => onOpenStatus(a.id)} className="h-full w-full rounded-lg bg-white p-5 text-left">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">{a.title}</p>
                <span className="shrink-0 rounded bg-amber-50 px-1.5 py-0.5 text-[11px] text-amber-700">
                  {formatDday(days)}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                {a.targets.map((t) => (
                  <span key={t} className="rounded bg-neutral-100 px-1.5 py-0.5">
                    {t}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-neutral-400">
                출제 {a.author} · 마감 {formatDeadline(a.deadline)}
                {submitted !== undefined && ` · ${submitted}명 제출`}
              </p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}