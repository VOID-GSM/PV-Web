import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { tokenStorage } from "./tokenStorage";

// ─────────────────────────────────────────────
// 1) 우리 서버 전용 axios 만들기
// ─────────────────────────────────────────────
export const api = axios.create({
  // .env 파일에 적은 값("/api")을 꺼내 쓴다
  // → api.get("/worklogs") 라고 쓰면 실제로는 "/api/worklogs"로 요청된다
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // 10초 안에 응답이 없으면 실패로 처리 (10_000 = 10000, 밑줄은 읽기 쉽게 하려고)
  timeout: 10_000,
  // 보내는 데이터가 JSON 형식이라고 알려준다
  headers: { "Content-Type": "application/json" },
});

// 출입증을 붙이는 헤더 형식
// ⚠️ 백엔드에 "Authorization: Bearer 토큰" 형식이 맞는지 확인할 것. 다르면 이 두 줄만 고치면 된다
const AUTH_HEADER = "Authorization";
const toAuthValue = (token: string) => `Bearer ${token}`;

// ─────────────────────────────────────────────
// 2) 요청 보내기 직전에 출입증 자동 첨부
// ─────────────────────────────────────────────
// interceptors.request: 모든 요청이 나가기 직전에 한 번씩 실행되는 함수
api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  // 저장된 출입증이 있으면 헤더에 붙인다
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
// (서버가 재발급할 때마다 옛날 쿠폰을 버려서, 두 번 하면 두 번째가 실패한다)
let refreshPromise: Promise<string> | null = null;

// 재발급 쿠폰으로 새 토큰 받아오기
async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStorage.getRefresh();
  // 쿠폰이 없으면 재발급 불가
  if (!refreshToken) throw new Error("NO_REFRESH_TOKEN");

  // Swagger에서 확인한 모양: 보낼 것 { refreshToken } → 받을 것 { accessToken, refreshToken }
  // 여기서는 api가 아니라 기본 axios로 보낸다 (api로 보내면 이 401 처리가 또 걸려서 꼬인다)
  const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
    `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
    { refreshToken },
  );

  // 새로 받은 토큰 두 개를 저장
  tokenStorage.set(data.accessToken, data.refreshToken);
  return data.accessToken;
}

// 요청 정보에 "이미 한 번 재시도했는지" 표시를 붙이기 위한 타입
type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// interceptors.response: 서버 응답이 올 때마다 실행되는 함수
api.interceptors.response.use(
  // 성공한 응답은 그대로 통과
  (response) => response,

  // 실패한 응답 처리
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;

    // 401(출입증 만료)이고, 아직 재시도 안 했고, 재발급 요청 자체가 아닐 때만
    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes("/auth/refresh")
    ) {
      // 같은 요청을 무한히 재시도하지 않도록 표시
      original._retry = true;

      try {
        // ??= : 비어 있을 때만 새로 넣는다
        // → 이미 누가 재발급 중이면 그걸 같이 기다리고, 아니면 새로 재발급 시작
        refreshPromise ??= refreshAccessToken().finally(() => {
          // 재발급이 끝나면 자리를 비운다
          refreshPromise = null;
        });

        const newToken = await refreshPromise;
        // 새 출입증을 붙여서 원래 요청을 다시 보낸다
        original.headers.set(AUTH_HEADER, toAuthValue(newToken));
        return api(original);
      } catch {
        // 재발급도 실패 = 30일 동안 안 들어와서 쿠폰까지 만료된 상태
        // → 토큰을 지우고 입장(초대) 화면으로 보낸다
        tokenStorage.clear();
        window.location.href = "/invite";
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
  // axios가 만든 에러인지 확인
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    // 서버가 message를 보내줬으면 그걸 그대로 보여준다
    const serverMessage = (error.response?.data as { message?: string } | undefined)?.message;
    if (serverMessage) return serverMessage;

    // 상태 코드별 기본 문장
    if (status === 400) return "입력한 내용을 다시 확인해 주세요.";
    if (status === 403) return "권한이 없습니다.";
    if (status === 404) return "대상을 찾을 수 없습니다.";
    if (status === 409) return "이미 처리되었거나 중복된 요청입니다.";
    // 응답 자체가 없으면 네트워크 문제
    if (!error.response) return "서버에 연결할 수 없습니다. 네트워크를 확인해 주세요.";
  }
  return "알 수 없는 오류가 발생했습니다.";
}
