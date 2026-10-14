
// useState: 화면에서 바뀌는 값을 기억하는 React 기능
import { useState } from "react";

// 고를 수 있는 기수 목록 (나중엔 부장이 관리하는 값으로 바뀐다)
const GENERATIONS = ["9기", "10기"];
// 고를 수 있는 전공 목록
const MAJORS = ["Front-end", "Back-end", "DevOps", "Design"];

export default function ProfileCard() {
  const [name, setName] = useState("");
  // 선택된 기수. 처음엔 아무것도 선택 안 된 빈 글자("")로 시작한다
  const [generation, setGeneration] = useState("");
  // 선택된 전공들. 처음엔 빈 배열([])로 시작한다 = 아무것도 선택 안 됨
  const [majors, setMajors] = useState<string[]>([]);

  // 전공 버튼을 눌렀을 때 실행되는 함수
  const toggleMajor = (major: string) => {
    // includes: 배열 안에 그 값이 있는지 확인한다
    if (majors.includes(major)) {
      // 이미 선택돼 있으면 → filter로 그 전공만 빼고 남긴다 (선택 해제)
      setMajors(majors.filter((m) => m !== major));
    } else {
      // 선택 안 돼 있으면 → 기존 배열(...majors) 뒤에 추가한다
      setMajors([...majors, major]);
    }
  };

  // 저장 버튼을 눌렀을 때 실행되는 함수
  // 백엔드가 없으니 지금은 팝업으로 값만 확인한다
  const handleSave = () => {
    alert(`저장: ${name} / ${generation} / ${majors.join(", ")}`);
  };

  return (
    <section id="profile" className="rounded-lg bg-white p-6">
      {/* 카드 제목과 설명 */}
      <h2 className="font-bold">내 프로필</h2>
      <p className="mt-1 text-xs text-neutral-400">
        이름과 전공은 아바타 색상과 과제 대상 선정에 쓰입니다
      </p>

      {/* 아바타(왼쪽) + 입력 영역(오른쪽)을 가로로 배치 */}
      <div className="mt-4 flex gap-4">
        {/* 아바타: 이름의 첫 글자를 동그라미 안에 표시 */}
        <div className="flex flex-col items-center gap-1">
          {/* h-10 w-10: 크기, rounded-full: 완전한 원, items-center justify-center: 글자를 가운데로 */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm text-white">
            {/* charAt(0): 글자의 첫 번째 글자 */}
            {name.charAt(0)}
          </div>
          <span className="text-[10px] text-neutral-400">전공 색상</span>
        </div>

        {/* 입력 영역. flex-1: 남는 공간을 전부 차지 */}
        <div className="flex-1">
          <label className="text-xs font-medium">이름</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            // w-full: 가로를 꽉 채운다
            className="mt-1 w-full rounded border px-3 py-2 text-sm"
          />

          {/* 기수와 전공을 2칸으로 나란히. grid-cols-2: 2칸짜리 격자 */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            {/* 기수: 하나만 선택 */}
            <div>
              <label className="text-xs font-medium">기수</label>
              {/* flex-wrap: 버튼이 넘치면 다음 줄로 */}
              <div className="mt-1 flex flex-wrap gap-2">
                {/* map: 배열의 값마다 버튼을 하나씩 만든다 */}
                {GENERATIONS.map((g) => (
                  <button
                    // key: React가 버튼들을 구분하는 이름표 (map에는 꼭 필요)
                    key={g}
                    // 누르면 선택된 기수를 이 값으로 바꾼다
                    onClick={() => setGeneration(g)}
                    // 선택된 기수면 검은 테두리, 아니면 연한 테두리
                    className={`rounded-full border px-4 py-1.5 text-sm ${generation === g
                        ? "border-black font-semibold"
                        : "border-neutral-200 text-neutral-500"
                      }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* 전공: 여러 개 선택 */}
            <div>
              <label className="text-xs font-medium">전공</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {MAJORS.map((m) => (
                  <button
                    key={m}
                    onClick={() => toggleMajor(m)}
                    // 선택된 전공 배열에 들어 있으면 검은 테두리
                    className={`rounded-full border px-4 py-1.5 text-sm ${majors.includes(m)
                        ? "border-black font-semibold"
                        : "border-neutral-200 text-neutral-500"
                      }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 저장 버튼. justify-end: 오른쪽 끝으로 */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          className="rounded bg-black px-4 py-2 text-sm font-semibold text-white"
        >
          변경 사항 저장
        </button>
      </div>
    </section>
  );
}