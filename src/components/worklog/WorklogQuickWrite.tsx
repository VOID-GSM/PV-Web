import { useState } from "react";
// 방금 만든 보드 목록과 템플릿 항목을 가져온다
import { BOARDS, TEMPLATES } from "../../constants/worklog";

export default function WorklogQuickWrite() {
  // 체크된 템플릿 항목들. 처음엔 빈 배열 = 아무것도 체크 안 됨
  const [checkedTemplates, setCheckedTemplates] = useState<string[]>([]);
  // 팀 전체에 공개할지. 처음엔 꺼짐
  const [isPublic, setIsPublic] = useState(false);
  // 선택된 보드 태그들. 처음엔 빈 배열
  const [selectedBoards, setSelectedBoards] = useState<string[]>([]);

  // 템플릿 체크박스를 눌렀을 때 (설정 페이지의 전공 선택과 같은 방식)
  const toggleTemplate = (template: string) => {
    if (checkedTemplates.includes(template)) {
      // 이미 체크돼 있으면 → 빼기
      setCheckedTemplates(checkedTemplates.filter((t) => t !== template));
    } else {
      // 체크 안 돼 있으면 → 넣기
      setCheckedTemplates([...checkedTemplates, template]);
    }
  };

  // 보드 태그를 눌렀을 때 (같은 방식)
  const toggleBoard = (boardName: string) => {
    if (selectedBoards.includes(boardName)) {
      setSelectedBoards(selectedBoards.filter((b) => b !== boardName));
    } else {
      setSelectedBoards([...selectedBoards, boardName]);
    }
  };

  // 일지 작성하기 버튼 (다음 단계에서 작성 창을 열도록 바꾼다)
  const handleWrite = () => {
    alert("작성 창은 다음 단계에서 만들어요");
  };

  return (
    // border-2 border-black: 디자인처럼 이 카드만 검은 테두리로 강조
    <section className="rounded-lg border-2 border-black bg-white p-5">
      {/* 제목 + "선택 사항" 배지 */}
      <div className="flex items-center justify-between">
        <h2 className="font-bold">오늘의 일지 쓰기</h2>
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px]">선택 사항</span>
      </div>
      <p className="mt-1 text-xs text-neutral-400">
        쓰고 싶을 때만 쓰면 됩니다. 작성 알림이나 미작성 체크는 없습니다.
      </p>

      {/* 템플릿 체크박스 영역 */}
      <div className="mt-4 rounded bg-neutral-50 p-3">
        <p className="text-xs text-neutral-500">템플릿</p>
        <div className="mt-2 flex flex-col gap-2">
          {TEMPLATES.map((template) => (
            // label로 감싸면 글자를 눌러도 체크박스가 눌린다
            <label key={template} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                // type="checkbox": 네모 체크박스
                type="checkbox"
                // checked: 체크 여부. 배열에 들어 있으면 체크된 상태
                checked={checkedTemplates.includes(template)}
                onChange={() => toggleTemplate(template)}
                // accent-black: 체크 표시 색을 검정으로
                className="h-4 w-4 accent-black"
              />
              {template}
            </label>
          ))}
        </div>
      </div>

      {/* 공개 토글 (설정 페이지 알림 카드의 토글과 같은 모양) */}
      <div className="mt-3 flex items-center justify-between gap-3 rounded bg-neutral-100 p-3">
        <div>
          <p className="text-sm font-medium">팀 전체에 공개</p>
          <p className="text-[11px] text-neutral-500">
            비공개 글은 본인만 볼 수 있고 주간 리포트에서도 제외됩니다
          </p>
        </div>
        <button
          // !isPublic: 지금 값의 반대로 바꾼다 (켜짐 ↔ 꺼짐)
          onClick={() => setIsPublic(!isPublic)}
          className={`relative h-6 w-11 shrink-0 rounded-full transition ${
            isPublic ? "bg-black" : "bg-neutral-200"
          }`}
        >
          <span
            className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
              isPublic ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>

      {/* 보드 태그 */}
      <p className="mt-4 text-xs text-neutral-500">보드 태그</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {BOARDS.map((board) => (
          <button
            key={board.name}
            onClick={() => toggleBoard(board.name)}
            // 선택된 태그만 검은 테두리 + 굵은 글씨
            className={`flex items-center gap-1.5 rounded border px-2 py-1 text-xs ${
              selectedBoards.includes(board.name)
                ? "border-black font-semibold"
                : "border-neutral-200 text-neutral-500"
            }`}
          >
            {/* 보드 색깔 점. 클래스 이름을 BOARDS의 dotColor에서 가져온다 */}
            <span className={`h-2 w-2 rounded-full ${board.dotColor}`} />
            {board.name}
          </button>
        ))}
      </div>

      {/* 작성 버튼. w-full: 가로를 꽉 채운다 */}
      <button
        onClick={handleWrite}
        className="mt-5 w-full rounded bg-black py-2.5 text-sm font-semibold text-white"
      >
        일지 작성하기
      </button>
    </section>
  );
}