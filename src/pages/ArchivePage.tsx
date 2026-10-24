import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Dropdown from "../components/common/Dropdown";


const activityFilterOptions = ["활동 선택", "등록된 활동 없음"];
const periodFilterOptions = ["기간 선택", "전체"];

type ArchiveTab = "all" | "my" | "compare" | "feedback";

export default function ArchivePage() {
  const navigate = useNavigate();

  const [selectedTab, setSelectedTab] = useState<ArchiveTab>("all");
  const [selectedActivity, setSelectedActivity] = useState("활동 선택");
  const [selectedPeriod, setSelectedPeriod] = useState("기간 선택");

  const tabs: { value: ArchiveTab; label: string }[] = [
    { value: "all", label: "전체 정리글" },
    { value: "my", label: "내가 쓴 정리글" },
    { value: "compare", label: "공통 주제 비교" },
    { value: "feedback", label: "피드백 제안" },
  ];

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#f8f9fa] font-pretendard">
      <header className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 py-5">
        <div>
          <h1 className="text-lg font-extrabold text-gray-900">
            정리글 아카이브
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            팀의 학습 기록과 정리글을 모아보세요.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/archive/editor")}
          className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800"
        >
          <span>＋</span>
          정리글 작성
        </button>
      </header>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1 rounded-xl bg-gray-100 p-1 text-xs font-semibold">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setSelectedTab(tab.value)}
                className={`rounded-lg px-3.5 py-2 transition ${
                  selectedTab === tab.value
                    ? "bg-black text-white"
                    : "text-gray-500 hover:bg-white hover:text-gray-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Dropdown
              options={activityFilterOptions}
              value={selectedActivity}
              onChange={setSelectedActivity}
            />
            <Dropdown
              options={periodFilterOptions}
              value={selectedPeriod}
              onChange={setSelectedPeriod}
            />
          </div>
        </div>

        <section className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl text-gray-400">
            ▤
          </div>

          <h2 className="text-sm font-bold text-gray-800">
            아직 등록된 정리글이 없습니다.
          </h2>
          <p className="mt-2 max-w-sm text-xs leading-5 text-gray-400">
            배운 내용을 정리하고 팀원들과 공유해 보세요. 작성한 정리글은
            이곳에서 확인할 수 있습니다.
          </p>

          <button
            type="button"
            onClick={() => navigate("/archive/editor")}
            className="mt-5 rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            첫 정리글 작성하기
          </button>
        </section>
      </main>
    </div>
  );
}
