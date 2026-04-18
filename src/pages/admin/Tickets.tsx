import { useEffect, useMemo, useState } from 'react';
import { bookingService, type AdminBookingDTO } from '../../services/bookingService';

type TicketStatus = 'PENDING' | 'PAID' | 'CANCELLED';

type TicketRow = {
  booking_id: number;
  user_email: string;
  user_name: string;
  movie_title: string;
  start_time: string;
  seats: string;
  total_price: number;
  status: TicketStatus;
  created_at: string;
};

function formatDateTimeVN(value: string) {
  if (!value) return '';
  const normalized = value.includes(' ') ? value.replace(' ', 'T') : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function fromApi(b: AdminBookingDTO): TicketRow {
  return {
    booking_id: b.bookingId,
    user_email: b.userEmail,
    user_name: b.userName,
    movie_title: b.movieTitle,
    start_time: b.showtimeStart,
    seats: b.seatNames,
    total_price: b.totalPrice,
    status: (b.status.toUpperCase()) as TicketStatus,
    created_at: b.createdAt || '',
  };
}

function mapBookingStatus(status: TicketStatus) {
  switch (status) {
    case 'PAID':
      return { label: 'Đã thanh toán', className: 'bg-emerald-100 text-emerald-700' };
    case 'CANCELLED':
      return { label: 'Đã hủy', className: 'bg-red-100 text-red-700' };
    default:
      return { label: 'Chờ thanh toán', className: 'bg-amber-100 text-amber-700' };
  }
}

export default function Tickets() {
  const [rows, setRows] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        setLoadError('');
        const data = await bookingService.getAllBookings();
        setRows(data.map(fromApi));
      } catch (e) {
        console.error(e);
        setLoadError('Không tải được danh sách vé. Kiểm tra backend và đăng nhập admin.');
      } finally {
        setLoading(false);
      }
    };
    loadBookings();
  }, []);

  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.user_name.toLowerCase().includes(q) ||
        r.user_email.toLowerCase().includes(q) ||
        r.movie_title.toLowerCase().includes(q) ||
        r.seats.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
    );
  }, [rows, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold font-headline">Quản lý vé</h2>
      </div>
      <div className="relative max-w-md">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm vé theo người dùng, phim, ghế"
          className="w-full border border-gray-200 rounded-lg py-2 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-sky-200"
        />
      </div>

      {loadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {loadError}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">STT</th>
                  <th className="p-4 font-medium">Người dùng</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Phim</th>
                  <th className="p-4 font-medium">Suất chiếu</th>
                  <th className="p-4 font-medium">Ghế</th>
                  <th className="p-4 font-medium">Tổng tiền</th>
                  <th className="p-4 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {filteredRows.map((row, idx) => {
                  const status = mapBookingStatus(row.status);
                  return (
                    <tr key={row.booking_id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-gray-700">{idx + 1}</td>
                      <td className="p-4 text-gray-900">{row.user_name}</td>
                      <td className="p-4 text-gray-600 text-sm">{row.user_email}</td>
                      <td className="p-4 text-gray-900">{row.movie_title}</td>
                      <td className="p-4 text-gray-600">{formatDateTimeVN(row.start_time)}</td>
                      <td className="p-4 text-gray-900">{row.seats}</td>
                      <td className="p-4 font-semibold text-sky-600">
                        {row.total_price.toLocaleString('vi-VN')}₫
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {!filteredRows.length && (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-gray-500">
                      {rows.length === 0 ? 'Chưa có vé nào.' : 'Không tìm thấy vé phù hợp.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}