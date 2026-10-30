// useCallback: 함수를 한 번만 만들어 두고 재사용하게 해주는 기능
import { useCallback, useState } from "react";
import { Header } from "../components/layout/Header";
import Dropdown from "../components/common/Dropdown";
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
  SUBMIT_TYPES,
  TARGET_ALL,
  TARGET_PERSONAL,
  getDaysLeft,
  getRecipients,
  nowString,
  type Assignment,
  type AssignmentForm,
  type Skill,
  type Submission,
  type SubmissionStatus,
} from "../constants/assignment";
// ★ 서버 연동
import { useAssignments, useCreateAssignment } from "../hooks/useAssignments";
import type {
  AssignmentSummary,
  SubmissionStatus as ServerSubmissionStatus,
  TargetType,
} from "../apis/assignments";
import { MAJOR_LABEL, type Major } from "../apis/interviews";
import { getErrorMessage } from "../apis/client";

// ─────────────────────────────────────────────
// ★ 서버 모양 → 화면 모양 번역 함수들 (컴포넌트 바깥에 둔다)
// ─────────────────────────────────────────────

// 표에서 "글자"로 "서버 값" 찾기 (예: "Front-end" → "FRONTEND")
function findKey<K extends string>(labels: Record<K, string>, label: string): K | undefined {
  return (Object.keys(labels) as K[]).find((key) => labels[key] === label);
}

// 세계 시각 "2026-10-30T09:00:00Z" → 한국 시각 입력칸 모양 "2026-10-30T18:00"
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  // sv-SE: YYYY-MM-DD 모양, toTimeString: "18:00:00 GMT+0900 ..." 에서 앞 5글자
  return `${d.toLocaleDateString("sv-SE")}T${d.toTimeString().slice(0, 5)}`;
}

// 서버 대상 종류 → 화면 대상 칩
// (목록 응답에는 어떤 전공인지가 없어서 MAJOR는 빈 배열)
function toTargets(targetType: TargetType): string[] {
  if (targetType === "ALL") return [TARGET_ALL];
  if (targetType === "MEMBER") return [TARGET_PERSONAL];
  return [];
}

// 서버 제출 상태 + 지각 여부 → 화면 배지 글자
function toPageStatus(status: ServerSubmissionStatus, late: boolean): SubmissionStatus {
  if (status === "PASSED") return "통과";
  if (status === "RESUBMIT_REQUESTED") return "재제출 요청";
  return late ? "지각 제출" : "제출";
}

// 서버 과제(목록용) → 화면 과제
function toPageAssignment(a: AssignmentSummary): Assignment {
  return {
    id: a.id,
    title: a.title,
    // 목록 응답에는 설명·역량 항목이 없다 (상세 연동 때 채운다)
    description: "",
    skillId: null,
    deadline: toLocalInput(a.deadline),
    targets: toTargets(a.targetType),
    personalTargets: [],
    // 서버가 제출 형식을 제한하지 않아서 전부 허용
    submitTypes: SUBMIT_TYPES,
    remind: false,
    author: a.authorName,
    isDraft: false,
  };
}

// 받은 과제의 "내 제출 상태" → 화면 제출물 (내 제출물 탭 배지용)
// 아직 안 냈으면 null
function toMySubmission(a: AssignmentSummary): Submission | null {
  if (!a.mySubmissionStatus) return null;
  return {
    // 진짜 제출물 번호는 상세 연동 때 받는다. 과제 번호로 겹치지 않게 음수를 쓴다
    id: -a.id,
    assignmentId: a.id,
    author: ME,
    type: "",
    content: "",
    submittedAt: "",
    status: toPageStatus(a.mySubmissionStatus, a.myLate ?? false),
    feedbacks: [],
  };
}

// 같은 번호의 과제가 두 목록에 다 있으면 하나만 남긴다
function uniqueById(list: AssignmentSummary[]): AssignmentSummary[] {
  const map = new Map<number, AssignmentSummary>();
  list.forEach((a) => map.set(a.id, a));
  return [...map.values()];
}

type ToastState = { id: number; message: string; type: "success" | "info" };

export default function AssignmentPage() {
  // ★ 서버에서 받은 과제 / 낸 과제 불러오기
  const receivedQuery = useAssignments("RECEIVED");
  const createdQuery = useAssignments("CREATED");
  const createMutation = useCreateAssignment();

  // 역량·제출은 다음 단계에서 서버로 바꾼다 (지금은 화면에만)
  const [skills, setSkills] = useState<Skill[]>([]);
  const [myScores, setMyScores] = useState<Record<number, number>>({});
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // 화면 상태
  const [activeTab, setActiveTab] = useState("역량 맵");
  const [generation, setGeneration] = useState("");
  const [major, setMajor] = useState("");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);

  // 출제 창
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [initialSkillId, setInitialSkillId] = useState<number | null>(null);

  const [toast, setToast] = useState<ToastState | null>(null);

  // 토스트 번호는 "이전 번호 + 1"
  const showToast = (message: string, type: "success" | "info" = "info") => {
    setToast((prev) => ({ id: (prev?.id ?? 0) + 1, message, type }));
  };
  const closeToast = useCallback(() => setToast(null), []);

  // ★ 서버 데이터 → 화면 데이터
  const received = receivedQuery.data?.content ?? [];
  const created = createdQuery.data?.content ?? [];
  const assignments = uniqueById([...created, ...received]).map(toPageAssignment);

  // ★ 내 제출물 탭: 서버가 알려준 "내가 받은 과제"
  const receivedIds = new Set(received.map((a) => a.id));
  const myAssignments = assignments.filter((a) => receivedIds.has(a.id));

  // ★ 내 제출 상태(서버) + 이번에 화면에서 제출한 것(아직 서버 연동 전)
  // 같은 과제를 화면에서 다시 냈으면 화면 쪽을 보여준다
  const serverMySubmissions = received
    .map(toMySubmission)
    .filter((s): s is Submission => s !== null)
    .filter((s) => !submissions.some((l) => l.assignmentId === s.assignmentId && l.author === ME));
  const allSubmissions = [...serverMySubmissions, ...submissions];

  const majorFilter = major === "" || major === "전체" ? "" : major;
  const generationFilter = generation === "" || generation === "전체" ? "" : generation;

  const visibleSkills = skills.filter((s) => majorFilter === "" || s.major === majorFilter);
  const visibleMembers = MEMBERS.filter(
    (m) =>
      (generationFilter === "" || m.generation === generationFilter) &&
      (majorFilter === "" || m.majors.includes(majorFilter))
  );

  const ongoingAssignments = assignments.filter((a) => getDaysLeft(a.deadline) >= 0);

  const remindedMajors = MAJORS.filter((m) => majorFilter === "" || m === majorFilter).filter(
    (m) => !assignments.some((a) => a.targets.includes(TARGET_ALL) || a.targets.includes(m))
  );

  const summaryAssignment =
    assignments.find((a) => a.id === selectedAssignmentId) ?? ongoingAssignments[0] ?? null;

  // ===== 이벤트 처리 =====

  const openCreate = (skillId: number | null = null) => {
    setInitialSkillId(skillId);
    setIsCreateOpen(true);
  };

  const handleAddSkill = (name: string, skillMajor: string) => {
    setSkills([...skills, { id: Date.now(), name, major: skillMajor }]);
    showToast(`역량 항목 '${name}'을(를) 추가했습니다`, "success");
  };

  const handleScoreChange = (skillId: number) => {
    const current = myScores[skillId] ?? 0;
    setMyScores({ ...myScores, [skillId]: (current % 5) + 1 });
  };

  // ★ 출제 → 서버에 저장
  const handleSubmitAssignment = (form: AssignmentForm, isDraft: boolean) => {
    // 서버에 임시 저장 기능이 없다
    if (isDraft) {
      showToast("임시 저장은 서버 연결을 준비 중입니다");
      return;
    }
    // 개인 지정은 회원 "번호"가 필요해서 팀원 연동 후에 지원
    if (form.targets.includes(TARGET_PERSONAL)) {
      showToast("개인 지정 출제는 팀원 연동 후 지원됩니다. 전체나 전공으로 출제해 주세요");
      return;
    }

    // 화면 대상 칩 → 서버 대상 종류
    const isAll = form.targets.includes(TARGET_ALL);
    const targetMajors = form.targets
      .map((t) => findKey(MAJOR_LABEL, t))
      .filter((m): m is Major => m !== undefined);

    createMutation.mutate(
      {
        title: form.title,
        description: form.description,
        // 한국 시각 입력값 → 세계 시각(ISO)
        deadline: new Date(form.deadline).toISOString(),
        targetType: isAll ? "ALL" : "MAJOR",
        targetMajors: isAll ? [] : targetMajors,
        targetMemberIds: [],
        fileKeys: [],
        // 역량 항목은 아직 화면에만 있는 가짜 번호라 보내지 않는다 (역량맵 연동 후 연결)
        skillIds: [],
      },
      {
        onSuccess: () => showToast("과제를 출제했습니다", "success"),
        // 부장·선배가 아니면 403 → "권한이 없습니다"
        onError: (error) => showToast(getErrorMessage(error)),
      }
    );
  };

  // 제출 (다음 단계에서 서버로 바꾼다)
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
    showToast(isLate ? "지각 제출되었습니다" : "과제를 제출했습니다", "success");
  };

  // 통과·재제출 요청 (다음 단계에서 서버로 바꾼다)
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

    const messages: Record<ReviewAction, string> = {
      통과: `${target.author} 님의 제출물을 통과 처리했습니다`,
      "재제출 요청": `${target.author} 님에게 재제출을 요청했습니다`,
      보류: "피드백을 남겼습니다",
    };
    showToast(messages[action], "success");
  };

  // 미제출자 알림 (서버 API가 없어서 안내만)
  const handleRemind = (assignmentId: number) => {
    const a = assignments.find((x) => x.id === assignmentId);
    if (!a) return;
    const unsubmitted = getRecipients(a.targets, a.personalTargets).filter(
      (m) => !allSubmissions.some((s) => s.assignmentId === a.id && s.author === m.name)
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
          submissions={allSubmissions}
          onOpenStatus={goToStatus}
          // 서버에 임시 저장이 없어서 이어서 쓰기도 없다
          onEditDraft={() => showToast("임시 저장은 서버 연결을 준비 중입니다")}
        />
      );
    }
    if (activeTab === "제출 현황") {
      return (
        <SubmissionReview
          assignments={assignments}
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
          submissions={allSubmissions.filter((s) => s.author === ME)}
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
          <OngoingAssignments assignments={ongoingAssignments} submissions={allSubmissions} onSelect={goToStatus} />
          <section className="rounded-lg bg-white p-5">
            <h2 className="font-bold">
              제출 현황{summaryAssignment ? ` · ${summaryAssignment.title}` : ""}
            </h2>
            <div className="mt-3">
              {summaryAssignment ? (
                <RecipientStatusList assignment={summaryAssignment} submissions={allSubmissions} />
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

  // ★ 둘 중 하나라도 불러오는 중 / 실패
  const isLoading = receivedQuery.isPending || createdQuery.isPending;
  const loadError = receivedQuery.error ?? createdQuery.error;

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
              disabled={createMutation.isPending}
              className="rounded bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              {createMutation.isPending ? "출제 중..." : "+ 과제 출제"}
            </button>
          </div>
        </div>

        <ReminderBanner majors={remindedMajors} onCreate={() => openCreate()} />

        {/* ★ 불러오는 중 / 실패 / 성공 */}
        {isLoading ? (
          <p className="rounded-lg bg-white py-16 text-center text-sm text-neutral-400">과제를 불러오는 중...</p>
        ) : loadError ? (
          <p className="rounded-lg bg-white py-16 text-center text-sm text-red-500">{getErrorMessage(loadError)}</p>
        ) : (
          renderTab()
        )}
      </div>

      {isCreateOpen && (
        <AssignmentCreateModal
          skills={skills}
          initialSkillId={initialSkillId}
          // 서버에 임시 저장이 없어서 이어서 쓸 과제도 없다
          editing={null}
          remindedMajors={remindedMajors}
          onSubmit={handleSubmitAssignment}
          onClose={() => setIsCreateOpen(false)}
        />
      )}

      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={closeToast} />}
    </div>
  );
}