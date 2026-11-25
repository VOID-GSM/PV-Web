// ★ goToInvitePage: 입장 화면이 아닐 때만 /invite로 보낸다
import { goToInvitePage, goToPendingPage, refreshSession } from "./session";

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
  const isRefreshRequest = path.endsWith("/auth/refresh");

  const sendRequest = async (): Promise<Response> => {
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

  // Access Token 만료 시 재발급 후 원래 요청 재시도
  if (response.status === 401 && !isRefreshRequest) {
    const result = await refreshSession();

    if (result === "ok") {
      response = await sendRequest();
    } else if (result === "pending") {
      goToPendingPage();
      return new Promise<T>(() => {});
    } else if (result === "invalid") {
      // ★ 입장 화면이 아니면 /invite로 보내고 기다린다
      // 입장·재입장 화면이면 보내지 않고(초대 코드 유지) 아래에서 그냥 에러로 끝낸다
      if (goToInvitePage()) {
        return new Promise<T>(() => {});
      }
    }
  }

  // 승인 대기 회원 처리
  if (response.status === 403 && !isRefreshRequest) {
    const result = await refreshSession();

    if (result === "pending") {
      goToPendingPage();
      return new Promise<T>(() => {});
    }

    if (result === "invalid") {
      // ★ 위와 같은 이유로 입장 화면에서는 보내지 않는다
      if (goToInvitePage()) {
        return new Promise<T>(() => {});
      }
    }
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : "요청 처리에 실패했어.";

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