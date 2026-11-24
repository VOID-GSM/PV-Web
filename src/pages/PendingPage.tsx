export default function PendingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f7f7] px-5 font-pretendard">
      <div className="w-full max-w-[420px] rounded-2xl bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-bold">VOID</h1>

        <div className="mt-10">
          <h2 className="text-lg font-bold">가입 승인을 기다리고 있어요</h2>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            팀 관리자가 가입을 승인하면
            <br />
            서비스를 이용할 수 있어요.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-8 h-11 w-full rounded-lg bg-black text-sm font-medium text-white"
        >
          승인 상태 확인
        </button>
      </div>
    </div>
  );
}
