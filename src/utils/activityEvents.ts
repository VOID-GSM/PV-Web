// 활동 목록이 바뀌었다는 신호를 주고받는 파일
// 활동을 만드는 곳(Header)과 목록을 보여주는 곳(활동 화면)이 서로 몰라도
// 이 신호로 "목록 다시 불러와!"를 전할 수 있다

// 신호 이름 (보내는 쪽과 듣는 쪽이 같은 이름을 써야 한다)
export const ACTIVITIES_CHANGED_EVENT = "pvweb:activities-changed";

// 신호 보내기: 브라우저 전체(window)에 알린다
export const notifyActivitiesChanged = () => {
  window.dispatchEvent(new Event(ACTIVITIES_CHANGED_EVENT));
};