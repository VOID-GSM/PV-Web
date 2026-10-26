import { useState } from "react";
import { KPT_FIELDS, type KptKey } from "../../constants/retrospective";

// 한 칸 최대 글자 수
const MAX_LENGTH = 1000;

type KptFormProps = {
  boardName: string;
  // 다 쓰고 제출했을 때 세 칸의 내용을 넘긴다
  onSubmit: (values: Record<KptKey, string>) => void;
};

export default function KptForm({ boardName, onSubmit }: KptFormProps) {
  // 세 칸의 내용. 처음엔 모두 비어 있음
  const [values, setValues] = useState<Record<KptKey, string>>({
    keep: "",
    problem: "",
    tryText: "",
  });

  // 한 칸에 글자를 칠 때
  const handleChange = (key: KptKey, value: string) => {
    setValues({ ...values, [key]: value });
  };

  // 아직 안 쓴 칸의 이름들 (띄어쓰기만 있으면 안 쓴 걸로 친다)
  const missing = KPT_FIELDS.filter((f) => values[f.key].trim() === "").map((f) => f.label);
  const canSubmit = missing.length === 0;

  const handleSubmit = () => {
    onSubmit({
      keep: values.keep.trim(),
      problem: values.problem.trim(),
      tryText: values.tryText.trim(),
    });
  };

  return (
    <section className="rounded-lg border-2 border-black bg-white p-5">
      <h2 className="font-bold">{boardName} 회고 작성</h2>
      <p className="mt-1 text-xs text-neutral-400">
        Keep · Problem · Try 세 칸을 모두 작성해 주세요
      </p>

      <div className="mt-4 flex flex-col gap-4">
        {KPT_FIELDS.map((field) => (
          <div key={field.key}>
            {/* 칸 제목: 색깔 배지 + 설명 */}
            <div className="flex items-center gap-2">
              <span className={`rounded px-2 py-0.5 text-xs font-bold ${field.bg} ${field.color}`}>
                {field.label}
              </span>
              <span className="text-xs text-neutral-500">{field.description}</span>
            </div>
            <textarea
              value={values[field.key]}
              onChange={(e) => handleChange(field.key, e.target.value)}
              maxLength={MAX_LENGTH}
              rows={3}
              className="mt-2 w-full resize-none rounded border px-3 py-2 text-sm"
            />
            <p className="text-right text-[11px] text-neutral-400">
              {values[field.key].length} / {MAX_LENGTH}
            </p>
          </div>
        ))}
      </div>

      {/* 바닥: 빠진 칸 안내 + 제출 버튼 */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        {canSubmit ? (
          <p className="text-xs text-neutral-400">제출한 회고는 보드 기록과 함께 보관됩니다</p>
        ) : (
          <p className="text-xs text-red-500">{missing.join(", ")}을(를) 작성해 주세요</p>
        )}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="rounded bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          회고 제출
        </button>
      </div>
    </section>
  );
}