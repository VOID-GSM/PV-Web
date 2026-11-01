import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";

interface SidebarLayoutProps {
  todayTaskCount?: number;
  assignmentCount?: number;
  onNavigate?: (menuName: string) => void;
  onOpenAddModal?: () => void;
}

export default function SidebarLayout({
  todayTaskCount = 0,
  assignmentCount = 0,
  onNavigate,
  onOpenAddModal,
}: SidebarLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // 지금 주소를 보고 사이드바에서 어떤 메뉴에 불을 켤지 정한다
  const getActiveMenu = (pathname: string) => {
    if (pathname.startsWith("/today") || pathname === "/") return "오늘 할 일";
    if (pathname.startsWith("/calendar")) return "통합 캘린더";
    if (pathname.startsWith("/activity")) return "활동";
    if (pathname.startsWith("/archive") || pathname.startsWith("/editor"))
      return "정리글 아카이브";
    if (pathname.startsWith("/questions")) return "면접 질문 뱅크";
    if (pathname.startsWith("/assignments")) return "과제 · 역량맵";
    // /worklog 주소면 "업무일지"에 불을 켠다
    if (pathname.startsWith("/worklog")) return "업무일지";
    if (pathname.startsWith("/members")) return "팀원 관리";
    if (pathname.startsWith("/weekly-report") || pathname.startsWith("/report"))
      return "주간 리포트";
    if (pathname.startsWith("/invite")) return "팀원 초대";
    // 설정 화면은 사이드바에 "설정" 메뉴가 없어서 "팀원 관리"에 불을 켠다
    if (pathname.startsWith("/settings")) return "팀원 관리";
    return "";
  };

  // 사이드바 메뉴를 눌렀을 때 해당 주소로 이동한다
  const handleNavigate = (menuName: string) => {
    if (onNavigate) {
      onNavigate(menuName);
      return;
    }

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
      // 업무일지 → /worklog
      case "업무일지":
        navigate("/worklog");
        break;
      case "팀원 관리":
        navigate("/members");
        break;
      case "주간 리포트":
      case "주간리포트":
        navigate("/weekly-report");
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
    <div className="flex h-screen w-full overflow-hidden bg-[#f7f7f8] font-pretendard">
      <Sidebar
        activeMenu={getActiveMenu(location.pathname)}
        todayTaskCount={todayTaskCount}
        assignmentCount={assignmentCount}
        onNavigate={handleNavigate}
      />
      <div className="flex flex-1 flex-col overflow-y-auto">
        <Outlet context={{ onOpenAddModal }} />
      </div>
    </div>
  );
}