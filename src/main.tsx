import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// BrowserRouter: 주소(URL)를 읽고 바꿔주는 큰 틀
import { BrowserRouter } from "react-router-dom";
// ★ QueryClient: 서버에서 받은 데이터를 보관하는 창고
// ★ QueryClientProvider: 앱 전체가 그 창고를 쓸 수 있게 감싸는 틀
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// Pretendard 폰트
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./index.css";
import App from "./App.tsx";

// ★ 앱 전체에서 딱 하나만 쓰는 창고
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 30초 동안은 받아온 데이터를 "최신"으로 보고 다시 요청하지 않는다
      staleTime: 30_000,
      // 실패하면 1번만 다시 시도한다
      retry: 1,
      // 다른 탭 갔다가 돌아올 때마다 다시 불러오지 않는다
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* ★ 창고로 앱 전체를 감싼다 */}
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);