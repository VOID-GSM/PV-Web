import { INVITE_BASE, formatMonthDay, type InviteLink } from "../../constants/admin";
import linkIcon from "../../assets/icons/link.svg";
import clipboardIcon from "../../assets/icons/clipboard.svg";
import plusIcon from "../../assets/icons/plus.svg";

type InviteLinkCardProps = {
  links: InviteLink[];
  approvalMode: boolean;
  onNewLink: () => void;
  onCopy: (link: InviteLink) => void;
  onRevoke: (link: InviteLink) => void;
  onToggleApproval: () => void;
};

export default function InviteLinkCard({
  links,
  approvalMode,
  onNewLink,
  onCopy,
  onRevoke,
  onToggleApproval,
}: InviteLinkCardProps) {
  return (
    <section className="rounded-lg bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">초대 링크</h2>
        <button onClick={onNewLink} className="flex items-center gap-1 text-xs font-medium">
          <img src={plusIcon} alt="" className="h-3.5 w-3.5" />새 링크
        </button>
      </div>

      {links.length === 0 ? (
        <p className="mt-4 rounded border border-dashed py-6 text-center text-xs text-neutral-400">
          사용 중인 초대 링크가 없습니다
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {links.map((link) => (
            <li key={link.id} className="rounded-lg bg-neutral-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2">
                  <img src={linkIcon} alt="" className="h-3.5 w-3.5 shrink-0 opacity-50" />
                  <span className="truncate font-mono text-xs">{INVITE_BASE + link.code}</span>
                </span>
                {/* 복사 버튼 */}
                <button onClick={() => onCopy(link)} className="shrink-0 rounded p-1 hover:bg-neutral-200" title="복사">
                  <img src={clipboardIcon} alt="복사" className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">
                    {link.expiresAt ? `${formatMonthDay(link.expiresAt)} 만료` : "만료 없음"}
                  </span>
                  <span className="rounded-full border bg-white px-2 py-0.5">
                    {link.remainingUses === null ? "무제한" : `${link.remainingUses}회 남음`}
                  </span>
                </div>
                <button onClick={() => onRevoke(link)} className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                  폐기
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* 부장 승인 모드 */}
      <div className="mt-4 flex items-center justify-between gap-3 rounded bg-neutral-100 px-4 py-3">
        <div>
          <p className="text-sm font-medium">부장 승인 모드</p>
          <p className="text-[11px] text-neutral-500">링크 유출 대비 · 입장 요청을 승인해야 입장</p>
        </div>
        <button
          onClick={onToggleApproval}
          className={`relative h-6 w-11 shrink-0 rounded-full transition ${approvalMode ? "bg-black" : "bg-neutral-300"}`}
        >
          <span
            className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${approvalMode ? "left-6" : "left-1"}`}
          />
        </button>
      </div>
    </section>
  );
}