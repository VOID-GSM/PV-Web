import { useCallback, useState } from "react";
import { Header } from "../components/layout/Header";
import Toast from "../components/common/Toast";
import WorklogFilterBar from "../components/worklog/WorklogFilterBar";
import WorklogCard from "../components/worklog/WorklogCard";
import WorklogQuickWrite from "../components/worklog/WorklogQuickWrite";
import BoardProgressCard from "../components/worklog/BoardProgressCard";
import { BOARDS, type NewWorklog, type Worklog } from "../constants/worklog";
// ★ 서버 연동
import {
  useBoards,
  useCreateWorklog,
  useCreateWorklogComment,
  useWorklogComments,
  useWorklogs,
} from "../hooks/useWorklogs";
import type { Worklog as ServerWorklog } from "../apis/worklogs";
import type { Board as ServerBoard } from "../apis/boards";
import { getErrorMessage } from "../apis/client";
import { tokenStorage } from "../apis/tokenStorage";

// Date를 "2026-10-26" 모양으로 (한국 시간 기준)
const formatDate = (d: Date) => d.toLocaleDateString("sv-SE");

// ─────────────────────────────────────────────
// ★ 항목(오늘 한 일 등) ↔ 서버 글 하나 바꾸기
// ─────────────────────────────────────────────

// 화면 항목들 → 서버에 보낼 글
// { "오늘 한 일": "A", "막힌 점": "B" } → "## 오늘 한 일\nA\n\n## 막힌 점\nB"
function toServerContent(contents: Record<string, string>): string {
  return Object.entries(contents)
    .filter(([, text]) => text.trim() !== "")
    .map(([title, text]) => `## ${title}\n${text.trim()}`)
    .join("\n\n");
}

// 서버 글 → 화면 항목들 (위와 반대)
// "## 제목" 줄이 없는 글은 통째로 "자유 형식"에 넣는다
function toContents(content: string): Record<string, string> {
  // split에 ( )가 있으면 나눈 기준(제목)도 결과에 들어간다
  // → ["앞부분", "오늘 한 일", "A", "막힌 점", "B"]
  const parts = content.split(/^## (.+)$/m);
  if (parts.length === 1) return { "자유 형식": content };

  const result: Record<string, string> = {};
  if (parts[0].trim() !== "") result["자유 형식"] = parts[0].trim();
  // 1번부터 두 칸씩: [제목, 내용]
  for (let i = 1; i < parts.length; i += 2) {
    result[parts[i].trim()] = (parts[i + 1] ?? "").trim();
  }
  return result;
}

// 서버 일지 → 화면 일지
function toPageWorklog(w: ServerWorklog, boards: ServerBoard[]): Worklog {
  const created = new Date(w.createdAt);
  // 보드 번호 → 보드 이름 (못 찾으면 태그 없음)
  const boardName = boards.find((b) => b.id === w.boardId)?.name;
  return {
    id: w.id,
    author: w.authorName,
    date: formatDate(created),
    time: created.toTimeString().slice(0, 5),
    boards: boardName ? [boardName] : [],
    isPublic: w.visibility === "PUBLIC",
    contents: toContents(w.content),
    // 댓글은 카드마다 따로 불러온다 (아래 WorklogCardWithComments)
    comments: [],
  };
}

// ─────────────────────────────────────────────
// ★ 댓글을 서버에서 불러와서 카드에 붙여주는 부품
// 훅은 반복문 안에서 못 쓰니까, 카드 하나마다 이 부품이 각자 불러온다
// (컴포넌트 바깥에 만들어서 매번 새로 만들어지지 않게)
// ─────────────────────────────────────────────
type WorklogCardWithCommentsProps = {
  worklog: Worklog;
  // 회원 번호 → 이름 (댓글은 서버가 이름을 안 주고 번호만 줘서)
  names: Map<number, string>;
  myId: number | null;
  onError: (message: string) => void;
};

function WorklogCardWithComments({ worklog, names, myId, onError }: WorklogCardWithCommentsProps) {
  // 비공개 글은 댓글을 받을 수 없으니 요청하지 않는다
  const commentsQuery = useWorklogComments(worklog.isPublic ? worklog.id : null);
  const createComment = useCreateWorklogComment();

  const comments = (commentsQuery.data ?? []).map((c) => ({
    id: c.id,
    // 이름을 못 찾으면: 나면 "나", 아니면 "팀원"
    author: names.get(c.authorId) ?? (c.authorId === myId ? "나" : "팀원"),
    content: c.content,
  }));

  const handleAddComment = (worklogId: number, content: string) => {
    createComment.mutate(
      { worklogId, content },
      { onError: (error) => onError(getErrorMessage(error)) }
    );
  };

  return <WorklogCard worklog={{ ...worklog, comments }} onAddComment={handleAddComment} />;
}

// 빈 목록 안내 상자. 제목, 설명, (있으면) 필터 초기화 버튼
type EmptyStateProps = {
  title: string;
  description: string;
  onReset?: () => void;
};

function EmptyState({ title, description, onReset }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed bg-white py-12 text-center">
      <p className="text-sm font-medium text-neutral-600">{title}</p>
      <p className="mt-1 text-xs text-neutral-400">{description}</p>
      {onReset && (
        <button onClick={onReset} className="mt-4 rounded border px-3 py-1.5 text-xs text-neutral-600">
          필터 초기화
        </button>
      )}
    </div>
  );
}

type ToastState = { id: number; message: string; type: "success" | "info" };

export default function WorklogPage() {
  // ★ 서버 데이터
  const worklogsQuery = useWorklogs();
  const boardsQuery = useBoards();
  const createWorklog = useCreateWorklog();
  const myId = tokenStorage.getMemberId();

  // 화면 상태
  const [activeTab, setActiveTab] = useState("팀 전체");
  const [board, setBoard] = useState("");
  const [period, setPeriod] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (message: string, type: "success" | "info" = "info") => {
    setToast((prev) => ({ id: (prev?.id ?? 0) + 1, message, type }));
  };
  const closeToast = useCallback(() => setToast(null), []);

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

  // 탭·보드·기간을 처음 상태로 되돌린다
  const handleResetFilters = () => {
    setActiveTab("팀 전체");
    setBoard("");
    setPeriod("");
    setPeriodStart("");
  };

  // ★ 서버 일지 → 화면 일지 (최신 글이 위로)
  const serverWorklogs = [...(worklogsQuery.data?.content ?? [])].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
  const boards = boardsQuery.data ?? [];
  const worklogs = serverWorklogs.map((w) => toPageWorklog(w, boards));

  // ★ 내가 쓴 일지 번호들 ("내 일지" 탭에 사용)
  const myWorklogIds = new Set(serverWorklogs.filter((w) => w.authorId === myId).map((w) => w.id));

  // ★ 회원 번호 → 이름 (댓글 작성자 이름 찾기용)
  const names = new Map(serverWorklogs.map((w) => [w.authorId, w.authorName]));

  // ★ 작성 → 서버에 저장
  const handleAddWorklog = (data: NewWorklog) => {
    const content = toServerContent(data.contents);
    if (content === "") {
      showToast("항목을 하나 이상 입력해 주세요");
      return;
    }
    createWorklog.mutate(
      {
        // 서버는 제목이 필수라서 날짜로 자동으로 만든다
        title: `${formatDate(new Date())} 업무일지`,
        content,
        visibility: data.isPublic ? "PUBLIC" : "PRIVATE",
        // 보드 태그는 보드 목록 연결 후 지원 (지금은 보내지 않는다)
      },
      {
        onSuccess: () => showToast("일지를 올렸습니다", "success"),
        onError: (error) => showToast(getErrorMessage(error)),
      }
    );
  };

  // 서버가 비공개 글은 "내 것만" 보내주니까, 받은 글은 전부 볼 수 있는 글이다
  const readableWorklogs = worklogs;

  const visibleWorklogs = readableWorklogs.filter((w) => {
    if (activeTab === "내 일지" && !myWorklogIds.has(w.id)) return false;
    if (board !== "" && board !== "전체" && !w.boards.includes(board)) return false;
    if (periodStart !== "" && w.date < periodStart) return false;
    return true;
  });

  const groupedByBoard = BOARDS.map((b) => ({
    ...b,
    items: visibleWorklogs.filter((w) => w.boards.includes(b.name)),
  })).filter((group) => group.items.length > 0);

  // 필터를 하나라도 바꿨는지
  const isFiltered =
    activeTab !== "팀 전체" || (board !== "" && board !== "전체") || (period !== "" && period !== "전체");
  const resetIfFiltered = isFiltered ? handleResetFilters : undefined;

  // 카드 하나 그리기 (댓글 포함)
  const renderCard = (w: Worklog) => (
    <WorklogCardWithComments key={w.id} worklog={w} names={names} myId={myId} onError={showToast} />
  );

  // 왼쪽 목록에 무엇을 보여줄지
  const renderList = () => {
    // ★ 불러오는 중 / 실패
    if (worklogsQuery.isPending) {
      return <p className="rounded-lg bg-white py-12 text-center text-sm text-neutral-400">일지를 불러오는 중...</p>;
    }
    if (worklogsQuery.isError) {
      return (
        <p className="rounded-lg bg-white py-12 text-center text-sm text-red-500">
          {getErrorMessage(worklogsQuery.error)}
        </p>
      );
    }

    // 1) 일지가 아예 없음
    if (readableWorklogs.length === 0) {
      return (
        <EmptyState
          title="아직 작성된 일지가 없습니다"
          description="오른쪽 '오늘의 일지 쓰기'에서 첫 일지를 남겨보세요"
          onReset={resetIfFiltered}
        />
      );
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
          {group.items.map(renderCard)}
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
    return visibleWorklogs.map(renderCard);
  };

  return (
    <div className="flex min-h-full flex-col">
      <Header title="업무일지" subtitle="자율 작성 · 작성 알림 없음 · 공개/비공개를 글마다 선택" />

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

      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={closeToast} />}
    </div>
  );
}