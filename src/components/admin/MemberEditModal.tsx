import { useState } from "react";
import Dropdown from "../common/Dropdown";
import { MAJORS, ROLE_OPTIONS, type Member } from "../../constants/admin";

type MemberEditModalProps = {
  member: Member;
  generations: string[];
  onSave: (member: Member) => void;
  onClose: () => void;
};

export default function MemberEditModal({ member, generations, onSave, onClose }: MemberEditModalProps) {
  // 지금 정보로 시작
  const [generation, setGeneration] = useState(member.generation);
  const [majors, setMajors] = useState<string[]>(member.majors);
  const [roles, setRoles] = useState<string[]>(member.roles);

  const toggleIn = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const canSave = generation !== "" && majors.length > 0;

  const handleSave = () => {
    onSave({ ...member, generation, majors, roles });
    onClose();
  };

  const chip = (on: boolean) =>
    `rounded-full border px-3 py-1.5 text-xs ${on ? "border-black font-semibold" : "border-neutral-200 text-neutral-500"}`;

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[460px] rounded-xl bg-white">
        <div className="flex items-start justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-lg font-bold">{member.name} 정보 수정</h2>
            <p className="mt-1 text-xs text-neutral-400">기수 · 전공 · 역할을 바꿀 수 있습니다. 한 사람이 여러 역할을 가질 수 있어요</p>
          </div>
          <button onClick={onClose} className="text-xl text-neutral-400">
            ×
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          <div>
            <p className="text-xs font-medium">기수</p>
            <div className="mt-1">
              <Dropdown options={generations} value={generation} onChange={setGeneration} />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium">전공 (복수 선택)</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {MAJORS.map((mj) => (
                <button key={mj} onClick={() => setMajors(toggleIn(majors, mj))} className={chip(majors.includes(mj))}>
                  {mj}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium">역할 (복수 선택 · 선택 안 하면 팀원)</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {ROLE_OPTIONS.map((r) => (
                <button key={r} onClick={() => setRoles(toggleIn(roles, r))} className={chip(roles.includes(r))}>
                  {roles.includes(r) && "✓ "}
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t px-6 py-4">
          {canSave ? (
            <p className="text-xs text-neutral-400">저장하면 바로 반영됩니다</p>
          ) : (
            <p className="text-xs text-red-500">전공을 하나 이상 선택해 주세요</p>
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
  );
}