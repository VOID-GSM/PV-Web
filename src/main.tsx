import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// BrowserRouter: 주소(URL)를 읽고 바꿔주는 큰 틀
// App 안에서 useNavigate, useLocation을 쓰려면 바깥을 이걸로 감싸야 한다
import { BrowserRouter } from "react-router-dom";
// Pretendard 폰트
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* App 전체를 BrowserRouter로 감싼다 */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);