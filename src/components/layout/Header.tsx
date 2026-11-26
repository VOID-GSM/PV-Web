import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

import bellIcon from "../../assets/icons/bell.svg";
import plusIcon from "../../assets/icons/plus.svg";
import calendarIcon from "../../assets/icons/calendar.svg";
import bookIcon from "../../assets/icons/book.svg";
import fileTextIcon from "../../assets/icons/file-text.svg";
import clipboardIcon from "../../assets/icons/clipboard.svg";
import micIcon from "../../assets/icons/mic.svg";

import CreateActivityModal, {
  type ActivityFormData,
} from "../modals/CreateActivityModal";
import { createActivity } from "../../api/activityApi";
import CreateNoticeModal from "../modals/CreateNoticeModal";
// ☆ 예전 작은 작성 창(CreateArticleModal)은 이제 안 쓴다 → 각 기능 화면으로 바로 보낸다
import Toast from "../common/Toast";
import { notifyActivitiesChanged } from "../../utils/activityEvents";
<<<<<<< HEAD
// ☆ 부장인지 (과제 출제는 부장만)
import { useMyName } from "../../hooks/useMyName";
=======
import { getNotice, type NoticeItem } from "../../api/noticeApi";
>>>>>>> origin/develop

import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type ApiNotification,
} from "../../api/notificationApi";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenAddModal?: () => void;
}

interface OutletContextType {
  onOpenAddModal?: () => void;
}

type ToastState = {
  id: number;
  message: string;
  type: "success" | "info";
};

const NOTICE_TABS = ["전체", "안 읽음"] as const;
type NoticeTab = (typeof NOTICE_TABS)[number];

const COMMENT_NOTIFICATIONS: Record<string, { path: string; label: string }> = {
  WORKLOG_COMMENT: { path: "/worklog", label: "업무일지 댓글" },
  SUBMISSION_COMMENT: { path: "/assignments", label: "제출물 댓글" },
  NOTE_COMMENT: { path: "/archive", label: "정리글 댓글" },
};

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onOpenAddModal,
}) => {
  const outletContext = useOutletContext<OutletContextType | null>();
  const handleAddModal = onOpenAddModal || outletContext?.onOpenAddModal;
  const navigate = useNavigate();
  // ☆ 부장인지 (못 불러왔으면 false → 과제 출제 메뉴가 잠깐 숨겨진다)
  const { isLeader } = useMyName();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [activeNoticeTab, setActiveNoticeTab] = useState<NoticeTab>("전체");

  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);

  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);
  const [noticePreview, setNoticePreview] = useState<{ title: string; content: string } | null>(null);
  const [isLoadingSelectedNotice, setIsLoadingSelectedNotice] = useState(false);
  const [selectedNoticeError, setSelectedNoticeError] = useState("");

  const filteredNotifications = notifications.filter(
    (item) => activeNoticeTab !== "안 읽음" || !item.read,
  );

  const showToast = (message: string, type: "success" | "info" = "info") => {
    setToast((prev) => ({
      id: (prev?.id ?? 0) + 1,
      message,
      type,
    }));
  };

  const closeToast = useCallback(() => setToast(null), []);

  // ☆ 새로 만들기 메뉴를 닫고 그 기능 화면으로 이동
  // state: 이동한 화면에 "바로 작성 창을 열어줘"라고 알려주는 쪽지 (과제 출제에서 사용)
  const goTo = (path: string, state?: Record<string, unknown>) => {
    setIsCreateOpen(false);
    navigate(path, state ? { state } : undefined);
  };

  useEffect(() => {
    let cancelled = false;

    getNotifications()
      .then((response) => {
        if (!cancelled) {
          setNotifications(response.items ?? []);
        }
      })
      .catch((error: unknown) => {
        console.error("알림 조회 실패:", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((items) =>
        items.map((item) => ({ ...item, read: true })),
      );
    } catch (error) {
      console.error("알림 전체 읽음 처리 실패:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "알림을 읽음 처리하지 못했습니다.",
      );
    }
  };

  const handleReadNotification = async (notification: ApiNotification) => {
    if (notification.read) return;

    try {
      await markNotificationRead(notification.id);
      setNotifications((items) =>
        items.map((item) =>
          item.id === notification.id ? { ...item, read: true } : item,
        ),
      );
    } catch (error) {
      console.error("알림 읽음 처리 실패:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "알림을 읽음 처리하지 못했습니다.",
      );
    }
  };

  const handleClickNotification = (notification: ApiNotification) => {
    void handleReadNotification(notification);
    setIsNoticeOpen(false);

    const notificationType = String(notification.type ?? "").toUpperCase();
    if (notificationType.includes("NOTICE")) {
      if (notification.noticeId) {
        setSelectedNotice(null);
        setNoticePreview(null);
        setSelectedNoticeError("");
        setIsLoadingSelectedNotice(true);
        void getNotice(notification.noticeId)
          .then((notice) => setSelectedNotice(notice))
          .catch((error: unknown) => {
            console.error("알림에서 공지 상세 조회 실패:", error);
            setSelectedNoticeError(
              error instanceof Error ? error.message : "공지 내용을 불러오지 못했습니다.",
            );
          })
          .finally(() => setIsLoadingSelectedNotice(false));
        return;
      }

      // noticeId가 없으면 서버가 제공한 이동 경로나 활동 ID를 사용한다.
      if (notification.targetUrl?.startsWith("/") && !notification.targetUrl.startsWith("//")) {
        navigate(notification.targetUrl);
        return;
      }
      if (notification.activityId) {
        navigate(`/activity/${notification.activityId}?tab=공지`);
        return;
      }

      // noticeId가 없는 기존 응답도 알림 본문을 표시한다. 실제 공지 상세 API 응답과는 구분한다.
      if (notification.content?.trim()) {
        setNoticePreview({
          title: notification.title || "공지 알림",
          content: notification.content,
        });
      } else {
        showToast("공지 상세 정보가 알림 응답에 없습니다.");
      }
      return;
    }

    // 서버가 제공한 내부 경로를 우선 사용한다.
    if (notification.targetUrl?.startsWith("/") && !notification.targetUrl.startsWith("//")) {
      navigate(notification.targetUrl);
      return;
    }

    const comment = COMMENT_NOTIFICATIONS[String(notification.type)];
    if (comment) navigate(comment.path);
  };
  const handleCreateActivity = async (form: ActivityFormData) => {
    const majorMap: Record<
      string,
      "FRONTEND" | "BACKEND" | "DEVOPS" | "DESIGN"
    > = {
      "Front-end": "FRONTEND",
      "Back-end": "BACKEND",
      DevOps: "DEVOPS",
      Design: "DESIGN",
    };

    const type =
      form.type === "면접 준비"
        ? "INTERVIEW"
        : form.type === "포폴 피드백"
          ? "PORTFOLIO"
          : "STUDY";

    const weekdayMap: Record<string, string> = {
      월요일: "MONDAY",
      화요일: "TUESDAY",
      수요일: "WEDNESDAY",
      목요일: "THURSDAY",
      금요일: "FRIDAY",
      토요일: "SATURDAY",
      일요일: "SUNDAY",
    };

    const weekday = Object.keys(weekdayMap).find((day) =>
      form.repeatRule.includes(day),
    );

    const repeatTime = form.repeatRule.match(/\d{1,2}:\d{2}/)?.[0];
    const topicOpenDaysBefore = Number(form.voteTime.match(/\d+/)?.[0] ?? 3);

    try {
      await createActivity({
        type,
        name: form.title.trim(),
        capacity: Number(form.memberCount),
        startDate: form.startDate,
        endDate: form.endDate,

        targetMajors: form.departments
          .map((major) => majorMap[major])
          .filter(
            (major): major is "FRONTEND" | "BACKEND" | "DEVOPS" | "DESIGN" =>
              Boolean(major),
          ),

        // 모달에서 검증한 실제 기수 ID를 API 필드명 그대로 전달한다.
        // '전체'를 선택하면 빈 배열이므로 제한 필드는 생략한다.
        targetGenerationIds:
          form.targetGenerationIds.length > 0
            ? [...form.targetGenerationIds]
            : undefined,

        recruitMode:
          form.confirmMode === "스터디장 승인" ? "APPROVAL" : "FIRST_COME",
        topicMode: form.topicMode === "투표형" ? "VOTE" : "ASSIGNED",
        repeatDayOfWeek: weekday ? weekdayMap[weekday] : undefined,
        repeatTime,
        topicOpenDaysBefore: Number.isFinite(topicOpenDaysBefore)
          ? topicOpenDaysBefore
          : 3,
        discordEnabled: form.discordEnabled,
      });

      notifyActivitiesChanged();
      showToast("활동을 만들었습니다.", "success");
    } catch (error) {
      console.error("활동 생성 실패:", error);
      showToast(
        error instanceof Error ? error.message : "활동을 생성하지 못했습니다.",
      );
    }
  };

  const unreadCount = notifications.filter((item) => !item.read).length;

  const noticeRef = useRef<HTMLDivElement>(null);
  const createRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (noticeRef.current && !noticeRef.current.contains(e.target as Node)) {
        setIsNoticeOpen(false);
      }

      if (createRef.current && !createRef.current.contains(e.target as Node)) {
        setIsCreateOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="relative flex h-16 w-full shrink-0 items-center justify-between border-b border-gray-100 bg-white px-8 font-pretendard select-none">
        <div>
          <h1 className="text-base font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative" ref={noticeRef}>
            <button
              type="button"
              onClick={() => {
                setIsNoticeOpen(!isNoticeOpen);
                setIsCreateOpen(false);
              }}
              className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-gray-100 text-gray-500 transition hover:bg-gray-50"
            >
              <img src={bellIcon} alt="알림" className="h-4 w-4 opacity-60" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
              )}
            </button>

            {isNoticeOpen && (
              <div className="absolute right-0 z-50 mt-3 w-96 animate-in fade-in zoom-in-95 rounded-3xl border border-gray-100 bg-white p-5 shadow-2xl duration-150">
                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900">알림</h3>
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      안 읽음 {unreadCount}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="cursor-pointer text-xs font-medium text-gray-400 hover:text-gray-600"
                  >
                    모두 읽음
                  </button>
                </div>

                <div className="flex gap-4 border-b border-gray-100 pt-2 pb-1 text-xs font-semibold text-gray-400">
                  {NOTICE_TABS.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveNoticeTab(tab)}
                      className={`relative cursor-pointer pb-2 ${
                        activeNoticeTab === tab
                          ? "border-b-2 border-black font-bold text-gray-900"
                          : "hover:text-gray-600"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {filteredNotifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">
                    새로운 알림이 없습니다.
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto py-2">
                    {filteredNotifications.map((item) => {
                      const comment = COMMENT_NOTIFICATIONS[String(item.type)];

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleClickNotification(item)}
                          className={`block w-full cursor-pointer rounded-xl px-3 py-3 text-left hover:bg-gray-50 ${
                            item.read ? "opacity-60" : "bg-blue-50/50"
                          }`}
                        >
                          {comment && (
                            <span className="mb-1 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600">
                              {comment.label}
                            </span>
                          )}
                          <span className="block text-xs font-semibold text-gray-800">
                            {item.title || "새 알림"}
                          </span>
                          <span className="mt-1 block text-[10px] text-gray-400">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleString("ko-KR")
                              : ""}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="relative" ref={createRef}>
            <button
              type="button"
              onClick={() => {
                setIsCreateOpen(!isCreateOpen);
                setIsNoticeOpen(false);
              }}
              className="flex h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-black px-4 text-xs font-bold text-white shadow-xs transition hover:bg-gray-800"
            >
              <img src={plusIcon} alt="" className="h-3.5 w-3.5 invert" />
              <span>새로 만들기</span>
            </button>

            {isCreateOpen && (
              <div className="absolute right-0 z-50 mt-3 w-64 animate-in fade-in zoom-in-95 space-y-3 rounded-3xl border border-gray-100 bg-white p-3 text-xs shadow-2xl duration-150">
                <div>
                  <p className="px-3 py-1 text-[10px] font-semibold text-gray-400">
                    새로 만들기
                  </p>

                  <div className="mt-1 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreateOpen(false);
                        handleAddModal?.();
                      }}
                      className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 font-semibold text-gray-800 transition hover:bg-gray-100"
                    >
                      <img
                        src={calendarIcon}
                        alt=""
                        className="h-4 w-4 opacity-70"
                      />
                      <span>일정 추가</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsCreateOpen(false);
                        setIsActivityModalOpen(true);
                      }}
                      className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 font-semibold text-gray-800 transition hover:bg-gray-100"
                    >
                      <img
                        src={bookIcon}
                        alt=""
                        className="h-4 w-4 opacity-70"
                      />
                      <span>활동 개설</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsCreateOpen(false);
                        setIsNoticeModalOpen(true);
                      }}
                      className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 font-semibold text-gray-800 transition hover:bg-gray-100"
                    >
                      <img
                        src={bellIcon}
                        alt=""
                        className="h-4 w-4 opacity-70"
                      />
                      <span>공지 보내기</span>
                    </button>

                    {/* ☆ 과제 출제: 부장만 보이고, 누르면 과제 화면에서 출제 창이 바로 열린다 */}
                    {isLeader && (
                      <button
                        type="button"
                        onClick={() =>
                          goTo("/assignments", { openCreate: true })
                        }
                        className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 font-semibold text-gray-800 transition hover:bg-gray-100"
                      >
                        <img
                          src={fileTextIcon}
                          alt=""
                          className="h-4 w-4 opacity-70"
                        />
                        <span>과제 출제</span>
                      </button>
                    )}
                  </div>
                </div>

                <hr className="border-gray-100" />

                <div>
                  <p className="px-3 py-1 text-[10px] font-semibold text-gray-400">
                    내 기록
                  </p>

                  <div className="mt-1 space-y-0.5">
                    {/* ☆ 정리글 작성: 활동·회차까지 고를 수 있는 정리글 작성 화면으로 */}
                    <button
                      type="button"
                      onClick={() => goTo("/editor")}
                      className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 font-semibold text-gray-800 transition hover:bg-gray-100"
                    >
                      <img
                        src={fileTextIcon}
                        alt=""
                        className="h-4 w-4 opacity-70"
                      />
                      <span>정리글 작성</span>
                    </button>

                    {/* ☆ 업무일지 쓰기: 업무일지 화면 (오른쪽 "오늘의 일지 쓰기") */}
                    <button
                      type="button"
                      onClick={() => goTo("/worklog")}
                      className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 font-semibold text-gray-800 transition hover:bg-gray-100"
                    >
                      <img
                        src={clipboardIcon}
                        alt=""
                        className="h-4 w-4 opacity-70"
                      />
                      <span>업무일지 쓰기</span>
                    </button>

                    {/* ☆ 면접 답변 남기기: 질문을 골라 답할 수 있는 면접 질문 뱅크로 */}
                    <button
                      type="button"
                      onClick={() => goTo("/questions")}
                      className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 font-semibold text-gray-800 transition hover:bg-gray-100"
                    >
                      <img
                        src={micIcon}
                        alt=""
                        className="h-4 w-4 opacity-70"
                      />
                      <span>면접 답변 남기기</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <CreateActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        onCreateSuccess={handleCreateActivity}
      />

      <CreateNoticeModal
        isOpen={isNoticeModalOpen}
        mode="global"
        onClose={() => setIsNoticeModalOpen(false)}
        activityId={0}
        onSuccess={() => {
          setIsNoticeModalOpen(false);
          showToast("공지를 보냈습니다", "success");
        }}
      />

      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </>
  );
};