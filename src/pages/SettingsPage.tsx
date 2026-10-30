// 노션 창이 열려 있는지 기억해야 해서 useState를 가져온다
import { useState } from "react";
import ProfileCard from "../components/settings/ProfileCard";
import ReentryCodeCard from "../components/settings/ReentryCodeCard";
import NotificationCard from "../components/settings/NotificationCard";
import DiscordCard from "../components/settings/DiscordCard";
import NotionImportModal from "../components/settings/NotionImportModal";
// 노션 가져오기 버튼에 쓸 아이콘
import uploadIcon from "../assets/icons/upload.svg";

export default function SettingsPage() {
  // 노션 가져오기 창이 열려 있는지. 처음엔 닫힘
  const [isNotionOpen, setIsNotionOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-100 p-6">
      {/* 왼쪽 설정 메뉴 없이 2칸 */}
      {/* 좁은 화면: 세로로 쌓기 / lg(1024px) 이상: 가로로 나란히 */}
      <div className="flex flex-col gap-4 lg:flex-row">
        {/* 왼쪽(넓은 칸): 내 프로필 + 기기·재입장 코드 */}
        <main className="flex min-w-0 flex-1 flex-col gap-4">
          <ProfileCard />
          <ReentryCodeCard />
        </main>

        {/* 오른쪽(좁은 칸): 알림 + 디스코드 연동 + 노션 가져오기 */}
        <aside className="flex w-full flex-col gap-4 self-start lg:w-80">
          <NotificationCard />
          <DiscordCard />

          {/* 노션 가져오기 카드 (왼쪽 메뉴에 있던 버튼을 여기로 옮겼다) */}
          <section className="rounded-lg bg-white p-6">
            <h2 className="font-bold">노션 가져오기</h2>
            <p className="mt-1 text-xs text-neutral-400">
              노션에서 내보낸 마크다운 파일을 정리글·면접 답변·업무일지로 옮깁니다
            </p>
            <button
              onClick={() => setIsNotionOpen(true)}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded border py-2.5 text-sm font-medium"
            >
              <img src={uploadIcon} alt="" className="h-4 w-4" />
              파일 가져오기
            </button>
          </section>
        </aside>
      </div>

      {/* isNotionOpen이 true일 때만 노션 창을 그린다 */}
      {isNotionOpen && <NotionImportModal onClose={() => setIsNotionOpen(false)} />}
    </div>
  );
}