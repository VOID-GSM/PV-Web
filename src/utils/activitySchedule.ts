import type { ActivityDetail } from "../api/activityApi";

// 서버 요일 값 → 화면 글자
const DAY_OF_WEEK_LABEL: Record<string, string> = {
  MONDAY: "월요일",
  TUESDAY: "화요일",
  WEDNESDAY: "수요일",
  THURSDAY: "목요일",
  FRIDAY: "금요일",
  SATURDAY: "토요일",
  SUNDAY: "일요일",
};

// "매주 수요일 16:00" (요일과 시간이 없으면 "일정 미정")
export function formatActivitySchedule(
  detail: Pick<ActivityDetail, "repeatDayOfWeek" | "repeatTime">,
) {
  const day = detail.repeatDayOfWeek
    ? (DAY_OF_WEEK_LABEL[detail.repeatDayOfWeek] ?? detail.repeatDayOfWeek)
    : "";
  // "16:00:00"처럼 초까지 오면 "16:00"까지만 보여준다
  const time = detail.repeatTime ? detail.repeatTime.slice(0, 5) : "";

  const text = [day ? `매주 ${day}` : "", time].filter(Boolean).join(" ");
  return text || "일정 미정";
}

// "2026-11-25 ~ 2027-01-06"
export function formatActivityPeriod(summary: {
  startDate?: string;
  endDate?: string;
}) {
  return `${summary.startDate ?? ""} ~ ${summary.endDate ?? ""}`;
}

// 주제를 정하는 방식과 시점
// - 투표형: 회차 N일 전에 투표가 열린다
// - 지정형: 회차 N일 전부터 스터디장에게 주제 입력 알림이 간다
export function formatTopicRule(
  detail: Pick<
    ActivityDetail,
    "topicMode" | "topicModeLabel" | "topicOpenDaysBefore"
  >,
) {
  const label =
    detail.topicModeLabel ||
    (detail.topicMode === "VOTE"
      ? "투표형"
      : detail.topicMode === "ASSIGNED"
        ? "지정형"
        : "");

  if (!label) return "규칙 미정";

  const days = detail.topicOpenDaysBefore;
  if (days === undefined || days === null) return label;

  return detail.topicMode === "ASSIGNED"
    ? `${label} · 회차 ${days}일 전 주제 입력 알림`
    : `${label} · 회차 ${days}일 전 투표 개설`;
}
