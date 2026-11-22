// 로그인(토큰) 상태를 확인하고 정리하는 공용 파일
// api/client.ts(fetch)와 apis/client.ts(axios)가 같은 함수를 쓰도록 한곳에 모았다
import { tokenStorage } from "../apis/tokenStorage";

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "/api";

// 그 밖에 이 기기에 남기는 로그인 관련 값
const MEMBER_ID_KEY = "pvweb:memberId";
const INVITE_PROFILE_KEY = "pvweb:invite-profile:v1";

// 재발급 결과
// - ok: 새 토큰을 저장했다
// - invalid: 토큰이 없거나 서버가 401로 거절했다 (이미 지웠다) → 다시 입장해야 한다
// - failed: 서버가 안 열렸거나 5xx 같은 일시적 문제 → 토큰은 그대로 둔다 (다시 시도하면 된다)
export type RefreshResult = "ok" | "invalid" | "failed";

// 이 기기의 로그인 정보를 전부 지운다
export function clearSession() {
  tokenStorage.clear();
  try {
    localStorage.removeItem(MEMBER_ID_KEY);
    localStorage.removeItem(INVITE_PROFILE_KEY);
  } catch {
    // 저장소를 쓸 수 없으면 지울 것도 없다
  }
}

async function requestRefresh(): Promise<RefreshResult> {
  const refreshToken = tokenStorage.getRefresh();

  if (!refreshToken) {
    // 재발급 쿠폰이 없으면 남아 있는 출입증도 의미가 없다
    clearSession();
    return "invalid";
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    // 네트워크 오류: 토큰을 지우면 서버가 잠깐 안 될 때마다 로그아웃되므로 그대로 둔다
    return "failed";
  }

  // 없는 토큰과 만료된 토큰 모두 401이다. 둘 다 같게 처리한다.
  if (response.status === 401) {
    clearSession();
    return "invalid";
  }

  if (!response.ok) return "failed";

  try {
    const result = (await response.json()) as {
      accessToken?: string;
      refreshToken?: string;
    };

    if (!result.accessToken) return "failed";

    // 서버는 refresh 토큰을 바꾸지 않고(같은 값) 만료일만 늘린다. 응답 값이 있으면 그걸로 덮어쓴다.
    tokenStorage.set(result.accessToken, result.refreshToken ?? refreshToken);
    return "ok";
  } catch {
    return "failed";
  }
}

// 지금 재발급 중인 요청 (여러 곳에서 동시에 불러도 서버에는 한 번만 보낸다)
let inFlight: Promise<RefreshResult> | null = null;

export function refreshSession(): Promise<RefreshResult> {
  if (!inFlight) {
    inFlight = requestRefresh().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

// ─────────────────────────────────────────────
// 가입 승인 대기 중인 사람 처리
// ─────────────────────────────────────────────
// 승인 대기(PENDING)인 사람도 refresh는 성공하지만, 활동 API 등에서는 403이 난다.
// 서버가 에러 코드를 따로 주지 않아서 메시지로 구분한다.
// (일반 권한 부족 403과 섞이면 안 되므로 메시지까지 같이 확인한다)
const PENDING_MESSAGE_KEYWORD = "가입이 완료된 팀원";
const PENDING_PATH = "/pending";

export function isPendingMemberError(status: number, message?: unknown) {
  return (
    status === 403 &&
    typeof message === "string" &&
    message.includes(PENDING_MESSAGE_KEYWORD)
  );
}

// 승인 대기 화면으로 보낸다 (이미 거기 있으면 가만히 둔다)
export function goToPendingPage() {
  if (!window.location.pathname.startsWith(PENDING_PATH)) {
    window.location.replace(PENDING_PATH);
  }
}
