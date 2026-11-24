// useRef: 값을 기억해 두는 상자 (바뀌어도 화면을 다시 그리지 않는다)
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, getErrorMessage } from "../apis/client";
// 토큰 저장은 키 이름을 직접 쓰지 않고 tokenStorage로
import { tokenStorage } from "../apis/tokenStorage";

// 재입장 응답 모양 (POST /auth/re-entry/{code})
interface ReEntryResponse {
  memberId: number;
  // 가입 완료 / 부장 승인 대기
  status: "JOINED" | "PENDING";
  accessToken: string;
  refreshToken: string;
}




const MEMBER_ID_KEY = "pvweb:memberId";
// 입장할 때 기기에 저장해 둔 프로필 (사이드바가 서버 정보 전에 잠깐 보여준다)
const INVITE_PROFILE_KEY = "pvweb:invite-profile:v1";


// ★ 화면 상태: 처리 중 / 실패 (승인 대기는 /pending 화면이 맡는다)
type ReEntryState = { kind: "loading" } | { kind: "error"; message: string };

export default function ReEntryPage() {
  // 주소의 :code 부분 (예: /re-entry/2d6252... → "2d6252...")
  const { code } = useParams();
  const navigate = useNavigate();

  // 처음 상태: 코드가 없으면 바로 "실패", 있으면 "처리 중"
  // (useEffect 안에서 바로 setState하면 ESLint 경고가 나서, 처음부터 정해 둔다)
  const [state, setState] = useState<ReEntryState>(() =>
    code
      ? { kind: "loading" }
      : { kind: "error", message: "재입장 코드가 없습니다." },
  );

  // 개발 모드(StrictMode)에서 화면이 두 번 그려져도 요청은 한 번만 보내려고 기억해 둔다
  // (코드가 한 번만 쓰이는 방식이면 두 번째 요청이 실패하기 때문)
  const requestedRef = useRef(false);

  useEffect(() => {
    // 코드가 없거나 이미 보냈으면 아무것도 안 한다
    if (!code || requestedRef.current) return;
    requestedRef.current = true;

    const reEnter = async () => {
      try {
        // encodeURIComponent: 코드에 특수문자가 있어도 주소가 깨지지 않게
        const { data } = await api.post<ReEntryResponse>(
          `/auth/re-entry/${encodeURIComponent(code)}`,
        );


        // 받은 토큰을 이 기기에 저장
        localStorage.setItem("pvweb:memberId", String(data.memberId));
        localStorage.setItem("pvweb:accessToken", data.accessToken);
        localStorage.setItem("pvweb:refreshToken", data.refreshToken);
        if (data.status === "PENDING") {
          // 아직 부장 승인 전이면 안내만 보여준다 (await 뒤라 경고 없음)
          setState({ kind: "pending" });
          return;
        }

        // 성공했을 때만 이 기기의 계정 정보를 새 계정으로 덮어쓴다
        // (실패하면 지금 쓰던 계정은 그대로 남는다)
        tokenStorage.set(data.accessToken, data.refreshToken);
        localStorage.setItem(MEMBER_ID_KEY, String(data.memberId));
        // 예전 계정의 저장 프로필을 지운다 (사이드바에 다른 사람 이름이 보이지 않게)
        localStorage.removeItem(INVITE_PROFILE_KEY);


        // ★ 승인 대기면 /pending, 가입 완료면 /today
        // window.location.replace: 페이지를 새로 열어서, 새 토큰으로 모든 정보를 처음부터 불러오게 한다
        // (navigate로 이동하면 App이 들고 있던 예전 계정의 일정·할 일이 남을 수 있다)
        window.location.replace(data.status === "PENDING" ? "/pending" : "/today");
      } catch (error) {
        setState({ kind: "error", message: getErrorMessage(error) });
      }
    };

    void reEnter();
  }, [code]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f7f8] p-6 font-pretendard">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-xl font-black tracking-wider">VOID</p>

        {state.kind === "loading" && (
          <>
            <p className="mt-6 text-sm font-semibold text-gray-800">
              재입장하는 중입니다...
            </p>
            <p className="mt-1 text-xs text-gray-400">잠시만 기다려 주세요</p>
          </>
        )}


        {state.kind === "pending" && (
          <>
            <p className="mt-6 text-sm font-semibold text-gray-800">
              부장 승인을 기다리고 있어요
            </p>
            <p className="mt-1 text-xs text-gray-400">
              승인되면 다시 이 링크로 들어와 주세요
            </p>
          </>
        )}


        {state.kind === "error" && (
          <>
            <p className="mt-6 text-sm font-semibold text-red-500">
              재입장하지 못했습니다
            </p>
            <p className="mt-1 text-xs text-gray-500">{state.message}</p>
            <p className="mt-1 text-xs text-gray-400">
              링크가 맞는지 확인하거나 부장에게 새 링크를 요청해 주세요
            </p>
            <button
              type="button"
              onClick={() => navigate("/invite", { replace: true })}
              className="mt-6 w-full rounded-xl bg-black py-3 text-sm font-bold text-white hover:bg-gray-800"
            >
              입장 화면으로
            </button>
          </>
        )}
      </div>
    </div>
  );
}
