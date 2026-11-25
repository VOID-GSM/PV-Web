import { tokenStorage } from "../apis/tokenStorage";

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "/api";

const MEMBER_ID_KEY = "pvweb:memberId";
const INVITE_PROFILE_KEY = "pvweb:invite-profile:v1";

// ★ 로그인 없이 들어오는 화면 (초대 링크로 가입 / 재입장 링크)
// 이 화면에서는 로그인이 필요한 API를 부르지 않고, 401이 나도 다른 주소로 보내지 않는다 (초대 코드가 사라지지 않게)
const PUBLIC_PATH_PREFIXES = ["/invite", "/re-entry"];

export type RefreshResult = "ok" | "pending" | "invalid" | "failed";

// ★ 지금(또는 넘겨받은) 주소가 로그인 없이 쓰는 화면인지
// "/invite", "/invite/abc", "/re-entry/abc" → true / "/invitex" 같은 다른 주소 → false
export function isPublicPath(pathname: string = window.location.pathname) {
  return PUBLIC_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function clearSession() {
  tokenStorage.clear();

  try {
    localStorage.removeItem(MEMBER_ID_KEY);
    localStorage.removeItem(INVITE_PROFILE_KEY);
  } catch {
    // 저장소 접근 실패 시 무시
  }
}

export function goToPendingPage() {
  if (!window.location.pathname.startsWith("/pending")) {
    window.location.replace("/pending");
  }
}

// ★ 로그인이 풀렸을 때 입장 화면으로 보낸다
// 이미 입장·재입장 화면이면 보내지 않는다 (보내면 주소의 초대 코드가 사라진다)
// 보냈으면 true, 안 보냈으면 false
export function goToInvitePage() {
  if (isPublicPath()) return false;
  window.location.replace("/invite");
  return true;
}

async function requestRefresh(): Promise<RefreshResult> {
  const refreshToken = tokenStorage.getRefresh();

  if (!refreshToken) {
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
    return "failed";
  }

  if (response.status === 401) {
    clearSession();
    return "invalid";
  }

  if (!response.ok) return "failed";

  try {
    const result = (await response.json()) as {
      accessToken?: string;
      refreshToken?: string;
      status?: "PENDING" | "JOINED";
    };

    if (!result.accessToken || !result.refreshToken || !result.status) {
      return "failed";
    }

    tokenStorage.set(result.accessToken, result.refreshToken);

    if (result.status === "PENDING") {
      goToPendingPage();
      return "pending";
    }

    return "ok";
  } catch {
    return "failed";
  }
}

let inFlight: Promise<RefreshResult> | null = null;

export function refreshSession(): Promise<RefreshResult> {
  if (!inFlight) {
    inFlight = requestRefresh().finally(() => {
      inFlight = null;
    });
  }

  return inFlight;
}