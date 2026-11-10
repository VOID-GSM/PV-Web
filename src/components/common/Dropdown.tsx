// useRef: 화면 속 특정 요소를 손으로 집어두는 기능
// useEffect: 화면이 그려진 뒤에 할 일을 정해두는 기능
import { useEffect, useRef, useState } from "react";

// 바깥에서 받을 값
type DropdownProps = {
  // 고를 수 있는 항목들
  options: string[];
  // 지금 선택된 값 (아무것도 안 골랐으면 빈 글자 "")
  value: string;
  // 항목을 골랐을 때 실행할 함수. 고른 값을 넘겨준다
  onChange: (value: string) => void;
  // 아무것도 안 골랐을 때 보여줄 글자 (안 넘기면 "선택하세요")
  placeholder?: string;
  // ★ 항상 앞에 붙일 이름표 (예: "전공" → "전공: Front-end")
  // 안 넘기면 placeholder가 "전공: 전체" 모양일 때 ":" 앞 글자를 이름표로 쓴다
  label?: string;
};

export default function Dropdown({
  options,
  value,
  onChange,
  placeholder = "선택하세요",
  label,
}: DropdownProps) {
  // 목록이 펼쳐져 있는지
  const [isOpen, setIsOpen] = useState(false);
  // 드롭다운 전체 영역을 집어둔다 (바깥을 클릭했는지 판단할 때 쓴다)
  const ref = useRef<HTMLDivElement>(null);

  // ★ 이름표 정하기
  // "전공: 전체".split(":") → ["전공", " 전체"] → 앞쪽 "전공"
  const placeholderParts = placeholder.split(":");
  const finalLabel = label ?? (placeholderParts.length > 1 ? placeholderParts[0].trim() : "");
  // 이름표가 있을 때, 아직 안 골랐으면 보여줄 기본값 (" 전체" → "전체")
  const emptyText = placeholderParts.length > 1 ? placeholderParts.slice(1).join(":").trim() : placeholder;

  // 드롭다운 바깥을 클릭하면 목록을 닫는다
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // 영역 "안이 아니면"(!) 닫는다
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    // 드롭다운이 화면에서 사라질 때 등록을 지운다 (뒷정리)
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 항목을 골랐을 때: 바깥에 알리고 목록을 닫는다
  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    // relative: 아래 펼쳐지는 목록(absolute)의 위치 기준이 된다
    <div ref={ref} className="relative">
      {/* 눌러서 열고 닫는 버튼 */}
      <button
        // type="button": 폼 안에 있어도 "제출"로 동작하지 않게
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        // ★ 테두리를 한 단계 진하게(300), 마우스를 올리면 더 진하게(400), 열려 있으면 검게
        className={`flex w-full items-center justify-between gap-2 rounded border bg-white px-3 py-2 text-left text-sm transition-colors ${
          isOpen ? "border-black" : "border-neutral-300 hover:border-neutral-400"
        }`}
      >
        {finalLabel ? (
          // ★ 이름표가 있으면: "전공: Front-end" (이름표는 회색, 값은 검정)
          // truncate + min-w-0: 글자가 길면 ...으로 줄인다
          <span className="min-w-0 truncate">
            <span className="text-neutral-400">{finalLabel}: </span>
            <span className={value ? "font-medium" : "text-neutral-400"}>{value || emptyText}</span>
          </span>
        ) : (
          // 이름표가 없으면 예전처럼: 고른 값, 없으면 흐린 안내 글자
          <span className={`min-w-0 truncate ${value ? "" : "text-neutral-400"}`}>{value || placeholder}</span>
        )}
        {/* 화살표. 열리면 위아래로 뒤집힌다(rotate-180) */}
        <span
          className={`shrink-0 text-[10px] text-neutral-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {/* 펼쳐지는 목록. 열려 있을 때만 그린다 */}
      {isOpen && (
        // absolute top-full: 버튼 바로 아래에 띄운다
        // left-0 right-0: 버튼과 너비를 똑같이
        // z-10: 다른 내용 위에 보이게, shadow-lg: 그림자
        <ul className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded border border-neutral-300 bg-white shadow-lg">
          {options.map((option) => (
            <li key={option}>
              <button
                type="button"
                onClick={() => handleSelect(option)}
                // 지금 선택된 항목은 굵게
                className={`w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 ${
                  value === option ? "font-semibold" : ""
                }`}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}