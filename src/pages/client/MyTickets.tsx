import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { bookingService, BookingHistoryDTO, PENDING_HOLD_MS } from '../../services/bookingService';
import { readAuthSession } from '../../utils/authSession';
import { parseLocalDateTimeLoose } from '../../utils/localDateTime';
import { formatShowtimeWindowFromIso } from '../../utils/showtimeRange';
import { useNavigate } from 'react-router-dom';

const TICKET_POSTER_FALLBACK =
  'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=600';

function bookingStatusLabel(status: string | undefined): { label: string; className: string } {
  const s = (status || '').toUpperCase();
  if (s === 'PAID') return { label: 'Đã thanh toán', className: 'bg-green-100 text-green-700' };
  if (s === 'PENDING') return { label: 'Chờ thanh toán', className: 'bg-amber-100 text-amber-800' };
  if (s === 'CANCELLED') return { label: 'Đã hủy', className: 'bg-slate-200 text-slate-700' };
  return { label: status || '—', className: 'bg-surface-container-high text-on-surface-variant' };
}

function showtimeMs(showtimeStart: string): number {
  return parseLocalDateTimeLoose(showtimeStart).getTime();
}

function isShowtimePast(showtimeStart: string): boolean {
  return showtimeMs(showtimeStart) < Date.now();
}

function parseBackendLocalDateTime(raw: unknown): number | null {
  const t = parseLocalDateTimeLoose(raw).getTime();
  return Number.isFinite(t) ? t : null;
}

function isPendingOverdue(ticket: BookingHistoryDTO, now: number): boolean {
  if ((ticket.status || '').toUpperCase() !== 'PENDING') return false;
  const startMs = parseBackendLocalDateTime(ticket.bookingCreatedAt as unknown);
  if (startMs == null) return false;
  return now >= startMs + PENDING_HOLD_MS;
}

function pendingRemainingMs(ticket: BookingHistoryDTO, now: number): number | null {
  if ((ticket.status || '').toUpperCase() !== 'PENDING') return null;
  const startMs = parseBackendLocalDateTime(ticket.bookingCreatedAt as unknown);
  if (startMs == null) return null;
  const end = startMs + PENDING_HOLD_MS;
  let remain = Math.max(0, end - now);
  // Không bao giờ hiển thị còn hơn thời hạn thanh toán (lỗi parse / sai lệch đồng hồ / dữ liệu created_at sai)
  remain = Math.min(remain, PENDING_HOLD_MS);
  return remain;
}

function formatCountdown(ms: number): string {
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

/** Lịch sử: đã hủy, hoặc suất đã chiếu (PAID & quá giờ chiếu), hoặc PENDING quá hạn thanh toán (chờ API đổi sang CANCELLED). */
function isHistoryTicket(ticket: BookingHistoryDTO, now: number): boolean {
  const st = (ticket.status || '').toUpperCase();
  if (st === 'CANCELLED') return true;
  if (st === 'PENDING' && isPendingOverdue(ticket, now)) return true;
  if (st === 'PAID' && isShowtimePast(ticket.showtimeStart)) return true;
  return false;
}

function isUpcomingTicket(ticket: BookingHistoryDTO, now: number): boolean {
  return !isHistoryTicket(ticket, now);
}

function bookingCreatedMs(ticket: BookingHistoryDTO): number {
  const created = parseBackendLocalDateTime(ticket.bookingCreatedAt as unknown);
  if (created != null) return created;
  return showtimeMs(ticket.showtimeStart);
}

function sortByNewestBooked(a: BookingHistoryDTO, b: BookingHistoryDTO): number {
  return bookingCreatedMs(b) - bookingCreatedMs(a);
}

export default function MyTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<BookingHistoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [continuingId, setContinuingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [nowTick, setNowTick] = useState(() => Date.now());
  const lastPollRef = useRef(0);
  const ticketsRef = useRef(tickets);
  ticketsRef.current = tickets;

  const loadTickets = useCallback(
    (email: string) =>
      bookingService.getMyBookings(email).then((data) => {
        const sorted = [...data].sort(sortByNewestBooked);
        setTickets(sorted);
      }),
    []
  );

  useEffect(() => {
    const email = readAuthSession()?.email;
    if (!email) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoadError(null);
    loadTickets(email)
      .catch(() => {
        if (!cancelled) {
          setLoadError('Không tải được danh sách vé. Bạn hãy đăng nhập lại hoặc thử sau.');
          setTickets([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [loadTickets]);

  useEffect(() => {
    const email = readAuthSession()?.email;
    if (!email) return;
    if (!tickets.some((t) => (t.status || '').toUpperCase() === 'PENDING')) return;

    const id = window.setInterval(() => {
      const now = Date.now();
      setNowTick(now);
      if (!ticketsRef.current.some((t) => (t.status || '').toUpperCase() === 'PENDING')) return;

      const overdue = ticketsRef.current.some((t) => isPendingOverdue(t, now));
      if (overdue && now - lastPollRef.current >= 2000) {
        lastPollRef.current = now;
        loadTickets(email).catch(() => {});
      }
    }, 1000);

    return () => window.clearInterval(id);
  }, [tickets, loadTickets]);

  const formatDateTime = (dtStr: string) => {
    const dt = parseLocalDateTimeLoose(dtStr);
    return {
      dateStr: dt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      timeStr: dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const now = nowTick;
  const filteredTickets = useMemo(() => {
    const list =
      activeTab === 'upcoming'
        ? tickets.filter((t) => isUpcomingTicket(t, now))
        : tickets.filter((t) => isHistoryTicket(t, now));
    return [...list].sort(sortByNewestBooked);
  }, [tickets, activeTab, now]);

  const handleContinuePayment = async (ticket: BookingHistoryDTO) => {
    const now = Date.now();
    if ((ticket.status || '').toUpperCase() !== 'PENDING' || isPendingOverdue(ticket, now)) return;
    try {
      setContinuingId(ticket.bookingId);
      const detail = await bookingService.getBookingDetail(ticket.bookingId);
      const showtime = detail.showtime;
      const seatDetails = detail.seatDetails ?? [];
      if (!showtime?.showtimeId || seatDetails.length === 0) {
        throw new Error('Không đủ dữ liệu để tiếp tục thanh toán.');
      }

      const showtimeDate = parseLocalDateTimeLoose(showtime.startTime);
      const dateDisplay = showtimeDate.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const timeLabel = formatShowtimeWindowFromIso(showtime.startTime, showtime.movieDuration);

      navigate('/checkout', {
        state: {
          bookingId: ticket.bookingId,
          booking: {
            movie: {
              id: 0,
              title: showtime.movieTitle,
              posterUrl: showtime.posterUrl,
              duration: showtime.movieDuration,
            },
            dateDisplay,
            timeLabel,
            showtimeId: showtime.showtimeId,
            cinemaName: showtime.cinemaName ?? ticket.cinemaName,
            startTime: showtime.startTime,
          },
          selectedSeats: seatDetails,
        },
      });
    } catch (error: any) {
      alert(error?.response?.data || error?.message || 'Không thể mở lại trang thanh toán. Vui lòng thử lại.');
    } finally {
      setContinuingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 min-h-[70vh]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-3xl font-headline font-bold text-on-surface mb-2">Vé của tôi</h1>
          <p className="text-on-surface-variant">
            Sắp chiếu: vé còn hiệu lực và suất chưa chiếu. Lịch sử: suất đã chiếu và vé đã hủy / hết hạn thanh toán.
          </p>
        </div>

        <div className="flex gap-2 p-1 bg-surface-container-high rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`px-6 py-2 rounded-lg font-headline font-bold transition-all ${
              activeTab === 'upcoming'
                ? 'bg-surface-container-lowest shadow-sm text-primary'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            Sắp chiếu
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('past')}
            className={`px-6 py-2 rounded-lg font-headline font-bold transition-all ${
              activeTab === 'past'
                ? 'bg-surface-container-lowest shadow-sm text-primary'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            Lịch sử
          </button>
        </div>
      </div>

      {loadError && (
        <div className="mb-6 rounded-2xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-on-surface">
          {loadError}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
      ) : !readAuthSession()?.email ? (
        <div className="text-center py-20 bg-surface-container-low rounded-3xl border border-outline-variant/30">
          <span className="material-symbols-outlined text-6xl text-outline mb-4">login</span>
          <h3 className="text-xl font-headline font-bold text-on-surface mb-2">Đăng nhập để xem vé</h3>
          <p className="text-on-surface-variant">Vui lòng đăng nhập tài khoản của bạn để xem vé đã đặt.</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-20 bg-surface-container-low rounded-3xl border border-outline-variant/30">
          <span className="material-symbols-outlined text-6xl text-outline mb-4">confirmation_number</span>
          <h3 className="text-xl font-headline font-bold text-on-surface mb-2">
            {activeTab === 'upcoming' ? 'Không có vé sắp chiếu' : 'Chưa có lịch sử'}
          </h3>
          <p className="text-on-surface-variant">
            {activeTab === 'upcoming'
              ? 'Bạn chưa có vé đã thanh toán hoặc đơn chờ thanh toán cho suất sắp tới.'
              : 'Các suất đã chiếu và vé đã hủy / hết hạn thanh toán sẽ hiển thị ở đây.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredTickets.map((ticket) => {
            const { dateStr } = formatDateTime(ticket.showtimeStart);
            const timeRangeStr = formatShowtimeWindowFromIso(ticket.showtimeStart, ticket.movieDuration);
            const remain = pendingRemainingMs(ticket, now);
            const showCountdown = remain != null && remain > 0;
            const discount = Number(ticket.discountAmount || 0);
            const finalPrice = Math.max(0, Number(ticket.totalPrice || 0));
            const originalPrice = finalPrice + discount;

            return (
              <div
                key={ticket.bookingId}
                className="flex flex-col sm:flex-row bg-surface-container-lowest rounded-3xl overflow-hidden border border-outline-variant/20 ticket-shadow group"
              >
                <div className="w-full sm:w-40 min-h-[10rem] sm:min-h-[12rem] sm:self-stretch shrink-0 relative overflow-hidden bg-surface-container-highest">
                  <img
                    src={ticket.posterUrl?.trim() || TICKET_POSTER_FALLBACK}
                    alt={`Áp phích ${ticket.movieTitle}`}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      const el = e.currentTarget;
                      if (el.dataset.triedFallback === '1') return;
                      el.dataset.triedFallback = '1';
                      el.src = TICKET_POSTER_FALLBACK;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-primary">
                    CINEMA
                  </div>
                </div>

                <div className="hidden sm:block w-4 relative bg-surface-container-lowest">
                  <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 perforation"></div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-background rounded-full border-b border-outline-variant/20"></div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-6 h-6 bg-background rounded-full border-t border-outline-variant/20"></div>
                </div>

                <div className="sm:hidden h-4 relative bg-surface-container-lowest w-full">
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-outline-variant/30 border-t border-dashed border-outline-variant/50"></div>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-background rounded-full border-r border-outline-variant/20"></div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 bg-background rounded-full border-l border-outline-variant/20"></div>
                </div>

                <div className="p-6 flex-grow flex flex-col justify-between bg-surface-container-lowest relative">
                  <div>
                    {showCountdown && (
                      <div className="mb-3 flex items-center justify-between gap-2 rounded-xl bg-amber-50 border border-amber-200/80 px-3 py-2">
                        <span className="text-xs font-headline font-bold text-amber-900">Chưa thanh toán</span>
                        <span className="font-mono text-sm font-bold tabular-nums text-amber-900">
                          {formatCountdown(remain)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className="text-xl font-headline font-bold text-on-surface line-clamp-1">{ticket.movieTitle}</h3>
                      {(() => {
                        const st = bookingStatusLabel(ticket.status);
                        return (
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap shrink-0 ${st.className}`}
                          >
                            {st.label}
                          </span>
                        );
                      })()}
                    </div>
                    <p className="text-sm text-on-surface-variant mb-4 flex items-center gap-1 line-clamp-1">
                      <span className="material-symbols-outlined text-sm shrink-0">location_on</span> {ticket.cinemaName}
                    </p>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div>
                        <p className="text-xs text-on-surface-variant mb-1">Ngày</p>
                        <p className="font-headline font-bold text-on-surface text-sm">{dateStr}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-on-surface-variant mb-1">Giờ chiếu</p>
                        <p className="font-headline font-bold text-on-surface text-sm leading-snug line-clamp-2">
                          {timeRangeStr}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-on-surface-variant mb-1">Ghế</p>
                        <p className="font-headline font-bold text-primary text-sm line-clamp-1">{ticket.seatNames || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-outline-variant/20">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-on-surface-variant">
                        Giá gốc: {originalPrice.toLocaleString('vi-VN')} đ
                      </span>
                      <span className="text-sm font-headline font-bold text-on-surface">
                        Giá sau giảm: {finalPrice.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    {(ticket.status || '').toUpperCase() === 'PENDING' && !isPendingOverdue(ticket, now) ? (
                      <button
                        type="button"
                        onClick={() => handleContinuePayment(ticket)}
                        disabled={continuingId === ticket.bookingId}
                        className="text-primary font-headline font-bold text-sm hover:underline disabled:opacity-50"
                      >
                        {continuingId === ticket.bookingId ? 'Đang mở...' : 'Tiếp tục thanh toán'}
                      </button>
                    ) : (
                      <button type="button" className="text-primary font-headline font-bold text-sm hover:underline">
                        Chi tiết
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
