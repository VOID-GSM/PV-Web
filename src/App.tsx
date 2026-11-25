// useCallback: 함수를 한 번만 만들어 두고 재사용하게 해주는 기능 (토스트 닫기에 사용)
import { useCallback, useEffect, useRef, useState } from "react";
// ★ useLocation: 지금 주소를 알려준다 (입장 화면인지 확인용)
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { getHomeTodos, type HomeTodoItem } from "./api/homeApi";
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
  deleteCalendarEvent,
  getBoards,
  getCalendarEvents,
  updateCalendarEvent,
  type ApiBoard,
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

  // 서버는 캘린더를 한 번에 최대 92일까지만 조회할 수 있다(넘기면 400).
  // 그래서 보는 달 기준 앞뒤 7일씩만 요청하고, 이미 불러온 달은 다시 요청하지 않는다.
  const loadedMonthsRef = useRef<Set<string>>(new Set());

  // 완료 체크를 서버에 저장하는 중인 일정 id (같은 일정을 연타해도 한 번만 처리)
  const pendingToggleRef = useRef<Set<string>>(new Set());

  const loadMonth = useCallback((base: Date) => {
    const monthKey = `${base.getFullYear()}-${base.getMonth()}`;
    if (loadedMonthsRef.current.has(monthKey)) return;
    loadedMonthsRef.current.add(monthKey);

    // 그 달 1일의 7일 전 ~ 그 달 말일의 7일 뒤
    const fromDate = new Date(base.getFullYear(), base.getMonth(), -6);
    const toDate = new Date(base.getFullYear(), base.getMonth() + 1, 7);

    getCalendarEvents(formatDate(fromDate), formatDate(toDate))
      .then((data) => {
        const loadedEvents: CalendarEvent[] = data.map((event) => ({
          id: String(event.id),
          title: event.title,
          type:
            event.type === "DEADLINE"
              ? "마감"
              : event.type === "MEETING"
                ? "회의"
                : event.type === "ACTIVITY"
                  ? "활동"
                  : "개인 일정",
          board: "",
          date: event.startsAt.slice(0, 10),
          endDate: event.endsAt.slice(0, 10),
          time: event.allDay ? undefined : event.startsAt.slice(11, 16),
          description: event.memo ?? "",
          // 서버에 저장된 완료 여부 (새로고침해도 체크가 유지된다)
          completed: event.completed ?? false,
          // 보드 마감이면 보드 번호와 담당자 번호들
          boardId: event.boardId,
          assigneeIds: event.assigneeIds ?? [],
          isMyEvent: true,
        }));

        // 같은 id는 새 값으로 덮어쓰고, 새 일정은 추가한다.
        // (달을 옮겨도 먼저 불러온 달의 일정이 사라지지 않는다)
        setEvents((prev) => {
          const merged = new Map(prev.map((item) => [item.id, item]));
          loadedEvents.forEach((item) => merged.set(item.id, item));
          return Array.from(merged.values());
        });
      })
      .catch((error: unknown) => {
        // 실패하면 다음에 다시 시도할 수 있게 표시를 지운다
        loadedMonthsRef.current.delete(monthKey);
        console.error("캘린더 API 조회 실패:", error);
      });
  }, []);

  // 어떤 날짜가 속한 달을 서버에서 다시 불러온다 (마감을 만든 뒤 캘린더에 바로 보이게)
  const reloadMonthOf = useCallback(
    (dateStr: string) => {
      // "2026-11-30" → 그 날짜 정오 (시간대 때문에 날짜가 밀리지 않게)
      const base = new Date(`${dateStr}T12:00:00`);
      loadedMonthsRef.current.delete(`${base.getFullYear()}-${base.getMonth()}`);
      loadMonth(base);
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

    // 회원 정보 및 보드 조회
    apiRequest<{ roles: string[] }>("/members/me")
      .then((member) => {
        if (cancelled) return;

        if (member.roles?.includes("LEADER")) {
          return getBoards().then((data) => {
            if (!cancelled) setBoards(data);
          });
        }

        setBoards([]);
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

    // 그 외(개인 일정 등): 기존처럼 내 일정으로 저장
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
      });

      setEvents((prev) => [...prev, { ...newEvent, id: String(created.id) }]);

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
    try {
      const updated = await updateCalendarEvent(Number(updatedEvent.id), {
        title: updatedEvent.title,
        memo: updatedEvent.description ?? "",
        startsAt: updatedEvent.time
          ? `${updatedEvent.date}T${updatedEvent.time}:00`
          : `${updatedEvent.date}T00:00:00`,
        endsAt: `${updatedEvent.endDate || updatedEvent.date}T${updatedEvent.time || "23:59"}:00`,
        allDay: !updatedEvent.time,
      });

      setEvents((prev) =>
        prev.map((event) =>
          event.id === updatedEvent.id
            ? {
                ...updatedEvent,
                id: String(updated.id),
                title: updated.title,
                date: updated.startsAt.slice(0, 10),
                endDate: updated.endsAt.slice(0, 10),
                time: updated.allDay
                  ? undefined
                  : updated.startsAt.slice(11, 16),
                description: updated.memo ?? updatedEvent.description,
                completed: updated.completed ?? updatedEvent.completed,
              }
            : event,
        ),
      );
      showToast("일정을 수정했습니다", "success");
    } catch (error) {
      console.error("일정 수정 실패:", error);
      showToast(
        error instanceof Error ? error.message : "일정을 수정하지 못했습니다.",
      );
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteCalendarEvent(Number(eventId));

      setEvents((prev) => prev.filter((event) => event.id !== eventId));
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
                boards={boards}
                activeMenu="통합 캘린더"
                onNavigate={handleNavigate}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                onAddEvent={handleAddEvent}
                onDeleteEvent={handleDeleteEvent}
                onUpdateEvent={handleUpdateEvent}
                onMonthChange={loadMonth}
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