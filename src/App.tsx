// useCallback: 함수를 한 번만 만들어 두고 재사용하게 해주는 기능 (토스트 닫기에 사용)
import { useCallback, useEffect, useRef, useState } from "react";
import { getMembers } from "./apis/members";
// ★ useLocation: 지금 주소를 알려준다 (입장 화면인지 확인용)
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { getHomeTodos, type HomeTodoItem } from "./api/homeApi";
import { getActivityMembers } from "./api/activityApi";
import { MainPage } from "./pages/MainPage";
import CalendarPage from "./pages/CalendarPage";
import ActivityDetailPage from "./pages/ActivityDetailPage";
import ArchivePage from "./pages/ArchivePage";
import ArticleEditorPage from "./pages/ArticleEditorPage";
import WeeklyReportPage from "./pages/WeeklyReportPage";
import InvitePage from "./pages/InvitePage";
import PendingPage from "./pages/PendingPage";
// 재입장 링크로 들어왔을 때 보여줄 화면
import ReEntryPage from "./pages/ReEntryPage";
import SettingsPage from "./pages/SettingsPage";
import WorklogPage from "./pages/WorklogPage";
import RetrospectivePage from "./pages/RetrospectivePage";
import QuestionBankPage from "./pages/QuestionBankPage";
import AssignmentPage from "./pages/AssignmentPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import { apiRequest } from "./api/client";
// ★ isPublicPath: 로그인 없이 쓰는 화면(입장·재입장)인지
import { isPublicPath, refreshSession } from "./api/session";
import SidebarLayout from "./components/layout/SidebarLayout";
import { AddEventModal } from "./components/calendar/AddEventModal";
// 브라우저 alert 대신 쓸 토스트
import Toast from "./components/common/Toast";
import type { CalendarEvent } from "./types/calendar";
import {
  createCalendarEvent,
  // 보드 마감 만들기
  createDeadline,
  createBoard,
  deleteCalendarEvent,
  getBoards,
  getCalendarEvents,
  updateCalendarEvent,
  type ApiBoard,
  type BoardCreateRequest,
} from "./api/calendarApi";

// 토스트 하나의 모양 (id가 바뀌면 같은 문구여도 새로 뜬다)
type ToastState = { id: number; message: string; type: "success" | "info" };

// 날짜를 "2026-11-17" 모양(로컬 시간 기준)으로 바꾼다
const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function AppContent() {
  const navigate = useNavigate();
  // ★ 지금 주소가 입장·재입장 화면이면 로그인이 필요한 데이터를 불러오지 않는다
  // (토큰이 없어서 401 → /invite로 튕기며 초대 코드가 사라지던 문제)
  const location = useLocation();
  const isPublicPage = isPublicPath(location.pathname);

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [boards, setBoards] = useState<ApiBoard[]>([]);
  const [canManageMeetings, setCanManageMeetings] = useState(false);

  const [myEvents, setMyEvents] = useState<CalendarEvent[]>([]);

  const memberNamesRef = useRef<Map<number, string>>(new Map());
  const boardNamesRef = useRef<Map<number, string>>(new Map());
  const [homeTodos, setHomeTodos] = useState<HomeTodoItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // 지금 떠 있는 토스트 (null이면 안 보임)
  const [toast, setToast] = useState<ToastState | null>(null);

  // 토스트 띄우기: 이전 번호 + 1로 새 토스트를 만든다
  const showToast = (message: string, type: "success" | "info" = "info") => {
    setToast((prev) => ({ id: (prev?.id ?? 0) + 1, message, type }));
  };
  // 토스트 닫기 (Toast가 2.5초 뒤 부른다)
  const closeToast = useCallback(() => setToast(null), []);

  // 앱 전체에서 호출되는 alert를 공통 Toast로 대체한다.
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (message?: unknown) => {
      const text = String(message ?? "");
      setToast((prev) => ({
        id: (prev?.id ?? 0) + 1,
        message: text,
        type: "info",
      }));
    };
    return () => {
      window.alert = originalAlert;
    };
  }, []);

  // 서버는 캘린더를 한 번에 최대 92일까지만 조회할 수 있다(넘기면 400).
  // 그래서 보는 달 기준 앞뒤 7일씩만 요청하고, 이미 불러온 달은 다시 요청하지 않는다.
  const loadedMonthsRef = useRef<Set<string>>(new Set());

  // 완료 체크를 서버에 저장하는 중인 일정 id (같은 일정을 연타해도 한 번만 처리)
  const pendingToggleRef = useRef<Set<string>>(new Set());

  const loadMonth = useCallback((base: Date, mine = false) => {
    const monthKey = `${base.getFullYear()}-${base.getMonth()}-${mine ? "mine" : "all"}`;

    if (loadedMonthsRef.current.has(monthKey)) return;
    loadedMonthsRef.current.add(monthKey);

    const fromDate = new Date(base.getFullYear(), base.getMonth(), -6);

    const toDate = new Date(base.getFullYear(), base.getMonth() + 1, 7);

    getCalendarEvents(formatDate(fromDate), formatDate(toDate), undefined, mine)
      .then(async (data) => {
        const activityIds = Array.from(
          new Set(
            data
              .filter(
                (event) =>
                  event.type === "ACTIVITY" &&
                  typeof event.activityId === "number",
              )
              .map((event) => event.activityId as number),
          ),
        );

        const leaderNames = new Map<number, string>();

        await Promise.all(
          activityIds.map(async (activityId) => {
            try {
              const members = await getActivityMembers(activityId);

              const leader = members.find(
                (member) =>
                  member.role === "LEADER" || member.roleLabel === "스터디장",
              );

              if (leader?.name) {
                leaderNames.set(activityId, leader.name);
              }
            } catch (error) {
              console.error(`활동 ${activityId}의 스터디장 조회 실패:`, error);
            }
          }),
        );

        const loadedEvents: CalendarEvent[] = data.map((event) => {
          const isActivity = event.type === "ACTIVITY";

          const leaderName =
            typeof event.activityId === "number"
              ? leaderNames.get(event.activityId)
              : undefined;

          return {
            id: String(event.id),
            title: event.title,

            type:
              event.type === "DEADLINE"
                ? "마감"
                : event.type === "MEETING"
                  ? "회의"
                  : isActivity
                    ? "활동"
                    : "개인 일정",

            board: isActivity
              ? "지정된 보드 없음"
              : event.boardId != null
                ? (boardNamesRef.current.get(event.boardId) ??
                  `보드 #${event.boardId}`)
                : "",

            date: event.startsAt.slice(0, 10),
            endDate: event.endsAt.slice(0, 10),

            time: event.allDay ? undefined : event.startsAt.slice(11, 16),

            description: event.memo ?? "",

            completed:
              event.type === "PERSONAL"
                ? (event.completed ?? false)
                : undefined,

            boardId: event.boardId,
            assigneeIds: event.assigneeIds ?? [],

            assignees: isActivity
              ? [leaderName || "스터디장"]
              : (event.assigneeIds ?? []).map(
                  (memberId) =>
                    memberNamesRef.current.get(memberId) ?? `회원 ${memberId}`,
                ),

            isMyEvent: mine || event.type === "PERSONAL",
          };
        });

        const mergeEventsForRange = (
          previous: CalendarEvent[],
        ): CalendarEvent[] => {
          const fromKey = formatDate(fromDate);
          const toKey = formatDate(toDate);

          const outsideRange = previous.filter(
            (event) =>
              event.date < fromKey ||
              event.date > toKey ||
              event.id.startsWith("ms-"),
          );

          const merged = new Map<string, CalendarEvent>();

          outsideRange.forEach((event) => {
            merged.set(event.id, event);
          });

          loadedEvents.forEach((event) => {
            merged.set(event.id, event);
          });

          return Array.from(merged.values());
        };

        if (mine) {
          setMyEvents(mergeEventsForRange);
        } else {
          setEvents(mergeEventsForRange);
        }
      })
      .catch((error: unknown) => {
        loadedMonthsRef.current.delete(monthKey);
        console.error("캘린더 API 조회 실패:", error);
      });
  }, []);

  const reloadMonthOf = useCallback(
    (dateStr: string) => {
      const base = new Date(`${dateStr}T12:00:00`);
      const monthPrefix = `${base.getFullYear()}-${base.getMonth()}`;

      loadedMonthsRef.current.delete(`${monthPrefix}-all`);
      loadedMonthsRef.current.delete(`${monthPrefix}-mine`);

      loadMonth(base, false);
      loadMonth(base, true);
    },
    [loadMonth],
  );
  // 처음에는 이번 달만 불러온다
  useEffect(() => {
    // ★ 입장·재입장 화면에서는 부르지 않는다
    if (isPublicPage) return;
    loadMonth(new Date());
  }, [loadMonth, isPublicPage]);

  useEffect(() => {
    // ★ 입장·재입장 화면에서는 부르지 않는다
    if (isPublicPage) return;

    let cancelled = false;

    // 오늘 할 일 조회
    getHomeTodos()
      .then((response) => {
        if (!cancelled) {
          setHomeTodos(response.items ?? []);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          console.error("오늘 할 일 API 조회 실패:", error);
        }
      });
    getMembers()
      .then((members) => {
        if (cancelled) return;

        const names = new Map<number, string>();

        members.forEach((member) => {
          names.set(member.memberId, member.name);
        });

        memberNamesRef.current = names;

        const applyMemberNames = (items: CalendarEvent[]) =>
          items.map((event) => {
            if (event.type === "활동" || !event.assigneeIds?.length) {
              return event;
            }

            return {
              ...event,
              assignees: event.assigneeIds.map(
                (memberId) => names.get(memberId) ?? `회원 ${memberId}`,
              ),
            };
          });

        setEvents(applyMemberNames);
        setMyEvents(applyMemberNames);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          console.error("참석자 이름 조회 실패:", error);
        }
      });

    // 회원 정보 및 보드 조회
    apiRequest<{ roles: string[] }>("/members/me")
      .then((member) => {
        if (cancelled) return;
        const isLeader = member.roles?.includes("LEADER") ?? false;

        setCanManageMeetings(isLeader);
        if (isLeader) {
          return getBoards().then((data) => {
            if (cancelled) return;

            setBoards(data);
            const names = new Map<number, string>(
              data.map((board) => [board.id, board.name] as const),
            );
            boardNamesRef.current = names;

            // 캘린더를 먼저 불러온 경우에도 보드 ID를 실제 이름으로 갱신한다.
            const applyBoardNames = (items: CalendarEvent[]) =>
              items.map((event) =>
                event.boardId != null && names.has(event.boardId)
                  ? { ...event, board: names.get(event.boardId)! }
                  : event,
              );

            setEvents(applyBoardNames);
            setMyEvents(applyBoardNames);
          });
        }

        setBoards([]);
        boardNamesRef.current = new Map();
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          console.error("회원 정보 또는 보드 조회 실패:", error);
        }
      });

    return () => {
      cancelled = true;
    };
    // ★ 입장 화면 → 일반 화면으로 바뀌면 그때 불러온다
  }, [isPublicPage]);

  // 보드 생성: POST 성공 직후 화면에 반영하고, GET /boards로 서버 저장 결과를 확인한다.
  const handleCreateBoard = async (
    request: BoardCreateRequest,
  ): Promise<void> => {
    if (!canManageMeetings) {
      throw new Error("보드 생성은 부장만 할 수 있습니다.");
    }

    const createdBoard = await createBoard(request);

    // 생성 결과를 즉시 반영해 화면에서 보드가 사라지지 않게 한다.
    setBoards((previous) => {
      const byId = new Map<number, ApiBoard>(previous.map((board) => [board.id, board] as const));
      byId.set(createdBoard.id, createdBoard);
      return Array.from(byId.values());
    });
    boardNamesRef.current.set(createdBoard.id, createdBoard.name);

    try {
      // 백엔드 명세상 GET /boards는 진행 중/종료 보드를 모두 반환한다.
      const latestBoards = await getBoards();
      const persisted = latestBoards.some(
        (board) => board.id === createdBoard.id,
      );

      if (persisted) {
        setBoards(latestBoards);
        boardNamesRef.current = new Map<number, string>(
          latestBoards.map((board) => [board.id, board.name] as const),
        );
        showToast("보드를 생성했습니다.", "success");
        return;
      }

      // POST 응답에는 있었지만 목록 조회에 없다면 프론트에서만 숨기지 않고 경고한다.
      setBoards((previous) => {
        const byId = new Map<number, ApiBoard>(previous.map((board) => [board.id, board] as const));
        byId.set(createdBoard.id, createdBoard);
        return Array.from(byId.values());
      });
      showToast(
        "보드 생성은 완료됐지만 GET /boards 응답에 새 보드가 없습니다. 백엔드 저장 및 조회 결과를 확인해 주세요.",
      );
    } catch (error) {
      console.error("생성 후 보드 목록 재조회 실패:", error);
      showToast(
        "보드는 생성됐지만 목록을 다시 불러오지 못했습니다. 새로고침 후 목록을 확인해 주세요.",
      );
    }
  };

  const handleAddEvent = async (newEvent: CalendarEvent) => {
    // 보드 마감 (부장이 마감 + 보드를 고른 경우): 보드 마감 API로 저장
    if (newEvent.type === "마감" && newEvent.boardId) {
      try {
        await createDeadline(newEvent.boardId, {
          name: newEvent.title,
          date: newEvent.date,
          assigneeIds: newEvent.assigneeIds ?? [],
          // 설명이 비어 있으면 보내지 않는다
          description: newEvent.description || undefined,
        });

        // 서버가 캘린더에 마감을 넣어주니, 그 달을 다시 불러와서 보여준다
        reloadMonthOf(newEvent.date);

        setIsAddModalOpen(false);
        showToast("보드 마감을 등록했습니다", "success");
      } catch (error) {
        console.error("보드 마감 생성 실패:", error);
        showToast(
          error instanceof Error
            ? error.message
            : "보드 마감을 등록하지 못했습니다.",
        );
      }
      return;
    }

    // 보드 회의는 부장만 생성할 수 있다.
    if (newEvent.type === "회의") {
      if (!canManageMeetings) {
        showToast("보드 회의 생성은 부장만 할 수 있습니다.");
        return;
      }
      if (newEvent.boardId == null) {
        showToast("회의를 등록할 보드를 선택해 주세요.");
        return;
      }
    }

    // 개인 일정은 type을 보내지 않아 기존 서버 동작을 유지한다.
    try {
      const startsAt = newEvent.time
        ? `${newEvent.date}T${newEvent.time}:00`
        : `${newEvent.date}T00:00:00`;

      const endDate = newEvent.endDate || newEvent.date;
      const endsAt = newEvent.time
        ? `${endDate}T${newEvent.time}:00`
        : `${endDate}T23:59:59`;

      const created = await createCalendarEvent({
        title: newEvent.title,
        memo: newEvent.description ?? "",
        startsAt,
        endsAt,
        allDay: !newEvent.time,
        ...(newEvent.type === "회의"
          ? {
              type: "MEETING" as const,
              boardId: newEvent.boardId!,
              assigneeIds: (newEvent.assigneeIds ?? []).slice(0, 20),
            }
          : {}),
      });
      if (newEvent.type === "회의") {
        reloadMonthOf(newEvent.date);
      } else {
        setEvents((prev) => [...prev, { ...newEvent, id: String(created.id) }]);
      }

      setIsAddModalOpen(false);
      showToast("일정을 추가했습니다", "success");
    } catch (error) {
      console.error("일정 생성 실패:", error);
      showToast(
        error instanceof Error ? error.message : "일정을 저장하지 못했습니다.",
      );
    }
  };

  const handleUpdateEvent = async (updatedEvent: CalendarEvent) => {
    const previousEvent = [...events, ...myEvents].find(
      (event) => event.id === updatedEvent.id,
    );

    if (updatedEvent.type === "회의" && !canManageMeetings) {
      showToast("보드 회의 수정은 부장만 할 수 있습니다.");
      return;
    }

    if (updatedEvent.type === "회의" && updatedEvent.boardId == null) {
      showToast("회의를 등록할 보드를 선택해 주세요.");
      return;
    }

    try {
      const updated = await updateCalendarEvent(Number(updatedEvent.id), {
        title: updatedEvent.title,
        memo: updatedEvent.description ?? "",
        startsAt: updatedEvent.time
          ? `${updatedEvent.date}T${updatedEvent.time}:00`
          : `${updatedEvent.date}T00:00:00`,
        endsAt: `${updatedEvent.endDate || updatedEvent.date}T${updatedEvent.time || "23:59"}:00`,
        allDay: !updatedEvent.time,
        ...(updatedEvent.type === "회의"
          ? {
              type: "MEETING" as const,
              boardId: updatedEvent.boardId as number,
              // []는 전체 참석자 해제, 값이 있으면 참석자 교체
              assigneeIds: (updatedEvent.assigneeIds ?? []).slice(0, 20),
            }
          : {}),
      });

      const optimisticEvent: CalendarEvent = {
        ...updatedEvent,
        id: String(updated.id),
        title: updated.title,
        date: updated.startsAt.slice(0, 10),
        endDate: updated.endsAt.slice(0, 10),
        time: updated.allDay ? undefined : updated.startsAt.slice(11, 16),
        description: updated.memo ?? updatedEvent.description,
        completed: updated.completed ?? updatedEvent.completed,
        assigneeIds: updatedEvent.assigneeIds ?? [],
      };

      const replaceEvent = (prev: CalendarEvent[]) =>
        prev.map((event) =>
          event.id === updatedEvent.id ? optimisticEvent : event,
        );
      setEvents(replaceEvent);
      setMyEvents(replaceEvent);

      // 서버의 mine 필터까지 다시 맞춘다. 날짜가 바뀌면 이전 달도 갱신한다.
      if (previousEvent && previousEvent.date !== updatedEvent.date) {
        reloadMonthOf(previousEvent.date);
      }
      reloadMonthOf(updatedEvent.date);
      showToast("일정을 수정했습니다", "success");
    } catch (error) {
      console.error("일정 수정 실패:", error);
      showToast(
        error instanceof Error ? error.message : "일정을 수정하지 못했습니다.",
      );
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    const targetEvent = [...events, ...myEvents].find(
      (event) => event.id === eventId,
    );

    if (targetEvent?.type === "회의" && !canManageMeetings) {
      showToast("보드 회의 삭제는 부장만 할 수 있습니다.");
      return;
    }

    try {
      await deleteCalendarEvent(Number(eventId));
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
      setMyEvents((prev) => prev.filter((event) => event.id !== eventId));
      showToast("일정을 삭제했습니다", "success");
    } catch (error) {
      console.error("일정 삭제 실패:", error);
      showToast(
        error instanceof Error ? error.message : "일정을 삭제하지 못했습니다.",
      );
    }
  };

  // 오늘 할 일 체크박스: 화면을 먼저 바꾸고 서버에 저장한다. 저장에 실패하면 되돌리고 토스트로 알린다.
  // 서버는 본인의 개인 일정만 완료 처리할 수 있다(마감·활동 일정은 불가).
  const handleToggleEvent = async (eventId: string) => {
    const target = events.find((event) => event.id === eventId);
    if (!target || target.type !== "개인 일정") return;
    if (pendingToggleRef.current.has(eventId)) return;
    pendingToggleRef.current.add(eventId);

    const nextCompleted = !target.completed;
    const setCompleted = (value: boolean) =>
      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId ? { ...event, completed: value } : event,
        ),
      );

    setCompleted(nextCompleted);

    try {
      const updated = await updateCalendarEvent(Number(eventId), {
        completed: nextCompleted,
      });
      // 서버가 돌려준 값이 있으면 그 값으로 맞춘다
      if (typeof updated.completed === "boolean") {
        setCompleted(updated.completed);
      }
    } catch (error) {
      console.error("일정 완료 상태 저장 실패:", error);
      setCompleted(!nextCompleted);
      showToast(
        error instanceof Error
          ? error.message
          : "완료 상태를 저장하지 못했습니다.",
      );
    } finally {
      pendingToggleRef.current.delete(eventId);
    }
  };

  const todayStr = new Date().toLocaleDateString("sv-SE");

  const todayTaskCount =
    events.filter((event) => event.date === todayStr).length +
    homeTodos.filter(
      (todo) => (todo.dueAt?.slice(0, 10) || todayStr) === todayStr,
    ).length;

  const handleNavigate = (menuName: string) => {
    switch (menuName) {
      case "오늘 할 일":
        navigate("/today");
        break;
      case "통합 캘린더":
        navigate("/calendar");
        break;
      case "활동":
        navigate("/activity");
        break;
      case "정리글":
      case "아카이브":
      case "정리글 아카이브":
        navigate("/archive");
        break;
      case "면접 질문 뱅크":
        navigate("/questions");
        break;
      case "과제 · 역량맵":
        navigate("/assignments");
        break;
      case "팀원 관리":
        navigate("/members");
        break;
      case "주간 리포트":
        navigate("/report");
        break;
      case "팀원 초대":
        navigate("/invite");
        break;
      case "설정":
        navigate("/settings");
        break;
      case "업무일지":
        navigate("/worklog");
        break;
      default:
        break;
    }
  };

  return (
    <>
      <Routes>
        <Route
          element={
            <SidebarLayout
              todayTaskCount={todayTaskCount}
              onOpenAddModal={() => setIsAddModalOpen(true)}
            />
          }
        >
          <Route path="/pending" element={<PendingPage />} />
          <Route path="/" element={<Navigate to="/today" replace />} />

          <Route
            path="/today"
            element={
              <MainPage
                events={events}
                homeTodos={homeTodos}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                onToggleEvent={handleToggleEvent}
              />
            }
          />

          <Route
            path="/calendar"
            element={
              <CalendarPage
                events={events}
                myEvents={myEvents}
                canManageMeetings={canManageMeetings}
                boards={boards}
                activeMenu="통합 캘린더"
                onNavigate={handleNavigate}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                onAddEvent={handleAddEvent}
                onDeleteEvent={handleDeleteEvent}
                onUpdateEvent={handleUpdateEvent}
                onMonthChange={loadMonth}
                onCreateBoard={handleCreateBoard}
              />
            }
          />

          <Route path="/activity" element={<ActivityDetailPage />} />
          <Route path="/activity/:id" element={<ActivityDetailPage />} />
          <Route path="/archive" element={<ArchivePage />} />
          <Route path="/editor" element={<ArticleEditorPage />} />
          <Route path="/archive/editor" element={<ArticleEditorPage />} />
          <Route
            path="/report"
            element={<Navigate to="/weekly-report" replace />}
          />
          <Route path="/weekly-report" element={<WeeklyReportPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/worklog" element={<WorklogPage />} />
          <Route path="/retrospective" element={<RetrospectivePage />} />
          <Route path="/questions" element={<QuestionBankPage />} />
          <Route path="/assignments" element={<AssignmentPage />} />
          <Route path="/members" element={<AdminDashboardPage />} />
        </Route>

        <Route path="/invite" element={<InvitePage />} />
        <Route path="/invite/:code" element={<InvitePage />} />
        {/* 재입장 링크 (사이드바 밖: 아직 토큰이 없는 사람이 들어오는 주소라서) */}
        <Route path="/re-entry/:code" element={<ReEntryPage />} />
      </Routes>

      <AddEventModal
        isOpen={isAddModalOpen}
        canManageMeetings={canManageMeetings}
        onClose={() => setIsAddModalOpen(false)}
        onAddEvent={handleAddEvent}
        // 부장이면 마감을 보드에 등록할 수 있게 (끝난 보드는 빼고)
        boards={boards.filter((board) => board.status !== "CLOSED")}
      />

      {/* 일정 추가·수정·삭제 결과 토스트 (어느 페이지에서든 뜬다) */}
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
}

// 로그인 상태 확인을 담당하는 최상위 App 컴포넌트
export default function App() {
  const isReEntry = window.location.pathname.startsWith("/re-entry/");

  const [authState, setAuthState] = useState<"checking" | "ready" | "failed">(
    isReEntry ? "ready" : "checking",
  );

  useEffect(() => {
    const pathname = window.location.pathname;

    // 재입장 링크는 기존 계정의 refresh보다 먼저 처리
    if (pathname.startsWith("/re-entry/")) {
      return;
    }

    let cancelled = false;

    const checkSession = async () => {
      const result = await refreshSession();

      if (cancelled) return;

      if (result === "ok") {
        if (pathname.startsWith("/invite") || pathname === "/") {
          window.location.replace("/today");
          return;
        }

        setAuthState("ready");
        return;
      }

      if (result === "invalid") {
        if (pathname.startsWith("/invite")) {
          setAuthState("ready");
        } else {
          window.location.replace("/invite");
        }
        return;
      }

      if (result === "pending") return;

      setAuthState("failed");
    };

    void checkSession();

    return () => {
      cancelled = true;
    };
  }, []);

  if (authState === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f8] font-pretendard">
        <p className="text-sm text-gray-500">
          로그인 상태를 확인하고 있어요...
        </p>
      </div>
    );
  }

  if (authState === "failed") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f7f7f8] font-pretendard">
        <p className="text-sm text-gray-600">
          로그인 상태를 확인하지 못했습니다.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg bg-black px-5 py-3 text-sm text-white"
        >
          다시 시도하기
        </button>
      </div>
    );
  }

  return <AppContent />;
}
