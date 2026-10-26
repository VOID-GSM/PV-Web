import { useState } from "react";
import {
  ME,
  OVERLOAD_THRESHOLD,
  attendanceColor,
  submissionColor,
  type Member,
} from "../../constants/admin";
import alertIcon from "../../assets/icons/alert.svg";
import moreIcon from "../../assets/icons/more.svg";

type MemberTableProps = {
  members: Member[];
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onEdit: (member: Member) => void;
  onIssueReentry: (member: Member) => void;
  onToggleActive: (member: Member) => void;
};

// 비율 막대 한 칸 (기록이 없으면 "-")
function RateBar({ rate, color }: { rate: number | null; color: (r: number) => string }) {
  if (rate === null) return <span className="text-xs text-neutral-300">-</span>;
  return (
    <div className="w-24">
      <p className={`text-[11px] ${rate < 70 ? "text-red-500" : ""}`}>{rate}%</p>
      <div className="mt-0.5 h-1.5 rounded bg-neutral-200">
        <div className={`h-1.5 rounded ${color(rate)}`} style={{ width: `${rate}%` }} />
      </div>
    </div>
  );
}

export default function MemberTable({
  members,
  tabs,
  activeTab,
  onTabChange,
  onEdit,
  onIssueReentry,
  onToggleActive,
}: MemberTableProps) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const runAndClose = (action: () => void) => {
    action();
    setOpenMenuId(null);
  };

  return (
    <section className="rounded-lg bg-white">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
        <div>
          <h2 className="font-bold">팀원 {members.length}명</h2>
          <p className="mt-1 text-xs text-neutral-400">참여 보드 · 이번 주 마감 · 출석률 · 과제 제출률</p>
        </div>
        <div className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`border-b-2 pb-1 text-sm ${
                activeTab === tab ? "border-black font-semibold" : "border-transparent text-neutral-400"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {members.length === 0 ? (
        <p className="py-16 text-center text-sm text-neutral-400">해당하는 팀원이 없습니다</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="text-[11px] text-neutral-400">
              <tr>
                <th className="px-5 py-2 text-left font-normal">팀원</th>
                <th className="py-2 text-left font-normal">기수 · 전공</th>
                <th className="py-2 text-left font-normal">역할</th>
                <th className="py-2 text-left font-normal">보드</th>
                <th className="py-2 text-left font-normal">이번 주 마감</th>
                <th className="py-2 text-left font-normal">출석률</th>
                <th className="py-2 text-left font-normal">과제 제출률</th>
                <th className="w-12 py-2" />
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const isOverloaded = m.weeklyDeadlines >= OVERLOAD_THRESHOLD;
                return (
                  <tr key={m.id} className={`border-t ${m.isActive ? "" : "text-neutral-400"}`}>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-2">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] ${
                            m.isActive ? "bg-black text-white" : "bg-neutral-200"
                          }`}
                        >
                          {m.name.charAt(0)}
                        </span>
                        {m.name}
                        {m.name === ME && <span className="text-[10px] text-neutral-400">(나)</span>}
                      </span>
                    </td>
                    <td className="py-3 text-xs">
                      {m.generation} · {m.majors.join(", ")}
                    </td>
                    <td className="py-3">
                      <span className="rounded-full border px-2 py-0.5 text-[11px]">
                        {m.roles.length === 0 ? "팀원" : m.roles.join(" · ")}
                      </span>
                    </td>
                    <td className="py-3">{m.boards}</td>
                    <td className="py-3">
                      {/* 과부하면 빨간 글씨 + 경고 아이콘 */}
                      <span className={`flex items-center gap-1 ${isOverloaded ? "text-red-500" : ""}`}>
                        {m.weeklyDeadlines}건
                        {isOverloaded && <img src={alertIcon} alt="과부하" className="h-3.5 w-3.5" />}
                      </span>
                    </td>
                    <td className="py-3">
                      <RateBar rate={m.attendance} color={attendanceColor} />
                    </td>
                    <td className="py-3">
                      <RateBar rate={m.submissionRate} color={submissionColor} />
                    </td>
                    <td className="relative py-3">
                      {/* 더보기 버튼 */}
                      <button
                        onClick={() => setOpenMenuId(openMenuId === m.id ? null : m.id)}
                        className="rounded p-1 hover:bg-neutral-100"
                        title="더보기"
                      >
                        <img src={moreIcon} alt="더보기" className="h-4 w-4 opacity-50" />
                      </button>
                      {openMenuId === m.id && (
                        <div className="absolute right-2 top-10 z-10 w-40 rounded-lg border bg-white py-1 text-left text-xs text-black shadow-lg">
                          <button onClick={() => runAndClose(() => onEdit(m))} className="block w-full px-3 py-2 text-left hover:bg-neutral-50">
                            정보 수정
                          </button>
                          <button
                            onClick={() => runAndClose(() => onIssueReentry(m))}
                            className="block w-full px-3 py-2 text-left hover:bg-neutral-50"
                          >
                            재입장 링크 발급
                          </button>
                          <button
                            onClick={() => runAndClose(() => onToggleActive(m))}
                            className={`block w-full px-3 py-2 text-left hover:bg-neutral-50 ${m.isActive ? "text-red-500" : ""}`}
                          >
                            {m.isActive ? "비활성화" : "다시 활성화"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}