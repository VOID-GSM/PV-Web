// 창이 열려 있는지 기억해야 해서 useState를 가져온다
import { useState } from "react";
import ProfileCard from "../components/settings/ProfileCard";
import ReentryCodeCard from "../components/settings/ReentryCodeCard";
import NotificationCard from "../components/settings/NotificationCard";
// ★ 디스코드 연동 카드
import DiscordCard from "../components/settings/DiscordCard";
import SettingsNav from "../components/settings/SettingsNav";
import NotionImportModal from "../components/settings/NotionImportModal";

export default function SettingsPage() {
  // 노션 가져오기 창이 열려 있는지. 처음엔 닫힘(false)
  const [isNotionOpen, setIsNotionOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-100 p-6">
      <div className="flex gap-4">
        <aside className="w-56">
          {/* 메뉴에게 "노션 눌리면 창을 열어(true)"라는 함수를 넘겨준다 */}
          <SettingsNav onNotionClick={() => setIsNotionOpen(true)} />
        </aside>

        <main className="flex flex-1 flex-col gap-4">
          <ProfileCard />
          <ReentryCodeCard />
        </main>

        {/* ★ 오른쪽 칸: 카드를 세로로 쌓는다 (flex-col), 카드 사이 간격 (gap-4) */}
        <aside className="flex w-80 flex-col gap-4 self-start">
          <NotificationCard />
          {/* ★ 알림 카드 바로 아래에 디스코드 연동 카드 */}
          <DiscordCard />
        </aside>
      </div>

      {/* isNotionOpen이 true일 때만 창을 그린다 */}
      {/* 창에게 "닫을 땐 이걸 실행해(false)"라는 함수를 넘겨준다 */}
      {isNotionOpen && (
        <NotionImportModal onClose={() => setIsNotionOpen(false)} />
      )}
    </div>
  );
}