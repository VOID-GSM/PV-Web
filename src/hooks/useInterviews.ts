// useQuery: 서버에서 데이터를 "불러올 때" 쓴다
// useMutation: 서버에 데이터를 "보낼 때(등록·수정)" 쓴다
// useQueryClient: 창고(QueryClient)를 꺼내 쓸 때 쓴다
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAnswer,
  createQuestion,
  getAnswers,
  getQuestions,
  type InterviewCategory,
  type Major,
} from "../apis/interviews";

// ─────────────────────────────────────────────
// 창고 안 데이터의 "이름표" (queryKey)
// 같은 이름표면 같은 데이터로 보고 다시 요청하지 않는다
// ─────────────────────────────────────────────
export const interviewKeys = {
  // 면접 관련 전부
  all: ["interviews"] as const,
  // 질문 목록 (필터가 다르면 다른 데이터로 본다)
  questions: (major?: Major, category?: InterviewCategory) =>
    ["interviews", "questions", major, category] as const,
  // 특정 질문의 답변 목록
  answers: (questionId: number) => ["interviews", "answers", questionId] as const,
};

// ─────────────────────────────────────────────
// 질문 목록 불러오기
// ─────────────────────────────────────────────
export function useQuestions(major?: Major, category?: InterviewCategory) {
  return useQuery({
    queryKey: interviewKeys.questions(major, category),
    // 실제로 서버에 요청하는 함수 (apis/interviews.ts에서 만든 것)
    queryFn: () => getQuestions({ major, category }),
  });
}

// ─────────────────────────────────────────────
// 특정 질문의 답변 목록 불러오기
// ─────────────────────────────────────────────
export function useAnswers(questionId: number | null) {
  return useQuery({
    queryKey: interviewKeys.answers(questionId ?? 0),
    // ! : "questionId는 여기서 null이 아니다"라고 TypeScript에게 알려준다
    // (아래 enabled 덕분에 null일 땐 이 함수가 실행되지 않는다)
    queryFn: () => getAnswers(questionId!),
    // 질문을 선택했을 때만 요청한다
    enabled: questionId !== null,
  });
}

// ─────────────────────────────────────────────
// 질문 등록
// ─────────────────────────────────────────────
export function useCreateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createQuestion,
    // 등록에 성공하면 → 면접 관련 데이터를 "오래됨"으로 표시 → 자동으로 다시 불러온다
    onSuccess: () => queryClient.invalidateQueries({ queryKey: interviewKeys.all }),
  });
}

// ─────────────────────────────────────────────
// 답변 작성
// ─────────────────────────────────────────────
export function useCreateAnswer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, content }: { questionId: number; content: string }) =>
      createAnswer(questionId, content),
    // 작성에 성공하면 그 질문의 답변 목록을 다시 불러온다
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: interviewKeys.answers(variables.questionId) }),
  });
}