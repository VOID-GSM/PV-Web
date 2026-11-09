import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getActivities,
  getActivity,
  getActivitySessions,
  getActivityMembers,
  getTopicCandidates,
  proposeTopicCandidate,
  voteTopicCandidate,
  cancelTopicVote,
} from "../api/activityApi";
import {
  getPendingAbsences,
  approveAbsence,
  rejectAbsence,
} from "../api/attendanceApi";
import { createComment } from "../api/commentApi";
import { createPost, getPost, getPosts } from "../api/postApi";
import { Header } from "../components/layout/Header";

import CreateNoticeModal from "../components/modals/CreateNoticeModal";
import AbsenceRequestModal from "../components/modals/AbsenceRequestModal";
import CreateArticleModal from "../components/modals/CreateArticleModal";
import ActivitySettingsModal from "../components/modals/ActivitySettingsModal";
import ArticleDetailModal, {
  type ArticleDetailData,
} from "../components/modals/ArticleDetailModal";

import bellIcon from "../assets/icons/bell.svg";
import settingsIcon from "../assets/icons/settings.svg";
import calendarIcon from "../assets/icons/calendar.svg";
import clockIcon from "../assets/icons/clock.svg";
import checkCircleIcon from "../assets/icons/check-circle.svg";
import plusIcon from "../assets/icons/plus.svg";

interface SessionItem {
  id: string;
  sessionNum: string;
  date: string;
  title: string;
  description: string;
  status: "진행 예정" | "완료" | "휴강";
}

interface VoteItem {
  id: string;
  text: string;
  votes: number;
  voted?: boolean;
}

interface AbsenceRequest {
  id: string;
  name: string;
  session: string;
  reason: string;
}

export default function ActivityDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("회차");

  // 활동 정보 상태
  const [activityTitle, setActivityTitle] = useState("활동 제목 없음");
  const [activitySchedule, setActivitySchedule] = useState("일정 미정");
  const [activityPeriod, setActivityPeriod] = useState("기간 미정");
  const [activityRule, setActivityRule] = useState("규칙 미정");
  const [members, setMembers] = useState<string[]>([]);

  // 탭별 데이터 상태
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [votes, setVotes] = useState<VoteItem[]>([]);
  const [selectedVoteOption, setSelectedVoteOption] = useState<number | null>(
    null,
  );
  const [isSubmittingTopic, setIsSubmittingTopic] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [absenceRequests, setAbsenceRequests] = useState<AbsenceRequest[]>([]);

  // 정리글
  const [articles, setArticles] = useState<ArticleDetailData[]>([]);
  const [selectedArticle, setSelectedArticle] =
    useState<ArticleDetailData | null>(null);

  // 모달 제어 상태
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);
  const [isCreateArticleOpen, setIsCreateArticleOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!id) {
      getActivities()
        .then((activities) => {
          if (cancelled) return;

          if (activities.length > 0) {
            navigate(`/activity/${activities[0].id}`, { replace: true });
          } else {
            setActivityTitle("등록된 활동이 없습니다");
          }
        })
        .catch((error: unknown) =>
          console.error("활동 목록 조회 실패:", error),
        );

      return () => {
        cancelled = true;
      };
    }

    const activityId = Number(id);

    if (!Number.isFinite(activityId)) return;

    Promise.all([
      getActivity(activityId),
      getActivitySessions(activityId),
      getActivityMembers(activityId),
      getPendingAbsences().catch((error: unknown) => {
        console.error("결석 요청 조회 실패:", error);
        return [];
      }),
    ])
      .then(async ([detail, apiSessions, apiMembers, absences]) => {
        if (cancelled) return;

        setActivityTitle(detail.summary.name);
        setActivitySchedule(
          detail.summary.statusLabel || detail.summary.status || "일정 미정",
        );
        setActivityPeriod(
          `${detail.summary.startDate} ~ ${detail.summary.endDate}`,
        );
        setActivityRule(
          detail.topicModeLabel || detail.topicMode || "규칙 미정",
        );
        setMembers(apiMembers.map((member) => member.name));

        const mappedSessions: SessionItem[] = apiSessions.map((session) => ({
          id: String(session.id),
          sessionNum: `${session.sessionNo ?? ""}회차`,
          date: session.sessionDate ?? "",
          title: session.topic || "주제 미정",
          description: "",
          status:
            session.status === "DONE"
              ? "완료"
              : session.status === "CANCELLED"
                ? "휴강"
                : "진행 예정",
        }));

        setSessions(mappedSessions);

        const postSummaries = await getPosts(
          { activityId, validRange: false },
          0,
          50,
        ).catch((error: unknown) => {
          console.error("활동 정리글 조회 실패:", error);
          return { content: [] };
        });

        const mappedPosts = await Promise.all(
          postSummaries.content.map(async (summary) => {
            try {
              const post = await getPost(summary.id);

              return {
                id: String(post.id),
                session: `회차 ${apiSessions.find((session) => session.id === post.sessionId)?.sessionNo ?? ""}`,
                author: String(post.authorId),
                date: (post.createdAt || "").slice(0, 10),
                title: post.title,
                content: post.content,
                feedbacks: [],
              };
            } catch {
              return {
                id: String(summary.id),
                session: "회차 미지정",
                author: String(summary.authorId),
                date: (summary.createdAt || "").slice(0, 10),
                title: summary.title,
                content: "",
                feedbacks: [],
              };
            }
          }),
        );

        setArticles(mappedPosts);

        setAbsenceRequests(
          absences
            .filter(
              (absence) =>
                absence.activityId === activityId &&
                absence.status === "REQUESTED",
            )
            .map((absence) => ({
              id: String(absence.id),
              name: `팀원 ${absence.memberId}`,
              session: `${apiSessions.find((session) => session.id === absence.sessionId)?.sessionNo ?? ""}회차`,
              reason: absence.reason,
            })),
        );

        if (apiSessions[0]) {
          const candidates = await getTopicCandidates(
            activityId,
            apiSessions[0].id,
          ).catch((error: unknown) => {
            console.error("주제 후보 조회 실패:", error);
            return [];
          });

          if (!cancelled) {
            setVotes(
              candidates.map((candidate) => ({
                id: String(candidate.id),
                text: candidate.title,
                votes: candidate.voteCount,
                voted: candidate.voted,
              })),
            );

            const votedIndex = candidates.findIndex(
              (candidate) => candidate.voted,
            );

            setSelectedVoteOption(votedIndex >= 0 ? votedIndex : null);
          }
        } else {
          setVotes([]);
          setSelectedVoteOption(null);
        }
      })
      .catch((error: unknown) => {
        console.error("활동 상세 API 조회 실패:", error);

        if (!cancelled) {
          setActivityTitle("활동 정보를 불러오지 못했습니다");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  // 주제 후보 목록 새로고침
  const refreshTopicCandidates = async () => {
    if (!id || !sessions[0]) return;

    const candidates = await getTopicCandidates(
      Number(id),
      Number(sessions[0].id),
    );

    const mappedCandidates: VoteItem[] = candidates.map((candidate) => ({
      id: String(candidate.id),
      text: candidate.title,
      votes: candidate.voteCount,
      voted: candidate.voted,
    }));

    setVotes(mappedCandidates);

    const votedIndex = mappedCandidates.findIndex(
      (candidate) => candidate.voted,
    );

    setSelectedVoteOption(votedIndex >= 0 ? votedIndex : null);
  };

  // 주제 후보 등록
  const handleProposeTopic = async () => {
    if (!id || !sessions[0]) {
      alert("주제를 등록할 회차가 없습니다.");
      return;
    }

    const title = window.prompt("제안할 주제를 입력해 주세요.");

    if (!title?.trim()) return;

    try {
      setIsSubmittingTopic(true);

      await proposeTopicCandidate(
        Number(id),
        Number(sessions[0].id),
        title.trim(),
      );

      await refreshTopicCandidates();

      alert("주제가 등록되었습니다.");
    } catch (error) {
      console.error("주제 후보 등록 실패:", error);

      alert(
        error instanceof Error ? error.message : "주제를 등록하지 못했습니다.",
      );
    } finally {
      setIsSubmittingTopic(false);
    }
  };

  // 결석 요청 승인
  const handleApproveAbsence = async (id: string) => {
    try {
      await approveAbsence(Number(id));

      setAbsenceRequests((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("결석 요청 승인 실패:", error);

      alert(
        error instanceof Error
          ? error.message
          : "결석 요청을 승인하지 못했습니다.",
      );
    }
  };

  // 결석 요청 거절
  const handleRejectAbsence = async (id: string) => {
    const comment = window.prompt("거절 사유를 입력해 주세요.");

    if (!comment?.trim()) return;

    try {
      await rejectAbsence(Number(id), comment.trim());

      setAbsenceRequests((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("결석 요청 거절 실패:", error);

      alert(
        error instanceof Error
          ? error.message
          : "결석 요청을 거절하지 못했습니다.",
      );
    }
  };

  // 정리글 피드백
  const handleAddFeedback = async (articleId: string, feedbackText: string) => {
    if (!/^\d+$/.test(articleId)) return;

    try {
      const comment = await createComment({
        targetType: "NOTE",
        targetId: Number(articleId),
        content: feedbackText,
      });

      setArticles((prev) =>
        prev.map((art) =>
          art.id === articleId
            ? {
                ...art,
                feedbacks: [
                  ...art.feedbacks,
                  {
                    id: String(comment.id),
                    author: `회원 ${comment.authorId}`,
                    text: comment.content,
                    date: (comment.createdAt || "")
                      .slice(0, 16)
                      .replace("T", " "),
                  },
                ],
              }
            : art,
        ),
      );
    } catch (error) {
      console.error("정리글 피드백 작성 실패:", error);

      alert(
        error instanceof Error
          ? error.message
          : "피드백을 저장하지 못했습니다.",
      );
    }
  };

  // 주제 투표 및 취소
  const handleVoteCandidate = async (candidateId: string) => {
    if (!id || !sessions[0] || isVoting) return;

    const activityId = Number(id);
    const sessionId = Number(sessions[0].id);
    const candidate = votes.find((item) => item.id === candidateId);

    if (!candidate) return;

    try {
      setIsVoting(true);

      if (candidate.voted) {
        await cancelTopicVote(activityId, sessionId, Number(candidateId));
      } else {
        const current = votes.find((item) => item.voted);

        if (current) {
          await cancelTopicVote(activityId, sessionId, Number(current.id));
        }

        await voteTopicCandidate(activityId, sessionId, Number(candidateId));
      }

      await refreshTopicCandidates();
    } catch (error) {
      console.error("주제 투표 실패:", error);

      alert(
        error instanceof Error ? error.message : "투표를 저장하지 못했습니다.",
      );
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col h-screen overflow-hidden bg-[#f8f9fa] font-pretendard select-none">
      <Header
        title={activityTitle}
        subtitle="모든 보드의 마감·회의·활동을 한 화면에서"
      />

      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* 상단 활동 요약 카드 */}
        <div className="rounded-3xl bg-white p-6 shadow-xs border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black text-gray-900">
                {activityTitle}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-medium text-gray-400">
                <span className="flex items-center gap-1.5">
                  <img
                    src={calendarIcon}
                    alt=""
                    className="h-3.5 w-3.5 opacity-40"
                  />
                  <span>{activitySchedule}</span>
                </span>

                <span className="flex items-center gap-1.5">
                  <img
                    src={clockIcon}
                    alt=""
                    className="h-3.5 w-3.5 opacity-40"
                  />
                  <span>{activityPeriod}</span>
                </span>

                <span className="flex items-center gap-1.5">
                  <img
                    src={checkCircleIcon}
                    alt=""
                    className="h-3.5 w-3.5 opacity-40"
                  />
                  <span>{activityRule}</span>
                </span>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs">
                <span className="font-bold text-gray-700">
                  참여자 {members.length}명
                </span>

                {members.length > 0 && (
                  <div className="flex -space-x-1.5">
                    {members.map((member, index) => (
                      <div
                        key={index}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white border-2 border-white"
                      >
                        {member[0]}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl">
                평균 출석률 0%
              </span>

              <button
                type="button"
                onClick={() => setIsNoticeModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                <img src={bellIcon} alt="" className="h-3.5 w-3.5 opacity-70" />
                <span>공지 보내기</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                <img
                  src={settingsIcon}
                  alt=""
                  className="h-3.5 w-3.5 opacity-70"
                />
                <span>활동 설정</span>
              </button>
            </div>
          </div>
        </div>

        {/* 대시보드 그리드 */}
        <div className="grid grid-cols-12 gap-6">
          {/* 좌측 콘텐츠 탭 */}
          <div className="col-span-8 space-y-4">
            <div className="flex gap-6 border-b border-gray-200 pb-2 text-xs font-bold text-gray-400">
              {["회차", "참여자", "출석 현황", "정리글", "공지"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 relative cursor-pointer transition ${
                    activeTab === tab
                      ? "text-gray-900 border-b-2 border-black font-extrabold"
                      : "hover:text-gray-600"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* 회차 탭 */}
            {activeTab === "회차" && (
              <div>
                {sessions.length === 0 ? (
                  <div className="rounded-3xl bg-white p-16 text-center text-xs text-gray-400 shadow-xs border border-gray-100">
                    등록된 회차가 없습니다.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="rounded-3xl bg-white p-5 shadow-xs border border-gray-100 hover:shadow-md transition"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-400">
                                {session.sessionNum} {session.date}
                              </span>

                              <h3 className="text-base font-bold text-gray-900">
                                {session.title}
                              </h3>
                            </div>

                            <p className="mt-1 text-xs text-gray-500">
                              {session.description}
                            </p>
                          </div>

                          <span className="rounded-full bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1">
                            {session.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 참여자 탭 */}
            {activeTab === "참여자" && (
              <div className="rounded-3xl bg-white p-6 shadow-xs border border-gray-100 space-y-4">
                <h3 className="font-bold text-gray-900 text-sm">
                  스터디 참여자 ({members.length}명)
                </h3>

                {members.length === 0 ? (
                  <div className="py-12 text-center text-xs text-gray-400">
                    등록된 참여자가 없습니다.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {members.map((member, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl"
                      >
                        <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                          {member[0]}
                        </div>

                        <span className="font-bold text-xs text-gray-800">
                          {member}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 출석 현황 탭 */}
            {activeTab === "출석 현황" && (
              <div className="rounded-3xl bg-white p-6 shadow-xs border border-gray-100 space-y-4">
                <h3 className="font-bold text-gray-900 text-sm">
                  회차별 출석 현황
                </h3>

                <div className="py-16 text-center text-xs text-gray-400">
                  출석 현황 데이터가 없습니다.
                </div>
              </div>
            )}

            {/* 정리글 탭 */}
            {activeTab === "정리글" && (
              <div className="rounded-3xl bg-white p-6 shadow-xs border border-gray-100 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-900 text-sm">
                    제출된 정리글 목록
                  </h3>

                  <button
                    type="button"
                    onClick={() => setIsCreateArticleOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition cursor-pointer"
                  >
                    <img
                      src={plusIcon}
                      alt=""
                      className="h-3.5 w-3.5 filter invert"
                    />
                    <span>정리글 작성하기</span>
                  </button>
                </div>

                {articles.length === 0 ? (
                  <div className="py-12 text-center text-xs text-gray-400">
                    제출된 정리글이 없습니다.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {articles.map((article) => (
                      <div
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}
                        className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/70 border border-gray-100 hover:bg-gray-100/60 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className="rounded-md bg-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-600">
                            {article.session}
                          </span>

                          <span className="font-bold text-xs text-gray-900">
                            {article.title}
                          </span>

                          <span className="text-[11px] text-gray-400">
                            {article.author} · {article.date}
                          </span>
                        </div>

                        <span className="text-[11px] font-semibold text-gray-500">
                          피드백 {article.feedbacks.length}개
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 공지 탭 */}
            {activeTab === "공지" && (
              <div className="rounded-3xl bg-white p-6 shadow-xs border border-gray-100 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-900 text-sm">공지사항</h3>

                  <button
                    type="button"
                    onClick={() => setIsNoticeModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition cursor-pointer"
                  >
                    <img
                      src={plusIcon}
                      alt=""
                      className="h-3.5 w-3.5 filter invert"
                    />
                    <span>공지 작성</span>
                  </button>
                </div>

                <div className="py-12 text-center text-xs text-gray-400">
                  등록된 공지사항이 없습니다.
                </div>
              </div>
            )}
          </div>

          {/* 우측 카드 영역 */}
          <div className="col-span-4 space-y-4">
            {/* 주제 투표 카드 */}
            <div className="rounded-3xl bg-white p-5 shadow-xs border border-gray-100 text-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">주제 투표</h3>

                  <p className="mt-1 text-[11px] text-gray-400">
                    함께 진행할 활동 주제를 정해 보세요.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleProposeTopic}
                  disabled={isSubmittingTopic || sessions.length === 0}
                  className="rounded-xl bg-black px-3 py-2 text-[11px] font-bold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isSubmittingTopic ? "등록 중..." : "+ 주제 제안"}
                </button>
              </div>

              {sessions.length === 0 ? (
                <div className="py-8 text-center text-gray-400">
                  회차가 등록되면 주제를 제안할 수 있습니다.
                </div>
              ) : votes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 py-8 text-center">
                  <p className="font-semibold text-gray-600">
                    아직 등록된 주제가 없습니다.
                  </p>

                  <p className="mt-1 text-[11px] text-gray-400">
                    첫 번째 주제를 제안해 보세요.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {votes.map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        disabled={isVoting}
                        onClick={() => setSelectedVoteOption(index)}
                        className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition disabled:opacity-60 ${
                          selectedVoteOption === index
                            ? "border-black bg-gray-50 ring-1 ring-black"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                              selectedVoteOption === index
                                ? "border-black bg-black"
                                : "border-gray-300 bg-white"
                            }`}
                          >
                            {selectedVoteOption === index && (
                              <span className="h-1.5 w-1.5 rounded-full bg-white" />
                            )}
                          </span>

                          <span className="font-medium text-gray-800">
                            {item.text}
                          </span>
                        </div>

                        <span className="text-[11px] font-bold text-gray-400">
                          {item.votes}표
                        </span>
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={selectedVoteOption === null || isVoting}
                    onClick={() => {
                      if (selectedVoteOption === null) return;

                      const selected = votes[selectedVoteOption];

                      if (selected) {
                        void handleVoteCandidate(
                          selected.id,
                        );
                      }
                    }}
                    className="w-full rounded-xl bg-black py-3 font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                  >
                    {isVoting
                      ? "처리 중..."
                      : selectedVoteOption !== null &&
                          votes[selectedVoteOption]?.voted
                        ? "선택한 투표 취소하기"
                        : "선택한 주제에 투표하기"}
                  </button>
                </>
              )}
            </div>

            {/* 불참 요청 승인 대기 카드 */}
            <div className="rounded-3xl bg-white p-5 shadow-xs border border-gray-100 text-xs space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-900 text-sm">
                  불참 요청 승인 대기
                </h3>

                <span className="rounded-full bg-red-500 text-white text-[10px] font-bold px-2 py-0.5">
                  {absenceRequests.length}건
                </span>
              </div>

              {absenceRequests.length === 0 ? (
                <p className="py-8 text-center text-gray-400">
                  대기 중인 불참 요청이 없습니다.
                </p>
              ) : (
                absenceRequests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-2xl bg-gray-50 p-4 space-y-2 border border-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                        {request.name[0]}
                      </div>

                      <span className="font-bold text-gray-900">
                        {request.name}
                      </span>

                      <span className="text-gray-400">· {request.session}</span>
                    </div>

                    <p className="text-[11px] text-gray-600 leading-relaxed bg-white p-2.5 rounded-xl border border-gray-100">
                      "{request.reason}"
                    </p>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleApproveAbsence(request.id)}
                        className="flex-1 rounded-xl bg-black py-1.5 font-bold text-white hover:bg-gray-800 transition cursor-pointer"
                      >
                        승인
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRejectAbsence(request.id)}
                        className="flex-1 rounded-xl border border-gray-200 py-1.5 font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
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
      </div>

      {/* 모달 연동 레이어 */}
      <CreateNoticeModal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
      />

      <AbsenceRequestModal
        isOpen={isAbsenceModalOpen}
        onClose={() => setIsAbsenceModalOpen(false)}
      />

      <CreateArticleModal
        isOpen={isCreateArticleOpen}
        onClose={() => setIsCreateArticleOpen(false)}
        mode="article"
        onSubmitSuccess={async (data) => {
          const sessionNo = Number(data.session.match(/^\d+/)?.[0]);

          const session = sessions.find(
            (item) => Number(item.sessionNum.match(/^\d+/)?.[0]) === sessionNo,
          );

          try {
            const post = await createPost({
              title: data.title.trim(),
              content: data.content,
              sessionId: session ? Number(session.id) : undefined,
            });

            setArticles((current) => [
              {
                id: String(post.id),
                session: session?.sessionNum ?? "회차 미지정",
                author: String(post.authorId),
                date: (
                  post.createdAt || new Date().toLocaleDateString("sv-SE")
                ).slice(0, 10),
                title: post.title,
                content: post.content,
                feedbacks: [],
              },
              ...current,
            ]);
          } catch (error) {
            console.error("활동 정리글 생성 실패:", error);

            alert(
              error instanceof Error
                ? error.message
                : "정리글을 생성하지 못했습니다.",
            );
          }
        }}
      />

      <ActivitySettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSave={(data) => {
          if (data.title) setActivityTitle(data.title);
          if (data.schedule) setActivitySchedule(data.schedule);
          if (data.period) setActivityPeriod(data.period);
          if (data.rule) setActivityRule(data.rule);
        }}
      />

      <ArticleDetailModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        onAddFeedback={handleAddFeedback}
      />
    </div>
  );
}
