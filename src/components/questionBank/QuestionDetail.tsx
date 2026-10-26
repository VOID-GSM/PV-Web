import { ME, getCategoryBadge, type Answer, type Question } from "../../constants/questionBank";
import editIcon from "../../assets/icons/edit.svg";
import starIcon from "../../assets/icons/star.svg";

type QuestionDetailProps = {
  question: Question | null;
  answers: Answer[];
  onOpenAnswerModal: () => void;
  onToggleLike: (answerId: number) => void;
};

export default function QuestionDetail({
  question,
  answers,
  onOpenAnswerModal,
  onToggleLike,
}: QuestionDetailProps) {
  if (!question) {
    return (
      <section className="flex min-h-[400px] items-center justify-center rounded-lg bg-white">
        <p className="text-sm text-neutral-400">왼쪽에서 질문을 선택하세요</p>
      </section>
    );
  }

  const hasMine = answers.some((a) => a.author === ME);
  // 내 답변이 맨 위에 오도록 정렬
  const sorted = [...answers].sort((a, b) => Number(b.author === ME) - Number(a.author === ME));

  return (
    <section className="rounded-lg bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <span className={`rounded px-2 py-0.5 text-xs ${getCategoryBadge(question.category)}`}>
            {question.category}
          </span>
          <span className="rounded-full border px-2 py-0.5 text-xs">{question.major}</span>
          <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs">{question.week} 공통</span>
        </div>
        <button
          onClick={onOpenAnswerModal}
          className="flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs font-medium"
        >
          <img src={editIcon} alt="" className="h-3.5 w-3.5" />
          {hasMine ? "내 답변 수정" : "내 답변 작성"}
        </button>
      </div>

      <h2 className="mt-6 text-xl font-bold">{question.title}</h2>
      <p className="mt-1 text-xs text-neutral-400">
        같은 질문에 대한 팀원 {answers.length}명의 답변을 나란히 비교할 수 있습니다. 기수가 바뀌어도 그대로 남습니다.
      </p>

      <div className="mt-5 border-t pt-5">
        {sorted.length === 0 ? (
          <p className="rounded border border-dashed py-10 text-center text-xs text-neutral-400">
            아직 답변이 없습니다. 첫 답변을 남겨보세요
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {sorted.map((answer) => {
              const isMine = answer.author === ME;
              const likedByMe = answer.likedBy.includes(ME);
              return (
                <li
                  key={answer.id}
                  className={`rounded-lg p-4 ${isMine ? "border-2 border-black" : "bg-neutral-50"}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-[10px] text-white">
                      {answer.author.charAt(0)}
                    </div>
                    <p className="text-sm font-semibold">{answer.author}</p>
                    <p className="text-xs text-neutral-400">
                      {answer.generation} · {answer.date}
                    </p>
                    {isMine && <span className="ml-auto rounded-full border px-2 py-0.5 text-[11px]">내 답변</span>}
                    {/* 별 버튼: 눌렀으면 진하게, 안 눌렀으면 흐리게 */}
                    <button
                      onClick={() => onToggleLike(answer.id)}
                      className={`flex items-center gap-1 rounded px-1 text-xs ${isMine ? "" : "ml-auto"}`}
                      title={likedByMe ? "추천 취소" : "추천"}
                    >
                      <img
                        src={starIcon}
                        alt="추천"
                        className={`h-3.5 w-3.5 ${likedByMe ? "opacity-100" : "opacity-30"}`}
                      />
                      <span className={likedByMe ? "font-semibold" : "text-neutral-400"}>{answer.likedBy.length}</span>
                    </button>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{answer.content}</p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}