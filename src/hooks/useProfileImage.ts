import { useQuery } from "@tanstack/react-query";
import {
  loadProfileImage,
  PROFILE_IMAGE_EXPIRY_MARGIN_MS,
  type ProfileImageEntry,
} from "../apis/profileImages";

// 창고 이름표 (멤버 한 명당 하나. members 이름표와 섞이지 않게 따로 둔다)
export const profileImageKeys = {
  all: ["profile-images"] as const,
  one: (memberId: number) => ["profile-images", memberId] as const,
};

// 받아온 사진 주소를 "새 주소로 바꿔야 하는 시점"까지 남은 시간(밀리초)
// 서버 주소는 발급 후 10분이면 막히므로, 만료 직전에 미리 다시 받는다
const msUntilRefresh = (entry: ProfileImageEntry) =>
  entry.expiresAt - Date.now() - PROFILE_IMAGE_EXPIRY_MARGIN_MS;

// ─────────────────────────────────────────────
// 멤버 한 명의 프로필 사진 주소
// ─────────────────────────────────────────────
// - 사진이 있으면 주소(문자열), 없거나 아직 불러오는 중이면 null
//   → 화면에서는 null이면 기본 이미지(이름 첫 글자)를 보여주면 된다
// - 같은 화면에서 여러 아바타가 동시에 부르면 서버 요청은 한 번으로 합쳐진다
// - 주소는 만료되므로, 만료 직전까지만 창고의 값을 쓰고 그 뒤에는 다시 받는다
export function useProfileImageUrl(
  memberId: number | null | undefined,
): string | null {
  const id = typeof memberId === "number" ? memberId : null;

  const query = useQuery<ProfileImageEntry>({
    queryKey: profileImageKeys.one(id ?? 0),
    queryFn: () => loadProfileImage(id as number),
    // 멤버 번호가 없으면 서버에 묻지 않는다
    enabled: id !== null,
    // 받아온 값이 만료되기 직전까지는 "최신"으로 본다 (처음에는 데이터가 없으니 0)
    staleTime: (q) => {
      const entry = q.state.data;
      return entry ? Math.max(0, msUntilRefresh(entry)) : 0;
    },
    // 화면에 계속 떠 있는 아바타는 만료되기 전에 새 주소를 받아 둔다
    // (사진이 없는 멤버는 다시 받을 필요가 없어서 끈다. 최소 30초 간격)
    refetchInterval: (q) => {
      const entry = q.state.data;
      return entry?.url ? Math.max(30_000, msUntilRefresh(entry)) : false;
    },
  });

  return query.data?.url ?? null;
}
