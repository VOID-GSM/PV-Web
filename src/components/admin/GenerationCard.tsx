import { useState } from "react";
import Dropdown from "../common/Dropdown";
import { type Member } from "../../constants/admin";

type GenerationCardProps = {
  generations: string[];
  graduated: string[];
  // 활동 중인 팀원들
  members: Member[];
  onAddGeneration: (name: string) => void;
  onGraduate: (generation: string) => void;
  onHandover: (role: string, fromId: number, toName: string) => void;
};

export default function GenerationCard({
  generations,
  graduated,
  members,
  onAddGeneration,
  onGraduate,
  onHandover,
}: GenerationCardProps) {
  const [newGeneration, setNewGeneration] = useState("");
  const [graduateTarget, setGraduateTarget] = useState("");
  // 역할별로 넘겨받을 사람 ("부장" → "김지유")
  const [handoverTargets, setHandoverTargets] = useState<Record<string, string>>({});

  // 지금 누가 어떤 역할을 갖고 있는지 (역할 하나당 한 줄)
  const roleRows = members.flatMap((m) => m.roles.map((role) => ({ role, holder: m })));

  // 아직 졸업 안 한 기수만 졸업 처리 대상
  const activeGenerations = generations.filter((g) => !graduated.includes(g));

  // "11" 이나 "11기" 모두 "11기"로 맞춘다
  const normalized = newGeneration.trim().replace(/기$/, "") + "기";
  const canAdd = /^\d+$/.test(newGeneration.trim().replace(/기$/, "")) && !generations.includes(normalized);

  const handleAdd = () => {
    onAddGeneration(normalized);
    setNewGeneration("");
  };

  const handleGraduate = () => {
    onGraduate(graduateTarget);
    setGraduateTarget("");
  };

  return (
    <section className="rounded-lg bg-white p-5">
      <h2 className="font-bold">기수 전환 · 인수인계</h2>
      <p className="mt-1 text-xs text-neutral-500">
        기수를 졸업 처리하면 정리글·과제·답변이 아카이브되고, 새 기수를 추가하면 기존 기수가 선배 기수가 됩니다.
      </p>

      {/* 기수 목록 + 추가 */}
      <p className="mt-4 text-xs font-medium">기수 목록</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {generations.map((g) => (
          <span
            key={g}
            className={`rounded-full px-2.5 py-1 text-xs ${
              graduated.includes(g) ? "bg-neutral-100 text-neutral-400 line-through" : "border"
            }`}
          >
            {g}
            {graduated.includes(g) && " (졸업)"}
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={newGeneration}
          onChange={(e) => setNewGeneration(e.target.value)}
          placeholder="예) 11기"
          className="min-w-0 flex-1 rounded border px-3 py-1.5 text-sm"
        />
        <button onClick={handleAdd} disabled={!canAdd} className="rounded border px-3 py-1.5 text-xs disabled:opacity-40">
          기수 추가
        </button>
      </div>

      {/* 졸업 처리 */}
      <p className="mt-4 text-xs font-medium">기수 졸업 처리</p>
      <div className="mt-2 flex gap-2">
        <div className="min-w-0 flex-1">
          <Dropdown options={activeGenerations} value={graduateTarget} onChange={setGraduateTarget} placeholder="기수 선택" />
        </div>
        <button
          onClick={handleGraduate}
          disabled={graduateTarget === ""}
          className="rounded bg-black px-3 py-1.5 text-xs text-white disabled:opacity-40"
        >
          졸업 처리
        </button>
      </div>

      {/* 역할 인수인계 */}
      <p className="mt-4 text-xs font-medium">역할 인수인계</p>
      {roleRows.length === 0 ? (
        <p className="mt-2 rounded border border-dashed py-4 text-center text-xs text-neutral-400">
          인계할 역할이 없습니다 · 팀원 정보 수정에서 역할을 지정하세요
        </p>
      ) : (
        <ul className="mt-2 flex flex-col gap-2">
          {roleRows.map(({ role, holder }) => {
            const key = `${role}-${holder.id}`;
            // 넘겨받을 수 있는 사람: 지금 담당자를 뺀 활동 중인 팀원
            const candidates = members.filter((m) => m.id !== holder.id).map((m) => m.name);
            const target = handoverTargets[key] ?? "";
            return (
              <li key={key} className="rounded bg-neutral-50 p-3">
                <p className="text-sm font-medium">{role}</p>
                <p className="text-[11px] text-neutral-400">
                  {holder.name}({holder.generation}) → {target || "넘겨받을 사람 선택"}
                </p>
                {candidates.length === 0 ? (
                  <p className="mt-2 text-[11px] text-neutral-400">넘겨받을 팀원이 없습니다</p>
                ) : (
                  <div className="mt-2 flex gap-2">
                    <div className="min-w-0 flex-1">
                      <Dropdown
                        options={candidates}
                        value={target}
                        onChange={(name) => setHandoverTargets({ ...handoverTargets, [key]: name })}
                        placeholder="팀원 선택"
                      />
                    </div>
                    <button
                      onClick={() => onHandover(role, holder.id, target)}
                      disabled={target === ""}
                      className="rounded bg-black px-3 text-xs text-white disabled:opacity-40"
                    >
                      인계
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}