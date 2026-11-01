import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { tokenStorage } from "./tokenStorage";

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

// 지금 재발급 중인지 기억해 두는 자리
// 여러 요청이 동시에 401을 받아도 재발급은 "딱 한 번만" 하게 하려고 쓴다
let refreshPromise: Promise<string> | null = null;

// 재발급 쿠폰으로 새 토큰 받아오기
async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) throw new Error("NO_REFRESH_TOKEN");

  // 보낼 것 { refreshToken } → 받을 것 { accessToken, refreshToken }
  // 기본 axios로 보내서 아래 401 처리를 거치지 않는다 (그래서 재발급이 또 재발급을 부르지 않는다)
  const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
    `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
    { refreshToken },
  );

  tokenStorage.set(data.accessToken, data.refreshToken);
  return data.accessToken;
}

// 요청 정보에 "이미 한 번 재시도했는지" 표시를 붙이기 위한 타입
type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

api.interceptors.response.use(
  // 성공한 응답은 그대로 통과
  (response) => response,

  // 실패한 응답 처리
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;

    // ★ 401이고, 아직 재시도 안 한 요청일 때만 (같은 요청을 무한히 재시도하지 않게 _retry로 막는다)
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;

      try {
        // 이미 누가 재발급 중이면 그걸 같이 기다리고, 아니면 새로 재발급 시작
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });

        const newToken = await refreshPromise;
        // 새 출입증을 붙여서 원래 요청을 다시 보낸다
        original.headers.set(AUTH_HEADER, toAuthValue(newToken));
        return api(original);
      } catch {
        // 재발급도 실패 = 30일 동안 안 들어와서 쿠폰까지 만료된 상태
        tokenStorage.clear();

        // ★ 이미 입장 화면에 있으면 이동하지 않는다 (무한 새로고침 방지)
        if (!window.location.pathname.startsWith(ENTRY_PATH)) {
          window.location.href = ENTRY_PATH;
          // ★ 끝나지 않는 약속을 돌려준다
          // → 페이지가 넘어가는 동안 에러가 화면으로 전달되지 않아 에러 토스트가 깜빡이지 않는다
          return new Promise(() => {});
        }
      }
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
    const serverMessage = (error.response?.data as { message?: string } | undefined)?.message;
    if (serverMessage) return serverMessage;

    if (status === 400) return "입력한 내용을 다시 확인해 주세요.";
    if (status === 403) return "권한이 없습니다.";
    if (status === 404) return "대상을 찾을 수 없습니다.";
    if (status === 409) return "이미 처리되었거나 중복된 요청입니다.";
    if (!error.response) return "서버에 연결할 수 없습니다. 네트워크를 확인해 주세요.";
  }
  return "알 수 없는 오류가 발생했습니다.";
}