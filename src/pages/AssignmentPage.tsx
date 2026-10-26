// ★ useCallback: 함수를 한 번만 만들어 두고 재사용하게 해주는 기능
import { useCallback, useState } from "react";
import { Header } from "../components/layout/Header";
import Dropdown from "../components/common/Dropdown";
// ★ 직접 만든 토스트
import Toast from "../components/common/Toast";
import ReminderBanner from "../components/assignment/ReminderBanner";
import CompetencyMap from "../components/assignment/CompetencyMap";
import OngoingAssignments from "../components/assignment/OngoingAssignments";
import RecipientStatusList from "../components/assignment/RecipientStatusList";
import AssignmentCreateModal from "../components/assignment/AssignmentCreateModal";
import AssignmentList from "../components/assignment/AssignmentList";
import SubmissionReview, { type ReviewAction } from "../components/assignment/SubmissionReview";
import MySubmissions from "../components/assignment/MySubmissions";
import {
  ASSIGNMENT_TABS,
  GENERATIONS,
  MAJORS,
  ME,
  MEMBERS,
  TARGET_ALL,
  getDaysLeft,
  getRecipients,
  nowString,
  type Assignment,
  type AssignmentForm,
  type Skill,
  type Submission,
} from "../constants/assignment";

// ★ 토스트 하나의 모양. id는 같은 메시지라도 새로 띄우기 위한 번호
type ToastState = { id: number; message: string; type: "success" | "info" };

export default function AssignmentPage() {
  // 데이터: 처음엔 전부 비어 있음
  const [skills, setSkills] = useState<Skill[]>([]);
  const [myScores, setMyScores] = useState<Record<number, number>>({});
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // 화면 상태
  const [activeTab, setActiveTab] = useState("역량 맵");
  const [generation, setGeneration] = useState("");
  const [major, setMajor] = useState("");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);

  // 출제 창
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [initialSkillId, setInitialSkillId] = useState<number | null>(null);
  const [editingDraft, setEditingDraft] = useState<Assignment | null>(null);

  // ★ 지금 떠 있는 토스트 (null이면 없음)
  const [toast, setToast] = useState<ToastState | null>(null);

  // ★ 토스트 띄우기
  const showToast = (message: string, type: "success" | "info" = "info") => {
    setToast({ id: Date.now(), message, type });
  };

  // ★ 토스트 닫기. useCallback으로 감싸서 매번 새 함수가 만들어지지 않게 한다
  // (Toast 안의 타이머가 화면이 다시 그려질 때마다 처음부터 다시 시작되는 걸 막는다)
  const closeToast = useCallback(() => setToast(null), []);

  const majorFilter = major === "" || major === "전체" ? "" : major;
  const generationFilter = generation === "" || generation === "전체" ? "" : generation;

  const visibleSkills = skills.filter((s) => majorFilter === "" || s.major === majorFilter);
  const visibleMembers = MEMBERS.filter(
    (m) =>
      (generationFilter === "" || m.generation === generationFilter) &&
      (majorFilter === "" || m.majors.includes(majorFilter))
  );

  const publishedAssignments = assignments.filter((a) => !a.isDraft);
  const ongoingAssignments = publishedAssignments.filter((a) => getDaysLeft(a.deadline) >= 0);

  const remindedMajors = MAJORS.filter((m) => majorFilter === "" || m === majorFilter).filter(
    (m) => !publishedAssignments.some((a) => a.targets.includes(TARGET_ALL) || a.targets.includes(m))
  );

  const myAssignments = publishedAssignments.filter((a) =>
    getRecipients(a.targets, a.personalTargets).some((m) => m.name === ME)
  );

  const summaryAssignment =
    publishedAssignments.find((a) => a.id === selectedAssignmentId) ?? ongoingAssignments[0] ?? null;

  // ===== 이벤트 처리 =====

  const openCreate = (skillId: number | null = null) => {
    setInitialSkillId(skillId);
    setEditingDraft(null);
    setIsCreateOpen(true);
  };

  const handleAddSkill = (name: string, skillMajor: string) => {
    setSkills([...skills, { id: Date.now(), name, major: skillMajor }]);
    // ★
    showToast(`역량 항목 '${name}'을(를) 추가했습니다`, "success");
  };

  const handleScoreChange = (skillId: number) => {
    const current = myScores[skillId] ?? 0;
    setMyScores({ ...myScores, [skillId]: (current % 5) + 1 });
  };

  const handleSubmitAssignment = (form: AssignmentForm, isDraft: boolean) => {
    if (editingDraft) {
      setAssignments(assignments.map((a) => (a.id === editingDraft.id ? { ...a, ...form, isDraft } : a)));
    } else {
      setAssignments([{ id: Date.now(), author: ME, isDraft, ...form }, ...assignments]);
    }
    // ★
    showToast(isDraft ? "임시 저장했습니다" : "과제를 출제했습니다", "success");
  };

  const handleSubmitWork = (assignmentId: number, type: string, content: string) => {
    const assignment = assignments.find((a) => a.id === assignmentId);
    const isLate = assignment ? getDaysLeft(assignment.deadline) < 0 : false;
    const status = isLate ? "지각 제출" : "제출";
    const mine = submissions.find((s) => s.assignmentId === assignmentId && s.author === ME);
    if (mine) {
      setSubmissions(
        submissions.map((s) => (s.id === mine.id ? { ...s, type, content, status, submittedAt: nowString() } : s))
      );
    } else {
      setSubmissions([
        { id: Date.now(), assignmentId, author: ME, type, content, submittedAt: nowString(), status, feedbacks: [] },
        ...submissions,
      ]);
    }
    // ★
    showToast(isLate ? "지각 제출되었습니다" : "과제를 제출했습니다", "success");
  };

  const handleReview = (submissionId: number, action: ReviewAction, feedback: string) => {
    const target = submissions.find((s) => s.id === submissionId);
    if (!target) return;

    setSubmissions(
      submissions.map((s) =>
        s.id === submissionId
          ? {
              ...s,
              status: action === "보류" ? s.status : action,
              feedbacks: feedback
                ? [...s.feedbacks, { id: Date.now(), author: ME, content: feedback, date: nowString() }]
                : s.feedbacks,
            }
          : s
      )
    );

    if (action === "통과" && target.author === ME) {
      const skillId = assignments.find((a) => a.id === target.assignmentId)?.skillId;
      if (skillId !== null && skillId !== undefined) {
        setMyScores({ ...myScores, [skillId]: Math.min(5, (myScores[skillId] ?? 0) + 1) });
      }
    }

    // ★ 동작별 안내
    const messages: Record<ReviewAction, string> = {
      통과: `${target.author} 님의 제출물을 통과 처리했습니다`,
      "재제출 요청": `${target.author} 님에게 재제출을 요청했습니다`,
      보류: "피드백을 남겼습니다",
    };
    showToast(messages[action], "success");
  };

  // ★ 미제출자에게 알림: alert 대신 토스트
  const handleRemind = (assignmentId: number) => {
    const a = assignments.find((x) => x.id === assignmentId);
    if (!a) return;
    const unsubmitted = getRecipients(a.targets, a.personalTargets).filter(
      (m) => !submissions.some((s) => s.assignmentId === a.id && s.author === m.name)
    );
    if (unsubmitted.length === 0) {
      showToast("모든 팀원이 제출했습니다", "success");
    } else {
      showToast(`미제출자 ${unsubmitted.length}명(${unsubmitted.map((m) => m.name).join(", ")})에게 알림을 보냈습니다`);
    }
  };

  const goToStatus = (assignmentId: number) => {
    setSelectedAssignmentId(assignmentId);
    setActiveTab("제출 현황");
  };

  // ===== 탭별 본문 =====
  const renderTab = () => {
    if (activeTab === "과제 목록") {
      return (
        <AssignmentList
          assignments={assignments}
          skills={skills}
          submissions={submissions}
          onOpenStatus={goToStatus}
          onEditDraft={(draft) => {
            setEditingDraft(draft);
            setInitialSkillId(null);
            setIsCreateOpen(true);
          }}
        />
      );
    }
    if (activeTab === "제출 현황") {
      return (
        <SubmissionReview
          assignments={publishedAssignments}
          skills={skills}
          submissions={submissions}
          myScores={myScores}
          selectedAssignmentId={selectedAssignmentId}
          onSelectAssignment={setSelectedAssignmentId}
          onReview={handleReview}
          onRemind={handleRemind}
        />
      );
    }
    if (activeTab === "내 제출물") {
      return (
        <MySubmissions
          assignments={myAssignments}
          submissions={submissions.filter((s) => s.author === ME)}
          onSubmit={handleSubmitWork}
        />
      );
    }

    return (
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="min-w-0 flex-1">
          <CompetencyMap
            skills={visibleSkills}
            members={visibleMembers}
            myScores={myScores}
            onScoreChange={handleScoreChange}
            onAddSkill={handleAddSkill}
            onCreateFromSkill={(skillId) => openCreate(skillId)}
          />
        </div>
        <aside className="flex w-full shrink-0 flex-col gap-4 self-start lg:w-80">
          <OngoingAssignments assignments={ongoingAssignments} submissions={submissions} onSelect={goToStatus} />
          <section className="rounded-lg bg-white p-5">
            <h2 className="font-bold">
              제출 현황{summaryAssignment ? ` · ${summaryAssignment.title}` : ""}
            </h2>
            <div className="mt-3">
              {summaryAssignment ? (
                <RecipientStatusList assignment={summaryAssignment} submissions={submissions} />
              ) : (
                <p className="rounded border border-dashed py-8 text-center text-xs text-neutral-400">
                  진행 중인 과제가 없습니다
                </p>
              )}
            </div>
          </section>
        </aside>
      </div>
    );
  };

  return (
    <div className="flex min-h-full flex-col">
      <Header title="과제 · 역량 맵" subtitle="9기가 10기의 강약점을 보고 과제를 출제합니다" />

      <div className="flex flex-col gap-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-5">
            {ASSIGNMENT_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`border-b-2 pb-1 text-sm ${
                  activeTab === tab ? "border-black font-semibold" : "border-transparent text-neutral-400"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="w-32">
              <Dropdown
                options={["전체", ...GENERATIONS]}
                value={generation}
                onChange={setGeneration}
                placeholder="기수: 전체"
              />
            </div>
            <div className="w-40">
              <Dropdown options={["전체", ...MAJORS]} value={major} onChange={setMajor} placeholder="전공: 전체" />
            </div>
            <button
              onClick={() => openCreate()}
              className="rounded bg-black px-4 py-2 text-sm font-semibold text-white"
            >
              + 과제 출제
            </button>
          </div>
        </div>

        <ReminderBanner majors={remindedMajors} onCreate={() => openCreate()} />

        {renderTab()}
      </div>

      {isCreateOpen && (
        <AssignmentCreateModal
          skills={skills}
          initialSkillId={initialSkillId}
          editing={editingDraft}
          remindedMajors={remindedMajors}
          onSubmit={handleSubmitAssignment}
          onClose={() => setIsCreateOpen(false)}
        />
      )}

      {/* ★ 토스트. key가 바뀌면 새로 떠서 타이머도 처음부터 다시 시작한다 */}
      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={closeToast} />}
    </div>
  );
}