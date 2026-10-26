import { KPT_FIELDS, type Retrospective } from "../../constants/retrospective";

type RetroArchiveProps = {
  // 선택한 보드에 작성된 회고들
  retros: Retrospective[];
};

export default function RetroArchive({ retros }: RetroArchiveProps) {
  return (
    <section className="rounded-lg bg-white p-5">
      <h2 className="font-bold">회고 아카이브</h2>
      <p className="mt-1 text-xs text-neutral-400">참여자별 회고가 보드 기록과 함께 보관됩니다</p>

      {retros.length === 0 ? (
        <p className="mt-4 rounded border border-dashed py-8 text-center text-xs text-neutral-400">
          아직 작성된 회고가 없습니다
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {retros.map((retro) => (
            <li key={retro.id} className="rounded-lg border border-neutral-100 p-4">
              {/* 작성자 · 날짜 */}
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-xs text-white">
                  {retro.author.charAt(0)}
                </div>
                <p className="text-sm font-semibold">{retro.author}</p>
                <p className="text-xs text-neutral-400">{retro.date}</p>
              </div>

              {/* Keep / Problem / Try: 좁은 화면은 세로, 넓으면 3칸 */}
              <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
                {KPT_FIELDS.map((field) => (
                  <div key={field.key} className={`rounded p-3 ${field.bg}`}>
                    <p className={`text-xs font-bold ${field.color}`}>{field.label}</p>
                    {/* whitespace-pre-wrap: 줄바꿈을 그대로 보여준다 */}
                    <p className="mt-1 whitespace-pre-wrap text-sm">{retro[field.key]}</p>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}