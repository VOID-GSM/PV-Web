import { useState } from "react";
import Dropdown from "../common/Dropdown";
// ☆ 역할 해제 확인 창
import ConfirmModal from "../common/ConfirmModal";
import { type Member } from "../../constants/admin";

type GenerationCardProps = {
  generations: string[];
  graduated: string[];
  // 활동 중인 팀원들
  members: Member[];
  // ☆ 줄 수 있는 역할 이름들 (예: "부장", "선배")
  roleOptions: string[];
  onAddGeneration: (name: string) => void;
  onGraduate: (generation: string) => void;
  // ☆ 고른 여러 명에게 역할 주기 (1:1 인계 대신)
  onGrantRole: (role: string, memberIds: number[]) => void;
  // ☆ 한 명에게서 역할 빼기
  onRemoveRole: (role: string, memberId: number) => void;
};

export default function GenerationCard({
  generations,
  graduated,
  members,
  roleOptions,
  onAddGeneration,
  onGraduate,
  onGrantRole,
  onRemoveRole,
}: GenerationCardProps) {
  const [newGeneration, setNewGeneration] = useState("");
  const [graduateTarget, setGraduateTarget] = useState("");
  // ☆ 줄 역할 (예: "선배")
  const [grantRole, setGrantRole] = useState("");
  // ☆ 체크한 팀원 번호들
  const [checkedIds, setCheckedIds] = useState<number[]>([]);
  // ☆ 해제 확인 창에 띄울 것 (없으면 창 닫힘)
  const [removeTarget, setRemoveTarget] = useState<{ role: string; member: Member } | null>(null);

  // 아직 졸업 안 한 기수만 졸업 처리 대상
  const activeGenerations = generations.filter((g) => !graduated.includes(g));

  // "11" 이나 "11기" 모두 "11기"로 맞춘다
  const normalized = newGeneration.trim().replace(/기$/, "") + "기";
  const canAdd = /^\d+$/.test(newGeneration.trim().replace(/기$/, "")) && !generations.includes(normalized);

  // ☆ 고른 역할을 아직 안 가진 사람만 체크 목록에 (이미 가진 사람은 위 칩에 나온다)
  const candidates = grantRole === "" ? [] : members.filter((m) => !m.roles.includes(grantRole));

  const handleAdd = () => {
    onAddGeneration(normalized);
    setNewGeneration("");
  };

  const handleGraduate = () => {
    onGraduate(graduateTarget);
    setGraduateTarget("");
  };

  // ☆ 역할을 바꾸면 체크는 비운다
  const handleRoleChange = (role: string) => {
    setGrantRole(role);
    setCheckedIds([]);
  };

  // ☆ 팀원 체크/해제
  const toggleChecked = (memberId: number) =>
    setCheckedIds((prev) => (prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]));

  // ☆ 한 번에 주기
  const handleGrant = () => {
    onGrantRole(grantRole, checkedIds);
    setCheckedIds([]);
  };

  return (
    <section className="rounded-lg bg-white p-5">
      <h2 className="font-bold">기수 전환 · 역할 관리</h2>
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

      {/* ☆ 지금 역할을 가진 사람 (역할별 이름 칩, × 로 해제) */}
      <p className="mt-4 text-xs font-medium">지금 역할</p>
      <div className="mt-2 flex flex-col gap-2">
        {roleOptions.map((role) => {
          const holders = members.filter((m) => m.roles.includes(role));
          return (
            <div key={role} className="rounded bg-neutral-50 p-3">
              <p className="text-xs font-semibold">
                {role} <span className="font-normal text-neutral-400">{holders.length}명</span>
              </p>
              {holders.length === 0 ? (
                <p className="mt-1 text-[11px] text-neutral-400">아직 없습니다</p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {holders.map((m) => (
                    <span
                      key={m.id}
                      className="flex items-center gap-1 rounded-full border bg-white px-2 py-0.5 text-[11px]"
                    >
                      {m.name}
                      <span className="text-neutral-400">({m.generation})</span>
                      <button
                        type="button"
                        onClick={() => setRemoveTarget({ role, member: m })}
                        className="ml-0.5 text-neutral-400 hover:text-red-500"
                        title={`${m.name} 님의 ${role} 권한 해제`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ☆ 역할 주기: 역할 고르기 → 여러 명 체크 → 한 번에 */}
      <p className="mt-4 text-xs font-medium">역할 주기</p>
      <div className="mt-2">
        <Dropdown options={roleOptions} value={grantRole} onChange={handleRoleChange} placeholder="줄 역할 선택" />
      </div>

      {grantRole !== "" &&
        (candidates.length === 0 ? (
          <p className="mt-2 rounded border border-dashed py-4 text-center text-xs text-neutral-400">
            모든 팀원이 이미 {grantRole} 권한을 갖고 있습니다
          </p>
        ) : (
          <>
            <ul className="mt-2 flex max-h-56 flex-col gap-1 overflow-y-auto rounded border p-2">
              {candidates.map((m) => (
                <li key={m.id}>
                  <label className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-neutral-50">
                    <input
                      type="checkbox"
                      checked={checkedIds.includes(m.id)}
                      onChange={() => toggleChecked(m.id)}
                      className="h-4 w-4 accent-black"
                    />
                    {m.name}
                    <span className="text-[11px] text-neutral-400">{m.generation}</span>
                  </label>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={handleGrant}
              disabled={checkedIds.length === 0}
              className="mt-2 w-full rounded bg-black py-2 text-xs font-semibold text-white disabled:opacity-40"
            >
              {checkedIds.length > 0
                ? `${checkedIds.length}명에게 ${grantRole} 권한 주기`
                : "권한을 줄 팀원을 체크하세요"}
            </button>
          </>
        ))}

      {/* ☆ 해제 확인 창 */}
      {removeTarget && (
        <ConfirmModal
          title={`${removeTarget.member.name} 님의 ${removeTarget.role} 권한을 해제할까요?`}
          message="해제하면 이 역할로 할 수 있던 기능을 더 이상 쓸 수 없습니다. 필요하면 다시 줄 수 있어요."
          confirmLabel="해제"
          danger
          onConfirm={() => {
            onRemoveRole(removeTarget.role, removeTarget.member.id);
            setRemoveTarget(null);
          }}
          onCancel={() => setRemoveTarget(null)}
        />
      )}
    </section>
  );
}