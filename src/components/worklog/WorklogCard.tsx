import { useState } from "react";
import { BOARDS, ME, type Worklog } from "../../constants/worklog";

// 항목마다 아이콘·글자색·배경색 (막힌 점만 노란 배경)
const SECTION_STYLES: Record<string, { icon: string; color: string; bg: string }> = {
  "오늘 한 일": { icon: "✓", color: "text-green-600", bg: "bg-neutral-50" },
  "내일 할 일": { icon: "→", color: "text-blue-600", bg: "bg-neutral-50" },
  "막힌 점": { icon: "⚠", color: "text-amber-600", bg: "bg-amber-50" },
  "자유 형식": { icon: "✎", color: "text-neutral-600", bg: "bg-neutral-50" },
};

// 카드 안에서 항목이 보이는 순서 (쓴 순서와 상관없이 항상 이 순서)
const SECTION_ORDER = ["오늘 한 일", "내일 할 일", "막힌 점", "자유 형식"];

type WorklogCardProps = {
  worklog: Worklog;
  // 댓글을 달았을 때 페이지에 알리는 함수 (어느 일지인지 + 내용)
  onAddComment: (worklogId: number, content: string) => void;
};

export default function WorklogCard({ worklog, onAddComment }: WorklogCardProps) {
  // 댓글 입력칸의 글자
  const [commentText, setCommentText] = useState("");

  // 내용이 있는 항목만 순서대로 골라낸다
  const sections = SECTION_ORDER.filter((title) => worklog.contents[title]);

  // 댓글 등록
  const handleSubmitComment = () => {
    // 띄어쓰기만 있으면 등록하지 않는다
    if (commentText.trim() === "") return;
    onAddComment(worklog.id, commentText.trim());
    // 입력칸 비우기
    setCommentText("");
  };

  return (
    <article className="rounded-lg bg-white p-5">
      {/* ===== 머리: 작성자 · 날짜 · 보드 태그 · 공개 여부 ===== */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* 아바타: 이름 첫 글자. 내 글은 검은 원 */}
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm ${
              worklog.author === ME ? "bg-black text-white" : "bg-neutral-200"
            }`}
          >
            {worklog.author.charAt(0)}
          </div>
          <div>
            <p className="text-sm">
              <span className="font-semibold">{worklog.author}</span>
              <span className="ml-2 text-xs text-neutral-400">
                {worklog.date} · {worklog.time}
              </span>
            </p>
            {/* 보드 태그들 */}
            <div className="mt-1 flex flex-wrap gap-1">
              {worklog.boards.map((boardName) => {
                // 보드 이름으로 색 정보를 찾는다
                const board = BOARDS.find((b) => b.name === boardName);
                return (
                  <span
                    key={boardName}
                    className="flex items-center gap-1 rounded bg-neutral-100 px-2 py-0.5 text-[11px]"
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${board?.dotColor ?? "bg-neutral-400"}`} />
                    {boardName}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* 공개 / 비공개 배지 */}
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] ${
            worklog.isPublic ? "bg-green-50 text-green-700" : "border text-neutral-500"
          }`}
        >
          {worklog.isPublic ? "공개" : "비공개"}
        </span>
      </div>

      {/* ===== 몸통: 항목 칸들 ===== */}
      {/* 좁은 화면: 1칸 / 넓은 화면: 칸 개수에 맞춰 자동으로 나란히 */}
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
        {sections.map((title) => {
          const style = SECTION_STYLES[title];
          return (
            <div key={title} className={`rounded p-3 ${style.bg}`}>
              <p className={`text-xs font-semibold ${style.color}`}>
                {style.icon} {title}
              </p>
              {/* whitespace-pre-wrap: 입력할 때 친 줄바꿈을 그대로 보여준다 */}
              <p className="mt-1 whitespace-pre-wrap text-sm">{worklog.contents[title]}</p>
            </div>
          );
        })}
      </div>

      {/* ===== 댓글: 공개 글에만 ===== */}
      {worklog.isPublic ? (
        <div className="mt-4 border-t pt-3">
          {/* 달린 댓글 목록 */}
          {worklog.comments.length > 0 && (
            <ul className="mb-3 flex flex-col gap-2">
              {worklog.comments.map((comment) => (
                <li key={comment.id} className="flex items-start gap-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-[10px]">
                    {comment.author.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[11px] text-neutral-400">{comment.author} · 댓글</p>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* 댓글 입력칸 + 등록 버튼 */}
          <div className="flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              // Enter로도 등록. isComposing: 한글 조합 중일 때는 무시 (두 번 등록되는 것 방지)
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                  handleSubmitComment();
                }
              }}
              placeholder="막힌 점에 도움이 될 댓글을 남겨보세요"
              className="min-w-0 flex-1 rounded border px-3 py-2 text-sm"
            />
            <button
              onClick={handleSubmitComment}
              disabled={commentText.trim() === ""}
              className="shrink-0 rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-40"
            >
              등록
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-4 border-t pt-3 text-xs text-neutral-400">
          비공개 일지는 본인만 볼 수 있고 댓글을 받을 수 없습니다
        </p>
      )}
    </article>
  );
}