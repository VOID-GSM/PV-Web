import { useState } from "react";

// 메뉴 목록
// id: 이동할 카드의 이름표 (1번에서 단 id와 같아야 한다)
// label: 메뉴에 보일 글자
const MENUS = [
    { id: "profile", label: "내 프로필" },
    { id: "device", label: "기기 · 재입장" },
    { id: "notification", label: "알림" },
    { id: "discord", label: "디스코드 연동" },
    { id: "role", label: "역할 · 권한" },
    { id: "notion", label: "노션 가져오기" },
];

// 바깥(SettingsPage)에서 받을 값의 종류
type SettingsNavProps = {
    // 노션 가져오기 메뉴를 눌렀을 때 실행할 함수
    onNotionClick: () => void;
};

export default function SettingsNav({ onNotionClick }: SettingsNavProps) {
    // 지금 선택된 메뉴의 id. 처음엔 "내 프로필"
    const [activeId, setActiveId] = useState("profile");

    // 메뉴를 눌렀을 때 실행되는 함수
    const handleClick = (id: string) => {
        // 노션 가져오기는 스크롤 대신 팝업 창을 연다
        if (id === "notion") {
            // 바깥에서 받은 함수를 실행 → SettingsPage에게 "창 열어줘"라고 알린다
            onNotionClick();
            // return: 여기서 함수를 끝낸다 (아래 스크롤 코드는 실행 안 됨)
            return;
        }

        // ↓ 원래 있던 코드는 그대로
        setActiveId(id);
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        // h-full: 칸 높이를 꽉 채운다
        <nav className="h-full rounded-lg bg-white p-3">
            <ul className="flex flex-col gap-1">
                {/* 메뉴 목록의 항목마다 버튼을 하나씩 만든다 */}
                {MENUS.map((menu) => (
                    <li key={menu.id}>
                        <button
                            // 어떤 메뉴든 handleClick에 맡긴다 (노션 처리는 handleClick 안에서 한다)
                            onClick={() => handleClick(menu.id)}
                            // w-full: 가로를 꽉 채운다, text-left: 글자를 왼쪽 정렬
                            // 선택된 메뉴: 회색 배경 + 굵은 글씨
                            // 나머지: 흐린 글씨, 마우스 올리면(hover:) 아주 연한 회색 배경
                            className={`w-full rounded px-3 py-2 text-left text-sm ${activeId === menu.id
                                    ? "bg-neutral-100 font-semibold"
                                    : "text-neutral-600 hover:bg-neutral-50"
                                }`}
                        >
                            {menu.label}
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
}