import alertIcon from "../../assets/icons/alert.svg";

export const Header = () => {
  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-8">
      <div>
        <h2 className="text-base font-bold text-gray-900">통합 일정 관리</h2>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 transition hover:bg-gray-200"
        >
          <img src={alertIcon} alt="알림" className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
          <div className="h-8 w-8 rounded-full bg-black text-xs font-bold text-white flex items-center justify-center">
            ME
          </div>
          <span className="text-xs font-medium text-gray-700">내 프로필</span>
        </div>
      </div>
    </header>
  );
};
