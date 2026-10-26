import { OVERLOAD_THRESHOLD, sortGenerations, type Member } from "../../constants/admin";
// ★ 프로젝트 공통 아이콘 (svg 파일을 가져오면 이미지 주소가 된다)
import usersIcon from "../../assets/icons/users.svg";
import folderIcon from "../../assets/icons/folder.svg";
import alertIcon from "../../assets/icons/alert.svg";
import checkCircleIcon from "../../assets/icons/check-circle.svg";

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
    {
      label: "활동 중인 팀원",
      value: `${members.length}`,
      sub: byGeneration || "팀원 없음",
      subColor: "text-neutral-400",
      // ★ 이모지 대신 아이콘 파일
      icon: usersIcon,
    },
    {
      label: "진행 중 보드",
      value: `${totalBoards}`,
      sub: "캘린더 보드 기준",
      subColor: "text-neutral-400",
      icon: folderIcon,
    },
    {
      label: "과부하 팀원",
      value: `${overloaded}`,
      sub: `마감 ${OVERLOAD_THRESHOLD}건 이상`,
      subColor: overloaded > 0 ? "text-red-500" : "text-neutral-400",
      icon: alertIcon,
    },
    {
      label: "평균 출석률",
      value: avgAttendance === null ? "-" : `${avgAttendance}%`,
      sub: avgAttendance === null ? "출석 기록 없음" : "활동 중인 팀원 기준",
      subColor: "text-green-600",
      icon: checkCircleIcon,
    },
  ];

  return (
    // 좁은 화면 2칸, 넓은 화면 4칸
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg bg-white p-5">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            {card.label}
            {/* ★ 아이콘: 헤더와 같은 크기·흐림 정도로 맞춘다 */}
            {/* alt="": 장식용 그림이라 화면 읽기 프로그램이 읽지 않게 */}
            <img src={card.icon} alt="" className="h-4 w-4 opacity-60" />
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