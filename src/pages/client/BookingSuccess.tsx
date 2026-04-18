import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function BookingSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingResult, booking, selectedSeats, priceData } = location.state || {};

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (!bookingResult) {
      navigate('/tickets', { replace: true });
    }
  }, [bookingResult, navigate]);

  if (!bookingResult) return null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-20 min-h-[80vh] flex flex-col items-center justify-center">
      <div className="bg-surface-container-lowest w-full rounded-3xl p-10 border border-outline-variant/20 shadow-xl relative overflow-hidden">
        {/* Success Header */}
        <div className="flex flex-col items-center text-center border-b border-outline-variant/20 pb-8 mb-8">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-green-600 text-5xl">check_circle</span>
          </div>
          <h1 className="text-3xl font-headline font-bold text-on-surface mb-2">Thanh toán thành công!</h1>
          <p className="text-on-surface-variant font-medium">Cảm ơn bạn đã đặt vé. Hãy xuất trình mã QR này khi đến rạp.</p>
        </div>

        {/* Ticket Details */}
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start bg-surface-container-high/30 rounded-2xl p-6 mb-10">
          <div className="w-40 aspect-square bg-white p-2 rounded-xl shadow-sm shrink-0 flex items-center justify-center border border-outline-variant/20">
            {/* Fake QR Code */}
            <div className="w-full h-full border-4 border-dashed border-primary/20 flex flex-col items-center justify-center text-primary/40 relative">
               <span className="material-symbols-outlined text-5xl">qr_code_2</span>
               <div className="absolute inset-x-0 top-1/2 h-0.5 bg-green-500 shadow-[0_0_8px_green] animate-[scan_2s_ease-in-out_infinite]" />
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <p className="text-sm text-on-surface-variant uppercase tracking-wider font-semibold">Mã vé đặt</p>
              <p className="font-headline font-bold text-2xl text-primary">#{(bookingResult.bookingId || '00000').toString().padStart(6, '0')}</p>
            </div>
            {booking && (
              <>
                <div>
                  <h3 className="font-headline font-bold text-lg text-on-surface line-clamp-1">{booking.movie?.title}</h3>
                  <p className="text-sm text-on-surface-variant">{booking.cinemaName}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-on-surface-variant">Lịch chiếu</p>
                    <p className="font-medium text-sm">{booking.timeLabel} • {booking.dateDisplay}</p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant">Vị trí ghế</p>
                    <p className="font-medium text-sm">{selectedSeats?.map((s: any) => s.seatNumber).join(', ')}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/tickets"
            className="flex-1 py-4 bg-primary text-on-primary rounded-xl font-headline font-bold hover:opacity-90 transition-opacity shadow-md flex items-center justify-center text-center"
          >
            Quản lý vé của tôi
          </Link>
          <Link
            to="/"
            className="flex-1 py-4 bg-surface-container-high text-on-surface rounded-xl font-headline font-bold hover:bg-surface-container-highest transition-colors flex items-center justify-center text-center"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
