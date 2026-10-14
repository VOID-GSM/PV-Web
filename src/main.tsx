import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Pretendard 폰트 파일을 불러온다
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
