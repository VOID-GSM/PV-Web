import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDiscordStatus,
  getNotificationSettings,
  updateDiscordWebhook,
  updateNotificationSetting,
  type NotificationSetting,
} from "../apis/notifications";

// 창고 이름표
export const notificationKeys = {
  settings: ["notifications", "settings"] as const,
  discord: ["notifications", "discord"] as const,
};

// ─────────────────────────────────────────────
// 알림 설정 불러오기 / 바꾸기
// ─────────────────────────────────────────────
export function useNotificationSettings() {
  return useQuery({
    queryKey: notificationKeys.settings,
    queryFn: getNotificationSettings,
  });
}

export function useUpdateNotificationSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateNotificationSetting,
    // 서버가 내용 없이 OK만 줘서, 창고 안의 그 한 줄만 직접 바꿔 넣는다 (다시 불러오지 않아도 됨)
    onSuccess: (_data, changed) =>
      queryClient.setQueryData<NotificationSetting[]>(notificationKeys.settings, (old = []) => {
        const exists = old.some((s) => s.type === changed.type);
        return exists ? old.map((s) => (s.type === changed.type ? changed : s)) : [...old, changed];
      }),
  });
}

// ─────────────────────────────────────────────
// 디스코드 등록 여부 / 등록
// ─────────────────────────────────────────────
export function useDiscordStatus() {
  return useQuery({
    queryKey: notificationKeys.discord,
    queryFn: getDiscordStatus,
  });
}

export function useUpdateDiscordWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDiscordWebhook,
    // 등록하면 "연결됨"으로 바로 바꾼다
    onSuccess: () => queryClient.setQueryData(notificationKeys.discord, true),
  });
}