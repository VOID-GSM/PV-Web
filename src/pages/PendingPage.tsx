// Navigate: 화면을 그리자마자 다른 주소로 보내는 부품
import { Navigate, useNavigate } from "react-router-dom";
import { tokenStorage } from "../apis/tokenStorage";

// 부장 승인을 기다리는 화면 (/pending)
// 가입·재입장 결과가 PENDING이면 여기로 온다
export default function PendingPage() {
  const navigate = useNavigate();

  // 토큰이 없으면(입장한 적 없음) 입장 화면으로
  if (!tokenStorage.hasToken()) {
    return <Navigate to="/invite" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f7f8] p-6 font-pretendard">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-xl font-black tracking-wider">VOID</p>

        <p className="mt-6 text-sm font-semibold text-gray-800">부장 승인을 기다리고 있어요</p>
        <p className="mt-1 text-xs leading-relaxed text-gray-400">
          부장이 입장 요청을 승인하면 바로 이용할 수 있어요.
          <br />
          승인 소식을 들었다면 아래 버튼을 눌러 주세요.
        </p>

        <button
          type="button"
          // 새 페이지로 열면서 /today로 간다
          // 아직 승인 전이면 로그인 확인 과정이 다시 이 화면으로 보내준다
          onClick={() => window.location.replace("/today")}
          className="mt-6 w-full rounded-xl bg-black py-3 text-sm font-bold text-white hover:bg-gray-800"
        >
          승인 상태 확인
        </button>

        <button
          type="button"
          onClick={() => navigate("/invite", { replace: true })}
          className="mt-3 w-full rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          입장 화면으로
        </button>
      </div>
    </div>
  );
}