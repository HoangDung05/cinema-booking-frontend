import { parseLocalDateTimeLoose } from './localDateTime';

export function formatTimeHHmm(d: Date): string {
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

/**
 * Hiển thị suất: "19:30 ~ 22:00" (bắt đầu + thời lượng phim, phút).
 * Không có duration hợp lệ thì chỉ hiển thị giờ bắt đầu.
 */
export function formatShowtimeWindowFromIso(
  startIso: string,
  durationMinutes?: number | null
): string {
  const start = parseLocalDateTimeLoose(startIso);
  if (!Number.isFinite(start.getTime())) return '—';
  const startLabel = formatTimeHHmm(start);
  const d =
    durationMinutes != null && Number.isFinite(durationMinutes) && durationMinutes > 0
      ? durationMinutes
      : null;
  if (d == null) return startLabel;
  const end = new Date(start.getTime() + d * 60_000);
  return `${startLabel} ~ ${formatTimeHHmm(end)}`;
}
