import {
  goToPendingPage,
  isPendingMemberError,
  refreshSession,
} from "./session";

export const API_BASE_URL = "/api";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const sendRequest = async () => {
    const headers = new Headers(options.headers);
    const token = localStorage.getItem("pvweb:accessToken");

    if (options.body !== undefined && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return fetch(url, {
      ...options,
      headers,
      body:
        options.body === undefined
          ? undefined
          : options.body instanceof FormData
            ? options.body
            : JSON.stringify(options.body),
    });
  };

  let response = await sendRequest();

  // 출입증이 만료됐으면(401) 한 번 재발급하고 다시 보낸다. (재발급 요청 자체는 제외)
  // 재발급은 session.ts의 공용 함수를 쓴다. 서버가 안 열렸을 때는 토큰을 지우지 않는다.
  if (response.status === 401 && !path.endsWith("/auth/refresh")) {
    const result = await refreshSession();

    if (result === "ok") {
      response = await sendRequest();
    }
  }

  if (response.status === 204) return undefined as T;

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text().catch(() => "");

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null && "message" in payload
        ? String((payload as { message: unknown }).message)
        : `API 요청에 실패했습니다. (${response.status})`;

    // 가입 승인 대기 중인 사람은 승인 대기 화면으로 보낸다.
    // 화면이 넘어가는 동안 에러가 화면에 전달되지 않게, 끝나지 않는 약속을 돌려준다.
    if (isPendingMemberError(response.status, message)) {
      goToPendingPage();
      return new Promise<T>(() => {});
    }

    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}

export function queryString(
  values: Record<string, string | number | boolean | null | undefined>,
): string {
  const params = new URLSearchParams();

  Object.entries(values).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  const result = params.toString();
  return result ? `?${result}` : "";
}
