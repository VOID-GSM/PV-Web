// src/components/layout/SidebarLayout.tsx
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";

interface SidebarLayoutProps {
  todayTaskCount?: number;
  assignmentCount?: number;
}

export default function SidebarLayout({
  todayTaskCount = 0,
  assignmentCount = 0,
}: SidebarLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // 현재 경로로 activeMenu 자동 계산
  const getCurrentMenu = (path: string) => {
    if (path.startsWith("/today")) return "오늘 할 일";
    if (path.startsWith("/calendar")) return "통합 캘린더";
    if (path.startsWith("/activity")) return "활동";
    if (path.startsWith("/archive")) return "정리글 아카이브";
    if (path.startsWith("/report")) return "주간 리포트";
    if (path.startsWith("/invite")) return "팀원 초대";
    if (path.startsWith("/settings")) return "설정";
    return "오늘 할 일";
  };

  // 메뉴 클릭 시 이동 핸들러
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
      case "주간 리포트":
      case "주간리포트":
      case "리포트":
        navigate("/report");
        break;
      case "팀원 초대":
        navigate("/invite");
        break;
      case "설정":
        navigate("/settings");
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f7f7f8]">
      <Sidebar
        activeMenu={getCurrentMenu(location.pathname)}
        todayTaskCount={todayTaskCount}
        assignmentCount={assignmentCount}
        onNavigate={handleNavigate}
      />
      <div className="flex flex-1 flex-col overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
