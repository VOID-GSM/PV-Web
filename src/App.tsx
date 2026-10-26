import { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import { MainPage } from "./pages/MainPage";
import CalendarPage from "./pages/CalendarPage";
import ActivityDetailPage from "./pages/ActivityDetailPage";
import ArchivePage from "./pages/ArchivePage";
import ArticleEditorPage from "./pages/ArticleEditorPage";
import WeeklyReportPage from "./pages/WeeklyReportPage";
import InvitePage from "./pages/InvitePage";
import SettingsPage from "./pages/SettingsPage";
// ★ 업무일지 페이지
import WorklogPage from "./pages/WorklogPage";
// 회고 페이지
import RetrospectivePage from "./pages/RetrospectivePage";
// 면접 질문 뱅크 페이지
import QuestionBankPage from "./pages/QuestionBankPage";
// ★★ 과제 (AssignmentPage.tsx가 없으면 이 줄 삭제)
import AssignmentPage from "./pages/AssignmentPage";
// ★ 부장 대시보드(팀원 관리) 페이지
import AdminDashboardPage from "./pages/AdminDashboardPage";

import SidebarLayout from "./components/layout/SidebarLayout";
import { AddEventModal } from "./components/calendar/AddEventModal";
import type { CalendarEvent } from "./types/calendar";

export default function App() {
  const navigate = useNavigate();

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddEvent = (newEvent: CalendarEvent) => {
    setEvents((prev) => [...prev, newEvent]);
  };

  // ★ 오늘 날짜 "2026-10-26" (한국 시간 기준)
  // 오늘 날짜 "2026-10-26" (한국 시간 기준) - 한 번만 선언한다
  // toISOString()은 UTC 기준이라 한국 오전 0~9시에 하루 전 날짜가 나와서 바꿨다
  const todayStr = new Date().toLocaleDateString("sv-SE");
  const todayTaskCount = events.filter((event) => event.date === todayStr).length;

  // 캘린더 화면 안에서 메뉴 이동이 필요할 때 쓰는 함수
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
      // ★ 팀원 관리 → /members
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
      // ★ 업무일지
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
        {/* 사이드바가 붙는 페이지들 */}
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
            element={<MainPage events={events} onOpenAddModal={() => setIsAddModalOpen(true)} />}
          />

          <Route
            path="/calendar"
            element={
              <CalendarPage
                events={events}
                activeMenu="통합 캘린더"
                onNavigate={handleNavigate}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                onAddEvent={handleAddEvent}
              />
            }
          />

          <Route path="/activity" element={<ActivityDetailPage />} />
          <Route path="/activity/:id" element={<ActivityDetailPage />} />
          <Route path="/archive" element={<ArchivePage />} />
          <Route path="/editor" element={<ArticleEditorPage />} />
          <Route path="/archive/editor" element={<ArticleEditorPage />} />
          <Route path="/report" element={<Navigate to="/weekly-report" replace />} />
          <Route path="/weekly-report" element={<WeeklyReportPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          {/* ★ 업무일지 */}
          <Route path="/worklog" element={<WorklogPage />} />
          {/* 회고 (사이드바에 메뉴가 없어서 주소로 접근) */}
          <Route path="/retrospective" element={<RetrospectivePage />} />
          {/* 면접 질문 뱅크 */}
          <Route path="/questions" element={<QuestionBankPage />} />
          {/* ★★ 과제 (AssignmentPage.tsx가 없으면 아래 줄 삭제) */}
          <Route path="/assignments" element={<AssignmentPage />} />
          {/* ★ 부장 대시보드(팀원 관리) */}
          <Route path="/members" element={<AdminDashboardPage />} />
        </Route>

        {/* 사이드바 없이 보이는 페이지 (아직 팀원이 아닌 사람이 들어오는 화면) */}
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