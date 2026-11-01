import { apiRequest, queryString } from "./client";
export interface ApiNotification {
  id: number; type?: string; title?: string; content?: string; read?: boolean; createdAt?: string;
  targetUrl?: string;
}
export interface NotificationList { items: ApiNotification[]; nextCursor?: number; }
export function getNotifications(cursor?: number, size = 20) {
  return apiRequest<NotificationList>(`/notifications${queryString({ cursor, size })}`);
}
export function markNotificationRead(notificationId: number) {
  return apiRequest<void>(`/notifications/${notificationId}/read`, { method: "POST" });
}
export function markAllNotificationsRead() {
  return apiRequest<void>("/notifications/read-all", { method: "POST" });
}
export function getNotificationSettings() {
  return apiRequest<unknown>("/notifications/settings");
}
export function updateNotificationSetting(body: { type: "NOTICE"; enabled: boolean }) {
  return apiRequest<void>("/notifications/settings", { method: "PATCH", body });
}
export function updateDiscordWebhook(webhookUrl: string) {
  return apiRequest<void>("/notifications/discord", { method: "PATCH", body: { webhookUrl } });
}
