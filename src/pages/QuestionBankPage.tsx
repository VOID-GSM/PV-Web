import { useCallback, useState } from "react";
import { Header } from "../components/layout/Header";
import Dropdown from "../components/common/Dropdown";
import Toast from "../components/common/Toast";
import QuestionList from "../components/questionBank/QuestionList";
import QuestionDetail from "../components/questionBank/QuestionDetail";
import AnswerModal from "../components/questionBank/AnswerModal";
import QuestionAddModal from "../components/questionBank/QuestionAddModal";
import MockInterviewCard from "../components/questionBank/MockInterviewCard";
import PracticeHistory from "../components/questionBank/PracticeHistory";
import MockInterviewSession from "../components/questionBank/MockInterviewSession";
import {
  CATEGORIES,
  MAJORS,
  MAX_SESSION_QUESTIONS,
  ME,
  MY_GENERATION,
  QB_TABS,
  formatDate,
  getCategoryBadge,
  type Answer,
  type PracticeRecord,
  type Question,
} from "../constants/questionBank";
// 서버 연동
import { useAllAnswers, useCreateAnswer, useCreateQuestion, useQuestions } from "../hooks/useInterviews";
import {
  CATEGORY_LABEL,
  MAJOR_LABEL,
  type Answer as ServerAnswer,
  type Question as ServerQuestion,
} from "../apis/interviews";
import { getErrorMessage } from "../apis/client";
import { tokenStorage } from "../apis/tokenStorage";

// 전공이 없는(모든 전공 공통) 질문에 붙일 이름
const COMMON_MAJOR = "공통";

// ─────────────────────────────────────────────
// 컴포넌트 바깥에 두는 도우미 함수들
// ─────────────────────────────────────────────

// 표에서 "글자"로 "서버 값" 찾기 (예: "기술" → "TECH")
function findKey<K extends string>(labels: Record<K, string>, label: string): K | undefined {
  return (Object.keys(labels) as K[]).find((key) => labels[key] === label);
}

// ★ 피셔-예이츠 섞기: 뒤에서부터 하나씩, 앞쪽 무작위 자리와 바꾼다 → 모든 순서가 똑같은 확률로 나온다
function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    // 0 ~ i 중 무작위 자리
    const j = Math.floor(Math.random() * (i + 1));
    // 두 자리 바꾸기
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// 서버 질문 → 화면 질문
function toPageQuestion(q: ServerQuestion): Question {
  const created = new Date(q.createdAt);
  return {
    id: q.id,
    title: q.content,
    // 전공이 없으면 공통 질문
    major: q.major ? MAJOR_LABEL[q.major] : COMMON_MAJOR,
    category: CATEGORY_LABEL[q.category],
    // 만든 날짜로 "10월 4주차" 만들기
    week: `${created.getMonth() + 1}월 ${Math.ceil(created.getDate() / 7)}주차`,
  };
}

// 서버 답변 → 화면 답변
// 화면 부품은 author === ME 로 "내 답변"을 알아보니까, 내 번호와 같으면 ME로 바꿔 준다
function toPageAnswer(a: ServerAnswer, questionId: number, myId: number | null): Answer {
  const isMine = myId !== null && a.memberId === myId;
  return {
    id: a.id,
    questionId,
    author: isMine ? ME : a.memberName,
    // 서버가 기수를 안 알려줘서, 내 것만 내 기수로 표시
    generation: isMine ? MY_GENERATION : "기수 미확인",
    date: formatDate(new Date(a.createdAt)),
    content: a.content,
    // 추천 기능은 서버에 없어서 빈 배열
    likedBy: [],
  };
}

type ToastState = { id: number; message: string; type: "success" | "info" };

export default function QuestionBankPage() {
  // 모의면접 기록은 서버 API가 없어서 아직 화면에만 저장
  const [practiceRecords, setPracticeRecords] = useState<PracticeRecord[]>([]);

  // 화면 상태
  const [activeTab, setActiveTab] = useState("질문 목록");
  const [major, setMajor] = useState("");
  const [category, setCategory] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // 모의면접 세션 (null이면 진행 중 아님)
  const [session, setSession] = useState<{ questions: Question[]; categories: string[] } | null>(null);

  // 토스트 번호는 "이전 번호 + 1"
  const showToast = (message: string, type: "success" | "info" = "success") => {
    setToast((prev) => ({ id: (prev?.id ?? 0) + 1, message, type }));
  };
  const closeToast = useCallback(() => setToast(null), []);

  // 토큰에서 꺼낸 내 회원 번호
  const myId = tokenStorage.getMemberId();

  // 서버에서 질문 목록 불러오기
  const questionsQuery = useQuestions();
  const serverQuestions = questionsQuery.data ?? [];
  const questions = serverQuestions.map(toPageQuestion);

  // ★ 모든 질문의 답변을 한꺼번에 불러와서 한 줄로 모으기
  const { answersByQuestion, isPending: isAnswersPending } = useAllAnswers(serverQuestions.map((q) => q.id));
  const allAnswers = serverQuestions.flatMap((q) =>
    (answersByQuestion.get(q.id) ?? []).map((a) => toPageAnswer(a, q.id, myId))
  );

  // 이 질문에 내가 이미 답했는지
  const hasMyAnswer = (questionId: number) =>
    allAnswers.some((a) => a.questionId === questionId && a.author === ME);

  // "전체"나 빈 값이면 필터 안 함
  const majorFilter = major === "" || major === "전체" ? "" : major;
  const categoryFilter = category === "" || category === "전체" ? "" : category;

  // ★ 전공 필터: 고른 전공 질문 + 공통 질문 (서버 API와 같은 동작)
  const questionsByMajor = questions.filter(
    (q) => majorFilter === "" || q.major === majorFilter || q.major === COMMON_MAJOR
  );
  // 전공 + 카테고리 필터 (목록용)
  const filteredQuestions = questionsByMajor.filter(
    (q) => categoryFilter === "" || q.category === categoryFilter
  );

  // 선택된 질문과 그 답변
  const selectedQuestion = filteredQuestions.find((q) => q.id === selectedId) ?? null;
  const selectedAnswers = selectedQuestion ? allAnswers.filter((a) => a.questionId === selectedQuestion.id) : [];

  // 서버로 보내는 도구들
  const createQuestionMutation = useCreateQuestion();
  const createAnswerMutation = useCreateAnswer();

  // 질문 추가 → 서버에 등록
  const handleAddQuestion = (data: { title: string; major: string; category: string }) => {
    // 화면 글자 → 서버 값 ("기술" → "TECH")
    const categoryKey = findKey(CATEGORY_LABEL, data.category);
    if (!categoryKey) {
      showToast(`'${data.category}' 카테고리는 서버에서 지원하지 않습니다`, "info");
      return;
    }
    createQuestionMutation.mutate(
      {
        content: data.title,
        // ★ 추가 창에서는 전공을 반드시 고르므로 항상 그 전공의 질문으로 등록된다
        // (공통 질문 등록은 추가 창에 '공통' 선택지를 넣을 때 지원 예정)
        major: findKey(MAJOR_LABEL, data.major),
        category: categoryKey,
      },
      {
        onSuccess: () => showToast("질문을 등록했습니다"),
        onError: (error) => showToast(getErrorMessage(error), "info"),
      }
    );
  };

  // ★ 답변 창 열기: 이미 답했으면 수정 API가 없어서 창을 열지 않는다 (입력한 내용이 사라지지 않게)
  const handleOpenAnswerModal = () => {
    if (!selectedQuestion) return;
    if (isAnswersPending) {
      showToast("답변 정보를 불러오는 중입니다. 잠시 후 다시 시도해 주세요", "info");
      return;
    }
    if (hasMyAnswer(selectedQuestion.id)) {
      showToast("이미 답변한 질문입니다. 답변 수정은 서버 연결을 준비 중입니다", "info");
      return;
    }
    setIsAnswerModalOpen(true);
  };

  // 답변 저장 → 서버에 작성 (한 질문에 1인 1답변)
  const handleSaveAnswer = (questionId: number, content: string) => {
    // ★ 답변을 다 불러오기 전에는 중복인지 알 수 없어서 막는다
    if (isAnswersPending) {
      showToast("답변 정보를 불러오는 중입니다. 잠시 후 다시 시도해 주세요", "info");
      return;
    }
    // ★ 어느 질문이든 이미 답했으면 서버로 보내지 않는다 (서버는 409로 거절함)
    if (hasMyAnswer(questionId)) {
      showToast("이미 답변한 질문입니다", "info");
      return;
    }
    createAnswerMutation.mutate(
      { questionId, content },
      {
        onSuccess: () => showToast("답변을 저장했습니다"),
        onError: (error) => showToast(getErrorMessage(error), "info"),
      }
    );
  };

  // 서버에 아직 없는 기능들
  // (삭제 버튼은 수정 창에만 있는데, 내 답변이 있으면 창을 열지 않아서 실제로는 눌리지 않는다)
  const handleDeleteAnswer = () => {
    showToast("답변 삭제는 서버 연결을 준비 중입니다", "info");
  };
  const handleToggleLike = () => {
    showToast("추천 기능은 서버 연결을 준비 중입니다", "info");
  };

  // 모의면접 시작: 고른 카테고리의 질문을 고르게 섞어서 최대 10개
  const handleStartMock = (categories: string[]) => {
    const pool = questionsByMajor.filter((q) => categories.includes(q.category));
    setSession({ questions: shuffle(pool).slice(0, MAX_SESSION_QUESTIONS), categories });
  };

  // 모의면접 종료: 이번 기록을 최근 연습 기록 맨 앞에
  const handleFinishMock = (records: PracticeRecord[]) => {
    setPracticeRecords([...records.reverse(), ...practiceRecords]);
    setSession(null);
  };

  // 내 답변 탭에서 질문을 누르면 질문 목록 탭으로 이동해서 선택
  const goToQuestion = (questionId: number) => {
    setMajor("");
    setCategory("");
    setSelectedId(questionId);
    setActiveTab("질문 목록");
  };

  const myAnswers = allAnswers.filter((a) => a.author === ME);
  const findQuestion = (id: number) => questions.find((q) => q.id === id);

  // 기수별 묶음
  const generations = [...new Set(allAnswers.map((a) => a.generation))].sort();

  // 오른쪽 칸 (질문 목록 탭에서 사용)
  const rightColumn = (
    <>
      <MockInterviewCard questions={questionsByMajor} onStart={handleStartMock} />
      <PracticeHistory records={practiceRecords} />
    </>
  );

  // 탭별 본문
  const renderTabContent = () => {
    if (activeTab === "내 답변") {
      return myAnswers.length === 0 ? (
        <p className="rounded-lg border border-dashed bg-white py-16 text-center text-sm text-neutral-400">
          {isAnswersPending ? "답변을 불러오는 중..." : "아직 작성한 답변이 없습니다"}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {myAnswers.map((a) => {
            const q = findQuestion(a.questionId);
            return (
              <li key={a.id}>
                <button onClick={() => goToQuestion(a.questionId)} className="w-full rounded-lg bg-white p-5 text-left">
                  <div className="flex items-center gap-2">
                    {q && (
                      <span className={`rounded px-2 py-0.5 text-[11px] ${getCategoryBadge(q.category)}`}>
                        {q.category}
                      </span>
                    )}
                    <span className="text-xs text-neutral-400">{a.date}</span>
                  </div>
                  <p className="mt-2 font-semibold">{q?.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{a.content}</p>
                </button>
              </li>
            );
          })}
        </ul>
      );
    }

    if (activeTab === "랜덤 모의면접") {
      return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <MockInterviewCard questions={questionsByMajor} onStart={handleStartMock} />
          <PracticeHistory records={practiceRecords} />
        </div>
      );
    }

    if (activeTab === "기수별 아카이브") {
      return generations.length === 0 ? (
        <p className="rounded-lg border border-dashed bg-white py-16 text-center text-sm text-neutral-400">
          {isAnswersPending ? "답변을 불러오는 중..." : "아카이브된 답변이 없습니다"}
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {generations.map((gen) => (
            <section key={gen}>
              <h3 className="text-sm font-semibold">{gen}</h3>
              <ul className="mt-2 flex flex-col gap-2">
                {allAnswers
                  .filter((a) => a.generation === gen)
                  .map((a) => (
                    <li key={a.id} className="rounded-lg bg-white p-4">
                      <p className="text-xs text-neutral-400">
                        {a.author} · {a.date}
                      </p>
                      <p className="mt-1 text-sm font-semibold">{findQuestion(a.questionId)?.title}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{a.content}</p>
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </div>
      );
    }

    // 질문 목록 (기본)
    return (
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="w-full shrink-0 self-start lg:w-72">
          {/* ★ 전체 답변을 넘겨서 질문마다 답변 수가 맞게 나온다 */}
          <QuestionList
            questions={filteredQuestions}
            answers={allAnswers}
            selectedId={selectedQuestion?.id ?? null}
            onSelect={setSelectedId}
          />
        </div>
        <div className="min-w-0 flex-1">
          <QuestionDetail
            question={selectedQuestion}
            answers={selectedAnswers}
            onOpenAnswerModal={handleOpenAnswerModal}
            onToggleLike={handleToggleLike}
          />
        </div>
        <aside className="flex w-full shrink-0 flex-col gap-4 self-start lg:w-72">{rightColumn}</aside>
      </div>
    );
  };

  return (
    <div className="flex min-h-full flex-col">
      <Header
        title="면접 질문 뱅크"
        subtitle={`매주 공통 질문이 자동 누적됩니다 · 질문 ${questions.length}개 · 답변 ${allAnswers.length}개`}
      />

      <div className="p-6">
        {/* 탭 + 필터 + 질문 추가 */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-5">
            {QB_TABS.map((tab) => (
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
            <div className="w-40">
              <Dropdown options={["전체", ...MAJORS]} value={major} onChange={setMajor} placeholder="전공: 전체" />
            </div>
            <div className="w-36">
              <Dropdown
                options={["전체", ...CATEGORIES.map((c) => c.name)]}
                value={category}
                onChange={setCategory}
                placeholder="카테고리: 전체"
              />
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              disabled={createQuestionMutation.isPending}
              className="rounded border bg-white px-3 py-2 text-sm font-medium disabled:opacity-40"
            >
              {createQuestionMutation.isPending ? "등록 중..." : "+ 질문 추가"}
            </button>
          </div>
        </div>

        {/* 불러오는 중 / 실패 / 성공 */}
        {questionsQuery.isPending ? (
          <p className="rounded-lg bg-white py-16 text-center text-sm text-neutral-400">질문을 불러오는 중...</p>
        ) : questionsQuery.isError ? (
          <p className="rounded-lg bg-white py-16 text-center text-sm text-red-500">
            {getErrorMessage(questionsQuery.error)}
          </p>
        ) : (
          renderTabContent()
        )}
      </div>

      {/* 모달들 */}
      {isAddModalOpen && <QuestionAddModal onAdd={handleAddQuestion} onClose={() => setIsAddModalOpen(false)} />}

      {isAnswerModalOpen && selectedQuestion && (
        <AnswerModal
          question={selectedQuestion}
          answers={selectedAnswers}
          onSave={(content) => handleSaveAnswer(selectedQuestion.id, content)}
          onDelete={handleDeleteAnswer}
          onClose={() => setIsAnswerModalOpen(false)}
        />
      )}

      {session && (
        <MockInterviewSession
          questions={session.questions}
          categories={session.categories}
          major={majorFilter === "" ? "전체 전공" : majorFilter}
          onSaveAnswer={handleSaveAnswer}
          onFinish={handleFinishMock}
          onExit={() => setSession(null)}
        />
      )}

      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={closeToast} />}
    </div>
  );
}