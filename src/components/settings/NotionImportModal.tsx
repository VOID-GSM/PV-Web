import { useState } from "react";
import Dropdown from "../common/Dropdown";

// 고를 수 있는 유형 3가지
const IMPORT_TYPES = [
  { value: "post", label: "정리글", description: "활동·회차와 연결됩니다" },
  { value: "interview", label: "면접 답변", description: "질문에 매칭됩니다" },
  { value: "worklog", label: "업무일지", description: "공개/비공개를 고를 수 있습니다" },
];

// 위쪽 단계 표시 글자
const STEPS = ["파일 선택", "유형·작성자 지정", "미리보기 후 가져오기"];

// 드롭다운 항목들
const AUTHOR_OPTIONS = ["동키 (10기)"];
const ACTIVITY_OPTIONS = ["React 심화 스터디", "CS 면접 준비", "포폴 피드백 모임"];
const DATE_OPTIONS = ["파일의 날짜 사용", "오늘 날짜로"];

// 파일 하나의 모양
type ImportFile = {
  name: string;
  size: string;
  // 파일이 마지막으로 수정된 시각 (밀리초)
  lastModified: number;
};

// 밀리초 숫자를 "2026-10-13" 모양으로 바꾸는 함수
const formatDate = (ms: number) => new Date(ms).toLocaleDateString("sv-SE");

type NotionImportModalProps = {
  onClose: () => void;
};

export default function NotionImportModal({ onClose }: NotionImportModalProps) {
  const [files, setFiles] = useState<ImportFile[]>([]);
  const [importType, setImportType] = useState("");
  const [author, setAuthor] = useState("");
  const [activity, setActivity] = useState("");
  const [dateOption, setDateOption] = useState("");
  // "오늘 날짜로"를 고른 순간의 날짜를 저장해 둔다
  const [todayDate, setTodayDate] = useState("");

  const selectedType = IMPORT_TYPES.find((type) => type.value === importType);

  // 아직 안 고른 필수 항목들의 이름
  const missingFields = [
    files.length === 0 ? "파일" : "",
    importType === "" ? "유형" : "",
    author === "" ? "작성자" : "",
    activity === "" ? "활동" : "",
    dateOption === "" ? "날짜" : "",
  ].filter(Boolean);

  // 빠진 항목이 없어야 가져오기 가능
  const canImport = missingFields.length === 0;

  // 단계: 파일 없음 → 0, 빠진 게 있음 → 1, 다 채움 → 2
  const currentStep = files.length === 0 ? 0 : canImport ? 2 : 1;

  // 미리보기 줄: 실제로 고른 파일로 만든다
  const previewRows = files.map((file) => ({
    title: file.name.replace(/\.(md|zip)$/, ""),
    activity: activity || "-",
    date:
      dateOption === "파일의 날짜 사용"
        ? formatDate(file.lastModified)
        : dateOption === "오늘 날짜로"
          ? todayDate
          : "-",
  }));

  // 날짜 드롭다운에서 골랐을 때 (이벤트 처리 함수라 Date.now()를 써도 괜찮다)
  const handleDateOptionChange = (value: string) => {
    setDateOption(value);
    if (value === "오늘 날짜로") {
      setTodayDate(formatDate(Date.now()));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    const newFiles = selected.map((file) => ({
      name: file.name,
      size: `${Math.round(file.size / 1024)}KB`,
      lastModified: file.lastModified,
    }));
    setFiles([...files, ...newFiles]);
    // 같은 파일을 다시 골라도 동작하도록 입력칸을 비운다
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleImport = () => {
    alert(`${files.length}개 파일을 ${selectedType?.label}(으)로 가져옵니다`);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="scrollbar-hide max-h-[90vh] w-full max-w-[640px] overflow-y-auto rounded-xl bg-white"
      >
        {/* ===== 머리 ===== */}
        <div className="flex items-start justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-lg font-bold">노션에서 가져오기</h2>
            <p className="mt-1 text-xs text-neutral-400">
              노션에서 내보낸 마크다운 파일을 정리글·면접 답변·업무일지로 옮깁니다
            </p>
          </div>
          <button onClick={onClose} className="text-xl text-neutral-400">
            ×
          </button>
        </div>

        {/* ===== 몸통 ===== */}
        <div className="flex flex-col gap-5 px-6 py-5">
          {/* 1. 단계 표시 */}
          <div className="flex gap-2">
            {STEPS.map((step, index) => (
              <div
                key={step}
                className={`flex flex-1 items-center gap-2 rounded px-3 py-2 text-xs ${
                  index === currentStep ? "bg-neutral-100 font-semibold" : "text-neutral-400"
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${
                    index <= currentStep ? "bg-black text-white" : "bg-neutral-200"
                  }`}
                >
                  {index + 1}
                </span>
                {step}
              </div>
            ))}
          </div>

          {/* 2. 파일 올리는 상자 */}
          <label className="flex flex-col items-center gap-1 rounded-lg border-2 border-dashed border-neutral-200 py-8">
            <span className="text-sm">노션 내보내기(.md, .zip) 파일을 끌어다 놓으세요</span>
            <span className="text-xs text-neutral-400">
              Notion → 내보내기 → Markdown & CSV 로 받은 파일
            </span>
            <input
              type="file"
              multiple
              accept=".md,.zip"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* 선택한 파일 목록 */}
          {files.length > 0 && (
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium">선택한 파일 {files.length}개</p>
                <button onClick={() => setFiles([])} className="text-xs text-neutral-500">
                  모두 지우기
                </button>
              </div>
              <ul className="mt-2 flex flex-col gap-1">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between gap-3 rounded bg-neutral-50 px-3 py-2 text-sm"
                  >
                    <span className="min-w-0 truncate" title={file.name}>
                      {file.name}
                    </span>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-xs text-neutral-400">{file.size}</span>
                      <button onClick={() => removeFile(index)} className="text-neutral-400">
                        ×
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 3. 유형 선택 */}
          <div>
            <p className="text-xs font-medium">
              어떤 유형으로 가져올까요? <span className="text-red-500">*</span>
            </p>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {IMPORT_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setImportType(type.value)}
                  className={`flex items-start gap-2 rounded-lg border px-3 py-3 text-left ${
                    importType === type.value ? "border-black" : "border-neutral-200"
                  }`}
                >
                  <span
                    className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 ${
                      importType === type.value ? "border-[5px] border-black" : "border-neutral-300"
                    }`}
                  />
                  <span>
                    <span className="block text-sm font-medium">{type.label}</span>
                    <span className="block text-[11px] text-neutral-400">{type.description}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. 작성자 · 활동 · 날짜 */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium">
                작성자 <span className="text-red-500">*</span>
              </p>
              <div className="mt-1">
                <Dropdown options={AUTHOR_OPTIONS} value={author} onChange={setAuthor} />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium">
                활동 <span className="text-red-500">*</span>
              </p>
              <div className="mt-1">
                <Dropdown options={ACTIVITY_OPTIONS} value={activity} onChange={setActivity} />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium">
                날짜 <span className="text-red-500">*</span>
              </p>
              <div className="mt-1">
                <Dropdown
                  options={DATE_OPTIONS}
                  value={dateOption}
                  onChange={handleDateOptionChange}
                />
              </div>
            </div>
          </div>

          {/* 5. 미리보기 */}
          <div>
            <p className="text-xs font-medium">미리보기</p>
            {files.length === 0 ? (
              <p className="mt-2 rounded border border-dashed py-6 text-center text-xs text-neutral-400">
                파일을 선택하면 미리보기가 표시됩니다
              </p>
            ) : (
              <table className="mt-2 w-full table-fixed overflow-hidden rounded border text-sm">
                <thead className="bg-neutral-50 text-xs text-neutral-500">
                  <tr>
                    <th className="px-3 py-2 text-left font-normal">제목</th>
                    <th className="w-20 whitespace-nowrap px-3 py-2 text-left font-normal">유형</th>
                    <th className="w-36 whitespace-nowrap px-3 py-2 text-left font-normal">활동</th>
                    <th className="w-28 whitespace-nowrap px-3 py-2 text-left font-normal">날짜</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, index) => (
                    <tr key={`${row.title}-${index}`} className="border-t">
                      <td className="truncate px-3 py-2" title={row.title}>
                        {row.title}
                      </td>
                      <td className="px-3 py-2">
                        <span className="whitespace-nowrap rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                          {selectedType?.label ?? "-"}
                        </span>
                      </td>
                      <td className="truncate px-3 py-2 text-xs">{row.activity}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-xs text-neutral-400">
                        {row.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* 6. 안내 상자 */}
          <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
            {importType === "worklog" ? (
              <p className="text-sm font-semibold text-blue-700">
                업무일지는 가져온 뒤 공개/비공개를 고를 수 있습니다
              </p>
            ) : (
              <>
                <p className="text-sm font-semibold text-blue-700">
                  가져온 글도 팀 전체에 공개됩니다
                </p>
                <p className="mt-1 text-xs text-neutral-600">
                  정리글은 비공개 옵션이 없습니다. 업무일지로 가져오면 공개/비공개를 고를 수 있어요.
                </p>
              </>
            )}
          </div>
        </div>

        {/* ===== 바닥 ===== */}
        <div className="flex items-center justify-between gap-3 border-t px-6 py-4">
          {canImport ? (
            <p className="text-xs text-neutral-400">
              가져온 뒤에도 각 글에서 활동·회차를 다시 바꿀 수 있습니다
            </p>
          ) : (
            <p className="text-xs text-red-500">{missingFields.join(", ")}을(를) 선택해 주세요</p>
          )}
          <div className="flex shrink-0 gap-2">
            <button onClick={onClose} className="rounded border px-4 py-2 text-sm">
              취소
            </button>
            <button
              onClick={handleImport}
              disabled={!canImport}
              className="rounded bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              {files.length}개 파일 가져오기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}