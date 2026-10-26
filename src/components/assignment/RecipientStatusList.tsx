import { STATUS_BADGE, getRecipients, type Assignment, type Submission } from "../../constants/assignment";

type RecipientStatusListProps = {
  assignment: Assignment;
  submissions: Submission[];
  // 선택된 사람 (있으면 강조)
  selectedName?: string;
  // 넘겨주면 줄을 누를 수 있다
  onSelect?: (name: string) => void;
};

export default function RecipientStatusList({
  assignment,
  submissions,
  selectedName,
  onSelect,
}: RecipientStatusListProps) {
  const recipients = getRecipients(assignment.targets, assignment.personalTargets);

  if (recipients.length === 0) {
    return <p className="py-6 text-center text-xs text-neutral-400">과제를 받는 팀원이 없습니다</p>;
  }

  return (
    <ul className="flex flex-col">
      {recipients.map((member) => {
        // 이 사람의 제출물
        const submission = submissions.find(
          (s) => s.assignmentId === assignment.id && s.author === member.name
        );
        const status = submission?.status ?? "미제출";
        return (
          <li key={member.name} className="border-b last:border-b-0">
            <button
              onClick={() => onSelect?.(member.name)}
              disabled={!onSelect}
              className={`flex w-full items-center justify-between gap-2 px-2 py-2.5 text-left ${
                selectedName === member.name ? "bg-neutral-100" : ""
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-[10px] text-white">
                  {member.name.charAt(0)}
                </span>
                <span>
                  <span className="block text-sm">{member.name}</span>
                  <span className="block text-[11px] text-neutral-400">
                    {submission ? `${submission.submittedAt.slice(5, 10)} ${submission.type}` : "아직 제출하지 않음"}
                  </span>
                </span>
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[11px] ${STATUS_BADGE[status]}`}>{status}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}