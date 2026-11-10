import { useCallback, useEffect, useState } from "react";
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
import { getNotice, getNotices, type NoticeItem } from "../api/noticeApi";
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
import MarkdownPreview from "../components/common/MarkdownPreview";

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

type ActivityNotice = NoticeItem & {
  content?: string;
};

const TABS = ["회차", "참여자", "출석 현황", "정리글", "공지"];

export default function ActivityDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const activityId = Number(id);

  const [activeTab, setActiveTab] = useState("회차");

  const [activityTitle, setActivityTitle] = useState("활동 제목 없음");
  const [activitySchedule, setActivitySchedule] = useState("일정 미정");
  const [activityPeriod, setActivityPeriod] = useState("기간 미정");
  const [activityRule, setActivityRule] = useState("규칙 미정");
  const [members, setMembers] = useState<string[]>([]);

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [votes, setVotes] = useState<VoteItem[]>([]);
  const [selectedVoteOption, setSelectedVoteOption] = useState<number | null>(
    null,
  );
  const [isSubmittingTopic, setIsSubmittingTopic] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  // 주제 제안 모달
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [topicTitle, setTopicTitle] = useState("");

  // Toast 알림
  const [toast, setToast] = useState<{
    id: number;
    message: string;
    type: "success" | "info";
  } | null>(null);

  const showToast = (message: string, type: "success" | "info" = "info") => {
    setToast((prev) => ({
      id: (prev?.id ?? 0) + 1,
      message,
      type,
    }));
  };

  const closeToast = useCallback(() => setToast(null), []);
  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [toast]);

  const [absenceRequests, setAbsenceRequests] = useState<AbsenceRequest[]>([]);

  const [articles, setArticles] = useState<ArticleDetailData[]>([]);
  const [selectedArticle, setSelectedArticle] =
    useState<ArticleDetailData | null>(null);

  const [notices, setNotices] = useState<ActivityNotice[]>([]);
  const [expandedNoticeId, setExpandedNoticeId] = useState<number | null>(null);
  const [loadingNoticeId, setLoadingNoticeId] = useState<number | null>(null);
  const [noticeDetailErrors, setNoticeDetailErrors] = useState<
    Record<number, string>
  >({});
  const [isLoadingNotices, setIsLoadingNotices] = useState(true);
  const [noticeError, setNoticeError] = useState("");

  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);
  const [isCreateArticleOpen, setIsCreateArticleOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const refreshNotices = useCallback(async () => {
    if (!id || !Number.isFinite(activityId)) return;

    try {
      setIsLoadingNotices(true);
      setNoticeError("");
      const response = await getNotices(activityId, 50);
      setNotices(response.items ?? []);
    } catch (error) {
      console.error("공지사항 조회 실패:", error);
      setNoticeError(
        error instanceof Error
          ? error.message
          : "공지사항을 불러오지 못했습니다.",
      );
    } finally {
      setIsLoadingNotices(false);
    }
  }, [id, activityId]);

  const refreshTopicCandidates = useCallback(
    async (targetActivityId: number, sessionId: number) => {
      const candidates = await getTopicCandidates(targetActivityId, sessionId);
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
    },
    [],
  );

  const loadNoticeDetail = async (noticeId: number) => {
    try {
      setLoadingNoticeId(noticeId);
      setNoticeDetailErrors((previous) => {
        const next = { ...previous };
        delete next[noticeId];
        return next;
      });

      const detail = await getNotice(noticeId);
      setNotices((previous) =>
        previous.map((notice) =>
          notice.id === noticeId ? { ...notice, ...detail } : notice,
        ),
      );

      if (!detail.content?.trim()) {
        setNoticeDetailErrors((previous) => ({
          ...previous,
          [noticeId]: "상세 조회 응답에 공지 내용(content)이 없습니다.",
        }));
      }
    } catch (error) {
      console.error("공지 상세 조회 실패:", error);
      setNoticeDetailErrors((previous) => ({
        ...previous,
        [noticeId]:
          error instanceof Error
            ? error.message
            : "공지 내용을 불러오지 못했습니다.",
      }));
    } finally {
      setLoadingNoticeId(null);
    }
  };

  const handleToggleNotice = (notice: ActivityNotice) => {
    if (expandedNoticeId === notice.id) {
      setExpandedNoticeId(null);
      return;
    }

    setExpandedNoticeId(notice.id);
    if (!notice.content?.trim()) {
      void loadNoticeDetail(notice.id);
    }
  };

  useEffect(() => {
    if (!id || !Number.isFinite(activityId)) {
      setIsLoadingNotices(false);
      return;
    }

    let cancelled = false;

    const loadNotices = async () => {
      try {
        setIsLoadingNotices(true);
        const response = await getNotices(activityId, 50);
        if (!cancelled) {
          setNotices(response.items ?? []);
          setNoticeError("");
        }
      } catch (error) {
        console.error("공지사항 조회 실패:", error);
        if (!cancelled) {
          setNoticeError(
            error instanceof Error
              ? error.message
              : "공지사항을 불러오지 못했습니다.",
          );
        }
      } finally {
        if (!cancelled) setIsLoadingNotices(false);
      }
    };

    void loadNotices();
    return () => {
      cancelled = true;
    };
  }, [id, activityId]);

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
        .catch((error: unknown) => {
          console.error("활동 목록 조회 실패:", error);
        });

      return () => {
        cancelled = true;
      };
    }

    const currentActivityId = Number(id);
    if (!Number.isFinite(currentActivityId)) {
      setActivityTitle("잘못된 활동 주소입니다");
      return;
    }

    const loadActivity = async () => {
      try {
        const [detail, apiSessions, apiMembers, absences] = await Promise.all([
          getActivity(currentActivityId),
          getActivitySessions(currentActivityId),
          getActivityMembers(currentActivityId),
          getPendingAbsences().catch((error: unknown) => {
            console.error("결석 요청 조회 실패:", error);
            return [];
          }),
        ]);

        if (cancelled) return;

        setActivityTitle(detail.summary.name);
        setActivitySchedule(
          detail.summary.statusLabel || detail.summary.status || "일정 미정",
        );
        setActivityPeriod(
          `${detail.summary.startDate ?? ""} ~ ${detail.summary.endDate ?? ""}`,
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
          { activityId: currentActivityId, validRange: false },
          0,
          50,
        ).catch((error: unknown) => {
          console.error("활동 정리글 조회 실패:", error);
          return { content: [] };
        });

        if (cancelled) return;

        const mappedPosts = await Promise.all(
          postSummaries.content.map(async (summary) => {
            try {
              const post = await getPost(summary.id);
              const sessionNo = apiSessions.find(
                (session) => session.id === post.sessionId,
              )?.sessionNo;

              return {
                id: String(post.id),
                session: `회차 ${sessionNo ?? ""}`,
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

        if (cancelled) return;
        setArticles(mappedPosts);

        setAbsenceRequests(
          absences
            .filter(
              (absence) =>
                absence.activityId === currentActivityId &&
                absence.status === "REQUESTED",
            )
            .map((absence) => ({
              id: String(absence.id),
              name: `팀원 ${absence.memberId}`,
              session: `${
                apiSessions.find((session) => session.id === absence.sessionId)
                  ?.sessionNo ?? ""
              }회차`,
              reason: absence.reason,
            })),
        );

        if (apiSessions[0]) {
          try {
            await refreshTopicCandidates(currentActivityId, apiSessions[0].id);
          } catch (error) {
            console.error("주제 후보 조회 실패:", error);
            if (!cancelled) {
              setVotes([]);
              setSelectedVoteOption(null);
            }
          }
        } else {
          setVotes([]);
          setSelectedVoteOption(null);
        }
      } catch (error) {
        console.error("활동 상세 API 조회 실패:", error);
        if (!cancelled) {
          setActivityTitle("활동 정보를 불러오지 못했습니다");
        }
      }
    };

    void loadActivity();

    return () => {
      cancelled = true;
    };
  }, [id, navigate, refreshTopicCandidates]);

  const handleProposeTopic = () => {
    if (!id || !sessions[0]) {
      showToast("주제를 제안할 회차가 없습니다.");
      return;
    }

    setTopicTitle("");
    setIsTopicModalOpen(true);
  };

  const handleSubmitTopic = async () => {
    const title = topicTitle.trim();

    if (!title) {
      showToast("제안할 주제를 입력해 주세요.");
      return;
    }

    if (!sessions[0]) {
      showToast("주제를 제안할 회차가 없습니다.");
      setIsTopicModalOpen(false);
      return;
    }

    const sessionId = Number(sessions[0].id);

    try {
      setIsSubmittingTopic(true);

      await proposeTopicCandidate(activityId, sessionId, title);
      await refreshTopicCandidates(activityId, sessionId);

      setIsTopicModalOpen(false);
      setTopicTitle("");

      showToast("주제가 제안되었습니다.", "success");
    } catch (error) {
      console.error("주제 제안 실패:", error);

      showToast(
        error instanceof Error ? error.message : "주제를 제안하지 못했습니다.",
      );
    } finally {
      setIsSubmittingTopic(false);
    }
  };

  const handleVoteCandidate = async () => {
    if (!id || !sessions[0]) {
      alert("투표할 회차가 없습니다.");
      return;
    }
    if (selectedVoteOption === null) {
      alert("투표할 주제를 선택해 주세요.");
      return;
    }

    const selectedCandidate = votes[selectedVoteOption];
    if (!selectedCandidate) return;

    const sessionId = Number(sessions[0].id);
    const candidateId = Number(selectedCandidate.id);

    try {
      setIsVoting(true);

      if (selectedCandidate.voted) {
        await cancelTopicVote(activityId, sessionId, candidateId);
      } else {
        const currentVotedCandidate = votes.find((item) => item.voted);
        if (currentVotedCandidate) {
          await cancelTopicVote(
            activityId,
            sessionId,
            Number(currentVotedCandidate.id),
          );
        }
        await voteTopicCandidate(activityId, sessionId, candidateId);
      }

      await refreshTopicCandidates(activityId, sessionId);
    } catch (error) {
      console.error("주제 투표 실패:", error);
      alert(
        error instanceof Error ? error.message : "투표를 저장하지 못했습니다.",
      );
    } finally {
      setIsVoting(false);
    }
  };

  const handleApproveAbsence = async (absenceId: string) => {
    try {
      await approveAbsence(Number(absenceId));
      setAbsenceRequests((previous) =>
        previous.filter((item) => item.id !== absenceId),
      );
    } catch (error) {
      console.error("결석 요청 승인 실패:", error);
      alert(
        error instanceof Error
          ? error.message
          : "결석 요청을 승인하지 못했습니다.",
      );
    }
  };

  const handleRejectAbsence = async (absenceId: string) => {
    const comment = window.prompt("거절 사유를 입력해 주세요.");
    if (!comment?.trim()) return;

    try {
      await rejectAbsence(Number(absenceId), comment.trim());
      setAbsenceRequests((previous) =>
        previous.filter((item) => item.id !== absenceId),
      );
    } catch (error) {
      console.error("결석 요청 거절 실패:", error);
      alert(
        error instanceof Error
          ? error.message
          : "결석 요청을 거절하지 못했습니다.",
      );
    }
  };

  const handleAddFeedback = async (articleId: string, feedbackText: string) => {
    if (!/^\d+$/.test(articleId)) return;

    try {
      const comment = await createComment({
        targetType: "NOTE",
        targetId: Number(articleId),
        content: feedbackText,
      });

      setArticles((previous) =>
        previous.map((article) =>
          article.id === articleId
            ? {
                ...article,
                feedbacks: [
                  ...article.feedbacks,
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
            : article,
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

  return (
    <div className="flex h-screen flex-1 flex-col overflow-hidden bg-[#f8f9fa] font-pretendard select-none">
      <Header
        title={activityTitle}
        subtitle="모든 보드의 마감·회의·활동을 한 화면에서"
      />

      <div className="flex-1 space-y-6 overflow-y-auto p-8">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xs">
          <div className="flex items-start justify-between gap-4">
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
                  {activitySchedule}
                </span>
                <span className="flex items-center gap-1.5">
                  <img
                    src={clockIcon}
                    alt=""
                    className="h-3.5 w-3.5 opacity-40"
                  />
                  {activityPeriod}
                </span>
                <span className="flex items-center gap-1.5">
                  <img
                    src={checkCircleIcon}
                    alt=""
                    className="h-3.5 w-3.5 opacity-40"
                  />
                  {activityRule}
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
                        key={`${member}-${index}`}
                        className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-black text-[10px] font-bold text-white"
                      >
                        {member[0] ?? "?"}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <span className="rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600">
                평균 출석률 0%
              </span>
              <button
                type="button"
                onClick={() => setIsNoticeModalOpen(true)}
                className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                <img src={bellIcon} alt="" className="h-3.5 w-3.5 opacity-70" />
                공지 보내기
              </button>
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(true)}
                className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                <img
                  src={settingsIcon}
                  alt=""
                  className="h-3.5 w-3.5 opacity-70"
                />
                활동 설정
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8 space-y-4">
            <div className="flex gap-6 border-b border-gray-200 pb-2 text-xs font-bold text-gray-400">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`relative cursor-pointer pb-2 transition ${
                    activeTab === tab
                      ? "border-b-2 border-black font-extrabold text-gray-900"
                      : "hover:text-gray-600"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "회차" && (
              <div>
                {sessions.length === 0 ? (
                  <div className="rounded-3xl border border-gray-100 bg-white p-16 text-center text-xs text-gray-400 shadow-xs">
                    등록된 회차가 없습니다.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="rounded-3xl border border-gray-100 bg-white p-5 shadow-xs transition hover:shadow-md"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
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
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
                            {session.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "참여자" && (
              <div className="space-y-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-xs">
                <h3 className="text-sm font-bold text-gray-900">
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
                        key={`${member}-${index}`}
                        className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
                          {member[0] ?? "?"}
                        </div>
                        <span className="text-xs font-bold text-gray-800">
                          {member}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "출석 현황" && (
              <div className="space-y-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-xs">
                <h3 className="text-sm font-bold text-gray-900">
                  회차별 출석 현황
                </h3>
                <div className="py-16 text-center text-xs text-gray-400">
                  출석 현황 데이터가 없습니다.
                </div>
              </div>
            )}

            {activeTab === "정리글" && (
              <div className="space-y-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900">
                    제출된 정리글 목록
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsCreateArticleOpen(true)}
                    className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-black px-4 py-2 text-xs font-bold text-white transition hover:bg-gray-800"
                  >
                    <img src={plusIcon} alt="" className="h-3.5 w-3.5 invert" />
                    정리글 작성하기
                  </button>
                </div>

                {articles.length === 0 ? (
                  <div className="py-12 text-center text-xs text-gray-400">
                    제출된 정리글이 없습니다.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {articles.map((article) => (
                      <button
                        key={article.id}
                        type="button"
                        onClick={() => setSelectedArticle(article)}
                        className="flex w-full cursor-pointer items-center justify-between rounded-2xl border border-gray-100 bg-gray-50/70 p-4 text-left transition hover:bg-gray-100/60"
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="shrink-0 rounded-md bg-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-600">
                            {article.session}
                          </span>
                          <span className="truncate text-xs font-bold text-gray-900">
                            {article.title}
                          </span>
                        </span>
                        <span className="ml-3 shrink-0 text-[11px] text-gray-400">
                          {article.author} · {article.date} · 피드백{" "}
                          {article.feedbacks.length}개
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "공지" && (
              <div className="space-y-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900">
                    공지사항 ({notices.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsNoticeModalOpen(true)}
                    className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-black px-4 py-2 text-xs font-bold text-white transition hover:bg-gray-800"
                  >
                    <img src={plusIcon} alt="" className="h-3.5 w-3.5 invert" />
                    공지 작성
                  </button>
                </div>

                {isLoadingNotices ? (
                  <div className="py-12 text-center text-xs text-gray-400">
                    공지사항을 불러오는 중입니다.
                  </div>
                ) : noticeError ? (
                  <div className="py-12 text-center text-xs text-red-500">
                    <p>{noticeError}</p>
                    <button
                      type="button"
                      onClick={() => void refreshNotices()}
                      className="mt-2 font-bold underline"
                    >
                      다시 시도
                    </button>
                  </div>
                ) : notices.length === 0 ? (
                  <div className="py-12 text-center text-xs text-gray-400">
                    등록된 공지사항이 없습니다.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notices.map((notice) => {
                      const isExpanded = expandedNoticeId === notice.id;

                      return (
                        <div
                          key={notice.id}
                          className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50"
                        >
                          <button
                            type="button"
                            aria-expanded={isExpanded}
                            onClick={() => handleToggleNotice(notice)}
                            className="flex w-full items-center justify-between gap-3 p-4 text-left transition hover:bg-gray-100"
                          >
                            <span className="min-w-0 truncate text-sm font-bold text-gray-900">
                              {notice.title}
                            </span>
                            <span className="flex shrink-0 items-center gap-2">
                              <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-gray-500">
                                {notice.scope === "ACTIVITY"
                                  ? "활동 공지"
                                  : notice.scope === "ALL"
                                    ? "전체 공지"
                                    : notice.scope === "BOARD"
                                      ? "보드 공지"
                                      : "대상 공지"}
                              </span>
                              <span className="text-xs text-gray-400">
                                {isExpanded ? "▲" : "▼"}
                              </span>
                            </span>
                          </button>

                          {isExpanded && (
                            <div className="border-t border-gray-100 bg-white p-4">
                              {loadingNoticeId === notice.id ? (
                                <p className="text-sm text-gray-400">
                                  공지 내용을 불러오는 중입니다.
                                </p>
                              ) : notice.content?.trim() ? (
                                <MarkdownPreview
                                  content={notice.content}
                                  className="text-sm"
                                />
                              ) : noticeDetailErrors[notice.id] ? (
                                <div className="text-sm text-red-500">
                                  <p>{noticeDetailErrors[notice.id]}</p>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void loadNoticeDetail(notice.id)
                                    }
                                    className="mt-2 font-bold underline"
                                  >
                                    다시 시도
                                  </button>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-400">
                                  공지 내용을 불러오지 못했습니다.
                                </p>
                              )}

                              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-[11px] text-gray-400">
                                <span>
                                  {notice.authorName ||
                                    `회원 ${notice.authorId}`}
                                </span>
                                <span>
                                  {notice.createdAt
                                    ? new Date(
                                        notice.createdAt,
                                      ).toLocaleDateString("ko-KR")
                                    : ""}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="col-span-4 space-y-4">
            <div className="space-y-4 rounded-3xl border border-gray-100 bg-white p-5 text-xs shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">주제 투표</h3>
                  <p className="mt-1 text-[11px] text-gray-400">
                    함께 진행할 활동 주제를 정해 보세요.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleProposeTopic}
                  disabled={isSubmittingTopic || sessions.length === 0}
                  className="rounded-xl bg-black px-3 py-2 text-[11px] font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
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
                  <div className="space-y-2 pt-1">
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
                        <span className="flex min-w-0 items-center gap-2">
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                              selectedVoteOption === index
                                ? "border-black bg-black"
                                : "border-gray-300 bg-white"
                            }`}
                          >
                            {selectedVoteOption === index && (
                              <span className="h-1.5 w-1.5 rounded-full bg-white" />
                            )}
                          </span>
                          <span className="truncate font-medium text-gray-800">
                            {item.text}
                          </span>
                        </span>
                        <span className="ml-2 shrink-0 text-[11px] font-bold text-gray-400">
                          {item.votes}표
                        </span>
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleVoteCandidate}
                    disabled={isVoting || selectedVoteOption === null}
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

            <div className="space-y-3 rounded-3xl border border-gray-100 bg-white p-5 text-xs shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">
                  불참 요청 승인 대기
                </h3>
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
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
                    className="space-y-2 rounded-2xl border border-gray-100 bg-gray-50 p-4"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                        {request.name[0] ?? "?"}
                      </div>
                      <span className="font-bold text-gray-900">
                        {request.name}
                      </span>
                      <span className="text-gray-400">· {request.session}</span>
                    </div>
                    <p className="rounded-xl border border-gray-100 bg-white p-2.5 text-[11px] leading-relaxed text-gray-600">
                      {request.reason}
                    </p>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => void handleApproveAbsence(request.id)}
                        className="flex-1 rounded-xl bg-black py-1.5 font-bold text-white transition hover:bg-gray-800"
                      >
                        승인
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleRejectAbsence(request.id)}
                        className="flex-1 rounded-xl border border-gray-200 py-1.5 font-bold text-gray-600 transition hover:bg-gray-100"
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

      {/* 주제 제안 모달 */}
      {isTopicModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setIsTopicModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-900">
              새로운 주제 제안
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              함께 진행하고 싶은 활동 주제를 입력해 주세요.
            </p>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleSubmitTopic();
              }}
            >
              <input
                type="text"
                value={topicTitle}
                onChange={(event) => setTopicTitle(event.target.value)}
                placeholder="주제 이름을 입력해 주세요."
                maxLength={100}
                autoFocus
                disabled={isSubmittingTopic}
                className="mt-5 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-black"
              />

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTopicModalOpen(false)}
                  disabled={isSubmittingTopic}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50"
                >
                  취소
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingTopic || !topicTitle.trim()}
                  className="rounded-xl bg-black px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isSubmittingTopic ? "등록 중..." : "주제 제안"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast 알림 */}
      {toast && (
        <div
          key={toast.id}
          className="fixed right-6 top-6 z-[200] flex min-w-[280px] items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-lg"
        >
          <div className="flex items-center gap-3">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                toast.type === "success" ? "bg-green-500" : "bg-blue-500"
              }`}
            />
            <p className="text-sm font-semibold text-gray-800">
              {toast.message}
            </p>
          </div>

          <button
            type="button"
            onClick={closeToast}
            className="text-lg text-gray-400 hover:text-gray-800"
            aria-label="알림 닫기"
          >
            ×
          </button>
        </div>
      )}

      <CreateNoticeModal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        activityId={activityId}
        onSuccess={async () => {
          await refreshNotices();
          setIsNoticeModalOpen(false);
        }}
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
            setIsCreateArticleOpen(false);
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
