// 업무일지에서 쓰는 보드 목록 (안 바뀌는 고정 값이라 constants에 둔다)
// name: 보드 이름, dotColor: 이름 앞 작은 점의 색(Tailwind 클래스)
export const BOARDS = [
  { name: "빛가람 경진대회", dotColor: "bg-blue-600" },
  { name: "안끊겨 프로젝트", dotColor: "bg-green-600" },
  { name: "React 심화", dotColor: "bg-blue-400" },
  { name: "포폴 피드백", dotColor: "bg-teal-500" },
];

// 일지 템플릿 항목 3개
export const TEMPLATES = ["오늘 한 일", "내일 할 일", "막힌 점"];