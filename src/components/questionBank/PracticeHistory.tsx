import { STATUS_BADGE, formatDuration, type PracticeRecord } from "../../constants/questionBank";

type PracticeHistoryProps = {
  records: PracticeRecord[];
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
            <li key={r.id} className="flex items-center justify-between gap-2 rounded bg-neutral-50 px-3 py-2.5">
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
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}