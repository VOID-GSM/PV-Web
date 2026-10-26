import { useState } from "react";
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

  // 기간을 골랐을 때 시작 날짜를 계산해 둔다
  // (이벤트 처리 함수라 new Date()를 써도 lint에 걸리지 않는다)
  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    const now = new Date();
    if (value === "이번 주") {
      // 오늘 포함 최근 7일
      const start = new Date(now);
      start.setDate(now.getDate() - 6);
      setPeriodStart(formatDate(start));
    } else if (value === "이번 달") {
      // 이번 달 1일
      setPeriodStart(formatDate(new Date(now.getFullYear(), now.getMonth(), 1)));
    } else {
      setPeriodStart("");
    }
  };

  // 작성 창에서 일지를 올렸을 때
  const handleAddWorklog = (data: NewWorklog) => {
    const now = new Date();
    const newWorklog: Worklog = {
      // 겹치지 않는 번호로 지금 시각(밀리초)을 쓴다
      id: now.getTime(),
      author: ME,
      // 날짜를 안 골랐으면 오늘
      date: data.date || formatDate(now),
      // "22:10" 모양
      time: now.toTimeString().slice(0, 5),
      boards: data.boards,
      isPublic: data.isPublic,
      contents: data.contents,
      comments: [],
    };
    // 새 일지를 맨 앞에
    setWorklogs([newWorklog, ...worklogs]);
  };

  // 댓글을 달았을 때: 그 일지의 댓글 목록 끝에 추가
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

  // 탭·보드·기간 필터를 적용한 목록
  const visibleWorklogs = readableWorklogs.filter((w) => {
    if (activeTab === "내 일지" && w.author !== ME) return false;
    if (board !== "" && board !== "전체" && !w.boards.includes(board)) return false;
    // "2026-10-20" 같은 글자는 크기 비교가 날짜 순서와 같다
    if (periodStart !== "" && w.date < periodStart) return false;
    return true;
  });

  // 보드별 모아보기용: 보드마다 해당 일지 묶기 (일지가 있는 보드만)
  const groupedByBoard = BOARDS.map((b) => ({
    ...b,
    items: visibleWorklogs.filter((w) => w.boards.includes(b.name)),
  })).filter((group) => group.items.length > 0);

  // 빈 화면 안내 문구 (일지가 아예 없을 때 / 필터에 걸려서 없을 때)
  const emptyMessage =
    readableWorklogs.length === 0
      ? "아직 작성된 일지가 없습니다. 오른쪽에서 오늘의 일지를 써보세요."
      : "조건에 맞는 일지가 없습니다";

  return (
    <div className="min-h-screen bg-neutral-100 p-6">
      {/* 위쪽: 탭 + 필터 */}
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

      {/* 아래: 좁은 화면은 세로, lg(1024px) 이상은 가로 */}
      <div className="flex flex-col gap-4 lg:flex-row">
        {/* 왼쪽: 일지 목록 */}
        {/* min-w-0: 긴 글이 있어도 칸이 넘치지 않게 */}
        <main className="flex min-w-0 flex-1 flex-col gap-4">
          {activeTab === "보드별 모아보기" ? (
            groupedByBoard.length === 0 ? (
              <p className="rounded-lg border border-dashed bg-white py-12 text-center text-sm text-neutral-400">
                보드 태그가 달린 일지가 없습니다
              </p>
            ) : (
              groupedByBoard.map((group) => (
                <section key={group.name} className="flex flex-col gap-3">
                  {/* 보드 이름 + 개수 */}
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <span className={`h-2 w-2 rounded-full ${group.dotColor}`} />
                    {group.name}
                    <span className="text-xs font-normal text-neutral-400">{group.items.length}개</span>
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
  );
}