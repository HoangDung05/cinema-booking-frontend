import { Fragment, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { SeatStatusDTO, showtimeService } from '../../services/showtimeService';
import { bookingService } from '../../services/bookingService';
import { useNavigate } from 'react-router-dom';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;


type BookingState = {
  movie: { id: number; title: string; posterUrl?: string; duration?: number };
  dateDisplay: string;
  timeLabel: string;
  showtimeId: number;
  cinemaName: string;
  startTime?: string;
  price?: number;
};

export default function SelectSeats() {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = (location.state as { booking?: BookingState } | null)?.booking;

  const [seats, setSeats] = useState<SeatStatusDTO[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<{id: number, seatNumber: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHoldingSeats, setIsHoldingSeats] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (!booking?.showtimeId) {
      // Redirect back if no booking context is found
      navigate(-1);
      return;
    }
    const fetchSeats = async () => {
      try {
        setLoading(true);
        const data = await showtimeService.getSeatsByShowtimeId(booking.showtimeId);
        setSeats(data);
      } catch (error) {
        console.error("Failed to load seats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSeats();
  }, [booking, navigate]);

  const sortSeatIds = (selected: {id: number, seatNumber: string}[]) =>
    [...selected].sort((a, b) => {
      const rowA = a.seatNumber.slice(0, 1) as (typeof ROWS)[number];
      const rowB = b.seatNumber.slice(0, 1) as (typeof ROWS)[number];
      const numA = Number(a.seatNumber.slice(1));
      const numB = Number(b.seatNumber.slice(1));
      const rowIndexA = ROWS.indexOf(rowA);
      const rowIndexB = ROWS.indexOf(rowB);
      return rowIndexA - rowIndexB || numA - numB;
    });

  const selectedSeatsSorted = sortSeatIds(selectedSeats);

  const toggleSeat = (seatObj: SeatStatusDTO) => {
    if (seatObj.booked) return; // Ghế đã bán không thể click

    setSelectedSeats((prev) => {
      if (prev.find(s => s.id === seatObj.id)) return prev.filter((s) => s.id !== seatObj.id);
      return [...prev, { id: seatObj.id, seatNumber: seatObj.seatNumber }];
    });
  };

  const getSeatStatus = (seatObj: SeatStatusDTO | undefined) => {
    if (!seatObj) return 'disabled' as const;
    if (seatObj.booked) return 'sold' as const;
    if (selectedSeats.find(s => s.id === seatObj.id)) return 'selected' as const;
    return 'available' as const;
  };

  const renderSeatButton = (seatNumberString: string) => {
    const seatObj = seats.find(s => s.seatNumber === seatNumberString);
    const status = getSeatStatus(seatObj);

    if (status === 'disabled') {
       return <div key={seatNumberString} className="w-8 h-8 opacity-20" />; // Empty slot
    }

    if (status === 'sold') {
      return (
        <button
          key={seatObj!.id}
          type="button"
          disabled
          aria-label={`${seatNumberString} - Đã bán`}
          className="w-8 h-8 rounded-t-xl rounded-b-md bg-red-600 border border-red-400/60 opacity-95 cursor-not-allowed relative overflow-hidden"
        >
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-full h-[1px] bg-white/90 rotate-45" />
          </span>
        </button>
      );
    }

    const isSelected = status === 'selected';

    return (
      <button
        key={seatObj!.id}
        type="button"
        onClick={() => toggleSeat(seatObj!)}
        aria-pressed={isSelected}
        className={
          isSelected
            ? 'w-8 h-8 rounded-t-xl rounded-b-md bg-primary shadow-md shadow-primary/30 text-on-primary flex items-center justify-center text-xs font-bold'
            : 'w-8 h-8 rounded-t-xl rounded-b-md bg-surface-container-high border border-outline-variant/30 hover:bg-primary/20 transition-colors'
        }
      >
        {isSelected ? seatObj!.seatNumber : null}
      </button>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Stepper */}
      <div className="flex items-center justify-center mb-12">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline font-bold shadow-md">
              <span className="material-symbols-outlined text-xl">check</span>
            </div>
            <span className="text-sm font-headline font-bold text-primary">Lịch chiếu</span>
          </div>
          <div className="w-16 h-1 bg-primary rounded-full"></div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline font-bold shadow-md">2</div>
            <span className="text-sm font-headline font-bold text-primary">Chọn ghế</span>
          </div>
          <div className="w-16 h-1 bg-surface-container-high rounded-full overflow-hidden">
            <div className="w-1/2 h-full bg-primary"></div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-headline font-bold">3</div>
            <span className="text-sm font-headline font-semibold text-on-surface-variant">Thanh toán</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Main Content - Seat Selection */}
        <div className="lg:col-span-8">
          <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/20 shadow-lg overflow-hidden">
            
            {/* Screen */}
            <div className="mb-16 perspective-screen">
              <div className="h-12 w-3/4 mx-auto bg-gradient-to-b from-primary/40 to-transparent rounded-t-full screen-curve flex items-end justify-center pb-2">
                <span className="text-primary font-headline font-bold tracking-widest uppercase text-sm">Màn hình</span>
              </div>
            </div>

            {/* Seat Grid */}
            <div className="overflow-x-auto pb-8 custom-scrollbar relative min-h-[300px]">
              {loading ? (
                 <div className="absolute inset-0 flex items-center justify-center bg-surface-container-lowest/80 z-10">
                   <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                 </div>
              ) : (
                <div className="min-w-[600px] flex flex-col gap-4 items-center">
                  {ROWS.map((row) => (
                    <Fragment key={row}>
                      <div className="flex items-center gap-4">
                        <span className="w-6 text-center font-headline font-bold text-on-surface-variant">
                          {row}
                        </span>
                        <div className="flex gap-2">
                          {[1, 2].map((seatNum) => renderSeatButton(`${row}${seatNum}`))}
                          <div className="w-4" />
                          {[3, 4, 5, 6].map((seatNum) => renderSeatButton(`${row}${seatNum}`))}
                          <div className="w-4" />
                          {[7, 8].map((seatNum) => renderSeatButton(`${row}${seatNum}`))}
                        </div>
                        <span className="w-6 text-center font-headline font-bold text-on-surface-variant">
                          {row}
                        </span>
                      </div>
                      {row === 'B' ? <div className="h-4" /> : null}
                    </Fragment>
                  ))}
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-8 mt-12">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-t-lg rounded-b-sm bg-surface-container-high border border-outline-variant/30" />
                <span className="text-sm text-on-surface-variant">Còn trống</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-t-lg rounded-b-sm bg-primary shadow-md shadow-primary/30" />
                <span className="text-sm text-on-surface-variant">Đã chọn</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-t-lg rounded-b-sm bg-red-600 border border-red-400/60 opacity-95 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-[1px] bg-white/90 rotate-45" />
                  </div>
                </div>
                <span className="text-sm text-on-surface-variant">Đã bán</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-4">
          <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/20 shadow-lg sticky top-24">
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-6">Tóm tắt đặt vé</h2>
            
            <div className="flex gap-4 mb-6 pb-6 border-b border-outline-variant/20">
              <div className="w-16 rounded-lg overflow-hidden shrink-0 aspect-[2/3] bg-surface-container-high">
                <img
                  src={
                    booking?.movie?.posterUrl ||
                    'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=200'
                  }
                  alt={booking?.movie?.title ? `Áp phích ${booking.movie.title}` : 'Poster'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h3 className="font-headline font-bold text-on-surface mb-1 line-clamp-2">
                  {booking?.movie.title ?? '—'}
                </h3>
                <p className="text-sm text-on-surface-variant">{booking?.cinemaName ?? '—'}</p>
                <p className="text-sm font-medium text-on-surface mt-1">
                  {booking ? `${booking.dateDisplay} • ${booking.timeLabel}` : '—'}
                </p>
              </div>
            </div>
            
            <div className="mb-6 pb-6 border-b border-outline-variant/20">
              <div className="flex justify-between items-center mb-4">
                <span className="text-on-surface-variant">Ghế đã chọn</span>
                <span className="font-headline font-bold text-on-surface">
                  {selectedSeatsSorted.length ? selectedSeatsSorted.map(s => s.seatNumber).join(', ') : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">{selectedSeatsSorted.length} × Vé Tiêu chuẩn</span>
              </div>
            </div>
            
            <div className="flex justify-between items-end mb-8">
              <div>
                <span className="text-sm text-on-surface-variant block mb-1">Tạm tính (chưa giảm giá)</span>
                <span className="text-3xl font-headline font-extrabold text-primary">
                  {booking?.price 
                    ? `${(booking.price * selectedSeats.length).toLocaleString()} ₫`
                    : '...'}
                </span>
              </div>
            </div>
            
            <button 
              onClick={async () => {
                if (selectedSeats.length === 0 || isHoldingSeats) return;
                const userRaw = localStorage.getItem('currentUser');
                if (!userRaw) {
                  window.dispatchEvent(new Event('open-login-modal'));
                  return;
                }
                
                try {
                  setIsHoldingSeats(true);
                  const user = JSON.parse(userRaw);
                  const realUserId = user.id || user.userId;
                  if (!realUserId) {
                     alert("Lỗi dữ liệu phiên đăng nhập. Vui lòng đăng xuất và đăng nhập lại.");
                     return;
                  }
                  
                  const res = await bookingService.holdBooking({
                    userId: realUserId,
                    showtimeId: booking!.showtimeId,
                    seatIds: selectedSeatsSorted.map(s => s.id)
                  });
                  
                  navigate('/checkout', {
                    state: {
                      booking,
                      selectedSeats: selectedSeatsSorted,
                      bookingId: res.bookingId
                    }
                  });
                } catch (error: any) {
                  alert(error.response?.data?.message || error.response?.data || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
                } finally {
                  setIsHoldingSeats(false);
                }
              }}
              disabled={selectedSeats.length === 0 || isHoldingSeats}
              className="w-full py-4 bg-primary disabled:bg-surface-container-highest disabled:text-on-surface-variant text-on-primary rounded-xl font-headline font-bold hover:bg-primary/90 transition-all shadow-md flex items-center justify-center gap-2"
            >
              {isHoldingSeats ? 'Đang giữ ghế...' : 'Tiến hành thanh toán'}
              <span className="material-symbols-outlined">payment</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
