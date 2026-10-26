import { useEffect, useState } from "react";
import {
  ANSWER_TIME_LIMIT,
  MAX_ANSWER_LENGTH,
  STATUS_BADGE,
  formatDate,
  formatDuration,
  formatTimer,
  getCategoryBadge,
  type PracticeRecord,
  type PracticeStatus,
  type Question,
} from "../../constants/questionBank";
import micIcon from "../../assets/icons/mic.svg";
import editIcon from "../../assets/icons/edit.svg";
import checkCircleIcon from "../../assets/icons/check-circle.svg";
import playIcon from "../../assets/icons/play.svg";
import alertIcon from "../../assets/icons/alert.svg";
import arrowRightIcon from "../../assets/icons/arrow-right.svg";

type MockInterviewSessionProps = {
  questions: Question[];
  categories: string[];
  major: string;
  onSaveAnswer: (questionId: number, content: string) => void;
  onFinish: (records: PracticeRecord[]) => void;
  onExit: () => void;
};

export default function MockInterviewSession({
  questions,
  categories,
  major,
  onSaveAnswer,
  onFinish,
  onExit,
}: MockInterviewSessionProps) {
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(ANSWER_TIME_LIMIT);
  const [mode, setMode] = useState<"idle" | "write" | "record">("idle");
  const [answerText, setAnswerText] = useState("");
  const [records, setRecords] = useState<PracticeRecord[]>([]);

  // 1초마다 남은 시간을 1씩 줄인다 (0이 되면 멈춘다)
  useEffect(() => {
    const timerId = setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  const isDone = index >= questions.length;
  const current = questions[index];
  const isTimeOver = remaining === 0;

  const goNext = (status: PracticeStatus) => {
    const now = new Date();
    setRecords([
      ...records,
      {
        id: now.getTime(),
        questionTitle: current.title,
        category: current.category,
        date: formatDate(now),
        seconds: ANSWER_TIME_LIMIT - remaining,
        status,
      },
    ]);
    setIndex(index + 1);
    setRemaining(ANSWER_TIME_LIMIT);
    setMode("idle");
    setAnswerText("");
  };

  const handleRecord = () => {
    if (mode !== "record") {
      setMode("record");
      return;
    }
    goNext(isTimeOver ? "시간 초과" : "말로 연습");
  };

  const handleSaveWritten = () => {
    onSaveAnswer(current.id, answerText.trim());
    goNext(isTimeOver ? "시간 초과" : "저장됨");
  };

  const handleSkip = () => {
    goNext(isTimeOver ? "시간 초과" : "건너뜀");
  };

  const handleExit = () => {
    if (records.length > 0 && !window.confirm("나가면 이번 세션 기록이 저장되지 않습니다. 나갈까요?")) return;
    onExit();
  };

  const progress = (Math.min(index + 1, questions.length) / questions.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-black text-white">
      {/* 위쪽 줄 */}
      <div className="flex items-center justify-between gap-4 border-b border-neutral-800 px-6 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handleExit} className="rounded bg-neutral-800 px-3 py-1.5 text-xs">
            × 나가기
          </button>
          <p className="ml-2 text-sm font-semibold">랜덤 모의면접</p>
          {categories.map((c) => (
            <span key={c} className={`rounded-full px-2 py-0.5 text-[11px] ${getCategoryBadge(c)}`}>
              {c}
            </span>
          ))}
          <span className="rounded-full bg-white px-2 py-0.5 text-[11px] text-black">{major}</span>
        </div>
        <div className="w-40 shrink-0">
          <div className="flex justify-between text-[11px] text-neutral-400">
            <span>진행</span>
            <span className="text-white">
              {Math.min(index + 1, questions.length)} / {questions.length}
            </span>
          </div>
          <div className="mt-1 h-1 rounded bg-neutral-800">
            <div className="h-1 rounded bg-white" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-6 p-6 lg:flex-row">
        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          {isDone ? (
            <div className="w-full max-w-2xl rounded-xl bg-white px-8 py-12 text-center text-black">
              <img src={checkCircleIcon} alt="" className="mx-auto h-10 w-10" />
              <p className="mt-3 text-2xl font-bold">모든 질문을 마쳤습니다</p>
              <p className="mt-2 text-sm text-neutral-500">
                오른쪽 아래 '세션 종료하고 결과 보기'를 누르면 연습 기록에 저장됩니다
              </p>
            </div>
          ) : (
            <>
              {/* 타이머 */}
              <div className="w-56 rounded-xl bg-neutral-900 px-6 py-4 text-center">
                <p className={`text-3xl font-bold ${isTimeOver ? "text-orange-400" : ""}`}>{formatTimer(remaining)}</p>
                <div className="mt-2 h-1 rounded bg-neutral-700">
                  <div
                    className="h-1 rounded bg-orange-400"
                    style={{ width: `${(remaining / ANSWER_TIME_LIMIT) * 100}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-neutral-400">남은 답변 시간 · 2분 제한</p>
              </div>

              {/* 질문 카드 */}
              <div className="w-full max-w-3xl rounded-xl bg-white px-8 py-10 text-center text-black">
                <div className="flex justify-center gap-1.5">
                  <span className={`rounded px-2 py-0.5 text-[11px] ${getCategoryBadge(current.category)}`}>
                    {current.category}
                  </span>
                  <span className="rounded bg-neutral-100 px-2 py-0.5 text-[11px]">{current.week} 공통</span>
                </div>
                <p className="mt-4 text-2xl font-bold leading-snug">{current.title}</p>
              </div>

              {mode === "write" && (
                <div className="w-full max-w-3xl">
                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    maxLength={MAX_ANSWER_LENGTH}
                    rows={4}
                    placeholder="답변을 입력하세요"
                    className="w-full resize-none rounded-lg bg-neutral-900 px-4 py-3 text-sm text-white"
                  />
                  <p className="text-right text-[11px] text-neutral-500">
                    {answerText.length} / {MAX_ANSWER_LENGTH}
                  </p>
                </div>
              )}

              {/* 버튼들 */}
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={handleRecord}
                  className="flex items-center gap-1.5 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white"
                >
                  <img src={micIcon} alt="" className="h-4 w-4 invert" />
                  {mode === "record" ? "녹음 끝내고 다음" : "말로 연습하기 (녹음)"}
                </button>
                {mode === "write" ? (
                  <button
                    onClick={handleSaveWritten}
                    disabled={answerText.trim() === ""}
                    className="flex items-center gap-1.5 rounded bg-white px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-40"
                  >
                    <img src={checkCircleIcon} alt="" className="h-4 w-4" />
                    저장하고 다음
                  </button>
                ) : (
                  <button
                    onClick={() => setMode("write")}
                    className="flex items-center gap-1.5 rounded bg-white px-5 py-2.5 text-sm font-semibold text-black"
                  >
                    <img src={editIcon} alt="" className="h-4 w-4" />
                    글로 답변 작성
                  </button>
                )}
                <button onClick={handleSkip} className="flex items-center gap-1.5 px-3 py-2.5 text-sm">
                  <img src={playIcon} alt="" className="h-4 w-4 invert" />
                  다른 질문 뽑기
                </button>
              </div>

              {/* 안내 */}
              <p
                className={`flex items-center gap-2 rounded px-4 py-2 text-xs ${
                  isTimeOver ? "bg-orange-500/20 text-orange-300" : "bg-neutral-900 text-neutral-400"
                }`}
              >
                {mode === "record" && !isTimeOver ? (
                  // 녹음 중 표시: 빨간 점
                  <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
                ) : (
                  <img src={alertIcon} alt="" className="h-3.5 w-3.5 shrink-0 opacity-70 invert" />
                )}
                {isTimeOver
                  ? "시간이 끝났습니다. 다음으로 넘어가면 '시간 초과'로 기록됩니다"
                  : mode === "record"
                    ? "말로 연습 중입니다. 다 말했으면 '녹음 끝내고 다음'을 누르세요"
                    : "2분 안에 답변해 보세요. 글로 쓴 답변은 질문 뱅크에 저장됩니다"}
              </p>
            </>
          )}
        </div>

        {/* 오른쪽: 이번 세션 기록 */}
        <aside className="flex w-full flex-col rounded-xl bg-neutral-900 p-4 lg:w-72">
          <p className="text-sm font-semibold">이번 세션 기록</p>
          <ul className="mt-3 flex flex-1 flex-col gap-2">
            {records.map((r) => (
              <li key={r.id} className="rounded bg-neutral-800 px-3 py-2">
                <p className="truncate text-xs">{r.questionTitle}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-400">{formatDuration(r.seconds)}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${STATUS_BADGE[r.status]}`}>
                    {r.status}
                  </span>
                </div>
              </li>
            ))}
            {!isDone && (
              <li className="rounded bg-white px-3 py-2 text-black">
                <p className="truncate text-xs font-medium">{current.title}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-500">진행 중</span>
                  <span className="rounded-full border px-1.5 py-0.5 text-[10px]">답변 중</span>
                </div>
              </li>
            )}
          </ul>
          <p className="mt-4 text-[11px] text-neutral-500">
            세션이 끝나면 기록이 최근 연습 기록에 저장되고, 글로 쓴 답변은 다른 팀원 답변과 비교할 수 있습니다.
          </p>
          <button
            onClick={() => onFinish(records)}
            className="mt-3 flex items-center justify-center gap-1.5 rounded bg-white py-2.5 text-sm font-semibold text-black"
          >
            <img src={arrowRightIcon} alt="" className="h-4 w-4" />
            세션 종료하고 결과 보기
          </button>
        </aside>
      </div>
    </div>
  );
}