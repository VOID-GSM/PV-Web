import { useState } from "react";
import {
  MAX_ANSWER_LENGTH,
  ME,
  getCategoryBadge,
  type Answer,
  type Question,
} from "../../constants/questionBank";

type AnswerModalProps = {
  question: Question;
  // 이 질문의 답변 전체 (내 답변이 있으면 수정 모드)
  answers: Answer[];
  onSave: (content: string, alsoArchive: boolean) => void;
  onDelete: () => void;
  onClose: () => void;
};

export default function AnswerModal({ question, answers, onSave, onDelete, onClose }: AnswerModalProps) {
  const myAnswer = answers.find((a) => a.author === ME);
  const otherAnswers = answers.filter((a) => a.author !== ME);
  const isEdit = myAnswer !== undefined;

  // 입력칸: 수정이면 기존 답변, 처음이면 빈 칸
  const [content, setContent] = useState(myAnswer?.content ?? "");
  // 정리글 아카이브에도 올릴지. 처음엔 꺼짐
  const [alsoArchive, setAlsoArchive] = useState(false);
  // 펼쳐 본 다른 팀원 답변 번호들
  const [openIds, setOpenIds] = useState<number[]>([]);

  const toggleOpen = (id: number) => {
    setOpenIds(openIds.includes(id) ? openIds.filter((x) => x !== id) : [...openIds, id]);
  };

  const canSave = content.trim() !== "";

  const handleSave = () => {
    onSave(content.trim(), alsoArchive);
    onClose();
  };

  const handleDelete = () => {
    if (!window.confirm("내 답변을 삭제할까요?")) return;
    onDelete();
    onClose();
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        onClick={(e) => e.stopPropagation()}
        className="scrollbar-hide max-h-[90vh] w-full max-w-[520px] overflow-y-auto rounded-xl bg-white"
      >
        {/* 머리 */}
        <div className="flex items-start justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-lg font-bold">{isEdit ? "답변 수정" : "답변 작성"}</h2>
            <p className="mt-1 text-xs text-neutral-400">저장하면 질문 페이지의 답변 모음집에 바로 반영됩니다</p>
          </div>
          <button onClick={onClose} className="text-xl text-neutral-400">
            ×
          </button>
        </div>

        <div className="flex flex-col gap-5 px-6 py-5">
          {/* 질문 정보 */}
          <div className="rounded-lg bg-neutral-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                <span className={`rounded px-2 py-0.5 text-[11px] ${getCategoryBadge(question.category)}`}>
                  {question.category}
                </span>
                <span className="rounded-full border bg-white px-2 py-0.5 text-[11px]">{question.major}</span>
                <span className="rounded bg-neutral-200 px-2 py-0.5 text-[11px]">{question.week} 공통</span>
              </div>
              <span className="text-[11px] text-neutral-400">답변 {answers.length}개</span>
            </div>
            <p className="mt-3 font-bold">{question.title}</p>
          </div>

          {/* 내 답변 */}
          <div>
            <p className="text-xs font-medium">내 답변</p>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={MAX_ANSWER_LENGTH}
              rows={6}
              className="mt-1 w-full resize-none rounded border px-3 py-2 text-sm"
            />
            <div className="flex justify-between text-[11px] text-neutral-400">
              <span>말하듯이 쓰면 모의면접에서 그대로 쓸 수 있습니다</span>
              <span>
                {content.length} / {MAX_ANSWER_LENGTH}
              </span>
            </div>
          </div>

          {/* 공개 안내 */}
          <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
            <p className="text-sm font-semibold text-blue-700">⚠ 이 답변은 팀 전체에 공개됩니다</p>
            <p className="mt-1 text-xs text-neutral-600">
              같은 질문에 답한 다른 팀원 글과 나란히 비교되고, 기수가 바뀌어도 아카이브에 남습니다.
            </p>
          </div>

          {/* 다른 팀원 답변 참고 */}
          <div>
            <div className="flex justify-between">
              <p className="text-xs font-medium">다른 팀원 답변 참고</p>
              <p className="text-[11px] text-neutral-400">작성 중에는 접어둘 수 있습니다</p>
            </div>
            {otherAnswers.length === 0 ? (
              <p className="mt-2 rounded border border-dashed py-4 text-center text-xs text-neutral-400">
                아직 다른 팀원의 답변이 없습니다
              </p>
            ) : (
              <ul className="mt-2 flex flex-col gap-2">
                {otherAnswers.map((a) => {
                  const isOpen = openIds.includes(a.id);
                  return (
                    <li key={a.id} className="rounded bg-neutral-50 px-3 py-2">
                      <button onClick={() => toggleOpen(a.id)} className="flex w-full items-start gap-2 text-left">
                        <span className="min-w-0 flex-1">
                          <span className="block text-[11px] text-neutral-400">
                            {a.author} · {a.generation}
                          </span>
                          {/* 접혀 있으면 한 줄로 자르기(truncate) */}
                          <span className={`block text-xs ${isOpen ? "whitespace-pre-wrap" : "truncate"}`}>
                            {a.content}
                          </span>
                        </span>
                        <span className="text-xs text-neutral-400">{isOpen ? "▲" : "▼"}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* 정리글 아카이브 체크 */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={alsoArchive}
              onChange={() => setAlsoArchive(!alsoArchive)}
              className="h-4 w-4 accent-black"
            />
            이 답변을 정리글 아카이브에도 함께 올리기
          </label>
        </div>

        {/* 바닥 */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4">
          <p className="text-[11px] text-neutral-400">수정 기록이 남고, 피드백을 받은 답변은 알림이 갑니다</p>
          <div className="flex shrink-0 gap-2">
            {/* 수정일 때만 삭제 버튼 */}
            {isEdit && (
              <button onClick={handleDelete} className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white">
                답변 삭제
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="rounded bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              저장하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}