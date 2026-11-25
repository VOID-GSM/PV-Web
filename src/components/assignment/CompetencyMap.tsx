import { useState } from "react";
import Dropdown from "../common/Dropdown";
// 프로필 사진 (없으면 이름 첫 글자)
import Avatar from "../common/Avatar";
// ☆ 삭제 확인 창
import ConfirmModal from "../common/ConfirmModal";
import { MAJORS, averageColor, scoreColor, type Member, type Skill } from "../../constants/assignment";
import targetIcon from "../../assets/icons/target.svg";
import arrowRightIcon from "../../assets/icons/arrow-right.svg";

type CompetencyMapProps = {
  skills: Skill[];
  members: Member[];
  // ★ 내 이름 (가짜 ME "동키" 대신 서버의 진짜 이름. 못 불러왔으면 "")
  myName: string;
  // 내 자가진단 점수 (역량 항목 번호 → 점수)
  myScores: Record<number, number>;
  // ☆ 부장인지 (역량 항목 관리·출제 버튼은 부장만)
  canManage: boolean;
  onScoreChange: (skillId: number) => void;
  onAddSkill: (name: string, major: string) => void;
  // ☆ 역량 항목 이름 수정
  onUpdateSkill: (skillId: number, name: string) => void;
  // ☆ 역량 항목 삭제 (서버에서는 숨기기)
  onDeleteSkill: (skillId: number) => void;
  onCreateFromSkill: (skillId: number) => void;
};

export default function CompetencyMap({
  skills,
  members,
  myName,
  myScores,
  canManage,
  onScoreChange,
  onAddSkill,
  onUpdateSkill,
  onDeleteSkill,
  onCreateFromSkill,
}: CompetencyMapProps) {
  const [newName, setNewName] = useState("");
  const [newMajor, setNewMajor] = useState("");
  // ☆ 지금 이름을 고치고 있는 항목 번호 (없으면 null)와 고친 이름
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  // ☆ 삭제 확인 창에 띄울 항목 (없으면 창 닫힘)
  const [deletingSkill, setDeletingSkill] = useState<Skill | null>(null);

  // ★ 이 줄이 내 줄인지 (이름이 비어 있으면 아무 줄도 내 것으로 보지 않는다)
  const isMe = (memberName: string) => myName !== "" && memberName === myName;

  // 팀원의 점수 꺼내기 (지금은 내 점수만 있다)
  const getScore = (memberName: string, skillId: number) =>
    isMe(memberName) ? myScores[skillId] : undefined;

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

  // ☆ 수정 시작: 지금 이름을 입력칸에 넣어 둔다
  const startEdit = (skill: Skill) => {
    setEditingId(skill.id);
    setEditName(skill.name);
  };

  // ☆ 수정 저장: 이름이 비었거나 그대로면 그냥 닫는다
  const saveEdit = (skill: Skill) => {
    const name = editName.trim();
    if (name !== "" && name !== skill.name) onUpdateSkill(skill.id, name);
    setEditingId(null);
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
          {/* ☆ 부장이면 추가 안내, 아니면 기다리라는 안내 */}
          {canManage
            ? "역량 항목이 없습니다. 아래에서 전공별 항목을 추가하세요"
            : "아직 등록된 역량 항목이 없습니다"}
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
                      <div className="flex items-center gap-2">
                        {/* 프로필 사진 */}
                        <Avatar
                          memberId={member.memberId}
                          name={member.name}
                          className="h-6 w-6 text-[10px]"
                        />
                        {member.name}
                      </div>
                    </td>
                    {skills.map((skill) => {
                      const score = getScore(member.name, skill.id);
                      // ★ 내 줄만 눌러서 점수를 바꿀 수 있다
                      const isMine = isMe(member.name);
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
            {lowest.skill.name} 항목이 평균 {lowest.avg}점으로 가장 낮습니다
            {/* ☆ 출제 제안 문구도 부장에게만 */}
            {canManage ? ". 다음 과제 주제로 제안합니다." : "."}
          </p>
          {/* ☆ 출제 버튼은 부장만 */}
          {canManage && (
            <button
              onClick={() => onCreateFromSkill(lowest.skill.id)}
              className="flex items-center gap-1 text-xs font-medium"
            >
              <img src={arrowRightIcon} alt="" className="h-3.5 w-3.5" />이 항목으로 출제
            </button>
          )}
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

      {/* ☆ 역량 항목 관리 (부장만): 목록 수정·삭제 + 추가 */}
      {canManage && (
        <div className="mt-5 border-t pt-4">
          <p className="text-xs font-medium">역량 항목 관리</p>

          {/* ☆ 지금 있는 항목들 */}
          {skills.length > 0 && (
            <ul className="mt-2 flex flex-col gap-1.5">
              {skills.map((skill) =>
                editingId === skill.id ? (
                  // 수정 중: 이름 입력칸 + 저장/취소
                  <li key={skill.id} className="flex items-center gap-2 rounded bg-neutral-50 px-3 py-2">
                    <input
                      autoFocus
                      value={editName}
                      maxLength={50}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        // Enter로 저장, Esc로 취소 (한글 조합 중에는 무시)
                        if (e.key === "Enter" && !e.nativeEvent.isComposing) saveEdit(skill);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="min-w-0 flex-1 rounded border bg-white px-2 py-1 text-sm"
                    />
                    <button
                      onClick={() => saveEdit(skill)}
                      className="shrink-0 rounded bg-black px-2.5 py-1 text-xs text-white"
                    >
                      저장
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="shrink-0 px-1.5 py-1 text-xs text-neutral-500"
                    >
                      취소
                    </button>
                  </li>
                ) : (
                  // 평소: 이름 (전공) + 수정/삭제
                  <li key={skill.id} className="flex items-center gap-2 rounded bg-neutral-50 px-3 py-2">
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {skill.name}
                      <span className="ml-1.5 text-[11px] text-neutral-400">{skill.major}</span>
                    </span>
                    <button
                      onClick={() => startEdit(skill)}
                      className="shrink-0 px-1.5 py-1 text-xs text-neutral-600 hover:text-black"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => setDeletingSkill(skill)}
                      className="shrink-0 px-1.5 py-1 text-xs text-red-500 hover:text-red-600"
                    >
                      삭제
                    </button>
                  </li>
                )
              )}
            </ul>
          )}

          {/* 새 항목 추가 */}
          <div className="mt-3 flex flex-wrap gap-2">
            <div className="w-36">
              <Dropdown options={MAJORS} value={newMajor} onChange={setNewMajor} placeholder="전공 선택" />
            </div>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              maxLength={50}
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
      )}

      {/* ☆ 삭제 확인 창 */}
      {deletingSkill && (
        <ConfirmModal
          title={`'${deletingSkill.name}' 항목을 삭제할까요?`}
          message="역량 맵에서 사라집니다. 이미 매긴 점수와 연결된 과제 기록은 그대로 남습니다."
          confirmLabel="삭제"
          onConfirm={() => {
            onDeleteSkill(deletingSkill.id);
            setDeletingSkill(null);
          }}
          onCancel={() => setDeletingSkill(null)}
        />
      )}
    </section>
  );
}