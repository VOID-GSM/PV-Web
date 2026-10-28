import { useCallback, useState } from "react";
import Toast from "../common/Toast";
// ★ 공통 확인 창
import ConfirmModal from "../common/ConfirmModal";
// 서버 연동
import { useIssueReEntryCode, useMyReEntryCode } from "../../hooks/useReEntry";
import { useMyProfile } from "../../hooks/useMembers";
import { getErrorMessage } from "../../apis/client";
// 경고 아이콘 (이모지 대신)
import alertIcon from "../../assets/icons/alert.svg";

type ToastState = { id: number; message: string; type: "success" | "info" };

// 코드를 가릴 때: 하이픈(-)은 남기고 나머지 글자를 ●로 바꾼다
const maskCode = (code: string) => code.replace(/[^-]/g, "●");

export default function ReentryCodeCard() {
  // 서버에서 내 재입장 코드 불러오기
  const codeQuery = useMyReEntryCode();
  // 재발급에 필요한 내 회원 번호 (프로필 카드가 불러온 걸 창고에서 같이 쓴다)
  const profileQuery = useMyProfile();
  const issueMutation = useIssueReEntryCode();

  // 코드를 보여줄지 (기본은 가림)
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  // ★ 재발급 확인 창이 열려 있는지
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (message: string, type: "success" | "info" = "success") => {
    setToast((prev) => ({ id: (prev?.id ?? 0) + 1, message, type }));
  };
  const closeToast = useCallback(() => setToast(null), []);
  // ★ 확인 창 닫기 (ConfirmModal이 Esc 감지에 쓰니까 매번 새로 만들지 않게 기억해 둔다)
  const closeConfirm = useCallback(() => setIsConfirmOpen(false), []);

  const code = codeQuery.data?.code;
  const myId = profileQuery.data?.memberId;

  // 복사
  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("복사하지 못했습니다. 코드를 직접 선택해서 복사해 주세요", "info");
    }
  };

  // ★ 확인 창에서 "재발급"을 눌렀을 때 실제로 서버에 보낸다
  const handleConfirmReissue = () => {
    setIsConfirmOpen(false);
    if (myId === undefined) return;
    issueMutation.mutate(myId, {
      onSuccess: () => {
        showToast("새 재입장 코드를 발급했습니다");
        setIsVisible(true);
      },
      // 부장이 아니면 403 → "권한이 없습니다"
      onError: (error) => showToast(getErrorMessage(error), "info"),
    });
  };

  // 코드 상자 안에 들어갈 글자
  const codeText = codeQuery.isPending
    ? "불러오는 중..."
    : codeQuery.isError
      ? "코드를 불러오지 못했습니다"
      : code
        ? isVisible
          ? code
          : maskCode(code)
        : "발급된 코드가 없습니다";

  return (
    <section id="device" className="rounded-lg bg-white p-6">
      <h2 className="font-bold">기기 · 재입장 코드</h2>
      <p className="mt-1 text-xs text-neutral-400">로그인이 없으므로 기기를 바꾸면 이 코드로 본인임을 증명합니다</p>

      {/* 경고 박스 */}
      <div className="mt-4 flex gap-2 rounded border-l-4 border-amber-400 bg-amber-50 px-4 py-3">
        <img src={alertIcon} alt="" className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-700">이 코드를 잃어버리면 부장에게 재발급을 요청해야 합니다</p>
          <p className="mt-1 text-xs text-neutral-600">
            코드가 없으면 같은 사람이 계정을 중복으로 만들게 됩니다. 메모장이나 비밀번호 관리자에 저장해두세요.
          </p>
        </div>
      </div>

      {/* 검은 코드 상자 */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-black px-6 py-5">
        <span className="min-w-0 break-all text-2xl font-bold tracking-wide text-white">{codeText}</span>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => setIsVisible(!isVisible)}
            disabled={!code}
            className="rounded bg-neutral-800 px-3 py-1.5 text-xs text-white disabled:opacity-40"
          >
            {isVisible ? "가리기" : "보기"}
          </button>
          <button
            onClick={handleCopy}
            disabled={!code}
            className="rounded bg-neutral-800 px-3 py-1.5 text-xs text-white disabled:opacity-40"
          >
            {copied ? "복사됨" : "복사"}
          </button>
          <button
            // ★ 바로 보내지 않고 확인 창만 연다
            onClick={() => setIsConfirmOpen(true)}
            disabled={myId === undefined || issueMutation.isPending}
            className="rounded bg-neutral-800 px-3 py-1.5 text-xs text-white disabled:opacity-40"
          >
            {issueMutation.isPending ? "발급 중..." : "재발급"}
          </button>
        </div>
      </div>

      {/* 접속 중인 기기 목록: 서버 API가 아직 없어서 안내만 */}
      <p className="mt-6 text-xs text-neutral-500">이 코드로 접속 중인 기기</p>
      <p className="mt-2 rounded border border-dashed py-6 text-center text-xs text-neutral-400">
        접속 기기 목록은 서버 연결을 준비 중입니다
      </p>

      {/* ★ 재발급 확인 창 */}
      {isConfirmOpen && (
        <ConfirmModal
          title="재입장 코드를 재발급할까요?"
          message="새 코드가 만들어집니다. 다른 곳에 저장해 둔 코드도 새 코드로 바꿔주세요."
          confirmLabel="재발급"
          onConfirm={handleConfirmReissue}
          onCancel={closeConfirm}
        />
      )}

      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={closeToast} />}
    </section>
  );
}