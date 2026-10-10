import calendarIcon from "../assets/icons/calendar.svg";
import bellIcon from "../assets/icons/bell.svg";
import bookIcon from "../assets/icons/book.svg";

export const GENERATION_OPTIONS = ["9기", "10기"];

export const DEPARTMENT_OPTIONS = ["Front-end", "Back-end", "DevOps", "Design"];

export const FEATURE_LIST = [
  {
    icon: calendarIcon,
    title: "통합 캘린더",
    description: "보드별 색상으로 모든 프로젝트 마감을 한 화면에서 봅니다",
  },
  {
    icon: bellIcon,
    title: "자동 리마인드",
    description: "D-7, D-3, D-1 알림과 마감 점검 결과를 먼저 보냅니다",
  },
  {
    icon: bookIcon,
    title: "기록 아카이브",
    description: "정리글 · 면접 답변 · 과제가 기수가 바뀌어도 남습니다",
  },
];
