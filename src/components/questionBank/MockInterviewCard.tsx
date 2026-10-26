import { useState } from "react";
import { ANSWER_TIME_LIMIT, CATEGORIES, formatTimer, type Question } from "../../constants/questionBank";

type MockInterviewCardProps = {
  // 뽑을 수 있는 질문들 (전공 필터가 적용된 것)
  questions: Question[];
  onStart: (categories: string[]) => void;
};

export default function MockInterviewCard({ questions, onStart }: MockInterviewCardProps) {
  // 고른 카테고리들. 처음엔 아무것도 안 고름
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (name: string) => {
    setSelected(selected.includes(name) ? selected.filter((c) => c !== name) : [...selected, name]);
  };

  // 고른 카테고리에 해당하는 질문 수
  const matchCount = questions.filter((q) => selected.includes(q.category)).length;

  // 안내 문구: 카테고리를 안 골랐을 때 / 질문이 없을 때
  const notice =
    selected.length === 0
      ? "카테고리를 하나 이상 선택하세요"
      : matchCount === 0
        ? "선택한 카테고리에 질문이 없습니다"
        : `질문 ${matchCount}개 중 무작위로 출제됩니다`;

  return (
    <section className="rounded-lg bg-black p-5 text-white">
      <h2 className="font-bold">🎙 랜덤 모의면접</h2>
      <p className="mt-1 text-xs text-neutral-400">
        전공과 카테고리를 고르면 질문을 무작위로 뽑아 타이머와 함께 연습합니다.
      </p>

      {/* 제한 시간 표시 */}
      <div className="mt-4 rounded-lg bg-neutral-900 py-5 text-center">
        <p className="text-3xl font-bold">{formatTimer(ANSWER_TIME_LIMIT)}</p>
        <p className="mt-1 text-[11px] text-neutral-400">답변 제한 시간</p>
      </div>

      {/* 카테고리 고르기 */}
      <div className="mt-3 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.name}
            onClick={() => toggle(c.name)}
            // 고른 카테고리는 흰 배경
            className={`rounded-full px-3 py-1 text-xs ${
              selected.includes(c.name) ? "bg-white text-black" : "bg-neutral-800 text-neutral-400"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <p className="mt-3 text-[11px] text-neutral-400">{notice}</p>

      <button
        onClick={() => onStart(selected)}
        disabled={matchCount === 0}
        className="mt-3 w-full rounded bg-white py-2.5 text-sm font-semibold text-black disabled:opacity-40"
      >
        ▷ 모의면접 시작
      </button>
    </section>
  );
}