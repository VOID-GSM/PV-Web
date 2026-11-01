import { STATUS_BADGE, type SubmissionStatus } from "../../constants/assignment";

// ★ 받는 사람 한 줄 (페이지가 서버 제출 현황을 이 모양으로 바꿔서 넘겨준다)
export type RecipientRow = {
  memberId: number;
  name: string;
  status: SubmissionStatus | "미제출";
  // "10-30 22:05" 모양 (안 냈으면 null)
  submittedAt: string | null;
  // 제출물 번호 (안 냈으면 null)
  submissionId: number | null;
};

type RecipientStatusListProps = {
  rows: RecipientRow[];
  // 선택된 사람 번호 (있으면 강조)
  selectedMemberId?: number | null;
  // 넘겨주면 줄을 누를 수 있다
  onSelect?: (memberId: number) => void;
};

export default function RecipientStatusList({ rows, selectedMemberId, onSelect }: RecipientStatusListProps) {
  if (rows.length === 0) {
    return <p className="py-6 text-center text-xs text-neutral-400">과제를 받는 팀원이 없습니다</p>;
  }

  return (
    <ul className="flex flex-col">
      {rows.map((row) => (
        <li key={row.memberId} className="border-b last:border-b-0">
          <button
            onClick={() => onSelect?.(row.memberId)}
            disabled={!onSelect}
            className={`flex w-full items-center justify-between gap-2 px-2 py-2.5 text-left ${
              selectedMemberId === row.memberId ? "bg-neutral-100" : ""
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-[10px] text-white">
                {row.name.charAt(0)}
              </span>
              <span>
                <span className="block text-sm">{row.name}</span>
                <span className="block text-[11px] text-neutral-400">
                  {row.submittedAt ? `${row.submittedAt} 제출` : "아직 제출하지 않음"}
                </span>
              </span>
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[11px] ${STATUS_BADGE[row.status]}`}>{row.status}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}