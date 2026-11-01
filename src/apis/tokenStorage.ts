// 토큰을 브라우저(localStorage)에 저장·꺼내기·지우기 하는 파일
// localStorage: 브라우저를 껐다 켜도 남아 있는 작은 저장 공간 (이름 → 값)

// ★ 저장할 때 쓸 이름표
// 친구의 src/api/client.ts(재입장·초대 로그인)와 "같은 이름"을 써야 같은 토큰을 공유한다
const ACCESS_KEY = "pvweb:accessToken";
const REFRESH_KEY = "pvweb:refreshToken";

// 토큰 속 글자(base64url)를 원래 글자로 되돌리는 함수
// 토큰은 - _ 를 쓰고 끝의 = 를 빼는 모양이라, atob가 읽을 수 있게 고친 뒤 되돌린다
function decodeBase64Url(text: string): string {
  // - → +, _ → / 로 바꾸기
  const base64 = text.replace(/-/g, "+").replace(/_/g, "/");
  // 길이가 4의 배수가 되도록 끝에 = 채우기
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  // atob: 글자 → 바이트 덩어리
  const binary = atob(padded);
  // 한글 같은 글자도 깨지지 않게 바이트를 UTF-8로 읽는다
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export const tokenStorage = {
  // 출입증(accessToken) 꺼내기. 없으면 null
  getAccess: () => localStorage.getItem(ACCESS_KEY),

  // 재발급 쿠폰(refreshToken) 꺼내기. 없으면 null
  getRefresh: () => localStorage.getItem(REFRESH_KEY),

  // 서버에서 토큰을 받으면 둘 다 저장한다
  set: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
  },

  // 토큰을 지운다 (재발급까지 실패해서 다시 입장해야 할 때)
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },

  // 이 기기에 토큰이 있는지 = 입장한 상태인지
  hasToken: () => !!localStorage.getItem(ACCESS_KEY),

  // 토큰 안에 적힌 "내 회원 번호" 꺼내기. 없거나 읽을 수 없으면 null
  getMemberId: (): number | null => {
    const token = localStorage.getItem(ACCESS_KEY);
    if (!token) return null;
    try {
      // 토큰 = "머리.내용.서명" → 가운데(내용)만 꺼내서 해석
      const payload = JSON.parse(decodeBase64Url(token.split(".")[1]));
      const id = Number(payload.sub);
      // 숫자가 아니면(NaN 등) null
      return Number.isFinite(id) ? id : null;
    } catch {
      return null;
    }
  },
};