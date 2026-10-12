// 업무일지 페이지에서 쓸 카드를 가져온다
import WorklogQuickWrite from "../components/worklog/WorklogQuickWrite";
export default function WorklogPage() {
  return (
    // 페이지 전체 배경 (연한 회색)
    <div className="min-h-screen bg-neutral-100 p-6">
      {/* 위쪽: 탭과 필터 자리 */}
      <div className="mb-4 rounded-lg bg-white p-4">탭 · 필터</div>

      {/* 아래: 왼쪽 목록 + 오른쪽 카드들 */}
      <div className="flex gap-4">
        {/* 왼쪽: 일지 목록 자리 */}
        <main className="flex flex-1 flex-col gap-4">
          <section className="rounded-lg bg-white p-6">일지 목록</section>
        </main>

        {/* 오른쪽: 카드 두 개가 세로로 */}
        <aside className="flex w-80 flex-col gap-4 self-start">
          {/* ★ 여기만 바뀜: 글자 대신 카드 컴포넌트 */}
          <WorklogQuickWrite />
          <section className="rounded-lg bg-white p-6">보드별 진행 기록</section>
        </aside>
      </div>
    </div>
  );
}