import { formatDday, formatDeadline, getDaysLeft, getRecipients, type Assignment, type Submission } from "../../constants/assignment";

type OngoingAssignmentsProps = {
  // 마감 전이고 임시 저장이 아닌 과제들
  assignments: Assignment[];
  submissions: Submission[];
  onSelect: (assignmentId: number) => void;
};

export default function OngoingAssignments({ assignments, submissions, onSelect }: OngoingAssignmentsProps) {
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
            const recipients = getRecipients(a.targets, a.personalTargets);
            const submitted = submissions.filter((s) => s.assignmentId === a.id).length;
            const days = getDaysLeft(a.deadline);
            // 제출 비율 (받는 사람이 없으면 0)
            const percent = recipients.length === 0 ? 0 : (submitted / recipients.length) * 100;
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
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded bg-neutral-200">
                      <div className="h-1.5 rounded bg-green-600" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="text-[11px] text-neutral-500">
                      {submitted}/{recipients.length} 제출
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}