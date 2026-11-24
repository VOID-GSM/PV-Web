// useCallback: 함수를 매번 새로 만들지 않고 기억해 둔다 (토스트 닫기 함수에 사용)
// useState: 화면에서 바뀌는 값을 기억하는 React 기능
// useRef: 숨겨 둔 파일 선택창을 버튼으로 열기 위해 쓴다
// ★ ReactNode: "화면에 그릴 수 있는 아무거나"라는 타입 (글자, 태그 등)
import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import axios from "axios";
import Toast from "../common/Toast";
import Avatar from "../common/Avatar";
// 서버 연동
import {
  useDeleteMyProfileImage,
  useMyProfile,
  useSetMyProfileImage,
  useUpdateMyProfile,
} from "../../hooks/useMembers";
import { MAJOR_LABEL, type Major } from "../../apis/interviews";
import { getErrorMessage } from "../../apis/client";
import type { Member } from "../../apis/members";
// 사진 파일을 올리는 기존 함수 (업로드 주소 받기 → S3에 올리기 → 파일 등록 → fileId)
import { uploadImage } from "../../api/fileApi";

// 고를 수 있는 전공 목록 (서버 값). Object.keys: 표의 이름표만 꺼낸다
// → ["FRONTEND", "BACKEND", "DEVOPS", "DESIGN"]
const MAJOR_KEYS = Object.keys(MAJOR_LABEL) as Major[];

// 프로필 사진으로 쓸 수 있는 형식 (서버 규칙. image/jpg는 안 되고 jpeg만 된다)
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
// 서버의 파일 업로드 최대 크기 (50MB)
const MAX_IMAGE_SIZE_MB = 50;

// 에러를 사람이 읽을 수 있는 문장으로 바꾼다
// - axios 에러(프로필 사진 등록·삭제): 기존 getErrorMessage
// - 그 밖의 에러(파일 업로드 단계): 서버가 보낸 메시지가 에러 안에 들어 있다
const toMessage = (error: unknown) =>
  axios.isAxiosError(error)
    ? getErrorMessage(error)
    : error instanceof Error
      ? error.message
      : getErrorMessage(error);

// 카드 겉모양 (불러오는 중 / 실패 / 성공 모두 같은 틀을 쓴다)
function CardFrame({ children }: { children: ReactNode }) {
  return (
    <section id="profile" className="rounded-lg bg-white p-6">
      <h2 className="font-bold">내 프로필</h2>
      <p className="mt-1 text-xs text-neutral-400">
        이름과 전공은 아바타 색상과 과제 대상 선정에 쓰입니다
      </p>
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
        <p className="py-10 text-center text-sm text-neutral-400">
          내 정보를 불러오는 중...
        </p>
      </CardFrame>
    );
  }

  // 실패
  if (profileQuery.isError) {
    return (
      <CardFrame>
        <p className="py-10 text-center text-sm text-red-500">
          {getErrorMessage(profileQuery.error)}
        </p>
      </CardFrame>
    );
  }

  // 다 불러왔으면 안쪽 부품을 그린다
  // key: 다른 사람 정보로 바뀌면 입력칸을 새로 만들도록 회원 번호를 이름표로 준다
  return (
    <ProfileForm key={profileQuery.data.memberId} profile={profileQuery.data} />
  );
}

// ─────────────────────────────────────────────
// 안쪽 부품: 입력칸과 저장 담당
// ─────────────────────────────────────────────
type ToastState = { id: number; message: string; type: "success" | "info" };

function ProfileForm({ profile }: { profile: Member }) {
  // 서버 정보가 이미 도착한 상태라, 처음부터 서버 값으로 시작한다
  const [name, setName] = useState(profile.name);
  const [majors, setMajors] = useState<Major[]>(profile.majors);
  const [isImageChanged, setIsImageChanged] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const updateMutation = useUpdateMyProfile();

  // 프로필 사진 등록·삭제
  const setImageMutation = useSetMyProfileImage();
  const deleteImageMutation = useDeleteMyProfileImage();
  // 파일을 서버에 올리는 중인지 (올린 뒤 등록까지 끝나면 false)
  const [isUploading, setIsUploading] = useState(false);
  // 화면에는 안 보이게 숨겨 둔 파일 선택창
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isImageBusy = isUploading || deleteImageMutation.isPending;

  const showToast = (message: string, type: "success" | "info" = "success") => {
    setToast((prev) => ({ id: (prev?.id ?? 0) + 1, message, type }));
  };
  const closeToast = useCallback(() => setToast(null), []);

  // 전공 버튼을 눌렀을 때: 있으면 빼고, 없으면 넣는다
  const toggleMajor = (major: Major) => {
    setMajors(
      majors.includes(major)
        ? majors.filter((m) => m !== major)
        : [...majors, major],
    );
  };

  // 서버에 있는 값과 달라진 게 있는지
  // 전공은 순서가 달라도 같은 걸로 보려고, 개수가 같고 모두 들어 있는지 확인한다
  const isNameChanged = name.trim() !== profile.name;
  const isMajorsChanged =
    majors.length !== profile.majors.length ||
    majors.some((m) => !profile.majors.includes(m));
  const isChanged = isNameChanged || isMajorsChanged || isImageChanged;

  // 서버 규칙: 이름은 비면 안 되고, 전공은 1개 이상
  const isValid = name.trim() !== "" && majors.length > 0;

  const handleSave = () => {
    // 사진만 변경했다면 이미 서버에 저장됐으므로 상태만 초기화
    if (!isNameChanged && !isMajorsChanged) {
      setIsImageChanged(false);
      return;
    }

    updateMutation.mutate(
      {
        ...(isNameChanged && { name: name.trim() }),
        ...(isMajorsChanged && { majors }),
      },
      {
        onSuccess: () => {
          setIsImageChanged(false);
          showToast("프로필을 저장했습니다");
        },
        onError: (error) => showToast(getErrorMessage(error), "info"),
      },
    );
  };
  // 사진 파일을 골랐을 때: 형식·크기를 확인하고 → 파일 업로드 → 프로필 사진으로 등록
  const handlePickImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // 같은 파일을 다시 고를 수 있게 선택 값을 비워 둔다
    event.target.value = "";
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      showToast(
        "png, jpeg, webp 이미지만 프로필 사진으로 사용할 수 있습니다",
        "info",
      );
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      showToast(
        `${MAX_IMAGE_SIZE_MB}MB 이하의 이미지만 올릴 수 있습니다`,
        "info",
      );
      return;
    }

    try {
      setIsUploading(true);
      const fileId = await uploadImage(file, profile.memberId);
      await setImageMutation.mutateAsync(fileId);
      setIsImageChanged(true);
      showToast("프로필 사진을 변경했습니다");
    } catch (error) {
      showToast(toMessage(error), "info");
    } finally {
      setIsUploading(false);
    }
  };

  // 사진 삭제 → 기본 이미지(이름 첫 글자)로 돌아간다
  const handleDeleteImage = () => {
    deleteImageMutation.mutate(undefined, {
      onSuccess: () => {
        setIsImageChanged(true);
        showToast("프로필 사진을 삭제했습니다");
      },
      onError: (error) => showToast(toMessage(error), "info"),
    });
  };

  return (
    <CardFrame>
      {/* 아바타(왼쪽) + 입력 영역(오른쪽) */}
      <div className="mt-4 flex gap-4">
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <Avatar
              memberId={profile.memberId}
              name={name.trim() || profile.name}
              className="h-16 w-16 text-xl"
            />
            {/* 올리거나 지우는 동안 아바타 위에 처리 중 표시 */}
            {isImageBusy && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-[10px] text-white">
                처리 중
              </div>
            )}
          </div>

          {/* 숨겨 둔 파일 선택창: accept로 고를 수 있는 형식을 제한한다 */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(",")}
            onChange={handlePickImage}
            className="hidden"
          />

          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImageBusy}
              className="rounded border px-2 py-1 text-[11px] disabled:opacity-40"
            >
              사진 변경
            </button>
            {/* 사진이 있을 때만 삭제 버튼 (없으면 null) */}
            {profile.profileImageFileId != null && (
              <button
                type="button"
                onClick={handleDeleteImage}
                disabled={isImageBusy}
                className="rounded border px-2 py-1 text-[11px] text-neutral-500 disabled:opacity-40"
              >
                삭제
              </button>
            )}
          </div>
          <span className="text-[10px] text-neutral-400">
            png · jpeg · webp
          </span>
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
              <p className="mt-1 text-[11px] text-neutral-400">
                기수는 부장이 팀원 관리에서 변경합니다
              </p>
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
                      majors.includes(m)
                        ? "border-black font-semibold"
                        : "border-neutral-200 text-neutral-500"
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
        {!isValid && (
          <p className="text-xs text-red-500">
            이름과 전공을 하나 이상 입력해 주세요
          </p>
        )}
        <button
          onClick={handleSave}
          // 바뀐 게 없거나, 규칙에 안 맞거나, 저장 중이면 못 누른다
          disabled={!isChanged || !isValid || updateMutation.isPending}
          className="rounded bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          {updateMutation.isPending ? "저장 중..." : "변경 사항 저장"}
        </button>
      </div>

      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </CardFrame>
  );
}
