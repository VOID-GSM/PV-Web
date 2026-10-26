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
};

export default function Dropdown({
  options,
  value,
  onChange,
  placeholder = "선택하세요",
}: DropdownProps) {
  // 목록이 펼쳐져 있는지
  const [isOpen, setIsOpen] = useState(false);
  // 드롭다운 전체 영역을 집어둔다 (바깥을 클릭했는지 판단할 때 쓴다)
  const ref = useRef<HTMLDivElement>(null);

  // 드롭다운 바깥을 클릭하면 목록을 닫는다
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // ref.current: 집어둔 드롭다운 영역
      // contains: 클릭한 곳이 그 영역 안인지 확인
      // 영역 "안이 아니면"(!) 닫는다
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    // 페이지 전체에 "마우스를 누르면 handleClickOutside 실행해"라고 등록
    document.addEventListener("mousedown", handleClickOutside);
    // 드롭다운이 화면에서 사라질 때 등록을 지운다 (뒷정리)
    return () => document.removeEventListener("mousedown", handleClickOutside);
    // []: 처음 한 번만 등록한다
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
        // 열려 있으면 테두리를 검게
        className={`flex w-full items-center justify-between gap-2 rounded border px-3 py-2 text-left text-sm ${
          isOpen ? "border-black" : "border-neutral-200"
        }`}
      >
        {/* 고른 값이 있으면 그 값, 없으면 흐린 안내 글자 */}
        <span className={value ? "" : "text-neutral-400"}>{value || placeholder}</span>
        {/* 화살표. 열리면 위아래로 뒤집힌다(rotate-180) */}
        {/* justify-between + gap-2 덕분에 테두리에 붙지 않고 적당히 떨어진다 */}
        <span
          className={`text-[10px] text-neutral-400 transition-transform ${
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
        <ul className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded border bg-white shadow-lg">
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