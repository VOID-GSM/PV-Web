// src/pages/InvitePage.tsx
import { useState } from "react";
import { useParams } from "react-router-dom";
import type { CalendarEvent } from "../types/calendar";

export interface InvitePageProps {
  events?: CalendarEvent[];
}

export default function InvitePage({ events = [] }: InvitePageProps = {}) {
  const { code } = useParams<{ code?: string }>();
  const [inviteCode] = useState(code || "PV-2026-TEAM");
  const [copied, setCopied] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [invitedMembers, setInvitedMembers] = useState([
    {
      id: 1,
      email: "developer@example.com",
      status: "초대 대기 중",
      date: "2026.10.26",
    },
  ]);

  // 오늘 할 일 수치 계산
  const todayStr = new Date().toISOString().split("T")[0];
  const todayTaskCount = events.filter((e) => e.date === todayStr).length;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://pv-web.com/invite/${inviteCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setInvitedMembers((prev) => [
      ...prev,
      {
        id: Date.now(),
        email: emailInput.trim(),
        status: "초대 대기 중",
        date: new Date().toLocaleDateString("ko-KR"),
      },
    ]);
    setEmailInput("");
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#f8f9fa] overflow-y-auto font-pretendard">
      {/* 상단 헤더 */}
      <header className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-lg font-extrabold text-gray-900">팀원 초대</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            새로운 팀원을 초대하고 함께 프로젝트를 진행하세요. (오늘 남은 할 일:{" "}
            {todayTaskCount}개)
          </p>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-8 max-w-4xl space-y-6">
        {/* 초대 링크 공유 카드 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 mb-1">
            초대 링크 공유
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            아래 링크를 복사하여 초대할 팀원에게 전달하세요.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={`https://pv-web.com/invite/${inviteCode}`}
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-700 focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition shrink-0"
            >
              {copied ? "복사 완료!" : "링크 복사"}
            </button>
          </div>
        </div>

        {/* 이메일로 직접 초대 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 mb-1">
            이메일로 초대하기
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            초대받을 팀원의 이메일 주소를 입력하세요.
          </p>
          <form onSubmit={handleSendInvite} className="flex gap-2">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="invited@example.com"
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-black transition"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition shrink-0"
            >
              초대장 발송
            </button>
          </form>
        </div>

        {/* 초대 현황 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 mb-4">
            초대 현황 ({invitedMembers.length})
          </h2>
          <div className="divide-y divide-gray-100">
            {invitedMembers.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">
                초대한 팀원이 없습니다.
              </p>
            ) : (
              invitedMembers.map((member) => (
                <div
                  key={member.id}
                  className="py-3 flex justify-between items-center text-xs"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {member.email}
                    </p>
                    <p className="text-[11px] text-gray-400">{member.date}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 font-bold rounded-full text-[10px]">
                    {member.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
