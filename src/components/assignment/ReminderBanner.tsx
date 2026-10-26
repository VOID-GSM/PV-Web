type ReminderBannerProps = {
  // 출제된 과제가 없는 전공들
  majors: string[];
  onCreate: () => void;
};

export default function ReminderBanner({ majors, onCreate }: ReminderBannerProps) {
  // 알릴 전공이 없으면 아무것도 안 그린다
  if (majors.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-amber-50 px-5 py-4">
      <div>
        <p className="text-sm font-semibold text-amber-700">
          ⚠ 출제 리마인더 · {majors.join(", ")} 전공에 출제된 과제가 없습니다
        </p>
        <p className="mt-1 text-xs text-neutral-600">
          해당 전공 9기에게 알림이 발송됩니다. 역량 맵에서 점수가 낮은 항목으로 출제해 보세요.
        </p>
      </div>
      <button onClick={onCreate} className="shrink-0 rounded border bg-white px-3 py-1.5 text-xs font-medium">
        ✎ 지금 출제
      </button>
    </div>
  );
}