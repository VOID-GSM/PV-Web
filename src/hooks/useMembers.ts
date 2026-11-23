import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteMyProfileImage,
  getMyProfile,
  setMyProfileImage,
  updateMyProfile,
} from "../apis/members";
import { profileImageKeys } from "./useProfileImage";

// 창고 이름표
export const memberKeys = {
  all: ["members"] as const,
  me: ["members", "me"] as const,
};

// ─────────────────────────────────────────────
// 내 프로필 불러오기
// ─────────────────────────────────────────────
export function useMyProfile() {
  return useQuery({
    queryKey: memberKeys.me,
    queryFn: getMyProfile,
  });
}

// ─────────────────────────────────────────────
// 내 프로필 수정
// ─────────────────────────────────────────────
export function useUpdateMyProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMyProfile,
    // 서버가 수정된 내 정보를 돌려주니까, 다시 요청하지 않고 창고에 바로 넣는다
    // setQueryData: 창고의 데이터를 직접 바꿔 넣는다
    onSuccess: (updated) => queryClient.setQueryData(memberKeys.me, updated),
  });
}

// ─────────────────────────────────────────────
// 내 프로필 사진 등록·변경 / 삭제
// ─────────────────────────────────────────────
// 사진이 바뀌면 "내 정보"(profileImageFileId)와 화면에 떠 있는 사진 주소를 다시 불러온다.
// (invalidateQueries: 창고의 값을 "오래된 값"으로 표시해서, 화면에 쓰이는 것은 바로 다시 받게 한다)
function useRefreshAfterImageChange() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: memberKeys.me }),
      queryClient.invalidateQueries({ queryKey: profileImageKeys.all }),
    ]);
}

// 사진 등록·변경: 파일을 먼저 올려서 받은 fileId를 넘긴다
export function useSetMyProfileImage() {
  const refresh = useRefreshAfterImageChange();
  return useMutation({
    mutationFn: setMyProfileImage,
    onSuccess: refresh,
  });
}

// 사진 삭제
export function useDeleteMyProfileImage() {
  const refresh = useRefreshAfterImageChange();
  return useMutation({
    mutationFn: deleteMyProfileImage,
    onSuccess: refresh,
  });
}
