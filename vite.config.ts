import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  // 개발 서버(npm run dev) 설정
  server: {
    proxy: {
      // "/api"로 시작하는 요청을 배포된 서버로 대신 보내준다
      "/api": {
        // 실제 서버 주소
        target: "https://d1tzm9vfgufqvm.cloudfront.net",
        // 요청의 "보낸 곳" 정보를 target 주소로 바꿔서 보낸다 (CloudFront가 요청을 받아주려면 필요)
        changeOrigin: true,
        // https 인증서가 올바른지 확인한다
        secure: true,
        // /api 를 지우지 않고 그대로 붙여서 보낸다
        // (CloudFront가 /api 로 시작하는 요청을 백엔드로 보내도록 되어 있어서)
      },
    },
  },
});