// src/pages/ActivityDetailPage.tsx
import { useState } from "react";
import { Header } from "../components/layout/Header";
import CreateActivityModal from "../components/modals/CreateActivityModal";
import CreateNoticeModal from "../components/modals/CreateNoticeModal";
import AbsenceRequestModal from "../components/modals/AbsenceRequestModal";
import CreateArticleModal from "../components/modals/CreateArticleModal";
import ArticleDetailModal from "../components/modals/ArticleDetailModal";
import ActivitySettingsModal, {
  type ActivityInfo,
} from "../components/modals/ActivitySettingsModal";

type TabType = "회차" | "참여자" | "출석 현황" | "정리글" | "공지";

interface Article {
  id: number;
  round: string;
  title: string;
  author: string;
  date: string;
  comments: number;
  content?: string;
}

interface Member {
  name: string;
  role: string;
  gen: string;
  avatar: string;
  attendance: string;
  isLeader: boolean;
}

interface Round {
  id: number;
  roundName: string;
  date: string;
  status: "진행 예정" | "완료" | "휴강";
  title: string;
  description: string;
  attendanceCount: number;
  totalMembers: number;
}

interface VoteTopic {
  id: number;
  text: string;
  votes: number;
}

interface AbsenceRequest {
  id: number;
  userName: string;
  userAvatar: string;
  roundInfo: string;
  reason: string;
}

interface Notice {
  id: number;
  title: string;
  author: string;
  date: string;
  target: string;
}

export default function ActivityDetailPage() {
  const [activeTab, setActiveTab] = useState<TabType>("회차");
  const [selectedVoteTopic, setSelectedVoteTopic] = useState<number | null>(
    null,
  );

  // 모달 상태 관리
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // 선택된 상세 정리글 모달 상태
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // 활동 정보 상태 관리
  const [activityInfo, setActivityInfo] = useState<ActivityInfo>({
    title: "",
    statusTag: "",
    categoryTag: "",
    scheduleText: "",
    periodText: "",
    ruleText: "",
    leaderName: "",
    averageAttendance: "0%",
  });

  const [members] = useState<Member[]>([]);
  const [rounds] = useState<Round[]>([]);
  const [voteTopics] = useState<VoteTopic[]>([]);
  const [absenceRequests] = useState<AbsenceRequest[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [notices] = useState<Notice[]>([]);

  // 정리글 추가 핸들러
  const handleAddArticle = (newArticle: {
    round: string;
    title: string;
    content: string;
  }) => {
    const created: Article = {
      id: Date.now(),
      round: newArticle.round,
      title: newArticle.title,
      author: "나",
      date: new Date().toISOString().slice(0, 10).replace(/-/g, "."),
      comments: 0,
      content: newArticle.content,
    };
    setArticles((prev) => [created, ...prev]);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f8f9fa] min-h-screen font-pretendard overflow-y-auto">
      {/* 1. 공통 헤더 고정 */}
      <Header
        title="활동"
        subtitle={activityInfo.title || "활동 상세"}
        onOpenAddModal={() => setIsActivityModalOpen(true)}
      />

      <main className="p-8 flex-1">
        {/* 2. 스터디 요약 메인 카드 */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">
                {activityInfo.title || "활동 제목 없음"}
              </h2>
              {activityInfo.statusTag && (
                <span className="px-2.5 py-0.5 border border-emerald-500 text-emerald-600 bg-emerald-50 text-[11px] rounded-full font-semibold">
                  {activityInfo.statusTag}
                </span>
              )}
              {activityInfo.categoryTag && (
                <span className="px-2.5 py-0.5 bg-sky-50 text-sky-600 text-[11px] rounded-full font-semibold">
                  ● {activityInfo.categoryTag}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsNoticeModalOpen(true)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
              >
                <svg
                  className="w-3.5 h-3.5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                공지 보내기
              </button>
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
              >
                <svg
                  className="w-3.5 h-3.5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                활동 설정
              </button>
            </div>
          </div>

          {/* 안내 정보 메타 데이터 */}
          <div className="flex items-center gap-6 text-xs text-gray-600 border-b border-gray-100 pb-4 mb-4">
            <span className="flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {activityInfo.scheduleText || "일정 미정"}
            </span>
            <span className="flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {activityInfo.periodText || "기간 미정"}
            </span>
            <span className="flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {activityInfo.ruleText || "규칙 미정"}
            </span>
          </div>

          {/* 참여자 아바타 및 출석률 */}
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-medium">
                참여자 {members.length}명
              </span>
              <div className="flex -space-x-1">
                {members.map((m, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center border-2 border-white"
                  >
                    {m.avatar}
                  </div>
                ))}
              </div>
              {activityInfo.leaderName && (
                <span className="text-gray-500 ml-1">
                  스터디장 {activityInfo.leaderName}
                </span>
              )}
            </div>

            <div className="font-bold text-emerald-600 text-xs">
              평균 출석률 {activityInfo.averageAttendance}
            </div>
          </div>
        </div>

        {/* 3. 탭 네비게이션 */}
        <div className="flex border-b border-gray-200 mb-6 gap-6 text-sm">
          {(["회차", "참여자", "출석 현황", "정리글", "공지"] as TabType[]).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2.5 font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? "border-black text-black font-bold"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab}
              </button>
            ),
          )}
        </div>

        {/* 4. 탭별 컨텐츠 */}
        {activeTab === "회차" && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-8 space-y-4">
              {rounds.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-xs text-gray-400">
                  등록된 회차가 없습니다.
                </div>
              ) : (
                rounds.map((round) => (
                  <div
                    key={round.id}
                    className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
                  >
                    <h3 className="text-base font-bold">{round.title}</h3>
                  </div>
                ))
              )}
            </div>

            <div className="col-span-4 space-y-4">
              {/* 주제 투표 위젯 */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <h4 className="font-bold text-sm text-gray-900 mb-2">
                  주제 투표
                </h4>
                {voteTopics.length === 0 ? (
                  <p className="text-xs text-gray-400 py-6 text-center">
                    진행 중인 투표가 없습니다.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {voteTopics.map((topic) => (
                      <label
                        key={topic.id}
                        className="flex items-center gap-2 text-xs p-2 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="vote"
                          checked={selectedVoteTopic === topic.id}
                          onChange={() => setSelectedVoteTopic(topic.id)}
                          className="accent-black"
                        />
                        <span>
                          {topic.text} ({topic.votes}표)
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* 불참 요청 승인 대기 위젯 */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-sm text-gray-900">
                    불참 요청 승인 대기
                  </h4>
                  <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                    {absenceRequests.length}건
                  </span>
                </div>
                {absenceRequests.length === 0 ? (
                  <p className="text-xs text-gray-400 py-6 text-center">
                    대기 중인 불참 요청이 없습니다.
                  </p>
                ) : (
                  absenceRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-3 bg-gray-50 rounded-xl mb-2 text-xs"
                    >
                      <span className="font-bold">{req.userName}</span>:{" "}
                      {req.reason}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: 정리글 */}
        {activeTab === "정리글" && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold">제출된 정리글 목록</h3>
              <button
                onClick={() => setIsArticleModalOpen(true)}
                className="px-3.5 py-2 bg-black text-white text-xs rounded-xl font-semibold hover:bg-gray-800 transition flex items-center gap-1.5"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                정리글 작성하기
              </button>
            </div>

            {articles.length === 0 ? (
              <div className="text-center text-xs text-gray-400 py-12 border border-dashed border-gray-200 rounded-xl">
                작성된 정리글이 없습니다. 우측 상단 버튼을 눌러 정리글을 작성해
                보세요!
              </div>
            ) : (
              <div className="space-y-3">
                {articles.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => setSelectedArticle(a)}
                    className="p-4 border border-gray-200 rounded-xl hover:border-black transition flex justify-between items-center bg-gray-50/30 cursor-pointer group"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] rounded font-bold">
                          {a.round}
                        </span>
                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-black">
                          {a.title}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-400">
                        {a.author} · {a.date}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 font-medium flex items-center gap-1">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                        />
                      </svg>
                      피드백 {a.comments}개
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: 참여자 */}
        {activeTab === "참여자" && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold mb-4">
              스터디 참여자 ({members.length}명)
            </h3>
            {members.length === 0 ? (
              <div className="text-center text-xs text-gray-400 py-12">
                등록된 참여자가 없습니다.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {members.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-4 border border-gray-100 rounded-xl text-xs font-bold"
                  >
                    {m.name} ({m.role})
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: 출석 현황 */}
        {activeTab === "출석 현황" && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold mb-4">회차별 출석 현황</h3>
            <div className="text-center text-xs text-gray-400 py-12">
              출석 현황 데이터가 없습니다.
            </div>
          </div>
        )}

        {/* TAB: 공지 */}
        {activeTab === "공지" && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold">공지사항</h3>
              <button
                onClick={() => setIsNoticeModalOpen(true)}
                className="px-3.5 py-2 bg-black text-white text-xs rounded-xl font-semibold hover:bg-gray-800 transition flex items-center gap-1.5"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                공지 작성
              </button>
            </div>

            {notices.length === 0 ? (
              <div className="text-center text-xs text-gray-400 py-12 border border-dashed border-gray-200 rounded-xl">
                등록된 공지사항이 없습니다.
              </div>
            ) : (
              <div className="space-y-3">
                {notices.map((n) => (
                  <div
                    key={n.id}
                    className="p-4 border border-gray-200 rounded-xl text-xs"
                  >
                    <h4 className="font-bold">{n.title}</h4>
                    <p className="text-gray-400">
                      {n.author} · {n.date}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* 모달 5종 연동 */}
      {isActivityModalOpen && (
        <CreateActivityModal onClose={() => setIsActivityModalOpen(false)} />
      )}
      {isNoticeModalOpen && (
        <CreateNoticeModal onClose={() => setIsNoticeModalOpen(false)} />
      )}
      {isAbsenceModalOpen && (
        <AbsenceRequestModal onClose={() => setIsAbsenceModalOpen(false)} />
      )}
      {isArticleModalOpen && (
        <CreateArticleModal
          onClose={() => setIsArticleModalOpen(false)}
          onSubmit={handleAddArticle}
        />
      )}
      {isSettingsModalOpen && (
        <ActivitySettingsModal
          activityInfo={activityInfo}
          onClose={() => setIsSettingsModalOpen(false)}
          onSubmit={(updated) => setActivityInfo(updated)}
        />
      )}
      {selectedArticle && (
        <ArticleDetailModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </div>
  );
}
