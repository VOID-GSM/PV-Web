import { Header } from "../components/layout/Header";

export interface WeeklyReportPageProps {
  onOpenAddModal?: () => void;
}

export default function WeeklyReportPage({
  onOpenAddModal = () => {},
}: WeeklyReportPageProps = {}) {
  return (
    <div className="flex-1 flex flex-col h-screen bg-[#f8f9fa] overflow-hidden font-pretendard">
      <Header
        title="주간 리포트"
        subtitle="팀의 주간 활동을 한눈에 확인할 수 있는 리포트를 준비하고 있습니다."
        onOpenAddModal={onOpenAddModal}
      />

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-16 h-16 mb-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2z"
              />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-gray-900">
            주간 리포트 구현 중
          </h2>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            더 나은 주간 리포트를 제공하기 위해 준비하고 있습니다.
            <br />
            조금만 기다려 주세요!
          </p>

          <span className="mt-5 px-4 py-2 rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
            COMING SOON
          </span>
        </div>
      </div>
    </div>
  );
}
