import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  getActivities,
  getActivity,
  deleteActivity,
  getActivitySessions,
  getActivityMembers,
  getTopicCandidates,
  proposeTopicCandidate,
  voteTopicCandidate,
  cancelTopicVote,
  updateActivitySessionTopic,
  getActivityApplications,
  applyToActivity,
  cancelActivityApplication,
  approveActivityApplication,
  rejectActivityApplication,
  updateActivity,
  type ActivityApplication,
  type ActivityDetail,
  type ActivityMember,
  type ActivitySummary,
  type ActivityUpdateRequest,
  type ApplicationStatus,
} from "../api/activityApi";
import { ApiError } from "../api/client";
import {
  getPendingAbsences,
  approveAbsence,
  rejectAbsence,
} from "../api/attendanceApi";
import { createComment } from "../api/commentApi";
import { createPost, getPost, getPosts } from "../api/postApi";
import {
  getNotice,
  getNotices,
  updateNotice,
  type NoticeItem,
} from "../api/noticeApi";
import { useMyProfile } from "../hooks/useMembers";
import {
  formatActivityPeriod,
  formatActivitySchedule,
  formatTopicRule,
} from "../utils/activitySchedule";
// ★ 활동 목록이 바뀌었다는 신호 이름 (Header에서 활동을 만들면 이 신호가 온다)
import { ACTIVITIES_CHANGED_EVENT } from "../utils/activityEvents";
import { Header } from "../components/layout/Header";
import ConfirmModal from "../components/common/ConfirmModal";
import CreateNoticeModal from "../components/modals/CreateNoticeModal";
import AbsenceRequestModal from "../components/modals/AbsenceRequestModal";
import CreateArticleModal from "../components/modals/CreateArticleModal";
import ActivitySettingsModal from "../components/modals/ActivitySettingsModal";
import ArticleDetailModal, {
  type ArticleDetailData,
} from "../components/modals/ArticleDetailModal";
import ActivitySwitcher from "../components/activity/ActivitySwitcher";
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
  votingOpen?: boolean;
}
interface TopicVotingWindow {
  opensAt: Date | null;
  closesAt: Date;
}

interface TopicVotingSchedule extends TopicVotingWindow {
  session: SessionItem;
}

type ScheduledTopicVotingWindow = TopicVotingSchedule & {
  opensAt: Date;
};

// 회차 날짜와 투표 개설 기준으로 KST 시작·종료 시각 계산
function getTopicVotingWindow(
  sessionDateValue: string,
  daysBefore?: number | null,
): TopicVotingWindow | null {
  const dateText = sessionDateValue.slice(0, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
    return null;
  }

  const [year, month, day] = dateText.split("-").map(Number);

  const sessionCalendarDay = new Date(Date.UTC(year, month - 1, day));

  // 잘못된 날짜는 계산하지 않는다.
  if (
    sessionCalendarDay.getUTCFullYear() !== year ||
    sessionCalendarDay.getUTCMonth() !== month - 1 ||
    sessionCalendarDay.getUTCDate() !== day
  ) {
    return null;
  }

  // 회차 날짜 당일 15:00 KST에 종료
  const closesAt = new Date(`${dateText}T15:00:00+09:00`);

  if (Number.isNaN(closesAt.getTime())) {
    return null;
  }

  let opensAt: Date | null = null;

  if (
    typeof daysBefore === "number" &&
    Number.isFinite(daysBefore) &&
    daysBefore >= 0
  ) {
    const openingCalendarDay = new Date(sessionCalendarDay);

    openingCalendarDay.setUTCDate(
      openingCalendarDay.getUTCDate() - Math.floor(daysBefore),
    );

    const openingDateText = openingCalendarDay.toISOString().slice(0, 10);

    // 시작일 00:00 KST
    opensAt = new Date(`${openingDateText}T00:00:00+09:00`);

    if (Number.isNaN(opensAt.getTime())) {
      opensAt = null;
    }
  }

  return { opensAt, closesAt };
}

// 브라우저의 시간대와 관계없이 한국 시간으로 표시
function formatKstDateTime(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
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

const PAGE_SUBTITLE = "모든 보드의 마감·회의·활동을 한 화면에서";

export default function ActivityDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const activityId = Number(id);

  // 내 정보 (내 회원 번호와 부장 여부를 알기 위해 쓴다)
  const profileQuery = useMyProfile();
  const me = profileQuery.data;

  const [activeTab, setActiveTab] = useState("회차");
  useEffect(() => {
    if (searchParams.get("tab") === "공지") {
      setActiveTab("공지");
    }
  }, [searchParams]);

  // 서버에서 받은 활동 상세 (설정 창과 권한 판단에 쓴다)
  const [detail, setDetail] = useState<ActivityDetail | null>(null);
  // notFound: 대상이 아니거나 없는 활동(404) / failed: 그 밖의 오류
  const [loadError, setLoadError] = useState<"notFound" | "failed" | null>(
    null,
  );

  const [activityTitle, setActivityTitle] = useState("활동 제목 없음");
  const [activitySchedule, setActivitySchedule] = useState("일정 미정");
  const [activityPeriod, setActivityPeriod] = useState("기간 미정");
  const [activityRule, setActivityRule] = useState("규칙 미정");
  const [members, setMembers] = useState<ActivityMember[]>([]);
  const [allActivities, setAllActivities] = useState<ActivitySummary[]>([]);

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [topicSessionId, setTopicSessionId] = useState<number | null>(null);
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

  // 활동 선택 칩에 쓸 전체 활동 목록
  // ★ 처음 한 번 + Header에서 활동을 만들 때마다(신호) 다시 불러온다 (새로고침 없이 바로 보이게)
  useEffect(() => {
    let cancelled = false;

    const loadActivities = () => {
      getActivities()
        .then((list) => {
          if (cancelled) return;
          const items = list ?? [];
          setAllActivities(items);
          // ★ 활동이 하나도 없던 화면(/activity)에서 새 활동이 생기면 그 활동으로 이동
          if (!id && items.length > 0) {
            navigate(`/activity/${items[0].id}`, { replace: true });
          }
        })
        .catch((error: unknown) =>
          console.error("활동 목록 조회 실패:", error),
        );
    };

    loadActivities();
    // ★ 신호를 듣기 시작 (화면을 떠나면 아래 return에서 그만 듣는다)
    window.addEventListener(ACTIVITIES_CHANGED_EVENT, loadActivities);

    return () => {
      cancelled = true;
      window.removeEventListener(ACTIVITIES_CHANGED_EVENT, loadActivities);
    };
  }, [id, navigate]);

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
  const [editingNotice, setEditingNotice] = useState<ActivityNotice | null>(
    null,
  );
  const [editNoticeTitle, setEditNoticeTitle] = useState("");
  const [editNoticeContent, setEditNoticeContent] = useState("");
  const [isUpdatingNotice, setIsUpdatingNotice] = useState(false);

  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);
  const [isCreateArticleOpen, setIsCreateArticleOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeletingActivity, setIsDeletingActivity] = useState(false);

  // ─────────────────────────────────────────────
  // 참여 신청 (신청하기 / 신청 취소 / 나가기 / 스터디장의 승인·거절)
  // ─────────────────────────────────────────────
  // 스터디장이 보는 참여 신청 목록 (어느 활동의 목록인지 같이 기억해서 다른 활동 것이 섞이지 않게 한다)
  const [applicationsState, setApplicationsState] = useState<{
    activityId: number;
    items: ActivityApplication[];
  } | null>(null);
  // 서버가 내 신청 상태를 아직 안 줄 때를 위해, 신청 직후 응답으로 알게 된 상태를 임시로 기억한다
  const [localApplication, setLocalApplication] = useState<{
    activityId: number;
    status: ApplicationStatus;
  } | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [processingApplicationId, setProcessingApplicationId] = useState<
    number | null
  >(null);
  // 확인 창: leave(활동 나가기) / cancel(신청 취소)
  const [confirmAction, setConfirmAction] = useState<"leave" | "cancel" | null>(
    null,
  );
  const closeConfirm = useCallback(() => setConfirmAction(null), []);

  // 지금 보고 있는 활동의 상세 (다른 활동 상세가 잠깐 남아 있어도 섞이지 않게 번호를 확인한다)
  const currentDetail =
    detail && detail.summary.id === activityId ? detail : null;

  // 내 권한
  // - 부장: 내 정보의 roles에 LEADER가 있다
  // - 스터디장: 이 활동 참여자 목록에서 내 role이 LEADER다
  const myId = me?.memberId;
  const isSystemLeader = me?.roles.includes("LEADER") ?? false;
  const myActivityRole = members.find(
    (member) => member.memberId === myId,
  )?.role;
  const canManage = isSystemLeader || myActivityRole === "LEADER";
  // 주제 지정형인지 확인
  const isAssignedTopicMode = currentDetail?.topicMode === "ASSIGNED";
  const topicOpenDaysBefore = currentDetail?.topicOpenDaysBefore;

  // 서버의 votingOpen이 true인 회차만 현재 투표 중인 회차로 판단
  const activeVotingSession =
    sessions.find((session) => session.votingOpen === true) ?? null;

  const activeVotingWindow = activeVotingSession
    ? getTopicVotingWindow(activeVotingSession.date, topicOpenDaysBefore)
    : null;

  // 아직 주제가 정해지지 않은 회차의 투표 일정
  const topicVotingSchedules: TopicVotingSchedule[] = sessions.flatMap(
    (session) => {
      if (session.title !== "주제 미정") {
        return [];
      }

      const window = getTopicVotingWindow(session.date, topicOpenDaysBefore);

      return window ? [{ session, ...window }] : [];
    },
  );

  const schedulesWithStart: ScheduledTopicVotingWindow[] =
    topicVotingSchedules.filter(
      (schedule): schedule is ScheduledTopicVotingWindow =>
        schedule.opensAt !== null,
    );

  const now = Date.now();

  // 아직 시작하지 않은 가장 가까운 투표 일정
  const upcomingVotingSchedule =
    schedulesWithStart
      .filter(
        ({ session, opensAt, closesAt }) =>
          session.status === "진행 예정" &&
          opensAt.getTime() > now &&
          closesAt.getTime() > now,
      )
      .sort((a, b) => a.opensAt.getTime() - b.opensAt.getTime())[0] ?? null;

  // 계산상 투표 기간이지만 서버에서는 닫혀 있는 경우
  const votingWindowButNotOpen =
    schedulesWithStart
      .filter(
        ({ session, opensAt, closesAt }) =>
          session.status === "진행 예정" &&
          opensAt.getTime() <= now &&
          closesAt.getTime() > now &&
          session.votingOpen !== true,
      )
      .sort((a, b) => a.closesAt.getTime() - b.closesAt.getTime())[0] ?? null;

  // 투표 기간이 지났는데 아직 주제가 정해지지 않은 회차
  const expiredUnresolvedVotingSchedule =
    topicVotingSchedules
      .filter(({ closesAt }) => closesAt.getTime() <= now)
      .sort((a, b) => b.closesAt.getTime() - a.closesAt.getTime())[0] ?? null;

  // 직접 지정되었거나 자동 확정된 주제가 있는지 확인
  const hasClosedVotingTopic = sessions.some(
    (session) => session.title !== "주제 미정" && session.votingOpen !== true,
  );
      // ★ 주제 지정은 이 활동의 스터디장 또는 부장 (서버 규칙과 같게)
  const canSetAssignedTopic = canManage;
  // ★ 지정형에서 주제를 정할 회차: 아직 진행 전인 회차 중 가장 앞 회차 (없으면 첫 회차)
  // (예전에는 항상 1회차에 저장돼서, 이미 끝난 회차에 주제가 들어갈 수 있었다)
  const assignedTargetSession =
    sessions.find((session) => session.status === "진행 예정") ??
    sessions[0] ??
    null;
  // 이 활동에 참여 중인지 (서버가 알려주는 값을 우선한다)
  const isMember =
    currentDetail?.summary.isMember ??
    members.some((member) => member.memberId === myId);

  // 내 신청 상태: 서버 값이 있으면 그걸 쓰고, 없으면 신청 직후 응답으로 기억한 값을 쓴다
  const serverApplicationStatus =
    currentDetail?.summary.myApplicationStatus ??
    currentDetail?.myApplicationStatus;
  const myApplicationStatus: ApplicationStatus | null =
    serverApplicationStatus ??
    (localApplication?.activityId === activityId
      ? localApplication.status
      : null);

  const applications =
    applicationsState?.activityId === activityId ? applicationsState.items : [];
  const pendingApplications = applications.filter(
    (application) => application.status === "PENDING",
  );

  // 서버에서 받은 활동 상세를 화면에 반영한다
  const applyDetail = useCallback((nextDetail: ActivityDetail) => {
    setDetail(nextDetail);
    setLoadError(null);
    setActivityTitle(nextDetail.summary.name);
    setActivitySchedule(formatActivitySchedule(nextDetail));
    setActivityPeriod(formatActivityPeriod(nextDetail.summary));
    setActivityRule(formatTopicRule(nextDetail));
  }, []);

  // 활동 상세와 참여자만 다시 불러온다 (신청·승인·설정 저장 뒤에 쓴다)
  const refreshActivityInfo = useCallback(async () => {
    if (!Number.isFinite(activityId)) return;

    try {
      const [nextDetail, nextMembers] = await Promise.all([
        getActivity(activityId),
        getActivityMembers(activityId),
      ]);
      applyDetail(nextDetail);
      setMembers(nextMembers);
    } catch (error) {
      console.error("활동 정보 새로고침 실패:", error);
    }
  }, [activityId, applyDetail]);

  // 참여 신청 승인 모드에서만 스터디장·부장이 신청 대기 목록을 조회한다.
  // 선착순(FIRST_COME) 활동에서는 신청 대기 목록을 조회하지 않는다.
  useEffect(() => {
    if (
      !canManage ||
      currentDetail?.summary.recruitMode !== "APPROVAL" ||
      !id ||
      !Number.isFinite(activityId)
    ) {
      setApplicationsState(null);
      return;
    }

    let cancelled = false;

    getActivityApplications(activityId)
      .then((list) => {
        if (!cancelled) {
          setApplicationsState({ activityId, items: list ?? [] });
        }
      })
      .catch((error: unknown) =>
        console.error("참여 신청 목록 조회 실패:", error),
      );

    return () => {
      cancelled = true;
    };
  }, [canManage, id, activityId, currentDetail?.summary.recruitMode]);

  const handleApply = async () => {
    if (!Number.isFinite(activityId)) return;

    try {
      setIsApplying(true);
      const result = await applyToActivity(activityId);
      const status =
        (result?.status as ApplicationStatus | undefined) ?? "PENDING";

      setLocalApplication({ activityId, status });
      await refreshActivityInfo();

      showToast(
        status === "APPROVED"
          ? "활동에 참여했습니다."
          : "참여 신청을 보냈습니다. 스터디장의 승인을 기다려 주세요.",
        "success",
      );
    } catch (error) {
      console.error("참여 신청 실패:", error);
      // 이미 신청했거나 정원이 찬 경우(409) 등은 서버가 보낸 메시지를 그대로 보여준다
      showToast(
        error instanceof Error
          ? error.message
          : "참여 신청을 보내지 못했습니다.",
      );
    } finally {
      setIsApplying(false);
    }
  };

  // 신청 취소 / 활동 나가기 (서버에서는 같은 API: 참여 중이면 나가기도 된다)
  const handleCancelApplication = async () => {
    if (!Number.isFinite(activityId)) return;
    const wasMember = isMember;

    try {
      setIsApplying(true);
      await cancelActivityApplication(activityId);

      setLocalApplication(null);
      await refreshActivityInfo();

      showToast(
        wasMember ? "활동에서 나갔습니다." : "참여 신청을 취소했습니다.",
        "success",
      );
    } catch (error) {
      console.error("신청 취소 실패:", error);
      showToast(
        error instanceof Error ? error.message : "요청을 처리하지 못했습니다.",
      );
    } finally {
      setIsApplying(false);
    }
  };

  // 스터디장의 승인 / 거절 (대기 중이 아니거나 정원이 차면 서버가 409를 준다)
  const handleApplicationDecision = async (
    application: ActivityApplication,
    decision: "approve" | "reject",
  ) => {
    try {
      setProcessingApplicationId(application.id);

      if (decision === "approve") {
        await approveActivityApplication(activityId, application.id);
      } else {
        await rejectActivityApplication(activityId, application.id);
      }

      // 처리한 신청을 목록에서 대기 중이 아닌 것으로 바꾼다
      setApplicationsState((prev) =>
        prev && prev.activityId === activityId
          ? {
              ...prev,
              items: prev.items.map((item) =>
                item.id === application.id
                  ? {
                      ...item,
                      status: decision === "approve" ? "APPROVED" : "REJECTED",
                    }
                  : item,
              ),
            }
          : prev,
      );

      // 승인하면 참여자와 인원 수가 바뀐다
      if (decision === "approve") await refreshActivityInfo();

      showToast(
        decision === "approve"
          ? `${application.name}님의 참여를 승인했습니다.`
          : `${application.name}님의 신청을 거절했습니다.`,
        "success",
      );
    } catch (error) {
      console.error("참여 신청 처리 실패:", error);
      showToast(
        error instanceof Error ? error.message : "요청을 처리하지 못했습니다.",
      );
    } finally {
      setProcessingApplicationId(null);
    }
  };

  // 활동 설정 저장 (바뀐 항목만 넘어온다)
  const handleSaveSettings = async (changes: ActivityUpdateRequest) => {
    if (!canManage) {
      showToast("활동 설정을 변경할 권한이 없습니다.");
      return false;
    }

    // 기존 저장 로직 유지
    try {
      await updateActivity(activityId, changes);
      await refreshActivityInfo();
      // 활동 선택 칩의 이름·상태도 바뀔 수 있어서 목록을 다시 불러온다
      getActivities()
        .then((list) => setAllActivities(list ?? []))
        .catch((error: unknown) =>
          console.error("활동 목록 조회 실패:", error),
        );
      showToast("활동 설정을 저장했습니다.", "success");
      return true;
    } catch (error) {
      console.error("활동 설정 저장 실패:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "활동 설정을 저장하지 못했습니다.",
      );
      return false;
    }
  };
  const handleDeleteActivity = async () => {
    if (!canManage || !Number.isFinite(activityId) || isDeletingActivity) {
      return;
    }

    try {
      setIsDeletingActivity(true);

      await deleteActivity(activityId);

      setIsDeleteConfirmOpen(false);
      setIsSettingsModalOpen(false);

      showToast("활동을 삭제했습니다.", "success");

      navigate("/activity", { replace: true });
    } catch (error) {
      console.error("활동 삭제 실패:", error);
      showToast(
        error instanceof Error ? error.message : "활동을 삭제하지 못했습니다.",
      );
    } finally {
      setIsDeletingActivity(false);
    }
  };

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

      const noticeDetail = await getNotice(noticeId);
      setNotices((previous) =>
        previous.map((notice) =>
          notice.id === noticeId ? { ...notice, ...noticeDetail } : notice,
        ),
      );

      if (!noticeDetail.content?.trim()) {
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

  // 공지 작성자 본인만 수정할 수 있다. 편집을 열 때 상세 내용을 다시 조회한다.
  const handleOpenNoticeEditor = async (notice: ActivityNotice) => {
    if (notice.authorId !== myId) {
      showToast("공지 작성자만 수정할 수 있습니다.");
      return;
    }

    try {
      const latestNotice = await getNotice(notice.id);
      if (latestNotice.authorId !== myId) {
        showToast("공지 작성자만 수정할 수 있습니다.");
        return;
      }

      setEditingNotice({ ...notice, ...latestNotice });
      setEditNoticeTitle(latestNotice.title ?? notice.title);
      setEditNoticeContent(latestNotice.content ?? notice.content ?? "");
    } catch (error) {
      console.error("공지 수정 내용 조회 실패:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "공지 내용을 불러오지 못했습니다.",
      );
    }
  };

  const handleUpdateNotice = async () => {
    if (!editingNotice || isUpdatingNotice) return;

    if (editingNotice.authorId !== myId) {
      showToast("공지 작성자만 수정할 수 있습니다.");
      setEditingNotice(null);
      return;
    }

    const title = editNoticeTitle.trim();
    const content = editNoticeContent.trim();

    if (!title || !content) {
      showToast("공지 제목과 내용을 모두 입력해 주세요.");
      return;
    }

    try {
      setIsUpdatingNotice(true);
      const updatedNotice = await updateNotice(editingNotice.id, {
        title,
        content,
      });

      setNotices((previous) =>
        previous.map((notice) =>
          notice.id === editingNotice.id
            ? { ...notice, ...updatedNotice, title, content }
            : notice,
        ),
      );
      setNoticeDetailErrors((previous) => {
        const next = { ...previous };
        delete next[editingNotice.id];
        return next;
      });
      setEditingNotice(null);
      showToast("공지를 수정했습니다.", "success");
    } catch (error) {
      console.error("공지 수정 실패:", error);
      showToast(
        error instanceof Error ? error.message : "공지를 수정하지 못했습니다.",
      );
    } finally {
      setIsUpdatingNotice(false);
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
        const [nextDetail, apiSessions, apiMembers, absences] =
          await Promise.all([
            getActivity(currentActivityId),
            getActivitySessions(currentActivityId),
            getActivityMembers(currentActivityId),
            getPendingAbsences().catch((error: unknown) => {
              console.error("결석 요청 조회 실패:", error);
              return [];
            }),
          ]);

        if (cancelled) return;

        applyDetail(nextDetail);
        setMembers(apiMembers);

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
          votingOpen: session.votingOpen === true,
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

        const openVotingSession = apiSessions.find(
          (session) => session.votingOpen === true,
        );

        if (nextDetail.topicMode !== "ASSIGNED" && openVotingSession) {
          setTopicSessionId(openVotingSession.id);

          try {
            await refreshTopicCandidates(
              currentActivityId,
              openVotingSession.id,
            );
          } catch (error) {
            console.error("주제 후보 조회 실패:", error);

            if (!cancelled) {
              setVotes([]);
              setSelectedVoteOption(null);
            }
          }
        } else {
          setTopicSessionId(null);
          setVotes([]);
          setSelectedVoteOption(null);
        }
      } catch (error) {
        console.error("활동 상세 API 조회 실패:", error);
        if (!cancelled) {
          // 대상이 아닌 사람이 주소로 들어오면 서버가 404를 준다
          if (error instanceof ApiError && error.status === 404) {
            setLoadError("notFound");
          } else {
            setLoadError("failed");
            setActivityTitle("활동 정보를 불러오지 못했습니다");
          }
        }
      }
    };

    void loadActivity();

    return () => {
      cancelled = true;
    };
  }, [id, navigate, refreshTopicCandidates, applyDetail]);

   const handleProposeTopic = () => {
    // ★ 지정형은 "주제 정할 회차"가 있는지, 투표형은 "투표 열린 회차"가 있는지
    const hasTargetSession = isAssignedTopicMode
      ? assignedTargetSession !== null
      : topicSessionId !== null;

    if (!id || !hasTargetSession) {
      showToast(
        isAssignedTopicMode
          ? "주제를 지정할 회차가 없습니다."
          : "현재 주제 제안 기간이 열린 회차가 없습니다.",
      );
      return;
    }

    if (isAssignedTopicMode && !canSetAssignedTopic) {
      // ★ 부장도 할 수 있게 안내 문구 수정
      showToast("주제 지정은 스터디장 또는 부장만 할 수 있습니다.");
      return;
    }

    // ★ 1회차가 아니라 "주제 정할 회차"의 지금 주제
    const currentTopic = assignedTargetSession?.title;

    setTopicTitle(
      isAssignedTopicMode && currentTopic && currentTopic !== "주제 미정"
        ? currentTopic
        : "",
    );

    setIsTopicModalOpen(true);
  };

    const handleSubmitTopic = async () => {
    const title = topicTitle.trim();

    if (!title) {
      showToast(
        isAssignedTopicMode
          ? "지정할 주제를 입력해 주세요."
          : "제안할 주제를 입력해 주세요.",
      );
      return;
    }

    // ★ 지정형은 "주제 정할 회차", 투표형은 "투표 열린 회차"
    const sessionId = isAssignedTopicMode
      ? assignedTargetSession
        ? Number(assignedTargetSession.id)
        : null
      : topicSessionId;

    if (sessionId === null) {
      showToast(
        isAssignedTopicMode
          ? "주제를 지정할 회차가 없습니다."
          : "현재 주제 제안 기간이 열린 회차가 없습니다.",
      );

      setIsTopicModalOpen(false);
      return;
    }
    try {
      setIsSubmittingTopic(true);

      // 지정형: 투표 후보 등록 없이 회차 주제를 직접 저장한다.
      if (isAssignedTopicMode) {
        await updateActivitySessionTopic(activityId, sessionId, title);

        // ★ 저장한 그 회차만 주제를 바꾼다 (예전에는 항상 첫 번째 회차)
        setSessions((previous) =>
          previous.map((session) =>
            Number(session.id) === sessionId ? { ...session, title } : session,
          ),
        );

        setIsTopicModalOpen(false);
        setTopicTitle("");

        showToast("회차 주제가 지정되었습니다.", "success");
        return;
      }

      // 투표형: 기존 동작을 그대로 유지한다.
      await proposeTopicCandidate(activityId, sessionId, title);

      await refreshTopicCandidates(activityId, sessionId);

      setIsTopicModalOpen(false);
      setTopicTitle("");

      showToast("주제가 제안되었습니다.", "success");
    } catch (error) {
      console.error(
        isAssignedTopicMode ? "회차 주제 지정 실패:" : "주제 제안 실패:",
        error,
      );

      showToast(
        error instanceof Error
          ? error.message
          : isAssignedTopicMode
            ? "주제를 지정하지 못했습니다."
            : "주제를 제안하지 못했습니다.",
      );
    } finally {
      setIsSubmittingTopic(false);
    }
  };
  const handleVoteCandidate = async () => {
    if (!id || topicSessionId === null) {
      showToast("현재 투표 기간이 열린 회차가 없습니다.");
      return;
    }
    if (selectedVoteOption === null) {
      showToast("투표할 주제를 선택해 주세요.");
      return;
    }

    const selectedCandidate = votes[selectedVoteOption];
    if (!selectedCandidate) return;

    const sessionId = topicSessionId;
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
      showToast(
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
      showToast(
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
      showToast(
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
      showToast(
        error instanceof Error
          ? error.message
          : "피드백을 저장하지 못했습니다.",
      );
    }
  };

  // 참여 상태에 따라 보여줄 버튼 (참여 신청 / 승인 대기 + 신청 취소 / 활동 나가기)
  const membershipControl = (() => {
    if (!currentDetail) return null;

    const isRecruiting = currentDetail.summary.status === "RECRUITING";

    // 참여 중: 일반 팀원은 나갈 수 있다. 스터디장은 서버가 409를 줘서 버튼을 숨긴다.
    if (isMember) {
      if (myActivityRole === "LEADER") return null;
      return (
        <button
          type="button"
          onClick={() => setConfirmAction("leave")}
          disabled={isApplying}
          className="cursor-pointer rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          활동 나가기
        </button>
      );
    }

    if (myApplicationStatus === "PENDING") {
      return (
        <>
          <span className="rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
            승인 대기 중
          </span>
          <button
            type="button"
            onClick={() => setConfirmAction("cancel")}
            disabled={isApplying}
            className="cursor-pointer rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            신청 취소
          </button>
        </>
      );
    }

    if (!isRecruiting) {
      return (
        <span className="text-xs font-medium text-gray-400">
          모집이 끝난 활동입니다
        </span>
      );
    }

    return (
      <>
        {myApplicationStatus === "REJECTED" && (
          <span className="rounded-xl bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600">
            신청이 거절되었습니다
          </span>
        )}
        <button
          type="button"
          onClick={() => void handleApply()}
          disabled={isApplying}
          className="cursor-pointer rounded-xl bg-black px-4 py-2 text-xs font-bold text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {isApplying
            ? "처리 중..."
            : myApplicationStatus === "REJECTED"
              ? "다시 신청"
              : "참여 신청"}
        </button>
      </>
    );
  })();

  // 대상이 아니거나 없는 활동(404)
  if (loadError === "notFound") {
    return (
      <div className="flex h-screen flex-1 flex-col overflow-hidden bg-[#f8f9fa] font-pretendard select-none">
        <Header title="활동" subtitle={PAGE_SUBTITLE} />

        <div className="flex-1 space-y-6 overflow-y-auto p-8">
          <ActivitySwitcher
            activities={allActivities}
            currentId={activityId}
            onSelect={(nextId) => navigate(`/activity/${nextId}`)}
          />

          <div className="rounded-3xl border border-gray-100 bg-white p-16 text-center shadow-xs">
            <p className="text-base font-bold text-gray-900">
              볼 수 없는 활동입니다
            </p>
            <p className="mt-2 text-xs text-gray-400">
              대상이 아니거나 삭제된 활동이에요. 다른 활동을 선택해 주세요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-1 flex-col overflow-hidden bg-[#f8f9fa] font-pretendard select-none">
      <Header title={activityTitle} subtitle={PAGE_SUBTITLE} />

      <div className="flex-1 space-y-6 overflow-y-auto p-8">
        {/* 활동 선택 칩 (활동이 2개 이상일 때만 표시됨) */}
        <ActivitySwitcher
          activities={allActivities}
          currentId={activityId}
          onSelect={(nextId) => navigate(`/activity/${nextId}`)}
        />

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xs">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-gray-900">
                  {activityTitle}
                </h1>
                {currentDetail && (
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-600">
                    {currentDetail.summary.statusLabel ||
                      currentDetail.summary.status}
                  </span>
                )}
              </div>

              {currentDetail?.description?.trim() && (
                <p className="mt-2 max-w-[560px] text-xs leading-relaxed text-gray-500">
                  {currentDetail.description}
                </p>
              )}

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
                  {currentDetail &&
                    ` / 정원 ${currentDetail.summary.capacity}명`}
                </span>
                {members.length > 0 && (
                  <div className="flex -space-x-1.5">
                    {members.map((member) => (
                      <div
                        key={member.memberId}
                        className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-black text-[10px] font-bold text-white"
                      >
                        {member.name?.[0] ?? "?"}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-end gap-3">
              <span className="rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600">
                평균 출석률 0%
              </span>

              {membershipControl}

              {/* 공지·설정은 부장과 이 활동의 스터디장만 쓸 수 있다 (서버도 403으로 막는다) */}
              {canManage && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsNoticeModalOpen(true)}
                    className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
                  >
                    <img
                      src={bellIcon}
                      alt=""
                      className="h-3.5 w-3.5 opacity-70"
                    />
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
                </>
              )}
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
                    {members.map((member) => (
                      <div
                        key={member.memberId}
                        className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
                          {member.name?.[0] ?? "?"}
                        </div>
                        <span className="min-w-0 truncate text-xs font-bold text-gray-800">
                          {member.name}
                        </span>
                        {member.role === "LEADER" && (
                          <span className="ml-auto shrink-0 rounded-full bg-black px-2 py-0.5 text-[10px] font-bold text-white">
                            {member.roleLabel || "스터디장"}
                          </span>
                        )}
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
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => setIsNoticeModalOpen(true)}
                      className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-black px-4 py-2 text-xs font-bold text-white transition hover:bg-gray-800"
                    >
                      <img
                        src={plusIcon}
                        alt=""
                        className="h-3.5 w-3.5 invert"
                      />
                      공지 작성
                    </button>
                  )}
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
                                <div className="flex items-center gap-3">
                                  <span>
                                    {notice.createdAt
                                      ? new Date(
                                          notice.createdAt,
                                        ).toLocaleDateString("ko-KR")
                                      : ""}
                                  </span>
                                  {notice.authorId === myId && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void handleOpenNoticeEditor(notice)
                                      }
                                      className="cursor-pointer font-bold text-gray-700 underline underline-offset-2 hover:text-black"
                                    >
                                      수정
                                    </button>
                                  )}
                                </div>
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
            {isAssignedTopicMode ? (
                      <div className="space-y-4 rounded-3xl border border-gray-100 bg-white p-5 text-xs shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      주제 지정
                    </h3>
                    <p className="mt-1 text-[11px] text-gray-400">
                      {/* ★ 부장도 할 수 있다고 안내 */}
                      스터디장 또는 부장이 회차 주제를 직접 지정합니다.
                    </p>
                  </div>

                  {canSetAssignedTopic && (
                    <button
                      type="button"
                      onClick={handleProposeTopic}
                      // ★ 주제 정할 회차가 없으면 비활성화
                      disabled={isSubmittingTopic || assignedTargetSession === null}
                      className="rounded-xl bg-black px-3 py-2 text-[11px] font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isSubmittingTopic
                        ? "저장 중..."
                        : assignedTargetSession &&
                            assignedTargetSession.title !== "주제 미정"
                          ? "주제 변경"
                          : "주제 입력"}
                    </button>
                  )}
                </div>

                {/* ★ 1회차가 아니라 "주제 정할 회차"를 보여준다 */}
                {assignedTargetSession === null ? (
                  <div className="py-8 text-center text-gray-400">
                    회차가 등록되면 주제를 지정할 수 있습니다.
                  </div>
                ) : (
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-[11px] font-semibold text-gray-400">
                      {assignedTargetSession.sessionNum}{" "}
                      {assignedTargetSession.date} 주제
                    </p>

                    <p className="mt-2 break-words text-sm font-bold text-gray-900">
                      {assignedTargetSession.title}
                    </p>
                  </div>
                )}

                {!canSetAssignedTopic && (
                  <p className="text-[11px] text-gray-400">
                    주제 입력 및 변경은 이 활동의 스터디장 또는 부장만 할 수
                    있습니다.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4 rounded-3xl border border-gray-100 bg-white p-5 text-xs shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      주제 투표
                    </h3>
                    <p className="mt-1 text-[11px] text-gray-400">
                      함께 진행할 활동 주제를 정해 보세요.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleProposeTopic}
                    disabled={isSubmittingTopic || topicSessionId === null}
                    className="rounded-xl bg-black px-3 py-2 text-[11px] font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isSubmittingTopic ? "등록 중..." : "+ 주제 제안"}
                  </button>
                </div>
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-3 text-[11px] leading-5 text-blue-800">
                  {activeVotingSession ? (
                    <>
                      <p className="font-bold">
                        현재 {activeVotingSession.sessionNum} 주제 투표가 진행
                        중입니다.
                      </p>

                      {activeVotingWindow?.opensAt && (
                        <p>
                          투표 시작:{" "}
                          {formatKstDateTime(activeVotingWindow.opensAt)} (KST)
                        </p>
                      )}

                      {activeVotingWindow ? (
                        <p>
                          투표 종료 예정:{" "}
                          {formatKstDateTime(activeVotingWindow.closesAt)} (KST)
                        </p>
                      ) : (
                        <p>투표는 회차 날짜 당일 15:00 (KST)에 종료됩니다.</p>
                      )}
                    </>
                  ) : upcomingVotingSchedule ? (
                    <>
                      <p className="font-bold">
                        다음 투표 개설 예정일:{" "}
                        {formatKstDateTime(upcomingVotingSchedule.opensAt)}{" "}
                        (KST)
                      </p>

                      <p>
                        대상 회차: {upcomingVotingSchedule.session.sessionNum}
                      </p>

                      <p>
                        투표 종료 예정:{" "}
                        {formatKstDateTime(upcomingVotingSchedule.closesAt)}{" "}
                        (KST)
                      </p>
                    </>
                  ) : votingWindowButNotOpen ? (
                    <>
                      <p className="font-bold">
                        예정된 투표 기간에 해당하지만 현재 서버에서 투표가 열려
                        있지 않습니다.
                      </p>

                      <p>
                        계산된 기간:{" "}
                        {formatKstDateTime(votingWindowButNotOpen.opensAt)} ~{" "}
                        {formatKstDateTime(votingWindowButNotOpen.closesAt)}{" "}
                        (KST)
                      </p>

                      <p>회차 정보를 새로고침한 뒤 다시 확인해 주세요.</p>
                    </>
                  ) : expiredUnresolvedVotingSchedule ? (
                    <>
                      <p className="font-bold">
                        이 회차의 투표 기간이 종료되었습니다.
                      </p>

                      <p>
                        종료 시각:{" "}
                        {formatKstDateTime(
                          expiredUnresolvedVotingSchedule.closesAt,
                        )}{" "}
                        (KST)
                      </p>

                      <p>
                        득표가 있으면 서버가 최다 득표 후보를 자동 확정합니다.
                        득표가 없으면 주제는 미정으로 남습니다.
                      </p>
                    </>
                  ) : hasClosedVotingTopic ? (
                    <p>
                      주제가 직접 지정되거나 자동 확정되어 투표가
                      종료되었습니다.
                    </p>
                  ) : topicOpenDaysBefore != null ? (
                    <>
                      <p>
                        투표는 회차 {topicOpenDaysBefore}일 전 00:00 (KST)에
                        시작하여 회차 당일 15:00 (KST)에 종료됩니다.
                      </p>

                      <p>예정된 회차가 등록되면 정확한 일정을 표시합니다.</p>
                    </>
                  ) : (
                    <p>
                      투표 개설 기준 정보를 확인할 수 없어 예정일을 계산할 수
                      없습니다.
                    </p>
                  )}

                  <div className="mt-2 border-t border-blue-100 pt-2 text-[10px] text-blue-700">
                    <p>
                      스터디장 또는 부장이 회차 주제를 직접 입력하면 투표는 즉시
                      종료됩니다.
                    </p>

                    <p>
                      회차 당일 15:00 (KST) 이후 서버가 1분 이내 최다 득표
                      후보를 확정합니다. 동점이면 먼저 제안된 후보가 우선합니다.
                    </p>

                    <p>득표가 없으면 주제는 확정되지 않고 투표만 종료됩니다.</p>
                  </div>
                </div>
                {topicSessionId === null ? (
                  <div className="py-8 text-center text-gray-400">
                    현재 주제 제안 및 투표가 가능한 회차가 없습니다.
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
            )}

            {/* 참여 신청 대기: 승인 모집 활동에서만 부장과 스터디장에게 보인다 */}
            {canManage && currentDetail?.summary.recruitMode === "APPROVAL" && (
              <div className="space-y-3 rounded-3xl border border-gray-100 bg-white p-5 text-xs shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900">
                    참여 신청 대기
                  </h3>
                  <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    {pendingApplications.length}건
                  </span>
                </div>

                {pendingApplications.length === 0 ? (
                  <p className="py-8 text-center text-gray-400">
                    대기 중인 참여 신청이 없습니다.
                  </p>
                ) : (
                  pendingApplications.map((application) => (
                    <div
                      key={application.id}
                      className="space-y-2 rounded-2xl border border-gray-100 bg-gray-50 p-4"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                          {application.name?.[0] ?? "?"}
                        </div>
                        <span className="min-w-0 truncate font-bold text-gray-900">
                          {application.name}
                        </span>
                        <span className="ml-auto shrink-0 text-gray-400">
                          {application.createdAt
                            ? new Date(
                                application.createdAt,
                              ).toLocaleDateString("ko-KR")
                            : ""}
                        </span>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          disabled={processingApplicationId !== null}
                          onClick={() =>
                            void handleApplicationDecision(
                              application,
                              "approve",
                            )
                          }
                          className="flex-1 rounded-xl bg-black py-1.5 font-bold text-white transition hover:bg-gray-800 disabled:opacity-50"
                        >
                          승인
                        </button>
                        <button
                          type="button"
                          disabled={processingApplicationId !== null}
                          onClick={() =>
                            void handleApplicationDecision(
                              application,
                              "reject",
                            )
                          }
                          className="flex-1 rounded-xl border border-gray-200 py-1.5 font-bold text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
                        >
                          거절
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

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
              {isAssignedTopicMode ? "회차 주제 지정" : "새로운 주제 제안"}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {isAssignedTopicMode
                ? "이 회차에서 진행할 주제를 입력해 주세요."
                : "함께 진행하고 싶은 활동 주제를 입력해 주세요."}
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
                placeholder={
                  isAssignedTopicMode
                    ? "지정할 회차 주제를 입력해 주세요."
                    : "주제 이름을 입력해 주세요."
                }
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
                  {isSubmittingTopic
                    ? "저장 중..."
                    : isAssignedTopicMode
                      ? "주제 저장"
                      : "주제 제안"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 활동 나가기 / 신청 취소 확인 창 */}
      {confirmAction && (
        <ConfirmModal
          title={
            confirmAction === "leave"
              ? "활동에서 나갈까요?"
              : "참여 신청을 취소할까요?"
          }
          message={
            confirmAction === "leave"
              ? "나간 뒤에 다시 참여하려면 새로 신청해야 합니다."
              : "취소한 뒤에도 다시 신청할 수 있습니다."
          }
          confirmLabel={confirmAction === "leave" ? "나가기" : "신청 취소"}
          onConfirm={() => {
            setConfirmAction(null);
            void handleCancelApplication();
          }}
          onCancel={closeConfirm}
        />
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
        mode="activity"
        onClose={() => setIsNoticeModalOpen(false)}
        activityId={activityId}
        onSuccess={async () => {
          await refreshNotices();
          setIsNoticeModalOpen(false);
        }}
      />

      {editingNotice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-notice-title"
            className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2
                id="edit-notice-title"
                className="text-lg font-bold text-gray-900"
              >
                공지 수정
              </h2>
              <button
                type="button"
                onClick={() => setEditingNotice(null)}
                disabled={isUpdatingNotice}
                className="cursor-pointer text-2xl leading-none text-gray-400 hover:text-gray-700 disabled:opacity-40"
                aria-label="공지 수정 닫기"
              >
                ×
              </button>
            </div>

            <label
              className="mb-2 block text-xs font-bold text-gray-700"
              htmlFor="edit-notice-title-input"
            >
              제목
            </label>
            <input
              id="edit-notice-title-input"
              value={editNoticeTitle}
              onChange={(event) => setEditNoticeTitle(event.target.value)}
              maxLength={100}
              placeholder="공지 제목을 입력해 주세요."
              className="mb-4 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-500"
            />

            <label
              className="mb-2 block text-xs font-bold text-gray-700"
              htmlFor="edit-notice-content-input"
            >
              내용
            </label>
            <textarea
              id="edit-notice-content-input"
              value={editNoticeContent}
              onChange={(event) => setEditNoticeContent(event.target.value)}
              rows={10}
              placeholder="공지 내용을 입력해 주세요."
              className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm leading-relaxed outline-none focus:border-gray-500"
            />

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingNotice(null)}
                disabled={isUpdatingNotice}
                className="cursor-pointer rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => void handleUpdateNotice()}
                disabled={
                  isUpdatingNotice ||
                  !editNoticeTitle.trim() ||
                  !editNoticeContent.trim()
                }
                className="cursor-pointer rounded-xl bg-black px-5 py-2.5 text-xs font-bold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isUpdatingNotice ? "저장 중..." : "수정 저장"}
              </button>
            </div>
          </div>
        </div>
      )}

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
            showToast(
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
        activity={currentDetail}
        onSave={handleSaveSettings}
        onDelete={() => setIsDeleteConfirmOpen(true)}
      />
      {isDeleteConfirmOpen && (
        <ConfirmModal
          title="활동을 삭제할까요?"
          message="활동을 삭제하면 되돌릴 수 없습니다. 정말 삭제하시겠습니까?"
          confirmLabel={isDeletingActivity ? "삭제 중..." : "삭제하기"}
          cancelLabel="취소"
          danger
          onConfirm={() => void handleDeleteActivity()}
          onCancel={() => {
            if (!isDeletingActivity) {
              setIsDeleteConfirmOpen(false);
            }
          }}
        />
      )}

      <ArticleDetailModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        onAddFeedback={handleAddFeedback}
      />
    </div>
  );
}
