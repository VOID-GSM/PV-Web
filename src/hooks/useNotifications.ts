import { useMutation } from "@tanstack/react-query";
import { updateDiscordWebhook } from "../apis/notifications";

// ─────────────────────────────────────────────
// 디스코드 웹훅 등록
// ─────────────────────────────────────────────
// 등록 여부를 불러오는 API(GET)가 없어서, 저장 후 다시 불러올 데이터도 없다
// 그래서 useQueryClient 없이 보내기(useMutation)만 한다
export function useUpdateDiscordWebhook() {
  return useMutation({
    mutationFn: updateDiscordWebhook,
  });
}