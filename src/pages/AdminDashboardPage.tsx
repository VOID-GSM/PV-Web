import { useCallback, useState } from "react";
import { Header } from "../components/layout/Header";
import Toast from "../components/common/Toast";
// 공통 확인 창 (브라우저 기본 창 대신)
import ConfirmModal from "../components/common/ConfirmModal";
import StatCards from "../components/admin/StatCards";
import MemberTable from "../components/admin/MemberTable";
import MemberEditModal from "../components/admin/MemberEditModal";
import InviteLinkCard from "../components/admin/InviteLinkCard";
import InviteLinkModal from "../components/admin/InviteLinkModal";
import JoinRequestCard from "../components/admin/JoinRequestCard";
import GenerationCard from "../components/admin/GenerationCard";
import {
  INVITE_BASE,
  REENTRY_BASE,
  formatDate,
  formatMonthDay,
  sortGenerations,
  type InviteForm,
  type InviteLink,
  type JoinRequest,
  type Member,
} from "../constants/admin";
// 서버 연동
import {
  useApproveJoinRequest,
  useCreateInvite,
  useDashboard,
  useDeleteInvite,
  useGrantRole,
  useIssueReEntryLink,
  useJoinRequests,
  useRemoveRole,
  useTeamMembers,
  useUpdateMember,
  useUpdateTeamSettings,
} from "../hooks/useTeam";
// ★ 내 회원 번호 ("(나)" 표시용)
import { useMyName } from "../hooks/useMyName";
import { ROLE_LABEL, type MemberUpdateRequest } from "../apis/members";
import { MAJOR_LABEL, type Major } from "../apis/interviews";
import { getErrorMessage } from "../apis/client";

// ─────────────────────────────────────────────
// 도우미 함수 (컴포넌트 바깥)
// ─────────────────────────────────────────────

// 표에서 "글자"로 "서버 값" 찾기 (예: "부장" → "LEADER")
function findKey<K extends string>(labels: Record<K, string>, label: string): K | undefined {
  return (Object.keys(labels) as K[]).find((key) => labels[key] === label);
}

// 비율 → 퍼센트 (0.85로 오면 85, 85로 오면 그대로. 없으면 null)
function toPercent(rate: number | null | undefined): number | null {
  if (rate === null || rate === undefined) return null;
  return Math.round(rate <= 1 ? rate * 100 : rate);
}

// 세계 시각 → "10/30 22:05"
function toShortDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.toTimeString().slice(0, 5)}`;
}

type ToastState = { id: number; message: string; type: "success" | "info" };

export default function AdminDashboardPage() {
  // 서버 데이터
  const membersQuery = useTeamMembers();
  const dashboardQuery = useDashboard();
  const joinRequestsQuery = useJoinRequests();

  // 서버로 보내는 도구들
  const updateMember = useUpdateMember();
  const grantRole = useGrantRole();
  const removeRole = useRemoveRole();
  const issueReEntry = useIssueReEntryLink();
  const createInvite = useCreateInvite();
  const deleteInvite = useDeleteInvite();
  const approveJoin = useApproveJoinRequest();
  const updateSettings = useUpdateTeamSettings();

  // ★ 내 회원 번호
  const { myId } = useMyName();

  // 초대 링크: 서버에 목록 API가 없어서 "이번에 만든 것"만 화면에 기억한다
  const [links, setLinks] = useState<InviteLink[]>([]);
  // 승인 모드: 현재 상태를 불러오는 API가 없어서 꺼짐으로 시작한다
  const [approvalMode, setApprovalMode] = useState(false);

  // 화면 상태
  const [activeTab, setActiveTab] = useState("전체");
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  // 폐기 확인 창에 띄울 링크 (null이면 창 닫힘)
  const [revokeTarget, setRevokeTarget] = useState<InviteLink | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (message: string, type: "success" | "info" = "success") => {
    setToast((prev) => ({ id: (prev?.id ?? 0) + 1, message, type }));
  };
  const closeToast = useCallback(() => setToast(null), []);
  // 확인 창 닫기 (ConfirmModal이 Esc 감지에 쓰니까 매번 새로 만들지 않게 기억해 둔다)
  const closeRevokeConfirm = useCallback(() => setRevokeTarget(null), []);

  // ===== 서버 → 화면 =====

  const serverMembers = (membersQuery.data ?? []).filter((m) => m.status === "JOINED");
  // 팀원별 통계 (회원 번호 → 통계)
  const stats = new Map((dashboardQuery.data?.members ?? []).map((s) => [s.memberId, s]));

  const members: Member[] = serverMembers.map((m) => {
    const s = stats.get(m.memberId);
    return {
      id: m.memberId,
      name: m.name,
      generation: `${m.generation}기`,
      majors: m.majors.map((major) => MAJOR_LABEL[major]),
      // MEMBER(팀원)는 기본이라 칩에서 뺀다
      roles: m.roles.filter((r) => r !== "MEMBER").map((r) => ROLE_LABEL[r]),
      isActive: true,
      boards: s?.boardCount ?? 0,
      weeklyDeadlines: s?.weeklyDeadlineCount ?? 0,
      attendance: toPercent(s?.attendanceRate),
      submissionRate: toPercent(s?.assignmentSubmissionRate),
    };
  });

  // 기수 목록과 "10기" → 서버 기수 번호
  const generationIds = new Map(serverMembers.map((m) => [`${m.generation}기`, m.generationId]));
  const generations = sortGenerations([...generationIds.keys()]);

  const requests: JoinRequest[] = (joinRequestsQuery.data ?? []).map((r) => ({
    id: r.requestId,
    name: r.name,
    generation: `${r.generation}기`,
    majors: r.majors.map((major) => MAJOR_LABEL[major]),
    requestedAt: toShortDateTime(r.requestedAt),
  }));

  // 탭: 전체 + 기수들 + 비활성 (비활성 API가 없어서 비활성 탭은 비어 있다)
  const tabs = ["전체", ...generations, "비활성"];
  const tabMembers =
    activeTab === "전체" ? members : activeTab === "비활성" ? [] : members.filter((m) => m.generation === activeTab);

  // 만료 안 됐고 횟수가 남은 링크만
  const today = formatDate(new Date());
  const validLinks = links.filter(
    (l) => (l.expiresAt === null || l.expiresAt >= today) && (l.remainingUses === null || l.remainingUses > 0)
  );

  // ===== 이벤트 처리 =====

  const copyToClipboard = async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(message);
    } catch {
      showToast(`복사하지 못했습니다: ${text}`, "info");
    }
  };

  // 정보 수정 + 역할 바꾸기
  const handleSaveMember = async (edited: Member) => {
    const original = members.find((m) => m.id === edited.id);
    if (!original) return;

    // 바뀐 것만 보낸다
    const body: MemberUpdateRequest = {};
    if (edited.generation !== original.generation) body.generationId = generationIds.get(edited.generation);
    const majorsChanged =
      edited.majors.length !== original.majors.length || edited.majors.some((m) => !original.majors.includes(m));
    if (majorsChanged) {
      body.majors = edited.majors.map((m) => findKey(MAJOR_LABEL, m)).filter((m): m is Major => m !== undefined);
    }

    // 역할: 새로 생긴 것 / 빠진 것
    const added = edited.roles.filter((r) => !original.roles.includes(r));
    const removed = original.roles.filter((r) => !edited.roles.includes(r));

    try {
      if (Object.keys(body).length > 0) await updateMember.mutateAsync({ memberId: edited.id, body });
      // 주는 것부터 하고 빼는 것은 나중에 (마지막 부장이 잠깐이라도 없어지지 않게)
      for (const label of added) {
        const role = findKey(ROLE_LABEL, label);
        if (role) await grantRole.mutateAsync({ memberId: edited.id, role });
      }
      for (const label of removed) {
        const role = findKey(ROLE_LABEL, label);
        if (role) await removeRole.mutateAsync({ memberId: edited.id, role });
      }
      showToast(`${edited.name} 님의 정보를 수정했습니다`);
    } catch (error) {
      showToast(getErrorMessage(error), "info");
    }
  };

  // 역할 인수인계: 넘겨받을 사람에게 먼저 주고, 원래 사람에게서 뺀다
  const handleHandover = async (roleLabel: string, fromId: number, toName: string) => {
    const role = findKey(ROLE_LABEL, roleLabel);
    const to = members.find((m) => m.name === toName);
    if (!role || !to) return;
    try {
      await grantRole.mutateAsync({ memberId: to.id, role });
      await removeRole.mutateAsync({ memberId: fromId, role });
      showToast(`${roleLabel} 역할을 ${toName} 님에게 인계했습니다`);
    } catch (error) {
      showToast(getErrorMessage(error), "info");
    }
  };

  // 재입장 링크 발급
  const handleIssueReentry = (member: Member) => {
    issueReEntry.mutate(member.id, {
      onSuccess: (issued) =>
        copyToClipboard(REENTRY_BASE + issued.code, `${member.name} 님의 재입장 링크를 발급하고 복사했습니다`),
      onError: (error) => showToast(getErrorMessage(error), "info"),
    });
  };

  // 초대 링크 만들기
  const handleCreateLink = async (form: InviteForm) => {
    const days: Record<string, number> = { "1일": 1, "7일": 7, "30일": 30 };
    const uses: Record<string, number> = { "1회": 1, "5회": 5, "15회": 15 };
    let expiresAt: string | undefined;
    if (form.expiry in days) {
      const d = new Date();
      d.setDate(d.getDate() + days[form.expiry]);
      expiresAt = d.toISOString();
    }
    try {
      const created = await createInvite.mutateAsync({
        expiresAt,
        maxUses: form.usage in uses ? uses[form.usage] : undefined,
      });
      // 승인 모드를 바꿨으면 서버에도 반영
      if (form.requireApproval !== approvalMode) {
        await updateSettings.mutateAsync(form.requireApproval);
        setApprovalMode(form.requireApproval);
      }
      setLinks((prev) => [
        {
          id: created.inviteId,
          code: created.code,
          expiresAt: created.expiresAt ? formatDate(new Date(created.expiresAt)) : null,
          remainingUses: created.maxUses ?? null,
          // 서버에 기본 기수 설정이 없어서 화면에만 남긴다
          defaultGeneration: form.defaultGeneration,
        },
        ...prev,
      ]);
      copyToClipboard(INVITE_BASE + created.code, "초대 링크를 만들고 복사했습니다");
    } catch (error) {
      showToast(getErrorMessage(error), "info");
    }
  };

  // 확인 창에서 "폐기"를 눌렀을 때 실제로 서버에 보낸다
  const handleConfirmRevoke = () => {
    const link = revokeTarget;
    setRevokeTarget(null);
    if (!link) return;
    deleteInvite.mutate(link.id, {
      onSuccess: () => {
        setLinks((prev) => prev.filter((l) => l.id !== link.id));
        showToast("초대 링크를 폐기했습니다");
      },
      onError: (error) => showToast(getErrorMessage(error), "info"),
    });
  };

  // 승인 모드 켜기/끄기
  const handleToggleApproval = () => {
    const next = !approvalMode;
    updateSettings.mutate(next, {
      onSuccess: () => {
        setApprovalMode(next);
        showToast(next ? "부장 승인 모드를 켰습니다" : "부장 승인 모드를 껐습니다", "info");
      },
      onError: (error) => showToast(getErrorMessage(error), "info"),
    });
  };

  // 입장 요청 승인 / 거절
  const handleApprove = (r: JoinRequest) => {
    approveJoin.mutate(r.id, {
      onSuccess: () => showToast(`${r.name} 님의 입장을 승인했습니다`),
      onError: (error) => showToast(getErrorMessage(error), "info"),
    });
  };
  const handleReject = () => showToast("입장 요청 거절은 서버 연결을 준비 중입니다", "info");

  // 서버에 없는 기능
  const handleToggleActive = () => showToast("비활성화는 서버 연결을 준비 중입니다", "info");
  const handleAddGeneration = () => showToast("기수 추가는 서버 연결을 준비 중입니다", "info");
  const handleGraduate = () => showToast("기수 졸업 처리는 서버 연결을 준비 중입니다", "info");

  // 불러오는 중 / 실패 (부장이 아니면 403)
  const loadMessage = membersQuery.isPending
    ? "팀원을 불러오는 중..."
    : membersQuery.isError
      ? `${getErrorMessage(membersQuery.error)} (팀원 관리는 부장만 사용할 수 있습니다)`
      : null;

  return (
    <div className="flex min-h-full flex-col">
      <Header title="팀원 관리" subtitle="부장 전용 · 초대 · 권한 · 과부하를 한 화면에서" />

      <div className="flex flex-col gap-4 p-6">
        <StatCards members={members} />

        <div className="flex flex-col gap-4 lg:flex-row">
          {/* 왼쪽: 팀원 표 */}
          <div className="min-w-0 flex-1">
            {loadMessage ? (
              <p className="rounded-lg bg-white py-16 text-center text-sm text-neutral-400">{loadMessage}</p>
            ) : (
              <MemberTable
                members={tabMembers}
                // ★ 내 줄에 (나) 표시
                myId={myId}
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onEdit={setEditingMember}
                onIssueReentry={handleIssueReentry}
                onToggleActive={handleToggleActive}
              />
            )}
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
              // 바로 지우지 않고 확인 창만 연다
              onRevoke={setRevokeTarget}
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
              graduated={[]}
              members={members}
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
          generations={generations}
          onSave={handleSaveMember}
          onClose={() => setEditingMember(null)}
        />
      )}

      {isInviteModalOpen && (
        <InviteLinkModal
          generations={generations}
          onCreate={handleCreateLink}
          onClose={() => setIsInviteModalOpen(false)}
        />
      )}

      {/* 초대 링크 폐기 확인 창 */}
      {revokeTarget && (
        <ConfirmModal
          title="이 초대 링크를 폐기할까요?"
          message="폐기하면 이 링크로는 더 이상 입장할 수 없어요. 이미 입장한 사람에게는 영향이 없습니다."
          confirmLabel="폐기"
          // 되돌릴 수 없는 일이라 빨간 버튼
          danger
          onConfirm={handleConfirmRevoke}
          onCancel={closeRevokeConfirm}
        />
      )}

      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={closeToast} />}
    </div>
  );
}