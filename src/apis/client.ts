import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { tokenStorage } from "./tokenStorage";
// 재발급은 api/client.ts와 같은 공용 함수를 쓴다 (두 군데가 따로 재발급하지 않게)
import { goToPendingPage, refreshSession } from "../api/session";

// ─────────────────────────────────────────────
// 1) 우리 서버 전용 axios 만들기
// ─────────────────────────────────────────────
export const api = axios.create({
  // .env 파일에 적은 값("/api")을 꺼내 쓴다
  // → api.get("/worklogs") 라고 쓰면 실제로는 "/api/worklogs"로 요청된다
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // 10초 안에 응답이 없으면 실패로 처리
  timeout: 10_000,
  // 보내는 데이터가 JSON 형식이라고 알려준다
  headers: { "Content-Type": "application/json" },
});

// 출입증을 붙이는 헤더 형식 (Authorization: Bearer 토큰)
const AUTH_HEADER = "Authorization";
const toAuthValue = (token: string) => `Bearer ${token}`;

// 토큰이 완전히 만료됐을 때 보낼 입장 화면 주소
const ENTRY_PATH = "/invite";

// ─────────────────────────────────────────────
// 2) 요청 보내기 직전에 출입증 자동 첨부
// ─────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) {
    config.headers.set(AUTH_HEADER, toAuthValue(token));
  }
  return config;
});

// ─────────────────────────────────────────────
// 3) 출입증이 만료됐을 때(401) 재발급 후 다시 요청
// ─────────────────────────────────────────────

// 요청 정보에 "이미 한 번 재시도했는지" 표시를 붙이기 위한 타입
type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

api.interceptors.response.use(
  // 성공한 응답은 그대로 통과
  (response) => response,

  // 실패한 응답 처리
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;
    const status = error.response?.status;

    // ★ 가입 승인 대기 중인 사람: 승인 대기 화면으로 보낸다
    // (일반 권한 부족 403과 섞이지 않게 메시지까지 확인한다)
    if (status === 403 && !original?.url?.includes("/auth/refresh")) {
      const result = await refreshSession();

      if (result === "pending") {
        goToPendingPage();
        return new Promise(() => {});
      }
    }

    // ★ 401이고, 아직 재시도 안 한 요청일 때만 (같은 요청을 무한히 재시도하지 않게 _retry로 막는다)
    if (status === 401 && original && !original._retry) {
      original._retry = true;

      // 이미 누가 재발급 중이면 그걸 같이 기다린다 (서버에는 한 번만 보낸다)
      const result = await refreshSession();

      if (result === "ok") {
        // 새 출입증을 붙여서 원래 요청을 다시 보낸다
        original.headers.set(
          AUTH_HEADER,
          toAuthValue(tokenStorage.getAccess() ?? ""),
        );
        return api(original);
      }

      if (result === "invalid") {
        // 재발급 쿠폰이 없거나 만료됐다. 토큰은 refreshSession이 이미 지웠다.
        // ★ 이미 입장 화면에 있으면 이동하지 않는다 (무한 새로고침 방지)
        if (!window.location.pathname.startsWith(ENTRY_PATH)) {
          window.location.href = ENTRY_PATH;
          // 끝나지 않는 약속: 페이지가 넘어가는 동안 에러가 화면으로 전달되지 않게
          return new Promise(() => {});
        }
      }

      // result === "failed": 서버가 잠깐 안 열린 것일 수 있다.
      // 토큰은 그대로 두고 원래 에러를 넘긴다 (각 화면에서 처리)
    }

    // 그 밖의 에러는 그대로 넘긴다 (각 페이지에서 처리)
    return Promise.reject(error);
  },
);

// ─────────────────────────────────────────────
// 4) 에러를 사람이 읽을 수 있는 문장으로 바꾸기 (토스트에 띄울 용도)
// ─────────────────────────────────────────────
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    // 서버가 message를 보내줬으면 그걸 그대로 보여준다
    const serverMessage = (
      error.response?.data as { message?: string } | undefined
    )?.message;
    if (serverMessage) return serverMessage;

    if (status === 400) return "입력한 내용을 다시 확인해 주세요.";
    if (status === 403) return "권한이 없습니다.";
    if (status === 404) return "대상을 찾을 수 없습니다.";
    if (status === 409) return "이미 처리되었거나 중복된 요청입니다.";
    if (!error.response)
      return "서버에 연결할 수 없습니다. 네트워크를 확인해 주세요.";
  }
  return "알 수 없는 오류가 발생했습니다.";
}
