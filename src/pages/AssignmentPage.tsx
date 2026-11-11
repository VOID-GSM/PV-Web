import { useCallback, useState } from "react";
import { Header } from "../components/layout/Header";
import Dropdown from "../components/common/Dropdown";
import Toast from "../components/common/Toast";
import ReminderBanner from "../components/assignment/ReminderBanner";
import CompetencyMap from "../components/assignment/CompetencyMap";
import OngoingAssignments from "../components/assignment/OngoingAssignments";
import RecipientStatusList, { type RecipientRow } from "../components/assignment/RecipientStatusList";
import AssignmentCreateModal from "../components/assignment/AssignmentCreateModal";
import AssignmentList from "../components/assignment/AssignmentList";
import SubmissionReview, { type ReviewAction } from "../components/assignment/SubmissionReview";
import MySubmissions from "../components/assignment/MySubmissions";
import {
  ASSIGNMENT_TABS,
  GENERATIONS,
  MAJORS,
  SUBMIT_TYPES,
  TARGET_ALL,
  TARGET_PERSONAL,
  getDaysLeft,
  type Assignment,
  type AssignmentForm,
  type Member,
  type Skill,
  type Submission,
  type SubmissionStatus,
} from "../constants/assignment";
// 서버 연동
import {
  useAssignments,
  useCreateAssignment,
  useCreateSkill,
  useMySkills,
  usePassSubmission,
  useRequestResubmission,
  useResubmitAssignment,
  useSaveMyScores,
  useSkills,
  useSubmissionStatus,
  useSubmitAssignment,
} from "../hooks/useAssignments";
// 진짜 내 이름·기수·전공·번호
import { useMyName } from "../hooks/useMyName";
import type {
  AssignmentSummary,
  SubmissionRequest,
  SubmissionStatus as ServerSubmissionStatus,
  SubmissionStatusSummary,
  TargetType,
} from "../apis/assignments";
import { MAJOR_LABEL, type Major } from "../apis/interviews";
import { getErrorMessage } from "../apis/client";
// ★ 파일 업로드
import { uploadFile } from "../apis/files";
import { tokenStorage } from "../apis/tokenStorage";

// ─────────────────────────────────────────────
// 서버 모양 → 화면 모양 번역 함수들 (컴포넌트 바깥)
// ─────────────────────────────────────────────

// 표에서 "글자"로 "서버 값" 찾기 (예: "Front-end" → "FRONTEND")
function findKey<K extends string>(labels: Record<K, string>, label: string): K | undefined {
  return (Object.keys(labels) as K[]).find((key) => labels[key] === label);
}

// 세계 시각 → 한국 시각 입력칸 모양 "2026-10-30T18:00"
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString("sv-SE")}T${d.toTimeString().slice(0, 5)}`;
}

// 세계 시각 → "10-30 22:05"
function toShortDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString("sv-SE").slice(5)} ${d.toTimeString().slice(0, 5)}`;
}

// 서버 대상 종류 → 화면 대상 칩 (목록에는 어떤 전공인지가 없어서 MAJOR는 "전공 대상")
function toTargets(targetType: TargetType): string[] {
  if (targetType === "ALL") return [TARGET_ALL];
  if (targetType === "MEMBER") return [TARGET_PERSONAL];
  return ["전공 대상"];
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
    // 목록 응답에는 설명이 없다
    description: "",
    skillId: null,
    deadline: toLocalInput(a.deadline),
    targets: toTargets(a.targetType),
    personalTargets: [],
    // 서버가 제출 형식을 제한하지 않아서 전부 보여준다
    submitTypes: SUBMIT_TYPES,
    remind: false,
    author: a.authorName,
    isDraft: false,
  };
}

// 받은 과제의 "내 제출 상태" → 화면 제출물 (내 제출물 탭 배지용). 안 냈으면 null
function toMySubmission(a: AssignmentSummary): Submission | null {
  if (!a.mySubmissionStatus) return null;
  return {
    id: -a.id,
    assignmentId: a.id,
    // 내 제출물 탭에서는 작성자 이름을 보여주지 않아서 "나"로 둔다
    author: "나",
    type: "",
    content: "",
    submittedAt: "",
    status: toPageStatus(a.mySubmissionStatus, a.myLate ?? false),
    // 목록 응답에는 피드백이 없다 (백엔드 확인 후 연결)
    feedbacks: [],
  };
}

// 서버 제출 현황 → 받는 사람 줄들
function toRows(status: SubmissionStatusSummary | undefined): RecipientRow[] {
  return (status?.items ?? []).map((item) => ({
    memberId: item.memberId,
    name: item.memberName,
    status: item.status ? toPageStatus(item.status, item.late) : "미제출",
    submittedAt: item.submittedAt ? toShortDateTime(item.submittedAt) : null,
    submissionId: item.submissionId,
  }));
}

// 같은 번호의 과제가 두 목록에 다 있으면 하나만 남긴다
function uniqueById(list: AssignmentSummary[]): AssignmentSummary[] {
  const map = new Map<number, AssignmentSummary>();
  list.forEach((a) => map.set(a.id, a));
  return [...map.values()];
}

type ToastState = { id: number; message: string; type: "success" | "info" };

export default function AssignmentPage() {
  // 서버 데이터
  const receivedQuery = useAssignments("RECEIVED");
  const createdQuery = useAssignments("CREATED");
  const skillsQuery = useSkills();
  const mySkillsQuery = useMySkills();

  // 서버로 보내는 도구들
  const createAssignment = useCreateAssignment();
  const submitAssignment = useSubmitAssignment();
  const resubmitAssignment = useResubmitAssignment();
  const passSubmission = usePassSubmission();
  const requestResubmission = useRequestResubmission();
  const createSkill = useCreateSkill();
  const saveScores = useSaveMyScores();

  // 진짜 내 정보 (★ 회원 번호는 파일 업로드에 필요. 못 불러왔으면 토큰에서)
  const { myName, myGeneration, myMajors, myId: profileId } = useMyName();
  const myId = profileId ?? tokenStorage.getMemberId();

  // 화면 상태
  const [activeTab, setActiveTab] = useState("역량 맵");
  const [generation, setGeneration] = useState("");
  const [major, setMajor] = useState("");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [initialSkillId, setInitialSkillId] = useState<number | null>(null);
  // 이번에 화면에서 제출한 제출물 번호 (재제출할 때 필요. 과제 번호 → 제출물 번호)
  const [mySubmissionIds, setMySubmissionIds] = useState<Record<number, number>>({});
  // ★ 지금 제출(파일 업로드 포함) 중인 과제 번호
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (message: string, type: "success" | "info" = "info") => {
    setToast((prev) => ({ id: (prev?.id ?? 0) + 1, message, type }));
  };
  const closeToast = useCallback(() => setToast(null), []);

  // ===== 과제 =====
  const received = receivedQuery.data?.content ?? [];
  const created = createdQuery.data?.content ?? [];
  const assignments = uniqueById([...created, ...received]).map(toPageAssignment);
  const myAssignments = received.map(toPageAssignment);
  const mySubmissions = received.map(toMySubmission).filter((s): s is Submission => s !== null);

  // 내가 낸 과제의 제출 인원 (서버가 알려준 값)
  const submittedCounts: Record<number, number> = Object.fromEntries(
    created.map((a) => [a.id, a.submissionCount ?? 0])
  );

  const ongoingAssignments = assignments.filter((a) => getDaysLeft(a.deadline) >= 0);
  const summaryAssignment =
    assignments.find((a) => a.id === selectedAssignmentId) ?? ongoingAssignments[0] ?? null;

  // 제출 현황: 제출 현황 탭에서 고른 과제 / 역량맵 탭 오른쪽 요약 과제
  const statusQuery = useSubmissionStatus(selectedAssignmentId, activeTab === "제출 현황");
  const summaryStatusQuery = useSubmissionStatus(summaryAssignment?.id ?? null, activeTab === "역량 맵");

  // ===== 역량 =====
  const pageSkills: Skill[] = (skillsQuery.data ?? [])
    .filter((s) => s.active)
    .map((s) => ({ id: s.id, name: s.name, major: MAJOR_LABEL[s.major] }));
  const myScores: Record<number, number> = Object.fromEntries(
    (mySkillsQuery.data?.skills ?? [])
      .filter((s) => s.selfScore !== null)
      .map((s) => [s.skillId, s.selfScore as number])
  );

  // 역량맵 팀원 목록: 지금은 내 점수만 있어서 진짜 나 한 줄
  const myMembers: Member[] = myName ? [{ name: myName, generation: myGeneration, majors: myMajors }] : [];

  const majorFilter = major === "" || major === "전체" ? "" : major;
  const generationFilter = generation === "" || generation === "전체" ? "" : generation;
  const visibleSkills = pageSkills.filter((s) => majorFilter === "" || s.major === majorFilter);
  const visibleMembers = myMembers.filter(
    (m) =>
      (generationFilter === "" || m.generation === generationFilter) &&
      (majorFilter === "" || m.majors.includes(majorFilter))
  );

  const remindedMajors = MAJORS.filter((m) => majorFilter === "" || m === majorFilter).filter(
    (m) => !assignments.some((a) => a.targets.includes(TARGET_ALL) || a.targets.includes(m))
  );

  // ===== 이벤트 처리 =====

  const openCreate = (skillId: number | null = null) => {
    setInitialSkillId(skillId);
    setIsCreateOpen(true);
  };

  // 역량 항목 추가 (부장만)
  const handleAddSkill = (name: string, skillMajorLabel: string) => {
    const skillMajor = findKey(MAJOR_LABEL, skillMajorLabel);
    if (!skillMajor) return;
    createSkill.mutate(
      { major: skillMajor, name },
      {
        onSuccess: () => showToast(`역량 항목 '${name}'을(를) 추가했습니다`, "success"),
        onError: (error) => showToast(getErrorMessage(error)),
      }
    );
  };

  // 내 점수 칸을 누르면 1→2→…→5→1
  const handleScoreChange = (skillId: number) => {
    const next = ((myScores[skillId] ?? 0) % 5) + 1;
    saveScores.mutate([{ skillId, score: next }], {
      onError: (error) => showToast(getErrorMessage(error)),
    });
  };

  // 출제 → 서버
  const handleSubmitAssignment = (form: AssignmentForm, isDraft: boolean) => {
    if (isDraft) {
      showToast("임시 저장은 서버 연결을 준비 중입니다");
      return;
    }
    if (form.targets.includes(TARGET_PERSONAL)) {
      showToast("개인 지정 출제는 팀원 연동 후 지원됩니다. 전체나 전공으로 출제해 주세요");
      return;
    }
    const isAll = form.targets.includes(TARGET_ALL);
    const targetMajors = form.targets
      .map((t) => findKey(MAJOR_LABEL, t))
      .filter((m): m is Major => m !== undefined);

    createAssignment.mutate(
      {
        title: form.title,
        description: form.description,
        deadline: new Date(form.deadline).toISOString(),
        targetType: isAll ? "ALL" : "MAJOR",
        targetMajors: isAll ? [] : targetMajors,
        targetMemberIds: [],
        fileKeys: [],
        skillIds: form.skillId !== null ? [form.skillId] : [],
      },
      {
        onSuccess: () => showToast("과제를 출제했습니다", "success"),
        onError: (error) => showToast(getErrorMessage(error)),
      }
    );
  };

  // ★ 제출 / 재제출 → 서버 (파일 첨부면 먼저 파일을 올린다)
  // async: 파일 업로드를 기다렸다가 제출해야 해서
  const handleSubmitWork = async (assignmentId: number, type: string, content: string, file: File | null) => {
    if (type === "GitHub 링크" && !content.startsWith("https://github.com/")) {
      showToast("GitHub 링크는 https://github.com/ 으로 시작해야 합니다");
      return;
    }

    setSubmittingId(assignmentId);
    try {
      // ★ 형식에 맞게 보낼 내용 만들기
      let body: SubmissionRequest;
      if (type === "파일 첨부") {
        if (!file) {
          showToast("파일을 선택해 주세요");
          return;
        }
        if (myId === null) {
          showToast("내 정보를 불러오는 중입니다. 잠시 후 다시 시도해 주세요");
          return;
        }
        showToast("파일을 올리는 중입니다...");
        // 파일을 올리고 받은 이름표(objectKey)로 제출한다
        const objectKey = await uploadFile(file, myId);
        body = { fileKeys: [objectKey] };
      } else if (type === "GitHub 링크") {
        body = { githubUrl: content };
      } else {
        body = { content };
      }

      // 재제출 요청을 받은 과제면 재제출(PATCH)
      const mine = received.find((a) => a.id === assignmentId);
      if (mine?.mySubmissionStatus === "RESUBMIT_REQUESTED") {
        const submissionId = mySubmissionIds[assignmentId];
        if (submissionId === undefined) {
          showToast("재제출은 서버 연결을 확인 중입니다");
          return;
        }
        await resubmitAssignment.mutateAsync({ assignmentId, submissionId, body });
        showToast("다시 제출했습니다", "success");
        return;
      }

      // 처음 제출
      const submission = await submitAssignment.mutateAsync({ assignmentId, body });
      setMySubmissionIds((prev) => ({ ...prev, [assignmentId]: submission.id }));
      showToast(submission.late ? "지각 제출되었습니다" : "과제를 제출했습니다", "success");
    } catch (error) {
      showToast(getErrorMessage(error));
    } finally {
      // finally: 성공·실패·중간에 return 어느 경우든 마지막에 꼭 실행된다
      setSubmittingId(null);
    }
  };

  // 통과 / 재제출 요청 → 서버
  const handleReview = (submissionId: number, action: ReviewAction, feedback: string) => {
    if (selectedAssignmentId === null) return;
    const variables = { assignmentId: selectedAssignmentId, submissionId, comment: feedback };
    const options = {
      onSuccess: () => showToast(action === "통과" ? "통과 처리했습니다" : "재제출을 요청했습니다", "success" as const),
      onError: (error: unknown) => showToast(getErrorMessage(error)),
    };
    if (action === "통과") passSubmission.mutate(variables, options);
    else requestResubmission.mutate(variables, options);
  };

  // 미제출자 알림 (서버 API가 없다)
  const handleRemind = () => {
    showToast("미제출자 알림은 서버 연결을 준비 중입니다");
  };

  const goToStatus = (assignmentId: number) => {
    setSelectedAssignmentId(assignmentId);
    setActiveTab("제출 현황");
  };

  // 제출 현황 불러오는 중 / 실패 문구
  const statusMessage = statusQuery.isPending
    ? "제출 현황을 불러오는 중..."
    : statusQuery.isError
      ? `${getErrorMessage(statusQuery.error)} (제출 현황은 출제자·부장만 볼 수 있습니다)`
      : null;

  // ===== 탭별 본문 =====
  const renderTab = () => {
    if (activeTab === "과제 목록") {
      return <AssignmentList assignments={assignments} submittedCounts={submittedCounts} onOpenStatus={goToStatus} />;
    }
    if (activeTab === "제출 현황") {
      return (
        <SubmissionReview
          assignments={assignments}
          selectedAssignmentId={selectedAssignmentId}
          onSelectAssignment={setSelectedAssignmentId}
          rows={toRows(statusQuery.data)}
          total={statusQuery.data?.total ?? 0}
          submittedCount={statusQuery.data?.submittedCount ?? 0}
          statusMessage={selectedAssignmentId === null ? null : statusMessage}
          onReview={handleReview}
          reviewPending={passSubmission.isPending || requestResubmission.isPending}
          onRemind={handleRemind}
        />
      );
    }
    if (activeTab === "내 제출물") {
      return (
        <MySubmissions
          assignments={myAssignments}
          submissions={mySubmissions}
          onSubmit={handleSubmitWork}
          // ★ 제출 중인 카드의 버튼을 잠근다
          submittingId={submittingId}
        />
      );
    }

    return (
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="min-w-0 flex-1">
          <CompetencyMap
            skills={visibleSkills}
            members={visibleMembers}
            myName={myName}
            myScores={myScores}
            onScoreChange={handleScoreChange}
            onAddSkill={handleAddSkill}
            onCreateFromSkill={(skillId) => openCreate(skillId)}
          />
        </div>
        <aside className="flex w-full shrink-0 flex-col gap-4 self-start lg:w-80">
          <OngoingAssignments
            assignments={ongoingAssignments}
            submittedCounts={submittedCounts}
            onSelect={goToStatus}
          />
          <section className="rounded-lg bg-white p-5">
            <h2 className="font-bold">제출 현황{summaryAssignment ? ` · ${summaryAssignment.title}` : ""}</h2>
            <div className="mt-3">
              {!summaryAssignment ? (
                <p className="rounded border border-dashed py-8 text-center text-xs text-neutral-400">
                  진행 중인 과제가 없습니다
                </p>
              ) : summaryStatusQuery.isError ? (
                <p className="py-6 text-center text-xs text-neutral-400">제출 현황은 출제자·부장만 볼 수 있습니다</p>
              ) : (
                <RecipientStatusList rows={toRows(summaryStatusQuery.data)} />
              )}
            </div>
          </section>
        </aside>
      </div>
    );
  };

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
              disabled={createAssignment.isPending}
              className="rounded bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              {createAssignment.isPending ? "출제 중..." : "+ 과제 출제"}
            </button>
          </div>
        </div>

        <ReminderBanner majors={remindedMajors} onCreate={() => openCreate()} />

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
          skills={pageSkills}
          initialSkillId={initialSkillId}
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