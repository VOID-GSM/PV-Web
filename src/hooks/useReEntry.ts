import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyReEntryCode, issueReEntryCode } from "../apis/auth";

// 창고 이름표
export const reEntryKeys = {
  mine: ["reEntry", "me"] as const,
};

// ─────────────────────────────────────────────
// 내 재입장 코드 불러오기
// ─────────────────────────────────────────────
export function useMyReEntryCode() {
  return useQuery({
    queryKey: reEntryKeys.mine,
    queryFn: getMyReEntryCode,
  });
}

// ─────────────────────────────────────────────
// 재입장 코드 재발급
// ─────────────────────────────────────────────
export function useIssueReEntryCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: issueReEntryCode,
    // 서버가 새 코드를 돌려주니까 창고에 바로 넣는다 → 화면이 새 코드로 바뀐다
    onSuccess: (issued) => queryClient.setQueryData(reEntryKeys.mine, { code: issued.code }),
  });
}