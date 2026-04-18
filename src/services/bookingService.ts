import apiClient from './apiClient';

/** Đồng bộ với PendingBookingExpirationService.PENDING_PAYMENT_DEADLINE_MINUTES */
export const PENDING_HOLD_MINUTES = 2;
export const PENDING_HOLD_MS = PENDING_HOLD_MINUTES * 60 * 1000;

export interface PriceCalculateRequest {
  showtimeId: number;
  seatIds: number[];
  voucherCode?: string;
}

export interface PriceCalculateResponse {
  seatCount: number;
  pricePerSeat: number;
  subtotal: number;
  appliedVoucherCode?: string;
  discountAmount: number;
  finalTotal: number;
  discountDescription?: string;
}

export interface BookingRequest {
  userId: number;
  showtimeId: number;
  seatIds: number[];
  voucherCode?: string;
  paymentMethod?: string;
}

export interface BookingResponse {
  bookingId: number;
  message: string;
  totalAmount: number;
}

export interface BookingHistoryDTO {
  bookingId: number;
  movieTitle: string;
  /** Thời lượng phim (phút) */
  movieDuration?: number | null;
  posterUrl?: string | null;
  cinemaName: string;
  showtimeStart: string;
  totalPrice: number;
  discountAmount?: number;
  status: string;
  seatNames: string;
  /** Thời điểm tạo đơn (ISO string hoặc mảng Jackson [y,m,d,h,mi,s]) — đếm ngược khi PENDING */
  bookingCreatedAt?: string | number[];
}

// Admin view
export interface AdminBookingDTO {
  bookingId: number;
  userEmail: string;
  userName: string;
  movieTitle: string;
  showtimeStart: string;
  seatNames: string;
  totalPrice: number;
  status: string;
  createdAt?: string;
}

export interface PayBookingRequest {
  paymentMethod: string;
  voucherCode?: string;
}

export interface BookingDetailResponse {
  id: number;
  status: string;
  createdAt?: string | number[];
  totalPrice: number;
  discountAmount?: number;
  showtime?: {
    showtimeId: number;
    startTime: string;
    movieTitle: string;
    movieDuration?: number;
    posterUrl?: string;
    roomName?: string;
    cinemaName?: string;
  };
  seats?: string[];
  seatDetails?: { id: number; seatNumber: string }[];
  voucherCode?: string;
}

export const bookingService = {
  // Tính giá đặt vé trước khi submit
  calculatePrice: async (request: PriceCalculateRequest): Promise<PriceCalculateResponse> => {
    const response = await apiClient.post<PriceCalculateResponse>('/bookings/calculate-price', request);
    return response.data;
  },

  // Giai đoạn 1: Lấy ghế và tạo hóa đơn PENDING
  holdBooking: async (request: BookingRequest): Promise<BookingResponse> => {
    const response = await apiClient.post<BookingResponse>('/bookings/hold', request);
    return response.data;
  },

  // Giai đoạn 2: Thanh toán Hóa đơn PENDING -> PAID
  payBooking: async (bookingId: number, request: PayBookingRequest): Promise<BookingResponse> => {
    const response = await apiClient.post<BookingResponse>(`/bookings/${bookingId}/pay`, request);
    return response.data;
  },

  getBookingDetail: async (bookingId: number): Promise<BookingDetailResponse> => {
    const response = await apiClient.get<BookingDetailResponse>(`/bookings/${bookingId}`);
    return response.data;
  },

  // Lấy lịch sử đặt vé của user
  getMyBookings: async (email: string): Promise<BookingHistoryDTO[]> => {
    const response = await apiClient.get<BookingHistoryDTO[]>(`/users/me/bookings?email=${encodeURIComponent(email)}`);
    return response.data;
  },

  // Lấy tất cả bookings (admin)
  getAllBookings: async (): Promise<AdminBookingDTO[]> => {
    const response = await apiClient.get<AdminBookingDTO[]>('/admin/bookings');
    return response.data;
  },
};
