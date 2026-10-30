// useCallback: 함수를 매번 새로 만들지 않고 기억해 둔다 (토스트 닫기 함수에 사용)
// useState: 화면에서 바뀌는 값을 기억하는 React 기능
// ★ ReactNode: "화면에 그릴 수 있는 아무거나"라는 타입 (글자, 태그 등)
import { useCallback, useState, type ReactNode } from "react";
import Toast from "../common/Toast";
// 서버 연동
import { useMyProfile, useUpdateMyProfile } from "../../hooks/useMembers";
import { MAJOR_LABEL, type Major } from "../../apis/interviews";
import { getErrorMessage } from "../../apis/client";
import type { Member } from "../../apis/members";

// 고를 수 있는 전공 목록 (서버 값). Object.keys: 표의 이름표만 꺼낸다
// → ["FRONTEND", "BACKEND", "DEVOPS", "DESIGN"]
const MAJOR_KEYS = Object.keys(MAJOR_LABEL) as Major[];

// 카드 겉모양 (불러오는 중 / 실패 / 성공 모두 같은 틀을 쓴다)
function CardFrame({ children }: { children: ReactNode }) {
  return (
    <section id="profile" className="rounded-lg bg-white p-6">
      <h2 className="font-bold">내 프로필</h2>
      <p className="mt-1 text-xs text-neutral-400">이름과 전공은 아바타 색상과 과제 대상 선정에 쓰입니다</p>
      {children}
    </section>
  );
}

// ─────────────────────────────────────────────
// 바깥 부품: 서버에서 내 정보를 불러오는 담당
// ─────────────────────────────────────────────
export default function ProfileCard() {
  const profileQuery = useMyProfile();

  // 불러오는 중
  if (profileQuery.isPending) {
    return (
      <CardFrame>
        <p className="py-10 text-center text-sm text-neutral-400">내 정보를 불러오는 중...</p>
      </CardFrame>
    );
  }

  // 실패
  if (profileQuery.isError) {
    return (
      <CardFrame>
        <p className="py-10 text-center text-sm text-red-500">{getErrorMessage(profileQuery.error)}</p>
      </CardFrame>
    );
  }

  // 다 불러왔으면 안쪽 부품을 그린다
  // key: 다른 사람 정보로 바뀌면 입력칸을 새로 만들도록 회원 번호를 이름표로 준다
  return <ProfileForm key={profileQuery.data.memberId} profile={profileQuery.data} />;
}

// ─────────────────────────────────────────────
// 안쪽 부품: 입력칸과 저장 담당
// ─────────────────────────────────────────────
type ToastState = { id: number; message: string; type: "success" | "info" };

function ProfileForm({ profile }: { profile: Member }) {
  // 서버 정보가 이미 도착한 상태라, 처음부터 서버 값으로 시작한다
  const [name, setName] = useState(profile.name);
  const [majors, setMajors] = useState<Major[]>(profile.majors);
  const [toast, setToast] = useState<ToastState | null>(null);

  const updateMutation = useUpdateMyProfile();

  const showToast = (message: string, type: "success" | "info" = "success") => {
    setToast((prev) => ({ id: (prev?.id ?? 0) + 1, message, type }));
  };
  const closeToast = useCallback(() => setToast(null), []);

  // 전공 버튼을 눌렀을 때: 있으면 빼고, 없으면 넣는다
  const toggleMajor = (major: Major) => {
    setMajors(majors.includes(major) ? majors.filter((m) => m !== major) : [...majors, major]);
  };

  // 서버에 있는 값과 달라진 게 있는지
  // 전공은 순서가 달라도 같은 걸로 보려고, 개수가 같고 모두 들어 있는지 확인한다
  const isNameChanged = name.trim() !== profile.name;
  const isMajorsChanged =
    majors.length !== profile.majors.length || majors.some((m) => !profile.majors.includes(m));
  const isChanged = isNameChanged || isMajorsChanged;

  // 서버 규칙: 이름은 비면 안 되고, 전공은 1개 이상
  const isValid = name.trim() !== "" && majors.length > 0;

  const handleSave = () => {
    updateMutation.mutate(
      // 바뀐 것만 보낸다 (PATCH = 일부만 고치기)
      {
        ...(isNameChanged && { name: name.trim() }),
        ...(isMajorsChanged && { majors }),
      },
      {
        onSuccess: () => showToast("프로필을 저장했습니다"),
        onError: (error) => showToast(getErrorMessage(error), "info"),
      }
    );
  };

  return (
    <CardFrame>
      {/* 아바타(왼쪽) + 입력 영역(오른쪽) */}
      <div className="mt-4 flex gap-4">
        <div className="flex flex-col items-center gap-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm text-white">
            {name.charAt(0)}
          </div>
          <span className="text-[10px] text-neutral-400">전공 색상</span>
        </div>

        <div className="flex-1">
          <label className="text-xs font-medium">이름</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2 text-sm"
          />

          <div className="mt-4 grid grid-cols-2 gap-4">
            {/* 기수: 보여주기만 (부장만 변경 가능) */}
            <div>
              <label className="text-xs font-medium">기수</label>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-black px-4 py-1.5 text-sm font-semibold">
                  {profile.generation}기
                </span>
              </div>
              <p className="mt-1 text-[11px] text-neutral-400">기수는 부장이 팀원 관리에서 변경합니다</p>
            </div>

            {/* 전공: 여러 개 선택 */}
            <div>
              <label className="text-xs font-medium">전공</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {MAJOR_KEYS.map((m) => (
                  <button
                    key={m}
                    onClick={() => toggleMajor(m)}
                    className={`rounded-full border px-4 py-1.5 text-sm ${
                      majors.includes(m) ? "border-black font-semibold" : "border-neutral-200 text-neutral-500"
                    }`}
                  >
                    {/* 서버 값(FRONTEND) → 화면 글자(Front-end) */}
                    {MAJOR_LABEL[m]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 저장 버튼 + 안내 */}
      <div className="mt-6 flex items-center justify-end gap-3">
        {!isValid && <p className="text-xs text-red-500">이름과 전공을 하나 이상 입력해 주세요</p>}
        <button
          onClick={handleSave}
          // 바뀐 게 없거나, 규칙에 안 맞거나, 저장 중이면 못 누른다
          disabled={!isChanged || !isValid || updateMutation.isPending}
          className="rounded bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          {updateMutation.isPending ? "저장 중..." : "변경 사항 저장"}
        </button>
      </div>

      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={closeToast} />}
    </CardFrame>
  );
}