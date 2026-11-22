import { api } from "./client";

// ─────────────────────────────────────────────
// 다른 사람의 프로필 사진 (GET /members/profile-images?ids=1,2,3)
// ─────────────────────────────────────────────
// - 부장이 아닌 팀원도 쓸 수 있는 사진 전용 API다 (같은 팀 멤버만, 한 번에 최대 100명)
// - 사진이 있는 멤버만 돌아온다. 응답에 없는 멤버는 기본 이미지를 보여준다.
// - downloadUrl은 만료된다. expiresAt 전까지만 쓰고 그 뒤에는 다시 받아야 한다.

export interface ProfileImageItem {
  memberId: number;
  image: {
    downloadUrl: string;
    // 이 시각이 지나면 downloadUrl로 사진을 볼 수 없다
    expiresAt: string;
    fileId: number;
    fileName: string;
    contentType: string;
    size: number;
  };
}

// 화면에서 쓰는 모양: 사진 주소(없으면 null)와 "이 시각까지 써도 된다"(밀리초)
export interface ProfileImageEntry {
  url: string | null;
  expiresAt: number;
}

// 서버가 한 번에 받는 최대 인원
const MAX_IDS_PER_REQUEST = 100;
// 요청을 모으는 시간 (같은 화면의 아바타들이 거의 동시에 요청하면 한 번으로 합친다)
const BATCH_DELAY_MS = 20;
// 사진이 없는 멤버를 다시 확인하기까지의 시간
const NO_IMAGE_TTL_MS = 5 * 60 * 1000;
// 서버의 사진 주소는 발급 후 10분이 지나면 막힌다.
// 만료 시각의 시간대가 어긋나 있어도 10분을 넘겨 쓰지 않게 하는 안전장치다.
const MAX_CACHE_MS = 10 * 60 * 1000;
// 만료 직전에 사진이 깨지지 않도록 미리 다시 받는 여유 시간
const EXPIRY_MARGIN_MS = 60 * 1000;

// 실제 서버 요청 (ids는 100명 이하)
const fetchProfileImages = async (ids: number[]) => {
  const { data } = await api.get<ProfileImageItem[]>(
    "/members/profile-images",
    {
      params: { ids: ids.join(",") },
    },
  );
  return Array.isArray(data) ? data : [];
};

// 서버 응답 하나를 화면용 모양으로 바꾼다
const toEntry = (item: ProfileImageItem | undefined): ProfileImageEntry => {
  const now = Date.now();

  if (!item) {
    return { url: null, expiresAt: now + NO_IMAGE_TTL_MS };
  }

  const parsed = Date.parse(item.image.expiresAt);
  // 읽을 수 없는 시각이면 짧게 쓰고 다시 받는다
  const expiresAt = Number.isFinite(parsed)
    ? Math.min(parsed, now + MAX_CACHE_MS)
    : now + EXPIRY_MARGIN_MS * 5;

  return { url: item.image.downloadUrl, expiresAt };
};

// ─────────────────────────────────────────────
// 요청 모아서 보내기
// ─────────────────────────────────────────────
// 아바타가 화면에 여러 개 있으면 각자 "이 사람 사진 주세요"를 부른다.
// 그걸 20ms 동안 모아서 서버에는 한 번(100명 넘으면 나눠서)만 보낸다.
type Waiter = {
  resolve: (entry: ProfileImageEntry) => void;
  reject: (error: unknown) => void;
};

const pending = new Map<number, Waiter[]>();
let timer: ReturnType<typeof setTimeout> | null = null;

async function flush() {
  timer = null;

  const batch = new Map(pending);
  pending.clear();

  const ids = [...batch.keys()];
  const chunks: number[][] = [];
  for (let i = 0; i < ids.length; i += MAX_IDS_PER_REQUEST) {
    chunks.push(ids.slice(i, i + MAX_IDS_PER_REQUEST));
  }

  await Promise.all(
    chunks.map(async (chunk) => {
      try {
        const items = await fetchProfileImages(chunk);
        const byId = new Map(items.map((item) => [item.memberId, item]));

        chunk.forEach((id) => {
          const entry = toEntry(byId.get(id));
          batch.get(id)?.forEach((waiter) => waiter.resolve(entry));
        });
      } catch (error) {
        chunk.forEach((id) => {
          batch.get(id)?.forEach((waiter) => waiter.reject(error));
        });
      }
    }),
  );
}

// 한 사람의 프로필 사진 정보를 요청한다 (실제 전송은 모아서 한 번에 한다)
export function loadProfileImage(memberId: number): Promise<ProfileImageEntry> {
  return new Promise((resolve, reject) => {
    const waiters = pending.get(memberId) ?? [];
    waiters.push({ resolve, reject });
    pending.set(memberId, waiters);

    if (timer === null) {
      timer = setTimeout(() => void flush(), BATCH_DELAY_MS);
    }
  });
}

// 이 시간만큼 남았을 때부터는 "오래된 정보"로 보고 다시 받는다
export const PROFILE_IMAGE_EXPIRY_MARGIN_MS = EXPIRY_MARGIN_MS;
