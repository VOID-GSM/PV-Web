// src/components/layout/SidebarLayout.tsx
import { Outlet, useLocation, useNavigate } from "react-router-dom";
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

  // 지금 주소를 보고 사이드바에서 어떤 메뉴에 불을 켤지 정한다
  const getCurrentMenu = (path: string) => {
    if (path === "/today" || path === "/") return "오늘 할 일";
    if (path.startsWith("/calendar")) return "통합 캘린더";
    if (path.startsWith("/activity")) return "활동";
    if (path.startsWith("/archive")) return "정리글 아카이브";
    if (path.startsWith("/questions")) return "면접 질문 뱅크";
    if (path.startsWith("/assignments")) return "과제 · 역량맵";
    // ★ /members 주소면 "팀원 관리"에 불을 켠다
    if (path.startsWith("/members")) return "팀원 관리";
    if (path.startsWith("/report")) return "주간 리포트";
    if (path.startsWith("/invite")) return "팀원 초대";
    if (path.startsWith("/settings")) return "설정";
    return "통합 캘린더";
  };

  const currentMenu = getCurrentMenu(location.pathname);

  // 사이드바 메뉴를 눌렀을 때 해당 주소로 이동한다
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
      default:
        break;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f7f7f8]">
      <Sidebar
        activeMenu={currentMenu}
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