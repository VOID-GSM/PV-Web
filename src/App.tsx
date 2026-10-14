// BrowserRouter: 주소창의 주소(URL)를 읽어서 페이지를 바꿔주는 큰 틀
// Routes: 주소별 페이지 목록을 담는 상자
// Route: "이 주소면 이 페이지" 한 줄
import { BrowserRouter, Routes, Route } from "react-router-dom";
// 친구가 만든 초대 링크 입장 페이지
import InvitePage from "./pages/InvitePage";
// 내가 만든 설정 페이지
import SettingsPage from "./pages/SettingsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* localhost:5173/invite 로 들어오면 초대 링크 입장 페이지 */}
        <Route path="/invite" element={<InvitePage />} />

        {/* localhost:5173/settings 로 들어오면 설정 페이지 */}
        <Route path="/settings" element={<SettingsPage />} />

        {/* 다른 페이지는 각자 PR에서 이 아래에 한 줄씩 추가한다 */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;