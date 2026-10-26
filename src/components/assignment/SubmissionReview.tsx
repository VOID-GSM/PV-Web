import { useState } from "react";
import Dropdown from "../common/Dropdown";
import RecipientStatusList from "./RecipientStatusList";
import {
  STATUS_BADGE,
  getRecipients,
  formatDeadline,
  type Assignment,
  type Skill,
  type Submission,
} from "../../constants/assignment";
import bellIcon from "../../assets/icons/bell.svg";
import linkIcon from "../../assets/icons/link.svg";
import checkCircleIcon from "../../assets/icons/check-circle.svg";

// 리뷰 동작: 통과 / 재제출 요청 / 보류(피드백만 남김)
export type ReviewAction = "통과" | "재제출 요청" | "보류";

type SubmissionReviewProps = {
  assignments: Assignment[];
  skills: Skill[];
  submissions: Submission[];
  myScores: Record<number, number>;
  selectedAssignmentId: number | null;
  onSelectAssignment: (id: number) => void;
  onReview: (submissionId: number, action: ReviewAction, feedback: string) => void;
  onRemind: (assignmentId: number) => void;
};

export default function SubmissionReview({
  assignments,
  skills,
  submissions,
  myScores,
  selectedAssignmentId,
  onSelectAssignment,
  onReview,
  onRemind,
}: SubmissionReviewProps) {
  const [selectedName, setSelectedName] = useState("");
  const [feedback, setFeedback] = useState("");

  const assignment = assignments.find((a) => a.id === selectedAssignmentId) ?? null;

  if (assignments.length === 0) {
    return (
      <p className="rounded-lg border border-dashed bg-white py-16 text-center text-sm text-neutral-400">
        출제된 과제가 없습니다
      </p>
    );
  }

  const skill = skills.find((s) => s.id === assignment?.skillId);
  const submission = submissions.find(
    (s) => s.assignmentId === assignment?.id && s.author === selectedName
  );
  const recipients = assignment ? getRecipients(assignment.targets, assignment.personalTargets) : [];
  const submittedCount = assignment ? submissions.filter((s) => s.assignmentId === assignment.id).length : 0;

  // 이미 결정이 끝난 제출물인지 (통과 또는 재제출 요청이면 잠금)
  const isPassed = submission?.status === "통과";
  const isWaitingResubmit = submission?.status === "재제출 요청";
  const isLocked = isPassed || isWaitingResubmit;

  const canReview = submission !== undefined && !isLocked;
  const hasFeedback = feedback.trim() !== "";

  const handleReview = (action: ReviewAction) => {
    if (!submission || isLocked) return;
    onReview(submission.id, action, feedback.trim());
    setFeedback("");
  };

  const handleSelectPerson = (name: string) => {
    setSelectedName(name);
    setFeedback("");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 과제 고르기 + 미제출자 알림 */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="w-full max-w-sm">
          <Dropdown
            options={assignments.map((a) => a.title)}
            value={assignment?.title ?? ""}
            onChange={(title) => {
              const found = assignments.find((a) => a.title === title);
              if (found) {
                onSelectAssignment(found.id);
                handleSelectPerson("");
              }
            }}
            placeholder="과제를 선택하세요"
          />
        </div>
        {assignment && (
          <button
            onClick={() => onRemind(assignment.id)}
            className="flex items-center gap-1.5 rounded border bg-white px-3 py-2 text-xs"
          >
            <img src={bellIcon} alt="" className="h-3.5 w-3.5" />
            미제출자에게 알림
          </button>
        )}
      </div>

      {!assignment ? (
        <p className="rounded-lg border border-dashed bg-white py-16 text-center text-sm text-neutral-400">
          위에서 과제를 선택하세요
        </p>
      ) : (
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* 왼쪽: 제출 현황 */}
          <section className="w-full shrink-0 self-start rounded-lg bg-white p-4 lg:w-64">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">제출 현황</h2>
              <span className="text-xs text-neutral-500">
                {submittedCount} / {recipients.length}
              </span>
            </div>
            <div className="mt-2 h-1.5 rounded bg-neutral-200">
              <div
                className="h-1.5 rounded bg-green-600"
                style={{ width: `${recipients.length ? (submittedCount / recipients.length) * 100 : 0}%` }}
              />
            </div>
            <div className="mt-3">
              <RecipientStatusList
                assignment={assignment}
                submissions={submissions}
                selectedName={selectedName}
                onSelect={handleSelectPerson}
              />
            </div>
          </section>

          {/* 가운데: 제출물 */}
          <section className="min-w-0 flex-1 rounded-lg bg-white p-5">
            {selectedName === "" ? (
              <p className="py-16 text-center text-sm text-neutral-400">왼쪽에서 제출자를 선택하세요</p>
            ) : !submission ? (
              <p className="py-16 text-center text-sm text-neutral-400">{selectedName} 님은 아직 제출하지 않았습니다</p>
            ) : (
              <>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold">{submission.author}의 제출물</p>
                    <p className="text-xs text-neutral-400">
                      {submission.submittedAt} 제출 · 마감 {formatDeadline(assignment.deadline)}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] ${STATUS_BADGE[submission.status]}`}>
                    {submission.status}
                  </span>
                </div>

                <div className="mt-4 rounded bg-neutral-50 p-4">
                  <p className="text-[11px] text-neutral-400">{submission.type}</p>
                  {submission.type === "GitHub 링크" ? (
                    <a
                      href={submission.content}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 flex items-center gap-2 break-all font-mono text-sm underline"
                    >
                      <img src={linkIcon} alt="" className="h-4 w-4 shrink-0" />
                      {submission.content}
                    </a>
                  ) : (
                    <p className="mt-1 whitespace-pre-wrap text-sm">{submission.content}</p>
                  )}
                </div>

                <p className="mt-5 text-sm font-semibold">피드백 {submission.feedbacks.length}</p>
                {submission.feedbacks.length === 0 ? (
                  <p className="mt-2 text-xs text-neutral-400">아직 피드백이 없습니다</p>
                ) : (
                  <ul className="mt-2 flex flex-col gap-2">
                    {submission.feedbacks.map((f) => (
                      <li key={f.id} className="rounded bg-amber-50 p-3">
                        <p className="text-[11px] text-neutral-500">
                          {f.author} · {f.date}
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-sm">{f.content}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </section>

          {/* 오른쪽: 제출물 확인 */}
          <section className="w-full shrink-0 self-start rounded-lg border-2 border-black bg-white p-4 lg:w-72">
            <h2 className="font-bold">제출물 확인</h2>
            <p className="mt-1 text-[11px] text-neutral-400">통과 처리하면 연결된 역량 맵 항목에 결과가 반영됩니다.</p>

            {skill && (
              <div className="mt-3 rounded bg-neutral-50 p-3 text-xs">
                <div className="flex justify-between">
                  <span>{skill.name}</span>
                  {isPassed ? (
                    <span className="font-semibold text-green-700">반영 완료</span>
                  ) : (
                    <span className="font-semibold text-green-700">
                      {myScores[skill.id] ?? 0} → {Math.min(5, (myScores[skill.id] ?? 0) + 1)}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-neutral-400">통과 시 +1점</p>
              </div>
            )}

            {isLocked ? (
              <div
                className={`mt-4 rounded p-4 text-center text-sm ${
                  isPassed ? "bg-neutral-900 text-white" : "bg-blue-50 text-blue-700"
                }`}
              >
                <p className="flex items-center justify-center gap-1.5 font-semibold">
                  {isPassed && <img src={checkCircleIcon} alt="" className="h-4 w-4 invert" />}
                  {isPassed ? "통과 처리된 제출물입니다" : "재제출을 기다리는 중입니다"}
                </p>
                <p className={`mt-1 text-[11px] ${isPassed ? "text-neutral-400" : "text-blue-600"}`}>
                  {isPassed ? "더 이상 상태를 바꿀 수 없습니다" : "제출자가 다시 제출하면 다시 확인할 수 있습니다"}
                </p>
              </div>
            ) : (
              <>
                <p className="mt-3 text-xs font-medium">피드백 남기기</p>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  maxLength={2000}
                  rows={4}
                  disabled={!canReview}
                  placeholder={submission ? "" : "제출자를 먼저 선택하세요"}
                  className="mt-1 w-full resize-none rounded border px-3 py-2 text-sm disabled:bg-neutral-50"
                />
                <p className="text-right text-[11px] text-neutral-400">{feedback.length} / 2000</p>

                <button
                  onClick={() => handleReview("통과")}
                  disabled={!canReview}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded bg-black py-2 text-sm font-semibold text-white disabled:opacity-40"
                >
                  <img src={checkCircleIcon} alt="" className="h-4 w-4 invert" />
                  통과 처리
                </button>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleReview("재제출 요청")}
                    disabled={!canReview || !hasFeedback}
                    className="flex-1 rounded border py-2 text-sm disabled:opacity-40"
                  >
                    재제출 요청
                  </button>
                  <button
                    onClick={() => handleReview("보류")}
                    disabled={!canReview || !hasFeedback}
                    className="flex-1 py-2 text-sm disabled:opacity-40"
                  >
                    보류
                  </button>
                </div>
                <p className="mt-3 rounded bg-blue-50 p-2 text-[11px] text-blue-700">
                  통과와 재제출 요청은 한 번만 할 수 있어요. 보류는 결정을 미루고 피드백만 남기며, 재제출 요청과 보류는 피드백을 적어야 누를 수 있어요.
                </p>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}