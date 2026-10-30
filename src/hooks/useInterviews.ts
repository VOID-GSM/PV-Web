// useQuery: 데이터 하나를 불러올 때
// useQueries: 데이터 여러 개를 한꺼번에 불러올 때
// useMutation: 서버에 데이터를 보낼 때(등록·수정)
// useQueryClient: 창고(QueryClient)를 꺼내 쓸 때
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAnswer,
  createQuestion,
  getAnswers,
  getQuestions,
  type Answer,
  type InterviewCategory,
  type Major,
} from "../apis/interviews";

// ─────────────────────────────────────────────
// 창고 안 데이터의 "이름표" (queryKey)
// ─────────────────────────────────────────────
export const interviewKeys = {
  // 면접 관련 전부
  all: ["interviews"] as const,
  // 질문 목록
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
    queryFn: () => getQuestions({ major, category }),
  });
}

// ─────────────────────────────────────────────
// ★ 여러 질문의 답변을 한꺼번에 불러오기
// ─────────────────────────────────────────────
// 결과: { answersByQuestion: 질문 번호 → 답변 목록, isPending: 아직 불러오는 중인지 }
export function useAllAnswers(questionIds: number[]) {
  return useQueries({
    // 질문 번호마다 요청 하나씩 만든다
    queries: questionIds.map((id) => ({
      queryKey: interviewKeys.answers(id),
      queryFn: () => getAnswers(id),
    })),
    // combine: 요청 결과 여러 개를 쓰기 좋은 모양 하나로 합친다
    combine: (results) => {
      // Map: "질문 번호 → 답변 목록"을 담는 표
      const answersByQuestion = new Map<number, Answer[]>();
      results.forEach((result, index) => {
        // results는 questionIds와 같은 순서라서 index로 질문 번호를 찾는다
        answersByQuestion.set(questionIds[index], result.data ?? []);
      });
      return {
        answersByQuestion,
        // 하나라도 아직 불러오는 중이면 true
        isPending: results.some((result) => result.isPending),
      };
    },
  });
}

// ─────────────────────────────────────────────
// 질문 등록
// ─────────────────────────────────────────────
export function useCreateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createQuestion,
    // 등록에 성공하면 면접 관련 데이터를 다시 불러온다
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
    // 작성에 성공하면 그 질문의 답변 목록만 다시 불러온다
    // (useAllAnswers도 같은 이름표를 써서 자동으로 함께 갱신된다)
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: interviewKeys.answers(variables.questionId) }),
  });
}