
interface Props {
  onClose: () => void;
}

export default function CreateActivityModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-lg font-bold text-gray-900">활동 개설</h2>
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
            <label className="block font-semibold mb-1">카테고리</label>
            <div className="flex gap-2">
              {["신규", "멘토링", "프로젝트", "기타"].map((cat, idx) => (
                <button
                  key={cat}
                  type="button"
                  className={`px-3 py-1.5 border rounded-md ${idx === 0 ? "bg-black text-white border-black" : "text-gray-600"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">활동명</label>
            <input
              type="text"
              placeholder="예: React 심화 스터디"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold mb-1">시작일</label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">종료일</label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
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
              개설 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
