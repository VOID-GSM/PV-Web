import { ME, getCategoryBadge, type Answer, type Question } from "../../constants/questionBank";

type QuestionListProps = {
  questions: Question[];
  answers: Answer[];
  // 선택된 질문 번호 (null이면 선택 안 됨)
  selectedId: number | null;
  onSelect: (id: number) => void;
};

export default function QuestionList({ questions, answers, selectedId, onSelect }: QuestionListProps) {
  return (
    <section className="rounded-lg bg-white">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <p className="text-xs font-semibold text-neutral-500">질문 목록</p>
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px]">{questions.length}개</span>
      </div>

      {questions.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <p className="text-sm text-neutral-500">등록된 질문이 없습니다</p>
          <p className="mt-1 text-xs text-neutral-400">'질문 추가'로 첫 질문을 등록해 보세요</p>
        </div>
      ) : (
        <ul>
          {questions.map((q) => {
            // 이 질문에 달린 답변 수, 그중 내 답변이 있는지
            const questionAnswers = answers.filter((a) => a.questionId === q.id);
            const hasMine = questionAnswers.some((a) => a.author === ME);
            return (
              <li key={q.id} className="border-b last:border-b-0">
                <button
                  onClick={() => onSelect(q.id)}
                  // 선택된 질문은 회색 배경
                  className={`w-full px-4 py-3 text-left ${
                    selectedId === q.id ? "bg-neutral-100" : "hover:bg-neutral-50"
                  }`}
                >
                  <p className="text-sm font-medium">{q.title}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`rounded px-1.5 py-0.5 text-[11px] ${getCategoryBadge(q.category)}`}>
                      {q.category}
                    </span>
                    <span className="text-[11px] text-neutral-400">답변 {questionAnswers.length}개</span>
                    {hasMine && <span className="ml-auto text-[11px] text-green-600">내 답변 있음</span>}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}