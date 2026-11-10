import { STATUS_BADGE, formatDuration, type PracticeRecord } from "../../constants/questionBank";

type PracticeHistoryProps = {
  records: PracticeRecord[];
};

// ★ 글 답변이 없을 때 상태별 안내
const EMPTY_ANSWER_TEXT: Record<string, string> = {
  "말로 연습": "말로 연습해서 글 답변이 없습니다",
  건너뜀: "건너뛴 질문입니다",
  "시간 초과": "시간 안에 답변하지 못했습니다",
};

export default function PracticeHistory({ records }: PracticeHistoryProps) {
  return (
    <section className="rounded-lg bg-white p-5">
      <h2 className="font-bold">최근 연습 기록</h2>

      {records.length === 0 ? (
        <p className="mt-4 rounded border border-dashed py-8 text-center text-xs text-neutral-400">
          아직 연습 기록이 없습니다
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {records.map((r) => (
            <li key={r.id} className="rounded bg-neutral-50 px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium" title={r.questionTitle}>
                    {r.questionTitle}
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    {r.date} · {r.category}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-semibold">{formatDuration(r.seconds)}</p>
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${STATUS_BADGE[r.status]}`}>
                    {r.status}
                  </span>
                </div>
              </div>

              {/* ★ 내가 쓴 답변 (두 줄까지, 마우스를 올리면 전체) */}
              {r.answer ? (
                <p
                  className="mt-2 line-clamp-2 whitespace-pre-wrap rounded bg-white px-2.5 py-2 text-xs text-neutral-700"
                  title={r.answer}
                >
                  {r.answer}
                </p>
              ) : (
                <p className="mt-2 text-[11px] text-neutral-400">{EMPTY_ANSWER_TEXT[r.status] ?? "답변 없음"}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}