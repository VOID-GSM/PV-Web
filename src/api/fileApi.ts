import { apiRequest } from "./client";

interface UploadUrlResponse {
  objectKey: string;
  uploadUrl: string;
  headers: Record<string, string>;
  expiresAt: string;
}

interface CreateFileResponse {
  fileId: number;
}

export interface FileInfo {
  fileId: number;
  fileName: string;
  contentType: string;
  size: number;
  downloadUrl: string;
  expiresAt: string;
}

export async function uploadImage(
  file: File,
  memberId: number,
): Promise<number> {
  const uploadInfo = await apiRequest<UploadUrlResponse>("/files/upload-url", {
    method: "POST",
    headers: { "X-Member-Id": String(memberId) },
    body: {
      fileName: file.name,
      contentType: file.type,
      size: file.size,
    },
  });

  const uploadResponse = await fetch(uploadInfo.uploadUrl, {
    method: "PUT",
    headers: uploadInfo.headers,
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error("이미지 파일 업로드에 실패했습니다.");
  }

  const result = await apiRequest<CreateFileResponse>("/files", {
    method: "POST",
    headers: { "X-Member-Id": String(memberId) },
    body: { objectKey: uploadInfo.objectKey },
  });

  return result.fileId;
}

export function getFile(fileId: number) {
  return apiRequest<FileInfo>(`/files/${fileId}`);
}
