
interface Props {
  onClose: () => void;
}

export default function CreateNoticeModal({ onClose }: Props) {
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
            <label className="block font-semibold mb-1">수신 대상</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="radio" name="target" defaultChecked /> 전체
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="radio" name="target" /> 특정 세션 참가자
              </label>
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
