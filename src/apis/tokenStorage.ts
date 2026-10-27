// 토큰을 브라우저(localStorage)에 저장·꺼내기·지우기 하는 파일
// localStorage: 브라우저를 껐다 켜도 남아 있는 작은 저장 공간 (이름 → 값)

// 저장할 때 쓸 이름표. 다른 데이터와 안 겹치게 pv_ 를 앞에 붙였다
const ACCESS_KEY = "pv_access_token";
const REFRESH_KEY = "pv_refresh_token";

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
      // 토큰 = "머리.내용.서명" → 가운데(내용)만 꺼낸다
      const payload = token.split(".")[1];
      // 토큰은 - 와 _ 를 쓰는 모양이라 atob가 읽을 수 있게 + 와 / 로 바꾼다
      const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
      // { "sub": "1", ... } 에서 sub(회원 번호)를 숫자로 꺼낸다
      return Number(JSON.parse(json).sub);
    } catch {
      return null;
    }
  },
};