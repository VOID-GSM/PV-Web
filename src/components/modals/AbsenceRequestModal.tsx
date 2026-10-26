
interface Props {
  onClose: () => void;
}

export default function AbsenceRequestModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-lg font-bold text-gray-900">불참 요청</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
          ⚠️ 무단 불참 시 스터디 참여에 제한이 있을 수 있습니다. 사유를 명확히
          작성해 주세요.
        </div>

        <form
          className="space-y-4 text-xs"
          onSubmit={(e) => e.preventDefault()}
        >
          <div>
            <label className="block font-semibold mb-1">불참 회차</label>
            <select className="w-full p-2 border border-gray-300 rounded">
              <option>3차시 - 2026년 03월 17일 19:00</option>
              <option>4차시 - 2026년 03월 24일 19:00</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">불참 사유</label>
            <textarea
              rows={3}
              placeholder="사유를 입력해 주세요 (예: 병원 방문, 개인 사정 등)"
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
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              불참 요청 제출
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
