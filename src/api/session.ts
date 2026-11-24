import { tokenStorage } from "../apis/tokenStorage";

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "/api";

const MEMBER_ID_KEY = "pvweb:memberId";
const INVITE_PROFILE_KEY = "pvweb:invite-profile:v1";

export type RefreshResult = "ok" | "pending" | "invalid" | "failed";

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
