import { useState } from "react";
import { ANSWER_TIME_LIMIT, CATEGORIES, formatTimer, type Question } from "../../constants/questionBank";
import micIcon from "../../assets/icons/mic.svg";
import playIcon from "../../assets/icons/play.svg";

type MockInterviewCardProps = {
  questions: Question[];
  onStart: (categories: string[]) => void;
};

export default function MockInterviewCard({ questions, onStart }: MockInterviewCardProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (name: string) => {
    setSelected(selected.includes(name) ? selected.filter((c) => c !== name) : [...selected, name]);
  };

  const matchCount = questions.filter((q) => selected.includes(q.category)).length;

  const notice =
    selected.length === 0
      ? "카테고리를 하나 이상 선택하세요"
      : matchCount === 0
        ? "선택한 카테고리에 질문이 없습니다"
        : `질문 ${matchCount}개 중 무작위로 출제됩니다`;

  return (
    <section className="rounded-lg bg-black p-5 text-white">
      <h2 className="flex items-center gap-2 font-bold">
        {/* 검은 카드라 invert로 아이콘을 하얗게 */}
        <img src={micIcon} alt="" className="h-4 w-4 invert" />
        랜덤 모의면접
      </h2>
      <p className="mt-1 text-xs text-neutral-400">
        전공과 카테고리를 고르면 질문을 무작위로 뽑아 타이머와 함께 연습합니다.
      </p>

      <div className="mt-4 rounded-lg bg-neutral-900 py-5 text-center">
        <p className="text-3xl font-bold">{formatTimer(ANSWER_TIME_LIMIT)}</p>
        <p className="mt-1 text-[11px] text-neutral-400">답변 제한 시간</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.name}
            onClick={() => toggle(c.name)}
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
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded bg-white py-2.5 text-sm font-semibold text-black disabled:opacity-40"
      >
        <img src={playIcon} alt="" className="h-4 w-4" />
        모의면접 시작
      </button>
    </section>
  );
}