import { OVERLOAD_THRESHOLD, sortGenerations, type Member } from "../../constants/admin";

type StatCardsProps = {
  // 활동 중인 팀원들
  members: Member[];
};

export default function StatCards({ members }: StatCardsProps) {
  // 기수별 인원 → "9기 0 · 10기 1"
  const generations = sortGenerations([...new Set(members.map((m) => m.generation))]);
  const byGeneration = generations
    .map((g) => `${g} ${members.filter((m) => m.generation === g).length}`)
    .join(" · ");

  // 참여 보드 수 합계 (보드 데이터가 연결되기 전이라 0)
  const totalBoards = members.reduce((sum, m) => sum + m.boards, 0);

  // 과부하: 이번 주 마감이 3개 이상인 팀원
  const overloaded = members.filter((m) => m.weeklyDeadlines >= OVERLOAD_THRESHOLD).length;

  // 출석률 평균 (기록이 있는 팀원만)
  const attendances = members.map((m) => m.attendance).filter((a): a is number => a !== null);
  const avgAttendance =
    attendances.length === 0 ? null : Math.round(attendances.reduce((s, a) => s + a, 0) / attendances.length);

  const cards = [
    { label: "활동 중인 팀원", value: `${members.length}`, sub: byGeneration || "팀원 없음", subColor: "text-neutral-400", icon: "👥" },
    { label: "진행 중 보드", value: `${totalBoards}`, sub: "캘린더 보드 기준", subColor: "text-neutral-400", icon: "📁" },
    {
      label: "과부하 팀원",
      value: `${overloaded}`,
      sub: `마감 ${OVERLOAD_THRESHOLD}건 이상`,
      subColor: overloaded > 0 ? "text-red-500" : "text-neutral-400",
      icon: "⚠",
    },
    {
      label: "평균 출석률",
      value: avgAttendance === null ? "-" : `${avgAttendance}%`,
      sub: avgAttendance === null ? "출석 기록 없음" : "활동 중인 팀원 기준",
      subColor: "text-green-600",
      icon: "✓",
    },
  ];

  return (
    // 좁은 화면 2칸, 넓은 화면 4칸
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg bg-white p-5">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            {card.label}
            <span className="text-neutral-400">{card.icon}</span>
          </div>
          <p className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold">{card.value}</span>
            <span className={`text-xs ${card.subColor}`}>{card.sub}</span>
          </p>
        </div>
      ))}
    </div>
  );
}