import { useState } from "react";
import {
  STATUS_BADGE,
  formatDday,
  formatDeadline,
  getDaysLeft,
  type Assignment,
  type Submission,
} from "../../constants/assignment";

type MySubmissionsProps = {
  // 내가 받은 과제들
  assignments: Assignment[];
  // 내 제출물들
  submissions: Submission[];
  // ★ 파일 첨부면 진짜 파일(file)도 같이 넘긴다
  onSubmit: (assignmentId: number, type: string, content: string, file: File | null) => void;
  // ★ 제출(또는 파일 업로드) 중인 과제 번호 (그 카드의 버튼만 잠근다)
  submittingId: number | null;
};

export default function MySubmissions({ assignments, submissions, onSubmit, submittingId }: MySubmissionsProps) {
  if (assignments.length === 0) {
    return (
      <p className="rounded-lg border border-dashed bg-white py-16 text-center text-sm text-neutral-400">
        받은 과제가 없습니다
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {assignments.map((a) => (
        <MySubmissionCard
          key={a.id}
          assignment={a}
          submission={submissions.find((s) => s.assignmentId === a.id)}
          onSubmit={onSubmit}
          isSubmitting={submittingId === a.id}
        />
      ))}
    </ul>
  );
}

// 과제 하나 카드 (자기만의 입력 상태를 가진다)
type MySubmissionCardProps = {
  assignment: Assignment;
  submission: Submission | undefined;
  onSubmit: (assignmentId: number, type: string, content: string, file: File | null) => void;
  isSubmitting: boolean;
};

// 바이트 → "12KB" / "1.2MB"
const formatSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)}KB` : `${(bytes / 1024 / 1024).toFixed(1)}MB`;

function MySubmissionCard({ assignment, submission, onSubmit, isSubmitting }: MySubmissionCardProps) {
  // 제출 형식과 내용. 처음엔 비어 있음
  const [type, setType] = useState("");
  const [content, setContent] = useState("");
  // ★ 고른 파일 (파일 첨부일 때만)
  const [file, setFile] = useState<File | null>(null);

  const status = submission?.status ?? "미제출";
  // 아직 안 냈거나 재제출 요청을 받았으면 제출 칸을 보여준다
  const canSubmitNow = !submission || submission.status === "재제출 요청";
  const days = getDaysLeft(assignment.deadline);

  // ★ 제출할 수 있는지: 파일 첨부는 파일이 있어야, 나머지는 내용이 있어야
  const isReady = type === "파일 첨부" ? file !== null : type !== "" && content.trim() !== "";

  const handleSubmit = () => {
    onSubmit(assignment.id, type, content.trim(), type === "파일 첨부" ? file : null);
    setType("");
    setContent("");
    setFile(null);
  };

  return (
    <li className="rounded-lg bg-white p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{assignment.title}</p>
          <p className="mt-1 text-xs text-neutral-400">
            출제 {assignment.author} · 마감 {formatDeadline(assignment.deadline)} ({formatDday(days)})
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] ${STATUS_BADGE[status]}`}>{status}</span>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm text-neutral-600">{assignment.description}</p>

      {/* 받은 피드백 */}
      {submission && submission.feedbacks.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {submission.feedbacks.map((f) => (
            <li key={f.id} className="rounded bg-amber-50 p-3 text-sm">
              <span className="text-[11px] text-neutral-500">
                {f.author} · {f.date}
              </span>
              <p className="mt-1">{f.content}</p>
            </li>
          ))}
        </ul>
      )}

      {/* 제출 칸 */}
      {canSubmitNow && (
        <div className="mt-4 border-t pt-4">
          <p className="text-xs font-medium">{submission ? "다시 제출하기" : "제출하기"}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {/* 출제자가 허락한 형식만 고를 수 있다 */}
            {assignment.submitTypes.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setType(t);
                  setContent("");
                  setFile(null);
                }}
                className={`rounded-full border px-3 py-1.5 text-xs ${
                  type === t ? "border-black font-semibold" : "border-neutral-200 text-neutral-500"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {type === "텍스트" && (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              maxLength={10000}
              className="mt-2 w-full resize-none rounded border px-3 py-2 text-sm"
            />
          )}
          {type === "GitHub 링크" && (
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="https://github.com/..."
              className="mt-2 w-full rounded border px-3 py-2 text-sm"
            />
          )}
          {type === "파일 첨부" && (
            <div className="mt-2">
              {/* ★ 진짜 파일을 기억한다 (files?.[0]: 고른 파일 중 첫 번째, 없으면 null) */}
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block text-sm"
              />
              {file && (
                <p className="mt-1 text-xs text-neutral-500">
                  {file.name} · {formatSize(file.size)}
                </p>
              )}
            </div>
          )}

          <div className="mt-3 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!isReady || isSubmitting}
              className="rounded bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              {isSubmitting ? "제출 중..." : "제출"}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}