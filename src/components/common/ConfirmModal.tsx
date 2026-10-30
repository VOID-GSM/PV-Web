import { useEffect } from "react";

type ConfirmModalProps = {
  // 제목 (예: "재입장 코드를 재발급할까요?")
  title: string;
  // 설명 (선택)
  message?: string;
  // 확인 버튼 글자 (기본: "확인")
  confirmLabel?: string;
  // 취소 버튼 글자 (기본: "취소")
  cancelLabel?: string;
  // true면 확인 버튼을 빨간색으로 (삭제·폐기처럼 되돌릴 수 없는 일)
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  title,
  message,
  confirmLabel = "확인",
  cancelLabel = "취소",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  // Esc 키를 누르면 취소
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    // 창이 열리면 키보드 감지 시작
    window.addEventListener("keydown", handleKeyDown);
    // 창이 닫히면 감지 끝 (뒷정리)
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    // 바깥 어두운 배경: 누르면 취소
    // z-[55]: 일반 모달(z-50)보다 위, 토스트(z-60)보다 아래
    <div onClick={onCancel} className="fixed inset-0 z-[55] flex items-center justify-center bg-black/50 p-4">
      {/* 안쪽 흰 상자: 눌러도 바깥으로 전달되지 않게 막는다 */}
      <div
        onClick={(e) => e.stopPropagation()}
        // role, aria-modal: 화면 읽기 프로그램에게 "확인 창"이라고 알려준다
        role="alertdialog"
        aria-modal="true"
        className="w-full max-w-[400px] rounded-xl bg-white p-6"
      >
        <h2 className="text-lg font-bold">{title}</h2>
        {message && <p className="mt-2 text-sm text-neutral-500">{message}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded border px-4 py-2 text-sm">
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            // autoFocus: 창이 열리면 확인 버튼에 바로 초점 → Enter로 누를 수 있다
            autoFocus
            className={`rounded px-4 py-2 text-sm font-semibold text-white ${danger ? "bg-red-600" : "bg-black"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}