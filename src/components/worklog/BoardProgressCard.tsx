import { BOARDS, type Worklog } from "../../constants/worklog";

type BoardProgressCardProps = {
  // 화면에 보이는 일지들 (최신순으로 정렬돼 있다)
  worklogs: Worklog[];
};

export default function BoardProgressCard({ worklogs }: BoardProgressCardProps) {
  // 보드마다: 그 보드 태그가 달린 일지 개수와 가장 최근 일지
  const rows = BOARDS.map((board) => {
    const tagged = worklogs.filter((w) => w.boards.includes(board.name));
    return {
      ...board,
      count: tagged.length,
      // 최신순이라 맨 앞이 가장 최근
      latest: tagged[0],
    };
  })
    // 일지가 하나도 없는 보드는 빼고 보여준다
    .filter((row) => row.count > 0);

  return (
    <section className="rounded-lg bg-white p-5">
      <h2 className="font-bold">보드별 진행 기록</h2>
      <p className="mt-1 text-xs text-neutral-400">
        보드 태그가 달린 항목이 프로젝트별로 모입니다
      </p>

      {rows.length === 0 ? (
        <p className="mt-4 rounded border border-dashed py-6 text-center text-xs text-neutral-400">
          보드 태그가 달린 일지가 없습니다
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {rows.map((row) => (
            <li
              key={row.name}
              className="flex items-center justify-between gap-3 rounded bg-neutral-50 px-3 py-3"
            >
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 text-xs">
                  <span className={`h-2 w-2 rounded-full ${row.dotColor}`} />
                  {row.name}
                </span>
                <p className="mt-1 truncate text-[11px] text-neutral-400">
                  최근 기록 {row.latest.date} · {row.latest.author}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold">{row.count}개</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}