import { useEffect } from "react";

type ToastProps = {
  message: string;
  // 아이콘 종류: success(✓) / info(🔔)
  type?: "success" | "info";
  onClose: () => void;
};

export default function Toast({ message, type = "info", onClose }: ToastProps) {
  // 화면에 뜨고 2.5초 뒤에 자동으로 닫는다
  useEffect(() => {
    // setTimeout: 정해진 시간(ms) 뒤에 한 번 실행
    const timerId = setTimeout(onClose, 2500);
    // 먼저 닫히거나 새 토스트로 바뀌면 예약을 취소한다 (뒷정리)
    return () => clearTimeout(timerId);
  }, [onClose]);

  return (
    // fixed bottom-6: 화면 아래쪽에 고정
    // left-1/2 -translate-x-1/2: 가로 가운데 정렬
    // z-[60]: 모달(z-50)보다도 위에 보이게
    <div className="fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-3 rounded-lg bg-black px-5 py-3 text-sm text-white shadow-lg">
      <span>{type === "success" ? "✓" : "🔔"}</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-neutral-400">
        ×
      </button>
    </div>
  );
}