import { useCallback, useState } from "react";
import Toast from "../common/Toast";
import {
  useDiscordStatus,
  useNotificationSettings,
  useUpdateNotificationSetting,
} from "../../hooks/useNotifications";
import type { NotificationType } from "../../apis/notifications";
import { getErrorMessage } from "../../apis/client";

// ★ 화면에 보여줄 알림 줄들 (서버 알림 종류와 짝을 맞춘다)
const SERVER_ROWS: { type: NotificationType; title: string; description: string }[] = [
  { type: "NOTICE", title: "공지 알림", description: "새 공지가 올라오면 알림" },
  { type: "DEADLINE_DDAY", title: "마감 D-day 알림", description: "D-7 · D-3 · D-1 · 당일" },
  { type: "TOPIC_REMINDER", title: "주제 미정 재알림", description: "회차 D-1까지 주제가 없으면 재알림" },
  { type: "UNEXCUSED_ABSENCE", title: "무단 불참 알림", description: "스터디장·부장에게 전달" },
  { type: "WEEKLY_REPORT", title: "주간 리포트", description: "매주 월요일 09:00" },
];

// 토글 스위치 (켜짐/꺼짐, 잠금)
function Toggle({ enabled, disabled, onClick }: { enabled: boolean; disabled?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-40 ${
        enabled ? "bg-black" : "bg-neutral-200"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${enabled ? "left-6" : "left-1"}`}
      />
    </button>
  );
}

type ToastState = { id: number; message: string; type: "success" | "info" };

export default function NotificationCard() {
  const settingsQuery = useNotificationSettings();
  const discordQuery = useDiscordStatus();
  const updateSetting = useUpdateNotificationSetting();
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (message: string, type: "success" | "info" = "info") => {
    setToast((prev) => ({ id: (prev?.id ?? 0) + 1, message, type }));
  };
  const closeToast = useCallback(() => setToast(null), []);

  // 서버 설정에서 그 종류가 켜져 있는지 (서버 목록에 없으면 켜진 걸로 본다)
  const isEnabled = (type: NotificationType) =>
    settingsQuery.data?.find((s) => s.type === type)?.enabled ?? true;

  const handleToggle = (type: NotificationType) => {
    updateSetting.mutate(
      { type, enabled: !isEnabled(type) },
      { onError: (error) => showToast(getErrorMessage(error)) }
    );
  };

  return (
    <section id="notification" className="rounded-lg bg-white p-6">
      <h2 className="font-bold">알림</h2>
      <p className="mt-1 text-xs text-neutral-400">웹 푸시를 기본으로 하고 디스코드 웹훅을 함께 쓰는 것을 권장합니다</p>

      <ul className="mt-4 flex flex-col gap-2">
        {/* 웹 푸시: 서버에 아직 없다 */}
        <li className="flex items-center justify-between gap-3 rounded bg-neutral-50 px-4 py-3">
          <div>
            <p className="text-sm font-medium">웹 푸시 (PWA)</p>
            <p className="text-xs text-neutral-400">브라우저·모바일 홈 화면에서 즉시 알림 · 준비 중</p>
          </div>
          <Toggle enabled={false} disabled />
        </li>

        {/* 디스코드: 토글 대신 등록 여부 표시 */}
        <li className="flex items-center justify-between gap-3 rounded bg-neutral-50 px-4 py-3">
          <div>
            <p className="text-sm font-medium">디스코드 웹훅</p>
            <p className="text-xs text-neutral-400">팀 채널로 전달 · 아래 디스코드 연동에서 등록</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] ${
              discordQuery.data ? "bg-green-50 text-green-700" : "border text-neutral-500"
            }`}
          >
            {discordQuery.isPending ? "확인 중" : discordQuery.data ? "연결됨" : "미연결"}
          </span>
        </li>

        {/* ★ 서버와 연결된 알림들 */}
        {SERVER_ROWS.map((row) => (
          <li key={row.type} className="flex items-center justify-between gap-3 rounded bg-neutral-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium">{row.title}</p>
              <p className="text-xs text-neutral-400">{row.description}</p>
            </div>
            <Toggle
              enabled={isEnabled(row.type)}
              // 불러오는 중이거나, 이 줄을 저장하는 중이면 잠근다
              disabled={settingsQuery.isPending || (updateSetting.isPending && updateSetting.variables?.type === row.type)}
              onClick={() => handleToggle(row.type)}
            />
          </li>
        ))}
      </ul>

      {settingsQuery.isError && (
        <p className="mt-3 text-xs text-red-500">{getErrorMessage(settingsQuery.error)}</p>
      )}

      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={closeToast} />}
    </section>
  );
}