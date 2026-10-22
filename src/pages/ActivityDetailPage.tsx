// src/pages/ActivityDetailPage.tsx
import { useState } from "react";
import CreateActivityModal from "../components/modals/CreateActivityModal";
import CreateNoticeModal from "../components/modals/CreateNoticeModal";
import AbsenceRequestModal from "../components/modals/AbsenceRequestModal";

type TabType = "회차" | "참여자" | "출석 현황" | "정리글" | "공지";

// 데이터 타입 정의
interface Member {
  name: string;
  role: string;
  gen: string;
  avatar: string;
  attendance: string;
  isLeader: boolean;
}

interface Article {
  id: number;
  round: string;
  title: string;
  author: string;
  date: string;
  comments: number;
}

interface Notice {
  id: number;
  title: string;
  author: string;
  date: string;
  target: string;
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

export default function ActivityDetailPage() {
  const [activeTab, setActiveTab] = useState<TabType>("회차");
  const [selectedVoteTopic, setSelectedVoteTopic] = useState<number | null>(
    null,
  );

  // 모달 상태 관리
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);

  // 데이터 상태 초기화 (예시 데이터 완전히 제거)
  const [activityInfo] = useState({
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
  const [articles] = useState<Article[]>([]);
  const [notices] = useState<Notice[]>([]);

  return (
    <div className="flex-1 bg-[#f8f9fa] min-h-screen p-8 text-gray-900 font-pretendard overflow-y-auto">
      {/* 1. 최상단 서치바 & 헤더 영역 */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {activityInfo.title || "활동 상세"}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {activityInfo.scheduleText || "등록된 스케줄 정보가 없습니다."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center">
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="정리글·질문·팀원 검색"
              className="pl-8 pr-4 py-1.5 bg-gray-100 text-xs rounded-lg w-56 border border-transparent focus:bg-white focus:border-gray-300 focus:outline-none"
            />
          </div>
          <button className="p-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-lg text-xs">
            <svg
              className="w-4 h-4"
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
          </button>
          <button
            onClick={() => setIsActivityModalOpen(true)}
            className="px-3 py-1.5 bg-black text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition flex items-center gap-1.5"
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
            새로 만들기
          </button>
        </div>
      </div>

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
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1.5">
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

      {/* 4. 탭별 컨텐츠 (초기화 상태) */}

      {/* TAB 1: 회차 */}
      {activeTab === "회차" && (
        <div className="grid grid-cols-12 gap-6">
          {/* 좌측 차시 카드 리스트 (8열) */}
          <div className="col-span-8 space-y-4">
            {rounds.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-xs text-gray-400">
                등록된 회차가 없습니다.
              </div>
            ) : (
              rounds.map((round) => (
                <div
                  key={round.id}
                  className={`bg-white border rounded-2xl p-5 shadow-sm ${
                    round.status === "진행 예정"
                      ? "border-2 border-black"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-gray-500">
                      {round.roundName} · {round.date}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[11px] rounded font-medium ${
                        round.status === "진행 예정"
                          ? "bg-gray-100 text-gray-600"
                          : round.status === "완료"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {round.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">
                    {round.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    {round.description}
                  </p>

                  {round.totalMembers > 0 && (
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-gray-500 font-medium">
                        출석 {round.attendanceCount}/{round.totalMembers}
                      </span>
                      <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full"
                          style={{
                            width: `${(round.attendanceCount / round.totalMembers) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* 우측 패널 위젯 (4열) */}
          <div className="col-span-4 space-y-4">
            {/* 주제 투표 위젯 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-sm text-gray-900">주제 투표</h4>
              </div>

              {voteTopics.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">
                  진행 중인 투표가 없습니다.
                </p>
              ) : (
                <>
                  <div className="space-y-2.5">
                    {voteTopics.map((item) => (
                      <label
                        key={item.id}
                        onClick={() => setSelectedVoteTopic(item.id)}
                        className={`block p-3 rounded-xl border text-xs cursor-pointer transition relative overflow-hidden ${
                          selectedVoteTopic === item.id
                            ? "border-black font-semibold bg-gray-50/50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex justify-between items-center relative z-10 mb-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="topic"
                              checked={selectedVoteTopic === item.id}
                              onChange={() => {}}
                              className="accent-black"
                            />
                            <span>{item.text}</span>
                          </div>
                          <span className="text-gray-500 text-[11px] font-normal">
                            {item.votes}표
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>

                  <button className="w-full mt-4 py-2.5 bg-black text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition flex items-center justify-center gap-1.5">
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    투표하기
                  </button>
                </>
              )}
            </div>

            {/* 불참 요청 승인 대기 위젯 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-3">
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
                    className="p-3.5 bg-gray-50 rounded-xl space-y-3 mb-2"
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-6 h-6 rounded-full bg-black text-white font-bold flex items-center justify-center text-[10px]">
                        {req.userAvatar}
                      </div>
                      <span className="font-bold text-gray-800">
                        {req.userName}
                      </span>
                      <span className="text-gray-400">· {req.roundInfo}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed italic">
                      "{req.reason}"
                    </p>
                    <div className="flex gap-2 pt-1">
                      <button className="flex-1 py-1.5 bg-black text-white rounded-lg text-xs font-medium hover:bg-gray-800">
                        승인
                      </button>
                      <button
                        onClick={() => setIsAbsenceModalOpen(true)}
                        className="flex-1 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-100"
                      >
                        거절 + 코멘트
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 참여자 */}
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
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-black text-white font-bold flex items-center justify-center text-sm">
                      {m.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{m.name}</span>
                        {m.isLeader && (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded">
                            스터디장
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        {m.gen} · {m.role}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500 block">출석률</span>
                    <span className="text-sm font-bold text-emerald-600">
                      {m.attendance}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: 출석 현황 */}
      {activeTab === "출석 현황" && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm overflow-x-auto">
          <h3 className="text-base font-bold mb-4">회차별 출석 현황</h3>
          {members.length === 0 ? (
            <div className="text-center text-xs text-gray-400 py-12">
              출석 데이터가 없습니다.
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-500 border-b">
                <tr>
                  <th className="p-3">이름</th>
                  <th className="p-3">출석률</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {members.map((m, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-3 font-bold">
                      {m.name} ({m.gen})
                    </td>
                    <td className="p-3 text-emerald-600 font-bold">
                      {m.attendance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB 4: 정리글 */}
      {activeTab === "정리글" && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold">제출된 정리글 목록</h3>
            <button className="px-3 py-1.5 bg-black text-white text-xs rounded-lg font-medium flex items-center gap-1">
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
            <div className="text-center text-xs text-gray-400 py-12">
              등록된 정리글이 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {articles.map((a) => (
                <div
                  key={a.id}
                  className="p-4 border border-gray-100 rounded-xl hover:border-gray-300 transition flex justify-between items-center cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded font-medium">
                        {a.round}
                      </span>
                      <h4 className="text-sm font-bold text-gray-900">
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

      {/* TAB 5: 공지 */}
      {activeTab === "공지" && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold">공지사항</h3>
            <button
              onClick={() => setIsNoticeModalOpen(true)}
              className="px-3 py-1.5 bg-black text-white text-xs rounded-lg font-medium flex items-center gap-1"
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
            <div className="text-center text-xs text-gray-400 py-12">
              등록된 공지사항이 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {notices.map((n) => (
                <div
                  key={n.id}
                  className="p-4 border border-gray-100 rounded-xl hover:border-gray-300 transition"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-gray-900">
                      {n.title}
                    </span>
                    <span className="text-[11px] text-gray-400">{n.date}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    작성자: {n.author} (대상: {n.target})
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 모달 연동 */}
      {isActivityModalOpen && (
        <CreateActivityModal onClose={() => setIsActivityModalOpen(false)} />
      )}
      {isNoticeModalOpen && (
        <CreateNoticeModal onClose={() => setIsNoticeModalOpen(false)} />
      )}
      {isAbsenceModalOpen && (
        <AbsenceRequestModal onClose={() => setIsAbsenceModalOpen(false)} />
      )}
    </div>
  );
}
