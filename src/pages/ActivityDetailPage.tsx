
import { useCallback, useEffect, useState } from "react";
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

// 공지 목록 응답에 content가 포함되는 경우를 위한 확장 타입
type ActivityNotice = NoticeItem & {
  content?: string;
};

export default function ActivityDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const activityId = Number(id);

  const [activeTab, setActiveTab] = useState("회차");

  // 활동 정보
  const [activityTitle, setActivityTitle] = useState("활동 제목 없음");
  const [activitySchedule, setActivitySchedule] = useState("일정 미정");
  const [activityPeriod, setActivityPeriod] = useState("기간 미정");
  const [activityRule, setActivityRule] = useState("규칙 미정");
  const [members, setMembers] = useState<string[]>([]);

  // 회차 및 주제 투표
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

  // 공지사항
  const [notices, setNotices] = useState<ActivityNotice[]>([]);
  const [expandedNoticeId, setExpandedNoticeId] = useState<number | null>(null);
  const [loadingNoticeId, setLoadingNoticeId] = useState<number | null>(null);
  const [noticeDetailErrors, setNoticeDetailErrors] = useState<
    Record<number, string>
  >({});
  const [isLoadingNotices, setIsLoadingNotices] = useState(true);
  const [noticeError, setNoticeError] = useState("");

  // 모달
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);
  const [isCreateArticleOpen, setIsCreateArticleOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // 공지사항 목록 조회
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

  // 공지 상세 내용 조회
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

  // 주제 후보 목록 새로고침
  const refreshTopicCandidates = async (
    targetActivityId: number,
    sessionId: number,
  ) => {
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
  };

  // 공지사항 조회
  // 공지사항 조회
  useEffect(() => {
    if (!id || !Number.isFinite(Number(id))) return;

    let cancelled = false;

    const loadNotices = async () => {
      try {
        const response = await getNotices(Number(id), 50);

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
        if (!cancelled) {
          setIsLoadingNotices(false);
        }
      }
    };

    void loadNotices();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // 활동 상세 데이터 조회
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

        .catch((error: unknown) =>
          console.error("활동 목록 조회 실패:", error),
        );


      return () => {
        cancelled = true;
      };
    }


    const currentActivityId = Number(id);

    if (!Number.isFinite(currentActivityId)) return;

    const activityId = Number(id);

    if (!Number.isFinite(activityId)) return;


    Promise.all([
      getActivity(currentActivityId),
      getActivitySessions(currentActivityId),
      getActivityMembers(currentActivityId),
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

              return {
                id: String(post.id),
                session: `회차 ${
                  apiSessions.find((session) => session.id === post.sessionId)
                    ?.sessionNo ?? ""
                }`,
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

        // 불참 요청 조회

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


        // 첫 번째 회차의 주제 후보 조회
        if (apiSessions[0]) {
          try {
            const candidates = await getTopicCandidates(
              currentActivityId,
              apiSessions[0].id,
            );

            if (cancelled) return;

            const mappedCandidates: VoteItem[] = candidates.map(
              (candidate) => ({

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
              }),
            );


            setVotes(mappedCandidates);

            const votedIndex = mappedCandidates.findIndex(

            const votedIndex = candidates.findIndex(

              (candidate) => candidate.voted,
            );

            setSelectedVoteOption(votedIndex >= 0 ? votedIndex : null);

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


  // 주제 제안
  const handleProposeTopic = async () => {
    if (!id || !sessions[0]) {
      alert("주제를 제안할 회차가 없습니다.");
      return;
    }

    const title = window.prompt("제안할 주제를 입력해 주세요.");

    if (!title?.trim()) return;

    const currentActivityId = Number(id);
    const sessionId = Number(sessions[0].id);

    try {
      setIsSubmittingTopic(true);

      await proposeTopicCandidate(currentActivityId, sessionId, title.trim());

      await refreshTopicCandidates(currentActivityId, sessionId);

      alert("주제가 제안되었습니다.");
    } catch (error) {
      console.error("주제 제안 실패:", error);

      alert(
        error instanceof Error ? error.message : "주제를 제안하지 못했습니다.",
      );
    } finally {
      setIsSubmittingTopic(false);
    }
  };

  // 주제 선택
  const handleSelectVoteOption = (index: number) => {
    setSelectedVoteOption(index);
  };

  // 주제 투표
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

    const currentActivityId = Number(id);
    const sessionId = Number(sessions[0].id);
    const candidateId = Number(selectedCandidate.id);

    try {
      setIsVoting(true);

      if (selectedCandidate.voted) {
        await cancelTopicVote(currentActivityId, sessionId, candidateId);
      } else {
        const currentVotedCandidate = votes.find((item) => item.voted);

        if (currentVotedCandidate) {
          await cancelTopicVote(
            currentActivityId,
            sessionId,
            Number(currentVotedCandidate.id),
          );
        }

        await voteTopicCandidate(currentActivityId, sessionId, candidateId);
      }

      await refreshTopicCandidates(currentActivityId, sessionId);
    } catch (error) {
      console.error("주제 투표 실패:", error);

      alert(
        error instanceof Error ? error.message : "투표를 저장하지 못했습니다.",
      );
    } finally {
      setIsVoting(false);
    }
  };

  // 불참 요청 승인
  const handleApproveAbsence = async (absenceId: string) => {
    try {
      await approveAbsence(Number(absenceId));

      setAbsenceRequests((prev) =>
        prev.filter((item) => item.id !== absenceId),
      );

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


  // 불참 요청 거절
  const handleRejectAbsence = async (absenceId: string) => {

  // 결석 요청 거절
  const handleRejectAbsence = async (id: string) => {

    const comment = window.prompt("거절 사유를 입력해 주세요.");

    if (!comment?.trim()) return;

    try {

      await rejectAbsence(Number(absenceId), comment.trim());

      setAbsenceRequests((prev) =>
        prev.filter((item) => item.id !== absenceId),
      );
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


  const handleAddFeedback = async (articleId: string, feedbackText: string) => {
    if (!/^\d+$/.test(articleId)) return;

    try {
      const comment = await createComment({
        targetType: "NOTE",
        targetId: Number(articleId),
        content: feedbackText,
      });

      setArticles((prev) =>
        prev.map((article) =>
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
    <div className="flex h-screen flex-1 flex-col overflow-hidden bg-[#f8f9fa] font-pretendard select-none">
      <Header
        title={activityTitle}
        subtitle="모든 보드의 마감·회의·활동을 한 화면에서"
      />


      <div className="flex-1 space-y-6 overflow-y-auto p-8">
        {/* 상단 활동 요약 */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xs">
          <div className="flex items-start justify-between">
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

        {/* 대시보드 */}
        <div className="grid grid-cols-12 gap-6">
          {/* 왼쪽 탭 영역 */}
          <div className="col-span-8 space-y-4">
            <div className="flex gap-6 border-b border-gray-200 pb-2 text-xs font-bold text-gray-400">
              {["회차", "참여자", "출석 현황", "정리글", "공지"].map((tab) => (
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

            {/* 회차 탭 */}
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

                        className="rounded-3xl bg-white p-5 shadow-xs border border-gray-100 hover:shadow-md transition"

                      >
                        <div className="flex items-start justify-between">
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


                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">

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
                          {member[0]}
                        </div>

                        <span className="text-xs font-bold text-gray-800">

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
              <div className="space-y-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-xs">
                <h3 className="text-sm font-bold text-gray-900">
                  회차별 출석 현황
                </h3>

                <div className="py-16 text-center text-xs text-gray-400">
                  출석 현황 데이터가 없습니다.
                </div>
              </div>
            )}

            {/* 정리글 탭 */}
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
                      <div
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}

                        className="flex cursor-pointer items-center justify-between rounded-2xl border border-gray-100 bg-gray-50/70 p-4 transition hover:bg-gray-100/60"
                        className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/70 border border-gray-100 hover:bg-gray-100/60 transition cursor-pointer"

                      >
                        <div className="flex items-center gap-3">
                          <span className="rounded-md bg-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-600">
                            {article.session}
                          </span>


                          <span className="text-xs font-bold text-gray-900">

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

              <div className="space-y-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900">
                    공지사항 ({notices.length})
                  </h3>
              <div className="rounded-3xl bg-white p-6 shadow-xs border border-gray-100 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-900 text-sm">공지사항</h3>


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
                <div className="py-12 text-center text-xs text-gray-400">
                  등록된 공지사항이 없습니다.
                </div>

              </div>
            )}
          </div>
          {/* 오른쪽 카드 */}
          <div className="col-span-4 space-y-4">
            {/* 주제 투표 */}
            <div className="space-y-3 rounded-3xl border border-gray-100 bg-white p-5 text-xs shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">주제 투표</h3>

                <button
                  type="button"
                  onClick={handleProposeTopic}
                  disabled={isSubmittingTopic || sessions.length === 0}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmittingTopic ? "제안 중..." : "+ 주제 제안"}
                </button>
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

                  <div className="space-y-2 pt-1">

                  <div className="space-y-2">

                    {votes.map((item, index) => (
                      <button
                        key={item.id}
                        type="button"

                        onClick={() => handleSelectVoteOption(index)}
                        className={`flex w-full cursor-pointer items-center justify-between rounded-xl border p-3 text-left transition ${
                          selectedVoteOption === index
                            ? "border-black bg-white font-bold ring-1 ring-black"
                            : "border-gray-200 bg-gray-50 text-gray-600"

                        disabled={isVoting}
                        onClick={() => setSelectedVoteOption(index)}
                        className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition disabled:opacity-60 ${
                          selectedVoteOption === index
                            ? "border-black bg-gray-50 ring-1 ring-black"
                            : "border-gray-200 hover:bg-gray-50"

                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span

                            className={`flex h-3.5 w-3.5 items-center justify-center rounded-md border border-gray-400 ${
                              selectedVoteOption === index
                                ? "border-black bg-black"
                                : "bg-white"
                            }`}
                          >
                            {selectedVoteOption === index && (
                              <img
                                src={checkCircleIcon}
                                alt=""
                                className="h-3 w-3 invert"
                              />
                            )}
                          </span>

                          <span>{item.text}</span>
                        </span>

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

                    onClick={handleVoteCandidate}
                    disabled={isVoting || selectedVoteOption === null}
                    className="w-full cursor-pointer rounded-xl bg-black py-2.5 font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isVoting ? "처리 중..." : "투표하기"}
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

            {/* 불참 요청 승인 대기 */}
            <div className="space-y-3 rounded-3xl border border-gray-100 bg-white p-5 text-xs shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">
                  불참 요청 승인 대기
                </h3>


                <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
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

                    className="space-y-2 rounded-2xl border border-gray-100 bg-gray-50 p-4"

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


                    <p className="rounded-xl border border-gray-100 bg-white p-2.5 text-[11px] leading-relaxed text-gray-600">

                    <p className="text-[11px] text-gray-600 leading-relaxed bg-white p-2.5 rounded-xl border border-gray-100">

                      "{request.reason}"
                    </p>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleApproveAbsence(request.id)}

                        className="flex-1 cursor-pointer rounded-xl bg-black py-1.5 font-bold text-white transition hover:bg-gray-800"

                        className="flex-1 rounded-xl bg-black py-1.5 font-bold text-white hover:bg-gray-800 transition cursor-pointer"
      >
                        승인
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRejectAbsence(request.id)}

                        className="flex-1 cursor-pointer rounded-xl border border-gray-200 py-1.5 font-bold text-gray-600 transition hover:bg-gray-100"

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

      {/* 공지사항 작성 모달 */}
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
