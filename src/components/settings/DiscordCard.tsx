import { useCallback, useState } from "react";
import Toast from "../common/Toast";
import { useDiscordStatus, useUpdateDiscordWebhook } from "../../hooks/useNotifications";
import { getErrorMessage } from "../../apis/client";

// 디스코드 웹훅 주소는 이 두 모양 중 하나로 시작한다
const WEBHOOK_PREFIXES = ["https://discord.com/api/webhooks/", "https://discordapp.com/api/webhooks/"];

type ToastState = { id: number; message: string; type: "success" | "info" };

export default function DiscordCard() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // ★ 등록 여부
  const statusQuery = useDiscordStatus();
  const updateMutation = useUpdateDiscordWebhook();

  const showToast = (message: string, type: "success" | "info" = "success") => {
    setToast((prev) => ({ id: (prev?.id ?? 0) + 1, message, type }));
  };
  const closeToast = useCallback(() => setToast(null), []);

  const trimmed = webhookUrl.trim();
  const isValid = WEBHOOK_PREFIXES.some((prefix) => trimmed.startsWith(prefix));

  const handleSave = () => {
    updateMutation.mutate(
      { webhookUrl: trimmed },
      {
        onSuccess: () => {
          showToast(statusQuery.data ? "디스코드 웹훅을 새 주소로 바꿨습니다" : "디스코드 웹훅을 등록했습니다");
          // 웹훅 주소는 비밀번호처럼 다뤄서, 저장 후에는 칸을 비운다
          setWebhookUrl("");
          setIsVisible(false);
        },
        onError: (error) => showToast(getErrorMessage(error), "info"),
      }
    );
  };

  return (
    <section id="discord" className="rounded-lg bg-white p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold">디스코드 연동</h2>
        {/* ★ 등록 여부 배지 */}
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] ${
            statusQuery.data ? "bg-green-50 text-green-700" : "border text-neutral-500"
          }`}
        >
          {statusQuery.isPending ? "확인 중" : statusQuery.data ? "연결됨" : "미연결"}
        </span>
      </div>
      <p className="mt-1 text-xs text-neutral-400">팀 디스코드 채널로 알림을 보냅니다 · 부장만 등록할 수 있어요</p>

      <ol className="mt-4 list-decimal space-y-1 rounded bg-neutral-50 py-3 pl-8 pr-4 text-xs text-neutral-600">
        <li>디스코드에서 알림 받을 채널의 ⚙ 채널 편집 → 연동 → 웹후크로 이동</li>
        <li>새 웹후크를 만들고 웹후크 URL 복사</li>
        <li>아래 칸에 붙여넣고 등록</li>
      </ol>

      <label className="mt-4 block text-xs font-medium">
        {statusQuery.data ? "새 웹훅 주소 (바꿀 때만)" : "웹훅 주소"}
      </label>
      <div className="mt-1 flex gap-2">
        <input
          type={isVisible ? "text" : "password"}
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          placeholder="https://discord.com/api/webhooks/..."
          autoComplete="off"
          className="min-w-0 flex-1 rounded border px-3 py-2 text-sm"
        />
        <button onClick={() => setIsVisible(!isVisible)} className="shrink-0 rounded border px-3 text-xs text-neutral-500">
          {isVisible ? "가리기" : "보기"}
        </button>
      </div>

      {trimmed !== "" && !isValid && (
        <p className="mt-1 text-xs text-red-500">디스코드 웹훅 주소(https://discord.com/api/webhooks/...)를 넣어주세요</p>
      )}

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSave}
          disabled={!isValid || updateMutation.isPending}
          className="rounded bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          {updateMutation.isPending ? "등록 중..." : statusQuery.data ? "웹훅 바꾸기" : "웹훅 등록"}
        </button>
      </div>

      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={closeToast} />}
    </section>
  );
}