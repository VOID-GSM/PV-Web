import { useState } from "react";

interface Props {
  onClose: () => void;
}
interface Props {
  onClose: () => void;
}

export default function CreateNoticeModal({ onClose }: Props) {
  const [target, setTarget] = useState<"all" | "session">("all");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-lg font-bold text-gray-900">공지 보내기</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form
          className="space-y-4 text-xs"
          onSubmit={(e) => e.preventDefault()}
        >
          <div>
            <label className="block font-semibold mb-2">수신 대상</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTarget("all")}
                className={`rounded-xl border p-3 text-left transition ${
                  target === "all"
                    ? "border-black bg-gray-50 ring-1 ring-black"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <span className="flex items-center gap-2 font-semibold text-gray-900">
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                      target === "all" ? "border-black" : "border-gray-300"
                    }`}
                  >
                    {target === "all" && (
                      <span className="h-2 w-2 rounded-full bg-black" />
                    )}
                  </span>
                  전체
                </span>
                <span className="mt-1 block pl-6 text-[11px] text-gray-500">
                  모든 참가자에게 공지
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTarget("session")}
                className={`rounded-xl border p-3 text-left transition ${
                  target === "session"
                    ? "border-black bg-gray-50 ring-1 ring-black"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <span className="flex items-center gap-2 font-semibold text-gray-900">
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                      target === "session" ? "border-black" : "border-gray-300"
                    }`}
                  >
                    {target === "session" && (
                      <span className="h-2 w-2 rounded-full bg-black" />
                    )}
                  </span>
                  특정 세션 참가자
                </span>
                <span className="mt-1 block pl-6 text-[11px] text-gray-500">
                  선택한 세션의 참가자에게 공지
                </span>
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">제목</label>
            <input
              type="text"
              placeholder="공지사항 제목을 입력해 주세요"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">내용</label>
            <textarea
              rows={4}
              placeholder="공지 내용을 작성해 주세요."
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-black resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded text-gray-600"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
            >
              공지 보내기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
