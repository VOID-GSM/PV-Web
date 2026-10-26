import { useState } from "react";
// ★ 친구가 만든 공통 헤더. "export const Header"로 내보내서 중괄호 { }로 가져온다
import { Header } from "../components/layout/Header";
import WorklogFilterBar from "../components/worklog/WorklogFilterBar";
import WorklogCard from "../components/worklog/WorklogCard";
import WorklogQuickWrite from "../components/worklog/WorklogQuickWrite";
import BoardProgressCard from "../components/worklog/BoardProgressCard";
import { BOARDS, ME, type NewWorklog, type Worklog } from "../constants/worklog";

// Date를 "2026-10-26" 모양으로
const formatDate = (d: Date) => d.toLocaleDateString("sv-SE");

export default function WorklogPage() {
  // 일지 목록. 처음엔 비어 있고, 작성하면 맨 앞에 추가된다 (최신순)
  const [worklogs, setWorklogs] = useState<Worklog[]>([]);
  // 탭·필터 값
  const [activeTab, setActiveTab] = useState("팀 전체");
  const [board, setBoard] = useState("");
  const [period, setPeriod] = useState("");
  // 기간 필터의 시작 날짜 ("" 이면 제한 없음)
  const [periodStart, setPeriodStart] = useState("");

  // 기간을 골랐을 때 시작 날짜를 계산해 둔다 (이벤트 처리 함수라 new Date() 사용 가능)
  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    const now = new Date();
    if (value === "이번 주") {
      const start = new Date(now);
      start.setDate(now.getDate() - 6);
      setPeriodStart(formatDate(start));
    } else if (value === "이번 달") {
      setPeriodStart(formatDate(new Date(now.getFullYear(), now.getMonth(), 1)));
    } else {
      setPeriodStart("");
    }
  };

  // 작성 창에서 일지를 올렸을 때
  const handleAddWorklog = (data: NewWorklog) => {
    const now = new Date();
    const newWorklog: Worklog = {
      id: now.getTime(),
      author: ME,
      date: data.date || formatDate(now),
      time: now.toTimeString().slice(0, 5),
      boards: data.boards,
      isPublic: data.isPublic,
      contents: data.contents,
      comments: [],
    };
    setWorklogs([newWorklog, ...worklogs]);
  };

  // 댓글을 달았을 때
  const handleAddComment = (worklogId: number, content: string) => {
    setWorklogs(
      worklogs.map((w) =>
        w.id === worklogId
          ? { ...w, comments: [...w.comments, { id: Date.now(), author: ME, content }] }
          : w
      )
    );
  };

  // 내가 볼 수 있는 일지: 공개 글 + 내가 쓴 비공개 글
  const readableWorklogs = worklogs.filter((w) => w.isPublic || w.author === ME);

  // 탭·보드·기간 필터 적용
  const visibleWorklogs = readableWorklogs.filter((w) => {
    if (activeTab === "내 일지" && w.author !== ME) return false;
    if (board !== "" && board !== "전체" && !w.boards.includes(board)) return false;
    if (periodStart !== "" && w.date < periodStart) return false;
    return true;
  });

  // 보드별 모아보기용 묶음
  const groupedByBoard = BOARDS.map((b) => ({
    ...b,
    items: visibleWorklogs.filter((w) => w.boards.includes(b.name)),
  })).filter((group) => group.items.length > 0);

  const emptyMessage =
    readableWorklogs.length === 0
      ? "아직 작성된 일지가 없습니다. 오른쪽에서 오늘의 일지를 써보세요."
      : "조건에 맞는 일지가 없습니다";

  return (
    // ★ 헤더(위) + 본문(아래)을 세로로 쌓는다
    // min-h-full: 화면 높이를 다 채운다 (배경은 App.tsx의 #f7f7f8을 그대로 쓴다)
    <div className="flex min-h-full flex-col">
      {/* ★ 공통 헤더 */}
      <Header
        title="업무일지"
        subtitle="자율 작성 · 작성 알림 없음 · 공개/비공개를 글마다 선택"
      />

      {/* 본문 */}
      <div className="p-6">
        {/* 탭 + 필터 */}
        <div className="mb-4">
          <WorklogFilterBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            board={board}
            onBoardChange={setBoard}
            period={period}
            onPeriodChange={handlePeriodChange}
          />
        </div>

        {/* 좁은 화면은 세로, lg(1024px) 이상은 가로 */}
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* 왼쪽: 일지 목록 */}
          <main className="flex min-w-0 flex-1 flex-col gap-4">
            {activeTab === "보드별 모아보기" ? (
              groupedByBoard.length === 0 ? (
                <p className="rounded-lg border border-dashed bg-white py-12 text-center text-sm text-neutral-400">
                  보드 태그가 달린 일지가 없습니다
                </p>
              ) : (
                groupedByBoard.map((group) => (
                  <section key={group.name} className="flex flex-col gap-3">
                    <h3 className="flex items-center gap-2 text-sm font-semibold">
                      <span className={`h-2 w-2 rounded-full ${group.dotColor}`} />
                      {group.name}
                      <span className="text-xs font-normal text-neutral-400">
                        {group.items.length}개
                      </span>
                    </h3>
                    {group.items.map((w) => (
                      <WorklogCard key={w.id} worklog={w} onAddComment={handleAddComment} />
                    ))}
                  </section>
                ))
              )
            ) : visibleWorklogs.length === 0 ? (
              <p className="rounded-lg border border-dashed bg-white py-12 text-center text-sm text-neutral-400">
                {emptyMessage}
              </p>
            ) : (
              visibleWorklogs.map((w) => (
                <WorklogCard key={w.id} worklog={w} onAddComment={handleAddComment} />
              ))
            )}
          </main>

          {/* 오른쪽: 작성 카드 + 보드별 진행 기록 */}
          <aside className="flex w-full flex-col gap-4 self-start lg:w-80">
            <WorklogQuickWrite onSubmit={handleAddWorklog} />
            <BoardProgressCard worklogs={readableWorklogs} />
          </aside>
        </div>
      </div>
    </div>
  );
}