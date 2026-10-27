import { api } from "./client";

// ─────────────────────────────────────────────
// 1) 서버가 쓰는 값들 (Swagger Schemas에서 확인)
// ─────────────────────────────────────────────

// 전공: 서버 값
export type Major = "FRONTEND" | "BACKEND" | "DEVOPS" | "DESIGN";
// 카테고리: 서버 값
export type InterviewCategory = "PERSONALITY" | "TECH" | "PROJECT";

// 화면에 보여줄 글자 ↔ 서버 값 바꾸기 표
// Record<A, B>: "A를 이름표로, B를 값으로 갖는 객체"라는 타입
export const MAJOR_LABEL: Record<Major, string> = {
  FRONTEND: "Front-end",
  BACKEND: "Back-end",
  DEVOPS: "DevOps",
  DESIGN: "Design",
};

export const CATEGORY_LABEL: Record<InterviewCategory, string> = {
  PERSONALITY: "인성",
  TECH: "기술",
  PROJECT: "프로젝트",
};

// ─────────────────────────────────────────────
// 2) 서버와 주고받는 데이터 모양 (전부 Swagger에서 확인 완료)
// ─────────────────────────────────────────────

// 서버가 보내주는 질문 하나 (QuestionResponse)
export interface Question {
  id: number;
  content: string;
  // null이면 공통 질문 (전공 상관없음)
  major: Major | null;
  category: InterviewCategory;
  // 만든 시각. "2026-10-27T06:54:42.562Z" 모양
  createdAt: string;
}

// 서버가 보내주는 답변 하나 (AnswerResponse)
export interface Answer {
  id: number;
  memberId: number;
  memberName: string;
  content: string;
  createdAt: string;
}

// 질문 등록할 때 보낼 것 (QuestionCreateRequest)
export interface QuestionCreateRequest {
  // 최대 500자
  content: string;
  // 공통 질문이면 안 보낸다 (?)
  major?: Major;
  category: InterviewCategory;
}

// ─────────────────────────────────────────────
// 3) 실제로 서버에 요청하는 함수들
// ─────────────────────────────────────────────
// 모든 주소 앞에 client.ts에서 정한 "/api"가 자동으로 붙는다

// 질문 목록 — GET /interviews/questions?major=&category=
// 전공을 고르면 그 전공 질문 + 공통 질문이 같이 온다
export const getQuestions = async (filter?: { major?: Major; category?: InterviewCategory }) => {
  // params: 주소 뒤에 ?major=...&category=... 로 붙여준다
  const { data } = await api.get<Question[]>("/interviews/questions", { params: filter });
  return data;
};

// 질문 등록 — POST /interviews/questions (같은 내용이 이미 있으면 409 에러)
export const createQuestion = async (body: QuestionCreateRequest) => {
  const { data } = await api.post<Question>("/interviews/questions", body);
  return data;
};

// 질문 하나 자세히 — GET /interviews/questions/{questionId}
export const getQuestion = async (questionId: number) => {
  const { data } = await api.get<Question>(`/interviews/questions/${questionId}`);
  return data;
};

// 모의면접용 랜덤 질문 — GET /interviews/questions/random?count=1~20
export const getRandomQuestions = async (count: number) => {
  const { data } = await api.get<Question[]>("/interviews/questions/random", {
    params: { count },
  });
  return data;
};

// 답변 목록 — GET /interviews/questions/{questionId}/answers
export const getAnswers = async (questionId: number) => {
  const { data } = await api.get<Answer[]>(`/interviews/questions/${questionId}/answers`);
  return data;
};

// 답변 작성 — POST /interviews/questions/{questionId}/answers
// 최대 5000자, 한 질문에 1인 1답변 (이미 썼으면 409 에러)
export const createAnswer = async (questionId: number, content: string) => {
  const { data } = await api.post<Answer>(`/interviews/questions/${questionId}/answers`, {
    content,
  });
  return data;
};