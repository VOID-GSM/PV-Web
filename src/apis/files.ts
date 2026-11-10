import { api } from "./client";

// 업로드 주소 받기 응답 (POST /files/upload-url)
interface UploadUrlResponse {
  // 서버가 파일을 찾을 때 쓰는 이름표 (과제 제출의 fileKeys에 넣는다)
  objectKey: string;
  // 파일을 직접 올릴 주소 (잠깐만 쓸 수 있는 S3 주소)
  uploadUrl: string;
  // 올릴 때 꼭 같이 보내야 하는 헤더들
  headers: Record<string, string>;
  expiresAt: string;
}

// ─────────────────────────────────────────────
// 파일 하나를 서버 저장소에 올리고 objectKey를 돌려준다
// ① 업로드 주소 받기 → ② 그 주소로 파일 올리기 → ③ 다 올렸다고 등록
// (서버가 이 두 API에 X-Member-Id 헤더로 내 회원 번호를 요구한다)
// ─────────────────────────────────────────────
export const uploadFile = async (file: File, memberId: number) => {
  const memberHeader = { "X-Member-Id": String(memberId) };

  // ① 업로드 주소 받기
  const { data } = await api.post<UploadUrlResponse>(
    "/files/upload-url",
    {
      fileName: file.name,
      // 파일 종류를 모르면 "그냥 파일"이라는 뜻의 기본값
      contentType: file.type || "application/octet-stream",
      size: file.size,
    },
    { headers: memberHeader }
  );

  // ② 받은 주소로 파일 올리기
  // 우리 서버가 아니라 S3로 바로 보내서, 토큰을 붙이는 api 대신 브라우저 기본 fetch를 쓴다
  const response = await fetch(data.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream", ...data.headers },
    body: file,
  });
  if (!response.ok) {
    throw new Error(`파일 업로드에 실패했습니다. (${response.status})`);
  }

  // ③ 다 올렸다고 등록
  await api.post("/files", { objectKey: data.objectKey }, { headers: memberHeader });

  return data.objectKey;
};