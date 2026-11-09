import { useMyProfile } from "./useMembers";
import { MAJOR_LABEL } from "../apis/interviews";

// ─────────────────────────────────────────────
// 내 이름·기수·전공을 화면용 글자로 꺼내주는 훅
// 사이드바·설정과 같은 창고(/members/me)를 써서 서버 요청은 한 번만 간다
// 퍼블리싱 때 쓰던 가짜 "나"(ME = "동키") 대신 이걸 쓴다
// ─────────────────────────────────────────────
export function useMyName() {
  const { data: me } = useMyProfile();

  return {
    // 아직 못 불러왔으면 빈 글자 ("" 은 어떤 작성자 이름과도 같지 않아서 "내 것"으로 잘못 보이지 않는다)
    myName: me?.name ?? "",
    // "10기" 모양
    myGeneration: me ? `${me.generation}기` : "",
    // ["Front-end"] 모양
    myMajors: me ? me.majors.map((m) => MAJOR_LABEL[m]) : [],
    // 내 회원 번호 (못 불러왔으면 null)
    myId: me?.memberId ?? null,
  };
}