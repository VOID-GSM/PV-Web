import { useState } from "react";
// ★ 기기 목록은 빈 상태로 시작하니 재입장 코드(mockProfile)만 가져온다
import { mockProfile } from "../../mocks/settings";

// ★ 기기 하나가 어떤 모양인지 미리 정해둔다
// 빈 배열로 시작하면 TypeScript가 안에 뭐가 들어갈지 모르기 때문이다
type Device = {
  id: number;
  name: string;
  location: string;
  lastSeen: string;
  isCurrent: boolean;
};

export default function ReentryCodeCard() {
  // ★ 빈 배열로 시작한다. <Device[]>: "Device들의 배열"이라는 뜻
  const [devices, setDevices] = useState<Device[]>([]);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(mockProfile.reentryCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReissue = () => {
    alert("재발급 요청을 보냈습니다");
  };

  const handleDisconnect = (id: number) => {
    setDevices(devices.filter((device) => device.id !== id));
  };

  return (
    <section id="device" className="rounded-lg bg-white p-6">
      <h2 className="font-bold">기기 · 재입장 코드</h2>
      <p className="mt-1 text-xs text-neutral-400">
        로그인이 없으므로 기기를 바꾸면 이 코드로 본인임을 증명합니다
      </p>

      {/* 경고 박스 */}
      <div className="mt-4 rounded border-l-4 border-amber-400 bg-amber-50 px-4 py-3">
        <p className="text-sm font-semibold text-amber-700">
          ⚠ 이 코드를 잃어버리면 부장에게 재발급을 요청해야 합니다
        </p>
        <p className="mt-1 text-xs text-neutral-600">
          코드가 없으면 같은 사람이 계정을 중복으로 만들게 됩니다. 메모장이나 비밀번호 관리자에 저장해두세요.
        </p>
      </div>

      {/* 검은 코드 상자 */}
      <div className="mt-4 flex items-center justify-between rounded-lg bg-black px-6 py-5">
        <span className="text-2xl font-bold tracking-wide text-white">
          {mockProfile.reentryCode}
        </span>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="rounded bg-neutral-800 px-3 py-1.5 text-xs text-white"
          >
            {copied ? "복사됨" : "복사"}
          </button>
          <button
            onClick={handleReissue}
            className="rounded bg-neutral-800 px-3 py-1.5 text-xs text-white"
          >
            재발급
          </button>
        </div>
      </div>

      {/* 접속 중인 기기 목록 */}
      <p className="mt-6 text-xs text-neutral-500">이 코드로 접속 중인 기기</p>

      {/* ★ 기기가 0개면 안내 문구, 1개 이상이면 목록 */}
      {devices.length === 0 ? (
        // border-dashed: 점선 테두리로 "비어 있음"을 표현한다
        <p className="mt-2 rounded border border-dashed py-6 text-center text-xs text-neutral-400">
          접속 중인 기기가 없습니다
        </p>
      ) : (
        <ul className="mt-2 flex flex-col gap-2">
          {devices.map((device) => (
            <li
              key={device.id}
              className={`flex items-center justify-between rounded px-4 py-3 ${
                device.isCurrent ? "bg-neutral-100" : "bg-neutral-50"
              }`}
            >
              <div>
                <p className="text-sm font-medium">{device.name}</p>
                <p className="text-xs text-neutral-400">
                  {device.location} · {device.lastSeen}
                </p>
              </div>

              {device.isCurrent ? (
                <span className="rounded-full border px-2 py-0.5 text-xs">현재 기기</span>
              ) : (
                <button
                  onClick={() => handleDisconnect(device.id)}
                  className="text-xs text-neutral-500"
                >
                  연결 해제
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}