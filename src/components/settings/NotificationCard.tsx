import { useState } from "react";
import { mockNotificationSettings } from "../../mocks/settings";

export default function NotificationCard() {
    // 알림 설정 6개를 통째로 기억한다
    const [settings, setSettings] = useState(mockNotificationSettings);

    // 토글을 눌렀을 때. 어떤 설정인지 key를 받는다
    const toggle = (key: string) => {
        setSettings(
            // map: 배열을 한 칸씩 돌면서 새 배열을 만든다
            settings.map((item) =>
                // 누른 설정이면 → 나머지는 그대로(...item) 두고 enabled만 반대로(!)
                // 다른 설정이면 → 그대로 둔다
                item.key === key ? { ...item, enabled: !item.enabled } : item
            )
        );
    };

    return (
            <section id="notification" className="rounded-lg bg-white p-6">
            <h2 className="font-bold">알림</h2>
            <p className="mt-1 text-xs text-neutral-400">
                웹 푸시를 기본으로 하고 디스코드 웹훅을 함께 쓰는 것을 권장합니다
            </p>

            <ul className="mt-4 flex flex-col gap-2">
                {settings.map((item) => (
                    <li
                        key={item.key}
                        className="flex items-center justify-between rounded bg-neutral-50 px-4 py-3"
                    >
                        {/* 왼쪽: 제목과 설명 */}
                        <div>
                            <p className="text-sm font-medium">{item.title}</p>
                            <p className="text-xs text-neutral-400">{item.description}</p>
                        </div>

                        {/* 오른쪽: 토글 스위치 (바깥 막대) */}
                        <button
                            onClick={() => toggle(item.key)}
                            // 켜져 있으면 검은 막대, 꺼져 있으면 연한 회색 막대
                            // shrink-0: 공간이 좁아도 토글이 찌그러지지 않게
                            className={`relative h-6 w-11 shrink-0 rounded-full transition ${item.enabled ? "bg-black" : "bg-neutral-200"
                                }`}
                        >
                            {/* 안쪽 흰 동그라미 */}
                            {/* absolute: 바깥 막대 기준으로 위치를 정한다 */}
                            {/* 켜지면 오른쪽(left-6), 꺼지면 왼쪽(left-1)으로 이동 */}
                            <span
                                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${item.enabled ? "left-6" : "left-1"
                                    }`}
                            />
                        </button>
                    </li>
                ))}
            </ul>
        </section>
    );
}