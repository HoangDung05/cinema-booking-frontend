import { type FormEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { bookingService, PriceCalculateResponse } from '../../services/bookingService';
import { voucherService, VoucherDTO } from '../../services/voucherService';
import { CURRENT_USER_STORAGE_KEY, AuthSession } from '../../utils/authSession';
import VoucherModal from '../../features/checkout/components/VoucherModal';
import PaymentMethods, { PaymentMethod } from '../../features/checkout/components/PaymentMethods';

export default function Checkout() {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('momo');
  const [promoCode, setPromoCode] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;
  const selectedSeats = location.state?.selectedSeats as {id: number, seatNumber: string}[] | undefined;

  const [priceData, setPriceData] = useState<PriceCalculateResponse | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [vouchers, setVouchers] = useState<VoucherDTO[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);

  // Lấy User từ local storage
  const rawCurrentUser = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
  let user: AuthSession & { id?: number } | null = null;
  if (rawCurrentUser) {
    try { user = JSON.parse(rawCurrentUser); } catch {}
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (!booking || !selectedSeats || selectedSeats.length === 0) {
      navigate(-1);
    } else {
      calculateInitialPrice();
    }
  }, [booking, selectedSeats, navigate]);

  const calculateInitialPrice = async (overridePromoCode?: string) => {
    if (!booking || !selectedSeats) return;
    setPriceLoading(true);
    setErrorMsg('');
    try {
      const normalizedVoucherCode =
        (overridePromoCode !== undefined ? overridePromoCode : promoCode).trim() || undefined;
      const resp = await bookingService.calculatePrice({
        showtimeId: booking.showtimeId,
        seatIds: selectedSeats.map(s => s.id),
        voucherCode: normalizedVoucherCode
      });
      setPriceData(resp);
    } catch (error: any) {
      setErrorMsg(error.response?.data || "Không thể tính phí đặt vé hoặc mã giảm giá không hợp lệ");
    } finally {
      setPriceLoading(false);
    }
  };

  const handleApplyPromo = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    calculateInitialPrice(promoCode);
  };

  const handleOpenVouchers = async () => {
    setIsVoucherModalOpen(true);
    if (vouchers.length === 0) {
      setLoadingVouchers(true);
      try {
        setVouchers(await voucherService.getActiveVouchers());
      } catch (error) {
        console.error("Lỗi lấy danh sách voucher", error);
      } finally {
        setLoadingVouchers(false);
      }
    }
  };

  const handlePayment = async () => {
    if (!user || (!user.id && !(user as any).userId)) {
      window.dispatchEvent(new CustomEvent('open-login-modal'));
      return;
    }
    
    const bookingId = location.state?.bookingId;
    if (!bookingId) {
      setErrorMsg("Lỗi: Không tìm thấy phiên đặt vé hợp lệ. Vui lòng quay lại màn hình chọn ghế.");
      return;
    }

    if (!booking || !selectedSeats) return;
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const voucherCodeToPay = (priceData?.appliedVoucherCode || promoCode || '').trim() || undefined;
      const resp = await bookingService.payBooking(bookingId, {
        voucherCode: voucherCodeToPay,
        paymentMethod: paymentMethod.toUpperCase(),
      });
      navigate('/booking-success', { 
        replace: true,
        state: { bookingResult: resp, booking, selectedSeats, priceData }
      });
    } catch (error: any) {
      setErrorMsg(error.response?.data || "Thanh toán thất bại! Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Stepper */}
      <div className="flex items-center justify-center mb-16">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-headline font-bold">
              1
            </div>
            <span className="text-sm font-headline font-semibold text-on-surface-variant">Lựa chọn</span>
          </div>
          <div className="w-16 h-1 bg-surface-container-high rounded-full overflow-hidden">
            <div className="w-1/3 h-full bg-primary" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-headline font-bold">
              2
            </div>
            <span className="text-sm font-headline font-semibold text-on-surface-variant">Chi tiết</span>
          </div>
          <div className="w-16 h-1 bg-surface-container-high rounded-full" />
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline font-bold shadow-md">
              3
            </div>
            <span className="text-sm font-headline font-bold text-primary">Thanh toán</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Booking Summary */}
        <div className="lg:col-span-5">
          <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/20 shadow-sm sticky top-24">
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-6">Tóm tắt đặt vé</h2>

            <div className="flex gap-5 mb-6">
              <div className="w-20 h-28 rounded-xl overflow-hidden shrink-0 bg-surface-container-high">
                <img
                  src={booking?.movie?.posterUrl || "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=200"}
                  alt="Poster phim"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-headline font-bold text-on-surface mb-1">{booking?.movie?.title}</h3>
                <p className="text-sm text-on-surface-variant">Thời lượng: {booking?.movie?.duration} phút</p>
                <p className="text-sm font-medium text-primary font-bold mt-1">{booking?.dateDisplay} • {booking?.timeLabel}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant font-medium">Rạp chiếu</span>
                <span className="font-headline font-bold text-on-surface">{booking?.cinemaName}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant font-medium">Ghế bạn chọn</span>
                <span className="font-headline font-bold text-on-surface">{selectedSeats?.map(s => s.seatNumber).join(', ')}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant font-medium">Giá 1 vé</span>
                <span className="font-headline font-bold text-on-surface">{priceData ? `${priceData.pricePerSeat.toLocaleString()} ₫` : '...'}</span>
              </div>

              <div className="pt-4 border-t border-outline-variant/20 flex justify-between items-end">
                <span className="text-sm text-on-surface-variant">Tạm tính ({priceData?.seatCount ?? 0} ghế)</span>
                <span className="text-2xl font-headline font-extrabold text-primary">{priceData ? `${priceData.subtotal.toLocaleString()} ₫` : '...'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Voucher + Payment */}
        <div className="lg:col-span-7">
          <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/20 shadow-sm">
            <div className="space-y-6">
              {/* Voucher */}
              <div className="rounded-2xl p-5 border border-outline-variant/20 bg-surface-container-low">
                <h3 className="text-lg font-headline font-bold text-on-surface mb-4">Mã giảm giá / Voucher</h3>

                <button
                  type="button"
                  onClick={handleOpenVouchers}
                  className="w-full flex items-center justify-between px-4 py-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl hover:border-primary transition-all text-left"
                >
                  <span className="text-on-surface flex items-center gap-2 font-medium">
                    <span className="material-symbols-outlined text-primary">sell</span>
                    {promoCode ? `Mã đã chọn: ${promoCode}` : 'Chọn hoặc nhập mã giảm giá'}
                  </span>
                  <span className="material-symbols-outlined text-on-surface-variant text-xl">navigate_next</span>
                </button>
              </div>

              {/* Payment methods */}
              <PaymentMethods paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />

              {/* Total & Pay */}
              <div className="pt-4">
                {errorMsg && (
                   <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm text-center">
                     {errorMsg}
                   </div>
                )}
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <span className="text-sm text-on-surface-variant block mb-1">Tổng tiền thanh toán</span>
                    <span className="text-3xl font-headline font-extrabold text-primary">
                      {priceData ? `${priceData.finalTotal.toLocaleString()} ₫` : '...'}
                    </span>
                  </div>
                </div>

                {priceData?.discountAmount ? (
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium mb-5">
                    <span className="material-symbols-outlined text-sm">local_activity</span>
                    <span>Đã giảm: -{priceData.discountAmount.toLocaleString()} ₫ ({priceData.discountDescription})</span>
                  </div>
                ) : (
                  <div className="h-5 mb-5" />
                )}

                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={isSubmitting || priceLoading}
                  className="w-full py-4 bg-primary-gradient text-on-primary rounded-xl font-headline font-bold hover:opacity-90 transition-opacity shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Thanh toán ngay'}
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>

                <p className="text-xs text-center text-on-surface-variant mt-4">
                  Bằng việc bấm &ldquo;Thanh toán ngay&rdquo;, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật. Tất cả giao dịch đều được mã hóa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <VoucherModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        vouchers={vouchers}
        loading={loadingVouchers}
        promoCode={promoCode}
        setPromoCode={setPromoCode}
        onApply={(code) => calculateInitialPrice(code)}
        currentSubtotal={booking?.price && selectedSeats?.length ? booking.price * selectedSeats.length : (priceData?.subtotal || 0)}
      />
    </div>
  );
}
