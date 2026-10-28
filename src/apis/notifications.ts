import { api } from "./client";

// 디스코드 웹훅 등록할 때 보낼 것 (PATCH /notifications/discord)
export interface DiscordWebhookRequest {
  // 디스코드 채널 설정에서 만든 웹훅 주소
  webhookUrl: string;
}

// 디스코드 웹훅 등록 — PATCH /notifications/discord
// 부장만 가능 (아니면 서버가 403으로 거절)
// 응답 내용이 없어서(200 OK만) 아무것도 돌려주지 않는다
export const updateDiscordWebhook = async (body: DiscordWebhookRequest) => {
  await api.patch("/notifications/discord", body);
};