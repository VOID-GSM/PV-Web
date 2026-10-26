import { useState } from "react";
import Dropdown from "../common/Dropdown";
import {
  MAJORS,
  MAX_DESCRIPTION,
  MEMBERS,
  SUBMIT_TYPES,
  TARGET_ALL,
  TARGET_PERSONAL,
  getRecipients,
  type Assignment,
  type AssignmentForm,
  type Skill,
} from "../../constants/assignment";

type AssignmentCreateModalProps = {
  skills: Skill[];
  // 처음부터 골라둘 역량 항목 (역량 맵에서 "이 항목으로 출제"를 눌렀을 때)
  initialSkillId: number | null;
  // 임시 저장한 과제를 이어서 쓸 때
  editing: Assignment | null;
  // 출제가 없어서 리마인더가 떠 있는 전공들
  remindedMajors: string[];
  onSubmit: (form: AssignmentForm, isDraft: boolean) => void;
  onClose: () => void;
};

// 대상 칩: 10기 전체 + 전공들 + 개인 지정
const TARGET_OPTIONS = [TARGET_ALL, ...MAJORS, TARGET_PERSONAL];

export default function AssignmentCreateModal({
  skills,
  initialSkillId,
  editing,
  remindedMajors,
  onSubmit,
  onClose,
}: AssignmentCreateModalProps) {
  // 이어서 쓰는 과제가 있으면 그 값으로, 없으면 빈 값으로 시작
  const [title, setTitle] = useState(editing?.title ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [skillId, setSkillId] = useState<number | null>(editing?.skillId ?? initialSkillId);
  const [deadline, setDeadline] = useState(editing?.deadline ?? "");
  const [targets, setTargets] = useState<string[]>(editing?.targets ?? []);
  const [personalTargets, setPersonalTargets] = useState<string[]>(editing?.personalTargets ?? []);
  const [submitTypes, setSubmitTypes] = useState<string[]>(editing?.submitTypes ?? []);
  const [remind, setRemind] = useState(editing?.remind ?? false);

  // 배열에서 값 켜고 끄기 (여러 곳에서 쓰는 공통 함수)
  const toggleIn = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  // 드롭다운에 보일 글자: "React 상태관리 (Front-end)"
  const skillLabel = (s: Skill) => `${s.name} (${s.major})`;
  const selectedSkill = skills.find((s) => s.id === skillId);

  const recipients = getRecipients(targets, personalTargets);

  // 이 과제로 리마인더가 풀리는 전공
  const clearedMajors = remindedMajors.filter((m) => targets.includes(TARGET_ALL) || targets.includes(m));

  // 빠진 필수 항목
  const missing = [
    title.trim() === "" ? "과제 제목" : "",
    description.trim() === "" ? "설명" : "",
    skillId === null ? "역량 항목" : "",
    deadline === "" ? "마감" : "",
    targets.length === 0 || (targets.includes(TARGET_PERSONAL) && personalTargets.length === 0) ? "대상" : "",
    submitTypes.length === 0 ? "제출 형식" : "",
  ].filter(Boolean);

  const form: AssignmentForm = {
    title: title.trim(),
    description: description.trim(),
    skillId,
    deadline,
    targets,
    personalTargets,
    submitTypes,
    remind,
  };

  const handleSubmit = (isDraft: boolean) => {
    onSubmit(form, isDraft);
    onClose();
  };

  // 공통 칩 스타일
  const chip = (on: boolean) =>
    `rounded-full border px-3 py-1.5 text-xs ${on ? "border-black font-semibold" : "border-neutral-200 text-neutral-500"}`;

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        onClick={(e) => e.stopPropagation()}
        className="scrollbar-hide max-h-[90vh] w-full max-w-[620px] overflow-y-auto rounded-xl bg-white"
      >
        {/* 머리 */}
        <div className="flex items-start justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-lg font-bold">과제 출제</h2>
            <p className="mt-1 text-xs text-neutral-400">
              9기가 10기에게 과제를 냅니다 · 역량 맵 항목과 연결하면 통과 시 자동 반영됩니다
            </p>
          </div>
          <button onClick={onClose} className="text-xl text-neutral-400">
            ×
          </button>
        </div>

        <div className="flex flex-col gap-5 px-6 py-5">
          {/* 제목 */}
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

          {/* 설명 */}
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

          {/* 역량 항목 + 마감 */}
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
                    // 고른 글자로 역량 항목을 다시 찾는다
                    onChange={(label) => setSkillId(skills.find((s) => skillLabel(s) === label)?.id ?? null)}
                  />
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium">
                마감 <span className="text-red-500">*</span>
              </p>
              {/* datetime-local: 날짜와 시간을 같이 고르는 입력칸 */}
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
              <p className="text-[11px] text-neutral-400">복수 선택</p>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {TARGET_OPTIONS.map((t) => (
                <button key={t} onClick={() => setTargets(toggleIn(targets, t))} className={chip(targets.includes(t))}>
                  {targets.includes(t) && "✓ "}
                  {t}
                </button>
              ))}
            </div>

            {/* 개인 지정을 골랐을 때만 팀원 고르기 */}
            {targets.includes(TARGET_PERSONAL) && (
              <div className="mt-2 flex flex-wrap gap-2 rounded bg-neutral-50 p-2">
                {MEMBERS.filter((m) => m.generation === "10기").map((m) => (
                  <button
                    key={m.name}
                    onClick={() => setPersonalTargets(toggleIn(personalTargets, m.name))}
                    className={chip(personalTargets.includes(m.name))}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            )}

            {/* 받는 사람 미리보기 */}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-neutral-500">
              받는 사람 {recipients.length}명
              {recipients.map((m) => (
                <span key={m.name} className="flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] text-white">
                    {m.name.charAt(0)}
                  </span>
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
                <button
                  key={t}
                  onClick={() => setSubmitTypes(toggleIn(submitTypes, t))}
                  className={chip(submitTypes.includes(t))}
                >
                  {submitTypes.includes(t) && "✓ "}
                  {t}
                </button>
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
            <div className="rounded-lg border-l-4 border-green-500 bg-green-50 px-4 py-3">
              <p className="text-sm font-semibold text-green-700">
                ✓ {clearedMajors.join(", ")} 전공 출제 리마인더가 해제됩니다
              </p>
              <p className="mt-1 text-xs text-neutral-600">이 과제를 출제하면 알림이 사라집니다.</p>
            </div>
          )}
        </div>

        {/* 바닥 */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4">
          {missing.length === 0 ? (
            <p className="text-xs text-neutral-400">출제하면 대상 팀원의 "오늘 할 일"에 바로 쌓입니다</p>
          ) : (
            <p className="text-xs text-red-500">{missing.join(", ")}을(를) 입력해 주세요</p>
          )}
          <div className="flex shrink-0 gap-2">
            {/* 임시 저장은 제목만 있으면 된다 */}
            <button
              onClick={() => handleSubmit(true)}
              disabled={title.trim() === ""}
              className="rounded border px-4 py-2 text-sm disabled:opacity-40"
            >
              임시 저장
            </button>
            <button
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