import { useState } from "react";
import { useProfileImageUrl } from "../../hooks/useProfileImage";

interface AvatarProps {
  // 멤버 번호. 없으면 서버에 묻지 않고 이름 첫 글자만 보여준다
  memberId?: number | null;
  // 사진이 없을 때 보여줄 글자(첫 글자)를 만드는 이름
  name: string;
  // 크기와 글자 크기 (예: "h-8 w-8 text-xs")
  className?: string;
}

// ─────────────────────────────────────────────
// 아바타: 프로필 사진이 있으면 사진, 없거나 불러오지 못하면 이름 첫 글자
// ─────────────────────────────────────────────
// 기존에 곳곳에 있던 이 코드를 이걸로 바꾸면 된다
//   <div className="flex h-8 w-8 ... rounded-full bg-black text-xs text-white">{m.name.charAt(0)}</div>
//   → <Avatar memberId={m.memberId} name={m.name} className="h-8 w-8 text-xs" />
export default function Avatar({
  memberId,
  name,
  className = "h-8 w-8 text-xs",
}: AvatarProps) {
  const url = useProfileImageUrl(memberId);

  // 사진 주소가 막혔거나(만료) 깨졌을 때 이름 첫 글자로 돌아가기 위해 실패한 주소를 기억한다
  // 새 주소를 받으면 (실패한 주소와 달라지므로) 다시 사진을 보여준다
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-black font-bold text-white ${className}`}
    >
      {url !== null && url !== failedUrl ? (
        <img
          src={url}
          alt=""
          draggable={false}
          onError={() => setFailedUrl(url)}
          className="h-full w-full object-cover"
        />
      ) : (
        name.charAt(0)
      )}
    </div>
  );
}
