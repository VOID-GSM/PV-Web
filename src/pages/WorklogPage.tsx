import { useState } from "react";
import { Header } from "../components/layout/Header";
import WorklogFilterBar from "../components/worklog/WorklogFilterBar";
import WorklogCard from "../components/worklog/WorklogCard";
import WorklogQuickWrite from "../components/worklog/WorklogQuickWrite";
import BoardProgressCard from "../components/worklog/BoardProgressCard";
import { BOARDS, ME, type NewWorklog, type Worklog } from "../constants/worklog";

// Date를 "2026-10-26" 모양으로 (한국 시간 기준)
const formatDate = (d: Date) => d.toLocaleDateString("sv-SE");

// ★ 빈 목록 안내 상자. 제목, 설명, (있으면) 필터 초기화 버튼
type EmptyStateProps = {
  title: string;
  description: string;
  // 이 함수가 넘어오면 "필터 초기화" 버튼을 보여준다
  onReset?: () => void;
};

function EmptyState({ title, description, onReset }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed bg-white py-12 text-center">
      <p className="text-sm font-medium text-neutral-600">{title}</p>
      <p className="mt-1 text-xs text-neutral-400">{description}</p>
      {onReset && (
        <button
          onClick={onReset}
          className="mt-4 rounded border px-3 py-1.5 text-xs text-neutral-600"
        >
          필터 초기화
        </button>
      )}
    </div>
  );
}

export default function WorklogPage() {
  const [worklogs, setWorklogs] = useState<Worklog[]>([]);
  const [activeTab, setActiveTab] = useState("팀 전체");
  const [board, setBoard] = useState("");
  const [period, setPeriod] = useState("");
  const [periodStart, setPeriodStart] = useState("");

  // 기간을 골랐을 때 시작 날짜를 계산해 둔다
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

  // ★ 탭·보드·기간을 처음 상태로 되돌린다
  const handleResetFilters = () => {
    setActiveTab("팀 전체");
    setBoard("");
    setPeriod("");
    setPeriodStart("");
  };

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

  const visibleWorklogs = readableWorklogs.filter((w) => {
    if (activeTab === "내 일지" && w.author !== ME) return false;
    if (board !== "" && board !== "전체" && !w.boards.includes(board)) return false;
    if (periodStart !== "" && w.date < periodStart) return false;
    return true;
  });

  const groupedByBoard = BOARDS.map((b) => ({
    ...b,
    items: visibleWorklogs.filter((w) => w.boards.includes(b.name)),
  })).filter((group) => group.items.length > 0);

  // ★ 필터를 하나라도 바꿨는지 (처음 상태가 아닌지)
  const isFiltered =
    activeTab !== "팀 전체" ||
    (board !== "" && board !== "전체") ||
    (period !== "" && period !== "전체");

  // ★ 필터를 바꿨을 때만 초기화 함수를 넘긴다 (안 바꿨으면 버튼이 안 보이게)
  const resetIfFiltered = isFiltered ? handleResetFilters : undefined;

  // ★ 일지가 하나도 없을 때의 안내 (모든 탭 공통)
  const noWorklogState = (
    <EmptyState
      title="아직 작성된 일지가 없습니다"
      description="오른쪽 '오늘의 일지 쓰기'에서 첫 일지를 남겨보세요"
      onReset={resetIfFiltered}
    />
  );

  // ★ 왼쪽 목록에 무엇을 보여줄지 정한다
  const renderList = () => {
    // 1) 일지가 아예 없음
    if (readableWorklogs.length === 0) {
      return noWorklogState;
    }

    // 2) 보드별 모아보기
    if (activeTab === "보드별 모아보기") {
      if (groupedByBoard.length === 0) {
        return (
          <EmptyState
            title="보드 태그가 달린 일지가 없습니다"
            description="일지를 쓸 때 보드 태그를 달면 보드별로 모아볼 수 있어요"
            onReset={resetIfFiltered}
          />
        );
      }
      return groupedByBoard.map((group) => (
        <section key={group.name} className="flex flex-col gap-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <span className={`h-2 w-2 rounded-full ${group.dotColor}`} />
            {group.name}
            <span className="text-xs font-normal text-neutral-400">{group.items.length}개</span>
          </h3>
          {group.items.map((w) => (
            <WorklogCard key={w.id} worklog={w} onAddComment={handleAddComment} />
          ))}
        </section>
      ));
    }

    // 3) 일지는 있는데 필터에 걸려서 없음
    if (visibleWorklogs.length === 0) {
      return (
        <EmptyState
          title="선택한 조건에 맞는 일지가 없습니다"
          description="탭이나 보드·기간 필터를 바꿔 보세요"
          onReset={handleResetFilters}
        />
      );
    }

    // 4) 일지 목록
    return visibleWorklogs.map((w) => (
      <WorklogCard key={w.id} worklog={w} onAddComment={handleAddComment} />
    ));
  };

  return (
    <div className="flex min-h-full flex-col">
      <Header
        title="업무일지"
        subtitle="자율 작성 · 작성 알림 없음 · 공개/비공개를 글마다 선택"
      />

      <div className="p-6">
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

        <div className="flex flex-col gap-4 lg:flex-row">
          {/* 왼쪽: 일지 목록 */}
          <main className="flex min-w-0 flex-1 flex-col gap-4">{renderList()}</main>

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