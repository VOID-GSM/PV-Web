import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import { MainPage } from "./pages/MainPage";
import CalendarPage from "./pages/CalendarPage";
import ActivityDetailPage from "./pages/ActivityDetailPage";
import ArchivePage from "./pages/ArchivePage";
import ArticleEditorPage from "./pages/ArticleEditorPage";
import WeeklyReportPage from "./pages/WeeklyReportPage";
import InvitePage from "./pages/InvitePage";
import SettingsPage from "./pages/SettingsPage";
import WorklogPage from "./pages/WorklogPage";
import RetrospectivePage from "./pages/RetrospectivePage";
import QuestionBankPage from "./pages/QuestionBankPage";
import AssignmentPage from "./pages/AssignmentPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

import SidebarLayout from "./components/layout/SidebarLayout";
import { AddEventModal } from "./components/calendar/AddEventModal";
import type { CalendarEvent } from "./types/calendar";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  getBoards,
  getCalendarEvents,
  updateCalendarEvent,
  type ApiBoard,
} from "./api/calendarApi";

export default function App() {
  const navigate = useNavigate();

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [boards, setBoards] = useState<ApiBoard[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const now = new Date();
    const from = `${now.getFullYear() - 1}-01-01`;
    const to = `${now.getFullYear() + 1}-12-31`;

    getBoards()
      .then((data) => {
        if (!cancelled) {
          setBoards(data);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          console.error("보드 목록 조회 실패:", error);
        }
      });

    getCalendarEvents(from, to)
      .then((data) => {
        if (cancelled) return;

        const loadedEvents: CalendarEvent[] = data.map((event) => ({
          id: String(event.id),
          title: event.title,
          type: "개인 일정",
          board: "",
          date: event.startsAt.slice(0, 10),
          endDate: event.endsAt.slice(0, 10),
          time: event.allDay
            ? undefined
            : event.startsAt.slice(11, 16),
          description: event.memo ?? "",
          isMyEvent: true,
        }));

        setEvents(loadedEvents);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          console.error("캘린더 API 조회 실패:", error);
          window.alert(
            error instanceof Error
              ? error.message
              : "캘린더 데이터를 불러오지 못했습니다.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleAddEvent = async (newEvent: CalendarEvent) => {
    try {
      const startsAt = newEvent.time
        ? `${newEvent.date}T${newEvent.time}:00`
        : `${newEvent.date}T00:00:00`;

      const endDate = newEvent.endDate || newEvent.date;
      const endsAt = newEvent.time
        ? `${endDate}T${newEvent.time}:00`
        : `${endDate}T23:59:00`;

      const created = await createCalendarEvent({
        title: newEvent.title,
        memo: newEvent.description ?? "",
        startsAt,
        endsAt,
        allDay: !newEvent.time,
      });

      setEvents((prev) => [
        ...prev,
        { ...newEvent, id: String(created.id) },
      ]);

      setIsAddModalOpen(false);
    } catch (error) {
      console.error("일정 생성 실패:", error);
      window.alert(
        error instanceof Error
          ? error.message
          : "일정을 저장하지 못했습니다.",
      );
    }
  };

  const handleUpdateEvent = async (updatedEvent: CalendarEvent) => {
    try {
      const updated = await updateCalendarEvent(
        Number(updatedEvent.id),
        {
          title: updatedEvent.title,
          memo: updatedEvent.description ?? "",
          startsAt: updatedEvent.time
            ? `${updatedEvent.date}T${updatedEvent.time}:00`
            : `${updatedEvent.date}T00:00:00`,
          endsAt: `${updatedEvent.endDate || updatedEvent.date}T${updatedEvent.time || "23:59"}:00`,
          allDay: !updatedEvent.time,
        },
      );

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
                description:
                  updated.memo ?? updatedEvent.description,
              }
            : event,
        ),
      );
    } catch (error) {
      console.error("일정 수정 실패:", error);
      window.alert(
        error instanceof Error
          ? error.message
          : "일정을 수정하지 못했습니다.",
      );
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteCalendarEvent(Number(eventId));

      setEvents((prev) =>
        prev.filter((event) => event.id !== eventId),
      );
    } catch (error) {
      console.error("일정 삭제 실패:", error);
      window.alert(
        error instanceof Error
          ? error.message
          : "일정을 삭제하지 못했습니다.",
      );
    }
  };

  const handleToggleEvent = (eventId: string) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId
          ? { ...event, completed: !event.completed }
          : event,
      ),
    );
  };

  const todayStr = new Date().toLocaleDateString("sv-SE");
  const todayTaskCount = events.filter(
    (event) => event.date === todayStr,
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
          <Route path="/" element={<Navigate to="/today" replace />} />

          <Route
            path="/today"
            element={
              <MainPage
                events={events}
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
      </Routes>

      <AddEventModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddEvent={handleAddEvent}
      />
    </>
  );
}
