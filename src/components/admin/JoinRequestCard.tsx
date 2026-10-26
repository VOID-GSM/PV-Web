import { type JoinRequest } from "../../constants/admin";

type JoinRequestCardProps = {
  requests: JoinRequest[];
  approvalMode: boolean;
  onApprove: (request: JoinRequest) => void;
  onReject: (request: JoinRequest) => void;
};

export default function JoinRequestCard({ requests, approvalMode, onApprove, onReject }: JoinRequestCardProps) {
  return (
    <section className="rounded-lg bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">입장 요청 승인 대기</h2>
        {requests.length > 0 && (
          <span className="rounded-full bg-red-600 px-2 py-0.5 text-[11px] text-white">{requests.length}건</span>
        )}
      </div>

      {requests.length === 0 ? (
        <p className="mt-4 rounded border border-dashed py-6 text-center text-xs text-neutral-400">
          {approvalMode ? "대기 중인 입장 요청이 없습니다" : "승인 모드가 꺼져 있어 링크로 바로 입장합니다"}
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {requests.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-2 rounded bg-neutral-50 px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black text-[11px] text-white">
                  {r.name.charAt(0)}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{r.name}</p>
                  <p className="truncate text-[11px] text-neutral-400">
                    {r.generation} · {r.majors.join(", ")} · {r.requestedAt}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => onApprove(r)} className="rounded bg-black px-3 py-1.5 text-xs text-white">
                  승인
                </button>
                <button onClick={() => onReject(r)} className="px-2 py-1.5 text-xs">
                  거절
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}