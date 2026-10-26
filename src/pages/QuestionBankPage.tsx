import { useState } from "react";
import { Header } from "../components/layout/Header";
import Dropdown from "../components/common/Dropdown";
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

export default function QuestionBankPage() {
  // 데이터: 처음엔 전부 비어 있음
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [practiceRecords, setPracticeRecords] = useState<PracticeRecord[]>([]);

  // 화면 상태
  const [activeTab, setActiveTab] = useState("질문 목록");
  const [major, setMajor] = useState("");
  const [category, setCategory] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // 모의면접 세션 (null이면 진행 중 아님)
  const [session, setSession] = useState<{ questions: Question[]; categories: string[] } | null>(null);

  // "전체"나 빈 값이면 필터 안 함
  const majorFilter = major === "" || major === "전체" ? "" : major;
  const categoryFilter = category === "" || category === "전체" ? "" : category;

  // 전공 필터만 적용 (모의면접용)
  const questionsByMajor = questions.filter((q) => majorFilter === "" || q.major === majorFilter);
  // 전공 + 카테고리 필터 (목록용)
  const filteredQuestions = questionsByMajor.filter(
    (q) => categoryFilter === "" || q.category === categoryFilter
  );

  // 선택된 질문 (필터에 걸려서 안 보이면 선택 안 된 걸로)
  const selectedQuestion = filteredQuestions.find((q) => q.id === selectedId) ?? null;
  const selectedAnswers = selectedQuestion ? answers.filter((a) => a.questionId === selectedQuestion.id) : [];

  // 질문 추가
  const handleAddQuestion = (data: { title: string; major: string; category: string }) => {
    const now = new Date();
    // 이번 달 몇 번째 주인지 (1~7일: 1주차, 8~14일: 2주차 ...)
    const week = `${now.getMonth() + 1}월 ${Math.ceil(now.getDate() / 7)}주차`;
    const newQuestion: Question = { id: now.getTime(), week, ...data };
    setQuestions([newQuestion, ...questions]);
    setSelectedId(newQuestion.id);
  };

  // 답변 저장 (있으면 수정, 없으면 새로)
  const handleSaveAnswer = (questionId: number, content: string) => {
    const today = formatDate(new Date());
    const mine = answers.find((a) => a.questionId === questionId && a.author === ME);
    if (mine) {
      setAnswers(answers.map((a) => (a.id === mine.id ? { ...a, content, date: today } : a)));
    } else {
      setAnswers([
        { id: Date.now(), questionId, author: ME, generation: MY_GENERATION, date: today, content, likedBy: [] },
        ...answers,
      ]);
    }
  };

  // 내 답변 삭제
  const handleDeleteAnswer = (questionId: number) => {
    setAnswers(answers.filter((a) => !(a.questionId === questionId && a.author === ME)));
  };

  // ★ 누르기/취소
  const handleToggleLike = (answerId: number) => {
    setAnswers(
      answers.map((a) =>
        a.id === answerId
          ? {
              ...a,
              likedBy: a.likedBy.includes(ME) ? a.likedBy.filter((n) => n !== ME) : [...a.likedBy, ME],
            }
          : a
      )
    );
  };

  // 모의면접 시작: 고른 카테고리의 질문을 섞어서 최대 10개
  const handleStartMock = (categories: string[]) => {
    const pool = questionsByMajor.filter((q) => categories.includes(q.category));
    // Math.random() - 0.5 로 정렬하면 순서가 무작위로 섞인다
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, MAX_SESSION_QUESTIONS);
    setSession({ questions: shuffled, categories });
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

  const myAnswers = answers.filter((a) => a.author === ME);
  const findQuestion = (id: number) => questions.find((q) => q.id === id);

  // 기수별 묶음 (예: { "10기": [...], "9기": [...] })
  const generations = [...new Set(answers.map((a) => a.generation))].sort();

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
          아직 작성한 답변이 없습니다
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
          아카이브된 답변이 없습니다
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {generations.map((gen) => (
            <section key={gen}>
              <h3 className="text-sm font-semibold">{gen}</h3>
              <ul className="mt-2 flex flex-col gap-2">
                {answers
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
          <QuestionList
            questions={filteredQuestions}
            answers={answers}
            selectedId={selectedQuestion?.id ?? null}
            onSelect={setSelectedId}
          />
        </div>
        <div className="min-w-0 flex-1">
          <QuestionDetail
            question={selectedQuestion}
            answers={selectedAnswers}
            onOpenAnswerModal={() => setIsAnswerModalOpen(true)}
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
        subtitle={`매주 공통 질문이 자동 누적됩니다 · 질문 ${questions.length}개 · 답변 ${answers.length}개`}
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
              className="rounded border bg-white px-3 py-2 text-sm font-medium"
            >
              + 질문 추가
            </button>
          </div>
        </div>

        {renderTabContent()}
      </div>

      {/* 모달들 */}
      {isAddModalOpen && <QuestionAddModal onAdd={handleAddQuestion} onClose={() => setIsAddModalOpen(false)} />}

      {isAnswerModalOpen && selectedQuestion && (
        <AnswerModal
          question={selectedQuestion}
          answers={selectedAnswers}
          onSave={(content) => handleSaveAnswer(selectedQuestion.id, content)}
          onDelete={() => handleDeleteAnswer(selectedQuestion.id)}
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
    </div>
  );
}