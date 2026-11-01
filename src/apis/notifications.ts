import { api } from "./client";

// ─────────────────────────────────────────────
// 1) 서버가 쓰는 값들 (api-docs.json에서 확인)
// ─────────────────────────────────────────────

// 알림 종류: 공지 / 마감 D-day / 주제 미정 재알림 / 무단 불참 / 주간 리포트
export type NotificationType = "NOTICE" | "DEADLINE_DDAY" | "TOPIC_REMINDER" | "UNEXCUSED_ABSENCE" | "WEEKLY_REPORT";

// 알림 종류 하나의 켜짐/꺼짐
export interface NotificationSetting {
  type: NotificationType;
  enabled: boolean;
}

// 디스코드 웹훅 등록할 때 보낼 것
export interface DiscordWebhookRequest {
  // 디스코드 채널 설정에서 만든 웹훅 주소
  webhookUrl: string;
}

// ─────────────────────────────────────────────
// 2) 알림 설정
// ─────────────────────────────────────────────

// 내 알림 설정 — GET /notifications/settings → { settings: [...] }
export const getNotificationSettings = async () => {
  const { data } = await api.get<{ settings: NotificationSetting[] }>("/notifications/settings");
  return data.settings;
};

// 알림 하나 켜기/끄기 — PATCH /notifications/settings (응답 내용 없음)
export const updateNotificationSetting = async (setting: NotificationSetting) => {
  await api.patch("/notifications/settings", setting);
};

// ─────────────────────────────────────────────
// 3) 디스코드
// ─────────────────────────────────────────────

// 디스코드 웹훅 등록 여부 — GET /notifications/discord → { registered }
export const getDiscordStatus = async () => {
  const { data } = await api.get<{ registered: boolean }>("/notifications/discord");
  return data.registered;
};

// 디스코드 웹훅 등록 — PATCH /notifications/discord (부장만, 아니면 403)
export const updateDiscordWebhook = async (body: DiscordWebhookRequest) => {
  await api.patch("/notifications/discord", body);
};