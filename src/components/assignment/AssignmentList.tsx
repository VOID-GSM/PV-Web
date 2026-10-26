import {
  formatDday,
  formatDeadline,
  getDaysLeft,
  getRecipients,
  type Assignment,
  type Skill,
  type Submission,
} from "../../constants/assignment";

type AssignmentListProps = {
  assignments: Assignment[];
  skills: Skill[];
  submissions: Submission[];
  // 출제된 과제를 누르면 제출 현황으로
  onOpenStatus: (assignmentId: number) => void;
  // 임시 저장 과제를 누르면 이어서 쓰기
  onEditDraft: (assignment: Assignment) => void;
};

export default function AssignmentList({
  assignments,
  skills,
  submissions,
  onOpenStatus,
  onEditDraft,
}: AssignmentListProps) {
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
        const skill = skills.find((s) => s.id === a.skillId);
        const recipients = getRecipients(a.targets, a.personalTargets);
        const submitted = submissions.filter((s) => s.assignmentId === a.id).length;
        const days = a.deadline ? getDaysLeft(a.deadline) : null;
        return (
          <li key={a.id}>
            <button
              onClick={() => (a.isDraft ? onEditDraft(a) : onOpenStatus(a.id))}
              className="h-full w-full rounded-lg bg-white p-5 text-left"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">{a.title}</p>
                {a.isDraft ? (
                  <span className="shrink-0 rounded-full border px-2 py-0.5 text-[11px] text-neutral-500">임시 저장</span>
                ) : (
                  days !== null && (
                    <span className="shrink-0 rounded bg-amber-50 px-1.5 py-0.5 text-[11px] text-amber-700">
                      {formatDday(days)}
                    </span>
                  )
                )}
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-neutral-500">{a.description || "설명 없음"}</p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                {skill && <span className="rounded bg-blue-50 px-1.5 py-0.5 text-blue-600">{skill.name}</span>}
                {a.targets.map((t) => (
                  <span key={t} className="rounded bg-neutral-100 px-1.5 py-0.5">
                    {t}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-neutral-400">
                {a.isDraft
                  ? "누르면 이어서 작성합니다"
                  : `마감 ${formatDeadline(a.deadline)} · ${submitted}/${recipients.length} 제출`}
              </p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}