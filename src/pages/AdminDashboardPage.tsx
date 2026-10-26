import { useCallback, useState } from "react";
import { Header } from "../components/layout/Header";
import Toast from "../components/common/Toast";
import StatCards from "../components/admin/StatCards";
import MemberTable from "../components/admin/MemberTable";
import MemberEditModal from "../components/admin/MemberEditModal";
import InviteLinkCard from "../components/admin/InviteLinkCard";
import InviteLinkModal from "../components/admin/InviteLinkModal";
import JoinRequestCard from "../components/admin/JoinRequestCard";
import GenerationCard from "../components/admin/GenerationCard";
import {
  INITIAL_GENERATIONS,
  INITIAL_MEMBERS,
  INVITE_BASE,
  REENTRY_BASE,
  formatDate,
  formatMonthDay,
  randomCode,
  sortGenerations,
  type InviteForm,
  type InviteLink,
  type JoinRequest,
  type Member,
} from "../constants/admin";

type ToastState = { id: number; message: string; type: "success" | "info" };

export default function AdminDashboardPage() {
  // 데이터
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [generations, setGenerations] = useState<string[]>(INITIAL_GENERATIONS);
  const [graduated, setGraduated] = useState<string[]>([]);
  const [links, setLinks] = useState<InviteLink[]>([]);
  // 입장 요청은 실제로 누가 링크로 들어와야 생긴다 (지금은 비어 있음)
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [approvalMode, setApprovalMode] = useState(false);

  // 화면 상태
  const [activeTab, setActiveTab] = useState("전체");
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (message: string, type: "success" | "info" = "success") => {
    setToast({ id: Date.now(), message, type });
  };
  const closeToast = useCallback(() => setToast(null), []);

  const activeMembers = members.filter((m) => m.isActive);

  // 탭: 전체 + 졸업 안 한 기수들 + 비활성
  const tabs = ["전체", ...generations.filter((g) => !graduated.includes(g)), "비활성"];
  const tabMembers =
    activeTab === "전체"
      ? activeMembers
      : activeTab === "비활성"
        ? members.filter((m) => !m.isActive)
        : activeMembers.filter((m) => m.generation === activeTab);

  // 만료 안 됐고 횟수가 남은 링크만 보여준다
  const today = formatDate(new Date());
  const validLinks = links.filter(
    (l) => (l.expiresAt === null || l.expiresAt >= today) && (l.remainingUses === null || l.remainingUses > 0)
  );

  // ===== 이벤트 처리 =====

  // 클립보드에 복사하고 안내
  const copyToClipboard = async (text: string, message: string) => {
    await navigator.clipboard.writeText(text);
    showToast(message);
  };

  // 초대 링크 만들기
  const handleCreateLink = (form: InviteForm) => {
    const days: Record<string, number> = { "1일": 1, "7일": 7, "30일": 30 };
    const uses: Record<string, number> = { "1회": 1, "5회": 5, "15회": 15 };
    let expiresAt: string | null = null;
    if (form.expiry in days) {
      const d = new Date();
      d.setDate(d.getDate() + days[form.expiry]);
      expiresAt = formatDate(d);
    }
    const link: InviteLink = {
      id: Date.now(),
      code: randomCode(8),
      expiresAt,
      remainingUses: form.usage in uses ? uses[form.usage] : null,
      defaultGeneration: form.defaultGeneration,
    };
    setLinks([link, ...links]);
    setApprovalMode(form.requireApproval);
    copyToClipboard(INVITE_BASE + link.code, "초대 링크를 만들고 복사했습니다");
  };

  const handleRevoke = (link: InviteLink) => {
    if (!window.confirm("이 초대 링크를 폐기할까요? 이미 입장한 사람에게는 영향이 없습니다.")) return;
    setLinks(links.filter((l) => l.id !== link.id));
    showToast("초대 링크를 폐기했습니다");
  };

  const handleToggleApproval = () => {
    setApprovalMode(!approvalMode);
    showToast(approvalMode ? "부장 승인 모드를 껐습니다" : "부장 승인 모드를 켰습니다", "info");
  };

  // 입장 요청 승인: 팀원으로 추가
  const handleApprove = (r: JoinRequest) => {
    setMembers([
      ...members,
      {
        id: Date.now(),
        name: r.name,
        generation: r.generation,
        majors: r.majors,
        roles: [],
        isActive: true,
        boards: 0,
        weeklyDeadlines: 0,
        attendance: null,
        submissionRate: null,
      },
    ]);
    setRequests(requests.filter((x) => x.id !== r.id));
    showToast(`${r.name} 님의 입장을 승인했습니다`);
  };

  const handleReject = (r: JoinRequest) => {
    setRequests(requests.filter((x) => x.id !== r.id));
    showToast(`${r.name} 님의 입장 요청을 거절했습니다`, "info");
  };

  const handleSaveMember = (edited: Member) => {
    setMembers(members.map((m) => (m.id === edited.id ? edited : m)));
    showToast(`${edited.name} 님의 정보를 수정했습니다`);
  };

  // 재입장 링크 발급: 새 코드를 만들어 복사
  const handleIssueReentry = (member: Member) => {
    copyToClipboard(REENTRY_BASE + randomCode(10), `${member.name} 님의 재입장 링크를 발급하고 복사했습니다`);
  };

  const handleToggleActive = (member: Member) => {
    if (member.isActive && !window.confirm(`${member.name} 님을 비활성화할까요? (졸업·탈퇴)`)) return;
    setMembers(members.map((m) => (m.id === member.id ? { ...m, isActive: !m.isActive } : m)));
    showToast(member.isActive ? `${member.name} 님을 비활성화했습니다` : `${member.name} 님을 다시 활성화했습니다`, "info");
  };

  const handleAddGeneration = (name: string) => {
    setGenerations(sortGenerations([...generations, name]));
    showToast(`${name}를 추가했습니다. 기존 기수가 선배 기수로 전환됩니다`);
  };

  // 기수 졸업: 그 기수 팀원을 비활성화하고 졸업 목록에 추가
  const handleGraduate = (generation: string) => {
    if (!window.confirm(`${generation}를 졸업 처리할까요? 해당 기수의 정리글·과제·답변은 아카이브되고 조회는 계속 가능합니다.`)) return;
    setMembers(members.map((m) => (m.generation === generation ? { ...m, isActive: false } : m)));
    setGraduated([...graduated, generation]);
    if (activeTab === generation) setActiveTab("전체");
    showToast(`${generation}를 졸업 처리했습니다`);
  };

  // 역할 인수인계: 지금 담당자에게서 빼고 넘겨받을 사람에게 추가
  const handleHandover = (role: string, fromId: number, toName: string) => {
    setMembers(
      members.map((m) => {
        if (m.id === fromId) return { ...m, roles: m.roles.filter((r) => r !== role) };
        if (m.name === toName && !m.roles.includes(role)) return { ...m, roles: [...m.roles, role] };
        return m;
      })
    );
    showToast(`${role} 역할을 ${toName} 님에게 인계했습니다`);
  };

  return (
    <div className="flex min-h-full flex-col">
      <Header title="팀원 관리" subtitle="부장 전용 · 초대 · 권한 · 과부하를 한 화면에서" />

      <div className="flex flex-col gap-4 p-6">
        <StatCards members={activeMembers} />

        <div className="flex flex-col gap-4 lg:flex-row">
          {/* 왼쪽: 팀원 표 */}
          <div className="min-w-0 flex-1">
            <MemberTable
              members={tabMembers}
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onEdit={setEditingMember}
              onIssueReentry={handleIssueReentry}
              onToggleActive={handleToggleActive}
            />
          </div>

          {/* 오른쪽: 초대 링크, 입장 요청, 기수 전환 */}
          <aside className="flex w-full shrink-0 flex-col gap-4 self-start lg:w-80">
            <InviteLinkCard
              links={validLinks}
              approvalMode={approvalMode}
              onNewLink={() => setIsInviteModalOpen(true)}
              onCopy={(link) =>
                copyToClipboard(
                  INVITE_BASE + link.code,
                  `초대 링크를 복사했습니다${link.expiresAt ? ` (${formatMonthDay(link.expiresAt)} 만료)` : ""}`
                )
              }
              onRevoke={handleRevoke}
              onToggleApproval={handleToggleApproval}
            />
            <JoinRequestCard
              requests={requests}
              approvalMode={approvalMode}
              onApprove={handleApprove}
              onReject={handleReject}
            />
            <GenerationCard
              generations={generations}
              graduated={graduated}
              members={activeMembers}
              onAddGeneration={handleAddGeneration}
              onGraduate={handleGraduate}
              onHandover={handleHandover}
            />
          </aside>
        </div>
      </div>

      {editingMember && (
        <MemberEditModal
          member={editingMember}
          generations={generations.filter((g) => !graduated.includes(g))}
          onSave={handleSaveMember}
          onClose={() => setEditingMember(null)}
        />
      )}

      {isInviteModalOpen && (
        <InviteLinkModal
          generations={generations.filter((g) => !graduated.includes(g))}
          onCreate={handleCreateLink}
          onClose={() => setIsInviteModalOpen(false)}
        />
      )}

      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={closeToast} />}
    </div>
  );
}