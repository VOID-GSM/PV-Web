// ===== 프로필 (ProfileCard, ReentryCodeCard에서 사용) =====
// 나중에 백엔드가 준비되면 서버에서 받은 실제 데이터로 바꾼다
export const mockProfile = {
  // 이름
  name: "동키",
  // 기수
  generation: "",
  // 전공 (여러 개 선택 가능해서 배열 [] 로 둔다)
  majors: ["Front-end", "Design"],
  // 다른 기기에서 접속할 때 쓰는 재입장 코드
  reentryCode: "TF-9K3M-2P7X-DQ84",
};

// ===== 접속 중인 기기 목록 (ReentryCodeCard에서 사용) =====
export const mockDevices = [
  {
    // 기기를 구분하는 번호
    id: 1,
    // 기기 이름과 브라우저
    name: "MacBook Air · Chrome",
    // 접속 위치
    location: "서울",
    // 마지막 접속 시간
    lastSeen: "방금 전",
    // 지금 이 화면을 보고 있는 기기인지
    isCurrent: true,
  },
  {
    id: 2,
    name: "iPhone 15 · Safari (PWA)",
    location: "서울",
    lastSeen: "3시간 전",
    isCurrent: false,
  },
  {
    id: 3,
    name: "학교 실습실 PC · Edge",
    location: "광주",
    lastSeen: "9월 18일",
    isCurrent: false,
  },
];

// ===== 알림 설정 목록 (NotificationCard에서 사용) =====
// key: 설정을 구분하는 이름, title: 제목, description: 설명, enabled: 켜져 있는지
export const mockNotificationSettings = [
  {
    key: "webPush",
    title: "웹 푸시 (PWA)",
    description: "브라우저·모바일 홈 화면에서 즉시 알림",
    enabled: true,
  },
  {
    key: "discord",
    title: "디스코드 웹훅",
    description: "#전공동아리 채널로 전달 · 연결됨",
    enabled: true,
  },
  {
    key: "deadline",
    title: "마감 D-day 알림",
    description: "D-7 · D-3 · D-1 · 당일",
    enabled: true,
  },
  {
    key: "topic",
    title: "주제 미정 재알림",
    description: "회차 D-1까지 주제가 없으면 재알림",
    enabled: true,
  },
  {
    key: "absence",
    title: "무단 불참 알림",
    description: "스터디장·부장에게 전달",
    enabled: true,
  },
  {
    key: "weeklyReport",
    title: "주간 리포트",
    description: "매주 월요일 09:00",
    enabled: false,
  },
];

// ===== 노션 가져오기 (NotionImportModal에서 사용) =====
// 처음부터 선택돼 있는 파일 목록 (가짜)
export const mockImportFiles = [
  { name: "React 스터디 정리 1~4주차.md", size: "42KB" },
  { name: "면접 답변 모음 (9월).md", size: "18KB" },
];

// 가져오기 전에 보여줄 미리보기 (가짜)
export const mockImportPreview = [
  { title: "React 렌더링 최적화 정리", activity: "React 심화 · 4회차", date: "2026-09-17" },
  { title: "컴포넌트 합성 패턴", activity: "React 심화 · 2회차", date: "2026-09-03" },
];