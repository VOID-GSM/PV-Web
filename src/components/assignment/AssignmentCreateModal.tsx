import { useState } from "react";
import Dropdown from "../common/Dropdown";
// 프로필 사진 (없으면 이름 첫 글자)
import Avatar from "../common/Avatar";
// ☆ 진짜 팀원 목록 (GET /members)
import { useTeamMembers } from "../../hooks/useTeam";
import { MAJOR_LABEL } from "../../apis/interviews";
import {
  MAJORS,
  MAX_DESCRIPTION,
  SUBMIT_TYPES,
  TARGET_ALL,
  TARGET_PERSONAL,
  type Assignment,
  type AssignmentForm,
  type Skill,
} from "../../constants/assignment";
import checkCircleIcon from "../../assets/icons/check-circle.svg";

type AssignmentCreateModalProps = {
  skills: Skill[];
  initialSkillId: number | null;
  editing: Assignment | null;
  remindedMajors: string[];
  // ☆ 개인 지정이면 고른 팀원의 회원 번호들도 같이 넘긴다 (서버는 이름이 아니라 번호로 받는다)
  onSubmit: (form: AssignmentForm, isDraft: boolean, targetMemberIds: number[]) => void;
  onClose: () => void;
};

// 대상 칩: 10기 전체 + 전공들 + 개인 지정
const TARGET_OPTIONS = [TARGET_ALL, ...MAJORS, TARGET_PERSONAL];

// 여러 개 고르는 칩 (골랐으면 체크 아이콘). 모달 바깥에 만들어 둔다
type CheckChipProps = {
  label: string;
  selected: boolean;
  onClick: () => void;
};

function CheckChip({ label, selected, onClick }: CheckChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs ${
        selected ? "border-black font-semibold" : "border-neutral-200 text-neutral-500"
      }`}
    >
      {selected && <img src={checkCircleIcon} alt="" className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}

export default function AssignmentCreateModal({
  skills,
  initialSkillId,
  editing,
  remindedMajors,
  onSubmit,
  onClose,
}: AssignmentCreateModalProps) {
  const [title, setTitle] = useState(editing?.title ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [skillId, setSkillId] = useState<number | null>(editing?.skillId ?? initialSkillId);
  const [deadline, setDeadline] = useState(editing?.deadline ?? "");
  const [targets, setTargets] = useState<string[]>(editing?.targets ?? []);
  // ☆ 개인 지정으로 고른 팀원의 회원 번호들
  const [personalIds, setPersonalIds] = useState<number[]>([]);
  const [submitTypes, setSubmitTypes] = useState<string[]>(editing?.submitTypes ?? []);
  const [remind, setRemind] = useState(editing?.remind ?? false);

  // ☆ 진짜 팀원 (가입 완료한 사람만, 기수 높은 순 → 이름순)
  const membersQuery = useTeamMembers();
  const joinedMembers = (membersQuery.data ?? [])
    .filter((m) => m.status === "JOINED")
    .sort((a, b) => b.generation - a.generation || a.name.localeCompare(b.name, "ko"));
  // ☆ 가장 최근 기수 ("10기 전체"의 대상)
  const latestGeneration = joinedMembers.length > 0 ? Math.max(...joinedMembers.map((m) => m.generation)) : null;

  const toggleIn = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  // ☆ 대상 칩 누르기: 서버는 대상을 한 종류만 받아서 "개인 지정"은 다른 칩과 같이 못 고른다
  const toggleTarget = (t: string) => {
    if (t === TARGET_PERSONAL) {
      // 개인 지정을 켜면 다른 칩은 끄고, 끄면 고른 사람도 비운다
      const turningOn = !targets.includes(TARGET_PERSONAL);
      setTargets(turningOn ? [TARGET_PERSONAL] : []);
      if (!turningOn) setPersonalIds([]);
      return;
    }
    // 전체·전공 칩을 누르면 개인 지정은 끈다
    setTargets(toggleIn(targets.filter((x) => x !== TARGET_PERSONAL), t));
    setPersonalIds([]);
  };

  // ☆ 개인 지정 팀원 고르기/빼기
  const togglePerson = (memberId: number) =>
    setPersonalIds((prev) => (prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]));

  const skillLabel = (s: Skill) => `${s.name} (${s.major})`;
  const selectedSkill = skills.find((s) => s.id === skillId);

  // ☆ 받는 사람 미리보기 (진짜 팀원 기준. 실제 대상은 서버가 정한다)
  const isPersonal = targets.includes(TARGET_PERSONAL);
  const recipients = isPersonal
    ? joinedMembers.filter((m) => personalIds.includes(m.memberId))
    : joinedMembers.filter(
        (m) =>
          m.generation === latestGeneration &&
          (targets.includes(TARGET_ALL) || m.majors.some((major) => targets.includes(MAJOR_LABEL[major])))
      );

  // 이 과제로 리마인더가 풀리는 전공
  const clearedMajors = remindedMajors.filter((m) => targets.includes(TARGET_ALL) || targets.includes(m));

  const missing = [
    title.trim() === "" ? "과제 제목" : "",
    description.trim() === "" ? "설명" : "",
    skillId === null ? "역량 항목" : "",
    deadline === "" ? "마감" : "",
    // ☆ 개인 지정이면 한 명 이상 골라야 한다
    targets.length === 0 || (isPersonal && personalIds.length === 0) ? "대상" : "",
    submitTypes.length === 0 ? "제출 형식" : "",
  ].filter(Boolean);

  const form: AssignmentForm = {
    title: title.trim(),
    description: description.trim(),
    skillId,
    deadline,
    targets,
    // ☆ 화면용으로 고른 사람 이름도 남긴다
    personalTargets: recipients.map((m) => m.name),
    submitTypes,
    remind,
  };

  const handleSubmit = (isDraft: boolean) => {
    // ☆ 개인 지정일 때만 회원 번호들을 넘긴다
    onSubmit(form, isDraft, isPersonal ? personalIds : []);
    onClose();
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        onClick={(e) => e.stopPropagation()}
        className="scrollbar-hide max-h-[90vh] w-full max-w-[620px] overflow-y-auto rounded-xl bg-white"
      >
        <div className="flex items-start justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-lg font-bold">과제 출제</h2>
            <p className="mt-1 text-xs text-neutral-400">
              9기가 10기에게 과제를 냅니다 · 역량 맵 항목과 연결하면 통과 시 자동 반영됩니다
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-xl text-neutral-400">
            ×
          </button>
        </div>

        <div className="flex flex-col gap-5 px-6 py-5">
          <div>
            <p className="text-xs font-medium">
              과제 제목 <span className="text-red-500">*</span>
            </p>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <p className="text-xs font-medium">
              설명 <span className="text-red-500">*</span>
            </p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={MAX_DESCRIPTION}
              rows={4}
              className="mt-1 w-full resize-none rounded border px-3 py-2 text-sm"
            />
            <div className="flex justify-between text-[11px] text-neutral-400">
              <span>마크다운과 코드블록을 지원합니다</span>
              <span>
                {description.length} / {MAX_DESCRIPTION}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium">
                연결할 역량 맵 항목 <span className="text-red-500">*</span>
              </p>
              <div className="mt-1">
                {skills.length === 0 ? (
                  <p className="rounded border border-dashed px-3 py-2 text-xs text-neutral-400">
                    역량 맵에서 항목을 먼저 추가하세요
                  </p>
                ) : (
                  <Dropdown
                    options={skills.map(skillLabel)}
                    value={selectedSkill ? skillLabel(selectedSkill) : ""}
                    onChange={(label) => setSkillId(skills.find((s) => skillLabel(s) === label)?.id ?? null)}
                  />
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium">
                마감 <span className="text-red-500">*</span>
              </p>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-1 w-full rounded border px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* 대상 */}
          <div>
            <div className="flex justify-between">
              <p className="text-xs font-medium">
                대상 <span className="text-red-500">*</span>
              </p>
              {/* ☆ 개인 지정은 다른 대상과 같이 고를 수 없다고 안내 */}
              <p className="text-[11px] text-neutral-400">복수 선택 · 개인 지정은 단독</p>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {TARGET_OPTIONS.map((t) => (
                <CheckChip key={t} label={t} selected={targets.includes(t)} onClick={() => toggleTarget(t)} />
              ))}
            </div>

            {/* ☆ 개인 지정: 진짜 팀원 목록 */}
            {isPersonal && (
              <div className="mt-2 rounded bg-neutral-50 p-2">
                {membersQuery.isPending ? (
                  <p className="px-1 py-2 text-xs text-neutral-400">팀원을 불러오는 중...</p>
                ) : membersQuery.isError ? (
                  <p className="px-1 py-2 text-xs text-red-500">팀원 목록을 불러오지 못했습니다</p>
                ) : joinedMembers.length === 0 ? (
                  <p className="px-1 py-2 text-xs text-neutral-400">고를 수 있는 팀원이 없습니다</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {joinedMembers.map((m) => (
                      <CheckChip
                        key={m.memberId}
                        label={`${m.name} · ${m.generation}기`}
                        selected={personalIds.includes(m.memberId)}
                        onClick={() => togglePerson(m.memberId)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-neutral-500">
              받는 사람 {recipients.length}명
              {recipients.map((m) => (
                <span key={m.memberId} className="flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5">
                  {/* ☆ 진짜 회원 번호라 프로필 사진도 나온다 */}
                  <Avatar memberId={m.memberId} name={m.name} className="h-4 w-4 text-[9px]" />
                  {m.name}
                </span>
              ))}
            </div>
          </div>

          {/* 제출 형식 */}
          <div>
            <div className="flex justify-between">
              <p className="text-xs font-medium">
                제출 형식 <span className="text-red-500">*</span>
              </p>
              <p className="text-[11px] text-neutral-400">복수 선택</p>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {SUBMIT_TYPES.map((t) => (
                <CheckChip
                  key={t}
                  label={t}
                  selected={submitTypes.includes(t)}
                  onClick={() => setSubmitTypes(toggleIn(submitTypes, t))}
                />
              ))}
            </div>
          </div>

          {/* 리마인더 토글 */}
          <div className="flex items-center justify-between gap-3 rounded bg-neutral-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium">마감 전 리마인더 보내기</p>
              <p className="text-[11px] text-neutral-500">D-3, D-1, 당일에 미제출자에게만 알림이 갑니다</p>
            </div>
            <button
              type="button"
              onClick={() => setRemind(!remind)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${remind ? "bg-black" : "bg-neutral-200"}`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${remind ? "left-6" : "left-1"}`}
              />
            </button>
          </div>

          {/* 리마인더 해제 안내 */}
          {clearedMajors.length > 0 && (
            <div className="flex gap-2 rounded-lg border-l-4 border-green-500 bg-green-50 px-4 py-3">
              <img src={checkCircleIcon} alt="" className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-700">
                  {clearedMajors.join(", ")} 전공 출제 리마인더가 해제됩니다
                </p>
                <p className="mt-1 text-xs text-neutral-600">이 과제를 출제하면 알림이 사라집니다.</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4">
          {missing.length === 0 ? (
            <p className="text-xs text-neutral-400">출제하면 대상 팀원의 "오늘 할 일"에 바로 쌓입니다</p>
          ) : (
            <p className="text-xs text-red-500">{missing.join(", ")}을(를) 입력해 주세요</p>
          )}
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={title.trim() === ""}
              className="rounded border px-4 py-2 text-sm disabled:opacity-40"
            >
              임시 저장
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={missing.length > 0}
              className="rounded bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              과제 출제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}