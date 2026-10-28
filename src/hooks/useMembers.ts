import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyProfile, updateMyProfile } from "../apis/members";

// 창고 이름표
export const memberKeys = {
  all: ["members"] as const,
  me: ["members", "me"] as const,
};

// ─────────────────────────────────────────────
// 내 프로필 불러오기
// ─────────────────────────────────────────────
export function useMyProfile() {
  return useQuery({
    queryKey: memberKeys.me,
    queryFn: getMyProfile,
  });
}

// ─────────────────────────────────────────────
// 내 프로필 수정
// ─────────────────────────────────────────────
export function useUpdateMyProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMyProfile,
    // 서버가 수정된 내 정보를 돌려주니까, 다시 요청하지 않고 창고에 바로 넣는다
    // setQueryData: 창고의 데이터를 직접 바꿔 넣는다
    onSuccess: (updated) => queryClient.setQueryData(memberKeys.me, updated),
  });
}