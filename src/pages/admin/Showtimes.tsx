import { useCallback, useEffect, useMemo, useState } from 'react';
import { movieService, type MovieDto } from '../../services/movieService';
import { roomService, type RoomDto } from '../../services/roomService';
import { showtimeService, type ShowtimeDto, type ShowtimeWritePayload } from '../../services/showtimeService';

type ShowtimeRow = {
  id: number;
  movieId: number;
  movieTitle: string;
  movieDuration: number;
  roomId: number;
  roomName: string;
  startTime: string;
  endTime: string;
  price: number;
  soldSeats: number;
  totalSeats: number;
};

type ShowtimeForm = ShowtimeWritePayload;

const emptyForm: ShowtimeForm = {
  movieId: 0,
  roomId: 0,
  startTime: '',
  price: 0,
};

function formatDateTime(value: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('vi-VN', {
    hour12: false,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function toInputDateTime(value: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const tzOffsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 16);
}

function calcEndTime(startTime: string, durationMinutes: number) {
  if (!startTime || !durationMinutes) return '';
  const start = new Date(startTime);
  if (Number.isNaN(start.getTime())) return '';
  return new Date(start.getTime() + durationMinutes * 60 * 1000).toISOString();
}

function fromApi(item: ShowtimeDto): ShowtimeRow {
  const movieDuration = item.movie?.duration ?? 0;
  const endTime = calcEndTime(item.startTime, movieDuration);
  return {
    id: item.id,
    movieId: item.movie?.id ?? 0,
    movieTitle: item.movie?.title ?? '—',
    movieDuration,
    roomId: item.room?.id ?? 0,
    roomName: item.room?.name ?? '—',
    startTime: item.startTime,
    endTime,
    price: Number(item.price ?? 0),
    soldSeats: 0,
    totalSeats: 0,
  };
}

function sortByRoomThenTime(items: ShowtimeRow[]): ShowtimeRow[] {
  return [...items].sort((a, b) => {
    const byRoom = a.roomName.localeCompare(b.roomName, 'vi', { sensitivity: 'base' });
    if (byRoom !== 0) return byRoom;
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });
}

export default function Showtimes() {
  const [rows, setRows] = useState<ShowtimeRow[]>([]);
  const [movies, setMovies] = useState<MovieDto[]>([]);
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ShowtimeForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoadError('');
    setLoading(true);
    try {
      const [showtimeList, movieList, roomList] = await Promise.all([
        showtimeService.getAllShowtimes(),
        movieService.getAllMovies(),
        roomService.getAllRooms(),
      ]);
      const mapped = sortByRoomThenTime(showtimeList.map(fromApi));
      const seatStats = await Promise.all(
        mapped.map(async (row) => {
          try {
            const seats = await showtimeService.getSeatsByShowtimeId(row.id);
            const totalSeats = seats.length;
            const soldSeats = seats.filter((s) => s.booked).length;
            return { id: row.id, totalSeats, soldSeats };
          } catch {
            return { id: row.id, totalSeats: 0, soldSeats: 0 };
          }
        })
      );
      const statsMap = new Map(seatStats.map((s) => [s.id, s]));
      setRows(
        mapped.map((row) => {
          const stat = statsMap.get(row.id);
          return {
            ...row,
            soldSeats: stat?.soldSeats ?? 0,
            totalSeats: stat?.totalSeats ?? 0,
          };
        })
      );
      setMovies(movieList);
      setRooms(
        [...roomList].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'vi', { sensitivity: 'base' }))
      );
    } catch (e) {
      console.error(e);
      setLoadError('Không tải được dữ liệu suất chiếu. Kiểm tra backend và đăng nhập admin.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return sortByRoomThenTime(rows);
    const filtered = rows.filter(
      (row) =>
        row.movieTitle.toLowerCase().includes(q) ||
        row.roomName.toLowerCase().includes(q)
    );
    return sortByRoomThenTime(filtered);
  }, [rows, searchTerm]);

  const selectedMovie = useMemo(
    () => movies.find((m) => m.id === form.movieId),
    [form.movieId, movies]
  );
  const previewEndTime = useMemo(
    () => calcEndTime(form.startTime, selectedMovie?.duration ?? 0),
    [form.startTime, selectedMovie?.duration]
  );

  const openCreate = () => {
    setEditingId(null);
    setForm({
      movieId: movies[0]?.id ?? 0,
      roomId: rooms[0]?.id ?? 0,
      startTime: '',
      price: 0,
    });
    setIsOpen(true);
  };

  const openEdit = (row: ShowtimeRow) => {
    setEditingId(row.id);
    setForm({
      movieId: row.movieId,
      roomId: row.roomId,
      startTime: toInputDateTime(row.startTime),
      price: row.price,
    });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const saveShowtime = async () => {
    if (!form.movieId || !form.roomId || !form.startTime || form.price <= 0) {
      window.alert('Vui lòng chọn phim, phòng, thời gian bắt đầu và nhập giá vé hợp lệ.');
      return;
    }
    setSaving(true);
    try {
      if (editingId === null) {
        await showtimeService.createShowtime(form);
      } else {
        const current = rows.find((r) => r.id === editingId);
        if (!current) {
          window.alert('Không tìm thấy suất chiếu để cập nhật.');
          return;
        }
        await showtimeService.updateShowtime(editingId, {
          movieId: current.movieId,
          startTime: toInputDateTime(current.startTime),
          price: current.price,
          roomId: form.roomId,
        });
      }
      await loadData();
      closeModal();
    } catch (e: any) {
      console.error(e);
      const message = e?.response?.data || 'Lưu suất chiếu thất bại.';
      window.alert(typeof message === 'string' ? message : 'Lưu suất chiếu thất bại.');
    } finally {
      setSaving(false);
    }
  };

  const deleteShowtime = async (id: number) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa suất chiếu này?')) return;
    try {
      await showtimeService.deleteShowtime(id);
      await loadData();
    } catch (e) {
      console.error(e);
      window.alert('Xóa suất chiếu thất bại.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold font-headline">Quản lý suất chiếu</h2>
        <button
          type="button"
          onClick={openCreate}
          disabled={!movies.length || !rooms.length}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Thêm suất chiếu
        </button>
      </div>

      <div className="relative max-w-md">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm suất chiếu theo phim, phòng"
          className="w-full border border-gray-200 rounded-lg py-2 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-sky-200"
        />
      </div>

      {loadError ? <p className="text-sm text-red-600">{loadError}</p> : null}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Đang tải...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">STT</th>
                  <th className="p-4 font-medium">Phim</th>
                  <th className="p-4 font-medium">Phòng</th>
                  <th className="p-4 font-medium">Khoảng chiếu</th>
                  <th className="p-4 font-medium">Đã bán/Tổng ghế</th>
                  <th className="p-4 font-medium">Giá vé</th>
                  <th className="p-4 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {filteredRows.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-700">{idx + 1}</td>
                    <td className="p-4">
                      <p className="font-semibold text-gray-900">{row.movieTitle}</p>
                      <p className="text-xs text-gray-500">{row.movieDuration || '—'} phút</p>
                    </td>
                    <td className="p-4 text-gray-900">{row.roomName}</td>
                    <td className="p-4 text-gray-900">
                      <p>{formatDateTime(row.startTime)}</p>
                      <p className="text-xs text-gray-500">đến {formatDateTime(row.endTime)}</p>
                    </td>
                    <td className="p-4 text-gray-900">
                      {row.soldSeats}/{row.totalSeats}
                    </td>
                    <td className="p-4 text-gray-900">{row.price.toLocaleString('vi-VN')} đ</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="px-3 py-1.5 text-xs rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteShowtime(row.id)}
                          className="px-3 py-1.5 text-xs rounded-md bg-red-50 text-red-700 hover:bg-red-100"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filteredRows.length && (
                  <tr>
                    <td className="p-6 text-center text-gray-500" colSpan={7}>
                      Chưa có suất chiếu.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/30 flex items-center justify-center px-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl p-5 space-y-4">
            <h3 className="text-lg font-bold">{editingId === null ? 'Thêm suất chiếu' : 'Sửa suất chiếu (chỉ đổi phòng)'}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <p className="text-xs text-gray-500">Phim</p>
                <select
                  value={form.movieId || ''}
                  onChange={(e) => setForm((f) => ({ ...f, movieId: Number(e.target.value) }))}
                  disabled={editingId !== null}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                >
                  <option value="">Chọn phim</option>
                  {movies.map((movie) => (
                    <option key={movie.id} value={movie.id}>
                      {movie.title} ({movie.duration} phút)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-gray-500">Phòng</p>
                <select
                  value={form.roomId || ''}
                  onChange={(e) => setForm((f) => ({ ...f, roomId: Number(e.target.value) }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                >
                  <option value="">Chọn phòng</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-gray-500">Giá vé (VND)</p>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={form.price || ''}
                  onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value || 0) }))}
                  disabled={editingId !== null}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                />
              </div>

              <div className="col-span-2 space-y-1">
                <p className="text-xs text-gray-500">Bắt đầu chiếu</p>
                <input
                  type="datetime-local"
                  value={form.startTime}
                  onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                  disabled={editingId !== null}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div className="text-sm bg-sky-50 border border-sky-200 rounded-lg px-3 py-2 text-sky-800">
              Khoảng chiếu dự kiến: {formatDateTime(form.startTime)} - {formatDateTime(previewEndTime)}
            </div>

            <p className="text-xs text-gray-500">
              Hệ thống sẽ tự chặn nếu khung giờ bị trùng với suất chiếu khác trong cùng phòng.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => void saveShowtime()}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50"
              >
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
