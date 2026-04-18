/**
 * Parse giá trị datetime từ Spring Boot (LocalDateTime) dùng trên UI như giờ trên vé / lịch chiếu.
 *
 * Chuỗi dạng `2026-04-12T19:30:00` **không có múi giờ** phải hiểu là giờ “ghi trên DB”, không phải UTC.
 * `new Date(iso)` tuỳ trình duyệt có thể coi là UTC → `toLocaleTimeString` lệch vài giờ so với MySQL Workbench.
 *
 * Cách xử lý: tách năm-tháng-ngày-giờ-phút-giây và dùng `new Date(y, m-1, d, h, mi, s)` (giờ theo lịch máy người dùng,
 * nhưng các con số trùng với DB — phù hợp khi dữ liệu là giờ địa phương rạp VN).
 */
export function parseLocalDateTimeLoose(raw: unknown): Date {
  if (raw == null || raw === '') return new Date(NaN);

  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return new Date(raw);
  }

  if (Array.isArray(raw)) {
    const y = raw[0];
    const mo = raw[1] ?? 1;
    const d = raw[2] ?? 1;
    const h = raw[3] ?? 0;
    const mi = raw[4] ?? 0;
    const s = raw[5] != null ? Math.floor(Number(raw[5])) : 0;
    if (typeof y !== 'number' || typeof mo !== 'number') return new Date(NaN);
    return new Date(y, mo - 1, Number(d), Number(h), Number(mi), s);
  }

  const s = String(raw).trim();
  if (/[Zz]$|[+-]\d{2}:\d{2}$/.test(s)) {
    return new Date(s);
  }

  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/.exec(s);
  if (!m) return new Date(s);

  const ys = Number(m[1]);
  const ms = Number(m[2]);
  const ds = Number(m[3]);
  const hs = Number(m[4]);
  const mins = Number(m[5]);
  const secs = m[6] != null ? Number(m[6]) : 0;
  return new Date(ys, ms - 1, ds, hs, mins, secs);
}
