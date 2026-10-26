import { useState } from "react";
import {
  ENTRY_GENERATION_ANY,
  EXPIRY_OPTIONS,
  INVITE_BASE,
  USAGE_OPTIONS,
  type InviteForm,
} from "../../constants/admin";
import linkIcon from "../../assets/icons/link.svg";
import alertIcon from "../../assets/icons/alert.svg";

// 하나만 고르는 칩 묶음 (모달 바깥에 만들어서 다시 그려져도 새로 만들어지지 않게)
type ChipGroupProps = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

function ChipGroup({ options, value, onChange }: ChipGroupProps) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`rounded-full border px-3 py-1.5 text-xs ${
            value === o ? "border-black font-semibold" : "border-neutral-200 text-neutral-500"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

type InviteLinkModalProps = {
  generations: string[];
  onCreate: (form: InviteForm) => void;
  onClose: () => void;
};

export default function InviteLinkModal({ generations, onCreate, onClose }: InviteLinkModalProps) {
  const [expiry, setExpiry] = useState("");
  const [usage, setUsage] = useState("");
  const [defaultGeneration, setDefaultGeneration] = useState("");
  const [requireApproval, setRequireApproval] = useState(false);

  const missing = [
    expiry === "" ? "만료 기간" : "",
    usage === "" ? "사용 가능 횟수" : "",
    defaultGeneration === "" ? "기본 기수" : "",
  ].filter(Boolean);

  const handleCreate = () => {
    onCreate({ expiry, usage, defaultGeneration, requireApproval });
    onClose();
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        onClick={(e) => e.stopPropagation()}
        className="scrollbar-hide max-h-[90vh] w-full max-w-[480px] overflow-y-auto rounded-xl bg-white"
      >
        <div className="flex items-start justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-lg font-bold">초대 링크 만들기</h2>
            <p className="mt-1 text-xs text-neutral-400">디스코드 초대 링크처럼 동작합니다 · 언제든 폐기할 수 있습니다</p>
          </div>
          <button onClick={onClose} className="text-xl text-neutral-400">
            ×
          </button>
        </div>

        <div className="flex flex-col gap-5 px-6 py-5">
          <div>
            <p className="text-xs font-medium">
              만료 기간 <span className="text-red-500">*</span>
            </p>
            <ChipGroup options={EXPIRY_OPTIONS} value={expiry} onChange={setExpiry} />
          </div>

          <div>
            <div className="flex justify-between">
              <p className="text-xs font-medium">
                사용 가능 횟수 <span className="text-red-500">*</span>
              </p>
              <p className="text-[11px] text-neutral-400">링크가 새어나가도 피해를 줄일 수 있습니다</p>
            </div>
            <ChipGroup options={USAGE_OPTIONS} value={usage} onChange={setUsage} />
          </div>

          <div>
            <div className="flex justify-between">
              <p className="text-xs font-medium">
                기본 기수 <span className="text-red-500">*</span>
              </p>
              <p className="text-[11px] text-neutral-400">입장한 사람에게 자동으로 적용됩니다</p>
            </div>
            <ChipGroup
              options={[...generations, ENTRY_GENERATION_ANY]}
              value={defaultGeneration}
              onChange={setDefaultGeneration}
            />
          </div>

          <div className="flex items-center justify-between gap-3 rounded bg-neutral-100 px-4 py-3">
            <div>
              <p className="text-sm font-medium">부장 승인 모드 켜기</p>
              <p className="text-[11px] text-neutral-500">입장 요청이 먼저 쌓이고, 승인해야 입장됩니다</p>
            </div>
            <button
              onClick={() => setRequireApproval(!requireApproval)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${requireApproval ? "bg-black" : "bg-neutral-300"}`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${requireApproval ? "left-6" : "left-1"}`}
              />
            </button>
          </div>

          {/* 미리보기 */}
          <div>
            <p className="text-xs font-medium">생성될 링크 (미리보기)</p>
            <div className="mt-1 flex items-center justify-between rounded border px-3 py-2 text-sm text-neutral-400">
              <span className="flex items-center gap-2 font-mono">
                <img src={linkIcon} alt="" className="h-3.5 w-3.5 opacity-50" />
                {INVITE_BASE}••••••••
              </span>
              <span className="rounded bg-neutral-100 px-2 py-0.5 text-[11px]">생성 후 표시</span>
            </div>
          </div>

          {/* 유출 주의 */}
          <div className="flex gap-2 rounded-lg border-l-4 border-amber-400 bg-amber-50 px-4 py-3">
            <img src={alertIcon} alt="" className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-700">링크가 유출되면 바로 폐기하세요</p>
              <p className="mt-1 text-xs text-neutral-600">
                폐기하면 그 링크로는 더 이상 입장할 수 없고, 이미 입장한 사람에게는 영향이 없습니다.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4">
          {missing.length === 0 ? (
            <p className="text-xs text-neutral-400">만든 링크는 팀원 관리 화면에서 언제든 폐기할 수 있습니다</p>
          ) : (
            <p className="text-xs text-red-500">{missing.join(", ")}을(를) 선택해 주세요</p>
          )}
          <div className="flex shrink-0 gap-2">
            <button onClick={onClose} className="rounded border px-4 py-2 text-sm">
              취소
            </button>
            <button
              onClick={handleCreate}
              disabled={missing.length > 0}
              className="rounded bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              링크 만들기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}