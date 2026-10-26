import { useState } from "react";
import Dropdown from "../common/Dropdown";
import { MAJORS, ME, averageColor, scoreColor, type Member, type Skill } from "../../constants/assignment";
import targetIcon from "../../assets/icons/target.svg";
import arrowRightIcon from "../../assets/icons/arrow-right.svg";

type CompetencyMapProps = {
  skills: Skill[];
  members: Member[];
  // 내 자가진단 점수 (역량 항목 번호 → 점수)
  myScores: Record<number, number>;
  onScoreChange: (skillId: number) => void;
  onAddSkill: (name: string, major: string) => void;
  onCreateFromSkill: (skillId: number) => void;
};

export default function CompetencyMap({
  skills,
  members,
  myScores,
  onScoreChange,
  onAddSkill,
  onCreateFromSkill,
}: CompetencyMapProps) {
  const [newName, setNewName] = useState("");
  const [newMajor, setNewMajor] = useState("");

  // 팀원의 점수 꺼내기 (지금은 내 점수만 있다)
  const getScore = (memberName: string, skillId: number) =>
    memberName === ME ? myScores[skillId] : undefined;

  // 점수가 있는 것만 평균 (없으면 undefined)
  const average = (scores: (number | undefined)[]) => {
    const valid = scores.filter((s): s is number => s !== undefined);
    if (valid.length === 0) return undefined;
    return Number((valid.reduce((sum, s) => sum + s, 0) / valid.length).toFixed(1));
  };

  // 항목별 팀 평균 (점수 있는 항목만, 낮은 순)
  const skillAverages = skills
    .map((skill) => ({ skill, avg: average(members.map((m) => getScore(m.name, skill.id))) }))
    .filter((row): row is { skill: Skill; avg: number } => row.avg !== undefined)
    .sort((a, b) => a.avg - b.avg);
  const lowest = skillAverages[0];

  const canAdd = newName.trim() !== "" && newMajor !== "";
  const handleAdd = () => {
    onAddSkill(newName.trim(), newMajor);
    setNewName("");
  };

  return (
    <section className="rounded-lg bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-bold">역량 맵 (스킬 체크)</h2>
          <p className="mt-1 text-xs text-neutral-400">
            10기 자가진단 1~5점 · 내 칸을 누를 때마다 점수가 바뀌고, 과제 통과 결과도 함께 반영됩니다
          </p>
        </div>
        {/* 색 범례 */}
        <div className="flex items-center gap-1 text-[11px] text-neutral-400">
          낮음
          {[1, 2, 3, 4, 5].map((s) => (
            <span key={s} className={`h-3 w-3 rounded-sm ${scoreColor(s)}`} />
          ))}
          높음
        </div>
      </div>

      {skills.length === 0 ? (
        <p className="mt-4 rounded border border-dashed py-10 text-center text-xs text-neutral-400">
          역량 항목이 없습니다. 아래에서 전공별 항목을 추가하세요
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="text-[11px] text-neutral-500">
                <th className="w-28 py-2 text-left font-normal">팀원</th>
                {skills.map((skill) => (
                  <th key={skill.id} className="px-1 py-2 font-normal">
                    {skill.name}
                  </th>
                ))}
                <th className="w-14 py-2 font-normal">평균</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const rowAvg = average(skills.map((s) => getScore(member.name, s.id)));
                return (
                  <tr key={member.name} className="border-t">
                    <td className="py-2">
                      <span className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-[10px] text-white">
                          {member.name.charAt(0)}
                        </span>
                        {member.name}
                      </span>
                    </td>
                    {skills.map((skill) => {
                      const score = getScore(member.name, skill.id);
                      const isMine = member.name === ME;
                      return (
                        <td key={skill.id} className="px-1 py-2">
                          <button
                            onClick={() => isMine && onScoreChange(skill.id)}
                            disabled={!isMine}
                            className={`h-9 w-full rounded text-xs ${scoreColor(score)}`}
                          >
                            {score ?? "-"}
                          </button>
                        </td>
                      );
                    })}
                    <td className="py-2 text-center font-semibold">{rowAvg ?? "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 가장 낮은 항목 제안 */}
      {lowest && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded bg-neutral-50 px-4 py-3">
          <p className="flex items-center gap-2 text-xs">
            <img src={targetIcon} alt="" className="h-4 w-4 shrink-0" />
            {lowest.skill.name} 항목이 평균 {lowest.avg}점으로 가장 낮습니다. 다음 과제 주제로 제안합니다.
          </p>
          <button
            onClick={() => onCreateFromSkill(lowest.skill.id)}
            className="flex items-center gap-1 text-xs font-medium"
          >
            <img src={arrowRightIcon} alt="" className="h-3.5 w-3.5" />이 항목으로 출제
          </button>
        </div>
      )}

      {/* 항목별 팀 평균 막대 */}
      {skillAverages.length > 0 && (
        <div className="mt-5">
          <p className="text-xs text-neutral-500">항목별 팀 평균 · 낮은 순</p>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {skillAverages.map(({ skill, avg }) => (
              <div key={skill.id} className="rounded bg-neutral-50 px-3 py-2">
                <div className="flex justify-between text-xs">
                  <span>{skill.name}</span>
                  <span className="font-semibold">{avg}</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded bg-neutral-200">
                  <div className={`h-1.5 rounded ${averageColor(avg)}`} style={{ width: `${(avg / 5) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 역량 항목 추가 */}
      <div className="mt-5 border-t pt-4">
        <p className="text-xs font-medium">역량 항목 추가</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <div className="w-36">
            <Dropdown options={MAJORS} value={newMajor} onChange={setNewMajor} placeholder="전공 선택" />
          </div>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="예) React 상태관리"
            className="min-w-0 flex-1 rounded border px-3 py-2 text-sm"
          />
          <button
            onClick={handleAdd}
            disabled={!canAdd}
            className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-40"
          >
            추가
          </button>
        </div>
      </div>
    </section>
  );
}