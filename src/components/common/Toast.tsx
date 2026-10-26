import { useEffect } from "react";
// 프로젝트 공통 아이콘
import checkCircleIcon from "../../assets/icons/check-circle.svg";
import bellIcon from "../../assets/icons/bell.svg";

type ToastProps = {
  message: string;
  // 아이콘 종류: success(체크) / info(종)
  type?: "success" | "info";
  onClose: () => void;
};

export default function Toast({ message, type = "info", onClose }: ToastProps) {
  // 화면에 뜨고 2.5초 뒤에 자동으로 닫는다
  useEffect(() => {
    const timerId = setTimeout(onClose, 2500);
    return () => clearTimeout(timerId);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-3 rounded-lg bg-black px-5 py-3 text-sm text-white shadow-lg">
      {/* invert: 검은 선 아이콘을 하얗게 뒤집어서 검은 배경에서 보이게 */}
      <img src={type === "success" ? checkCircleIcon : bellIcon} alt="" className="h-4 w-4 invert" />
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-neutral-400">
        ×
      </button>
    </div>
  );
}