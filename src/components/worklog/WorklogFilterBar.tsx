import Dropdown from "../common/Dropdown";
import { BOARDS, PERIOD_OPTIONS, WORKLOG_TABS } from "../../constants/worklog";

// 바깥(WorklogPage)에서 받을 값: 지금 값 + 바꾸는 함수
type WorklogFilterBarProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  board: string;
  onBoardChange: (value: string) => void;
  period: string;
  onPeriodChange: (value: string) => void;
};

export default function WorklogFilterBar({
  activeTab,
  onTabChange,
  board,
  onBoardChange,
  period,
  onPeriodChange,
}: WorklogFilterBarProps) {
  return (
    // flex-wrap: 화면이 좁으면 탭과 드롭다운이 두 줄로 나뉜다
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white px-5 py-3">
      {/* 왼쪽: 탭 3개 */}
      <div className="flex gap-5">
        {WORKLOG_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            // 선택된 탭만 아래에 검은 밑줄(border-b-2) + 굵은 글씨
            className={`border-b-2 pb-1 text-sm ${
              activeTab === tab
                ? "border-black font-semibold"
                : "border-transparent text-neutral-400"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 오른쪽: 보드 · 기간 드롭다운 (직접 만든 Dropdown 재사용) */}
      <div className="flex gap-2">
        <div className="w-44">
          <Dropdown
            // "전체" + 보드 이름 4개
            options={["전체", ...BOARDS.map((b) => b.name)]}
            value={board}
            onChange={onBoardChange}
            placeholder="보드: 전체"
          />
        </div>
        <div className="w-32">
          <Dropdown
            options={PERIOD_OPTIONS}
            value={period}
            onChange={onPeriodChange}
            placeholder="기간: 전체"
          />
        </div>
      </div>
    </div>
  );
}