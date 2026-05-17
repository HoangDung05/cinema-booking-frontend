import { useCallback, useEffect, useMemo, useState } from 'react';
import { movieService, type MovieDto } from '../../services/movieService';
import { roomService, type RoomDto } from '../../services/roomService';
import { showtimeService, type ShowtimeDto, type ShowtimeWritePayload, type SeatStatusDTO } from '../../services/showtimeService';

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
  seats: SeatStatusDTO[];
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
    seats: []
  };
}

const startHour = 8;
const endHour = 24;
const totalHours = endHour - startHour;

const getLeftPercent = (startTime: string) => {
    const d = new Date(startTime);
    let h = d.getHours() + d.getMinutes() / 60;
    if (h < startHour) h = startHour;
    let p = ((h - startHour) / totalHours) * 100;
    return Math.max(0, Math.min(p, 100));
}

const getWidthPercent = (duration: number) => {
    return (duration / 60 / totalHours) * 100;
}

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

function renderAdminSeat(seatObj: SeatStatusDTO | undefined, seatNumberString: string) {
    if (!seatObj) return <div key={seatNumberString} className="w-8 h-8 opacity-20" />;
    
    if (seatObj.status === 'BOOKED') {
      return (
        <div
          key={seatObj.id}
          className="w-8 h-8 rounded-t-xl rounded-b-md bg-red-600 border border-red-400/60 opacity-95 relative overflow-hidden"
          title={`Ghế ${seatNumberString} - Đã bán`}
        >
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-full h-[1px] bg-white/90 rotate-45" />
          </span>
        </div>
      );
    }
    if (seatObj.status === 'HOLDING') {
      return (
        <div
          key={seatObj.id}
          className="w-8 h-8 rounded-t-xl rounded-b-md bg-amber-500 border border-amber-400/60 opacity-95 flex items-center justify-center"
          title={`Ghế ${seatNumberString} - Đang giữ`}
        >
          <span className="material-symbols-outlined text-white text-[16px]">schedule</span>
        </div>
      );
    }
    return (
      <div
        key={seatObj.id}
        className="w-8 h-8 rounded-t-xl rounded-b-md bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-xs font-bold text-on-surface-variant"
        title={`Ghế ${seatNumberString} - Trống`}
      >
        {seatNumberString}
      </div>
    );
}

export default function Showtimes() {
  const [rows, setRows] = useState<ShowtimeRow[]>([]);
  const [movies, setMovies] = useState<MovieDto[]>([]);
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  
  // Date Selector
  const [selectedDate, setSelectedDate] = useState(() => {
     const tzOffsetMs = new Date().getTimezoneOffset() * 60 * 1000;
     return new Date(Date.now() - tzOffsetMs).toISOString().split('T')[0];
  });

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ShowtimeForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  
  const [viewingShowtime, setViewingShowtime] = useState<ShowtimeRow | null>(null);

  const loadData = useCallback(async () => {
    setLoadError('');
    setLoading(true);
    try {
      const [showtimeList, movieList, roomList] = await Promise.all([
        showtimeService.getAllShowtimes(),
        movieService.getAllMovies(),
        roomService.getAllRooms(),
      ]);
      const mapped = showtimeList.map(fromApi);
      const seatStats = await Promise.all(
        mapped.map(async (row) => {
          try {
            const seats = await showtimeService.getSeatsByShowtimeId(row.id);
            const totalSeats = seats.length;
            const soldSeats = seats.filter((s) => s.status === 'BOOKED').length;
            return { id: row.id, totalSeats, soldSeats, seats };
          } catch {
            return { id: row.id, totalSeats: 0, soldSeats: 0, seats: [] };
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
            seats: stat?.seats ?? []
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

  // Filter rows by selected Date
  const filteredRowsByDate = useMemo(() => {
     return rows.filter(r => {
        const d = new Date(r.startTime);
        if (Number.isNaN(d.getTime())) return false;
        const tzOffsetMs = d.getTimezoneOffset() * 60 * 1000;
        const dateStr = new Date(d.getTime() - tzOffsetMs).toISOString().split('T')[0];
        return dateStr === selectedDate;
     });
  }, [rows, selectedDate]);

  // Group by Room
  const groupedByRoom = useMemo(() => {
     const map = new Map<string, ShowtimeRow[]>();
     rooms.forEach(r => map.set(r.name, [])); // ensure all rooms show up
     filteredRowsByDate.forEach(r => {
         const list = map.get(r.roomName) || [];
         list.push(r);
         map.set(r.roomName, list);
     });
     return map;
  }, [filteredRowsByDate, rooms]);

  const changeDate = (days: number) => {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + days);
      const tzOffsetMs = d.getTimezoneOffset() * 60 * 1000;
      setSelectedDate(new Date(d.getTime() - tzOffsetMs).toISOString().split('T')[0]);
  };

  const formatDisplayDate = (ds: string) => {
      const d = new Date(ds);
      const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      return `${days[d.getDay()]}, ${d.getDate()} Tháng ${d.getMonth() + 1}, ${d.getFullYear()}`;
  };

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
      setViewingShowtime(null);
    } catch (e) {
      console.error(e);
      window.alert('Xóa suất chiếu thất bại.');
    }
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
         <div className="flex items-center gap-4">
            <button onClick={() => changeDate(-1)} className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition-colors text-gray-600">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <h3 className="font-headline font-bold text-xl text-gray-800 w-[280px] text-center">
              {formatDisplayDate(selectedDate)}
            </h3>
            <button onClick={() => changeDate(1)} className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition-colors text-gray-600">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
            
            <div className="relative ml-4">
               <input 
                 type="date" 
                 value={selectedDate} 
                 onChange={e => setSelectedDate(e.target.value)} 
                 className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-sky-200 shadow-sm hover:border-gray-300 transition-colors cursor-pointer"
               />
               <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px] pointer-events-none">calendar_today</span>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreate}
            disabled={!movies.length || !rooms.length}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-xl font-bold transition-all shadow-md disabled:opacity-50"
          >
            <span className="material-symbols-outlined">add</span>
            Thêm suất chiếu mới
          </button>
      </div>

      {loadError ? <p className="text-sm text-red-600">{loadError}</p> : null}

      {/* Timeline Board */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
           {loading ? (
             <div className="p-12 text-center text-gray-500 font-medium flex items-center justify-center gap-3">
                 <div className="w-5 h-5 border-2 border-gray-300 border-t-sky-600 rounded-full animate-spin"></div>
                 Đang tải dữ liệu...
             </div>
           ) : (
             <div className="min-w-[1200px] select-none pr-6">
                 {/* Timeline Header (Hours) */}
                 <div className="flex border-b border-gray-100 bg-gray-50 h-14">
                     <div className="w-48 shrink-0 border-r border-gray-100"></div>
                     <div className="flex-1 relative">
                        {Array.from({length: totalHours + 1}).map((_, i) => (
                           <div key={i} className="absolute top-0 bottom-0 border-l border-gray-200" style={{ left: `${(i / totalHours) * 100}%` }}>
                               <div className="absolute -translate-x-1/2 pt-4 text-[13px] text-gray-500 font-bold font-headline px-1">
                                   {startHour + i}:00
                               </div>
                           </div>
                        ))}
                     </div>
                 </div>

                 {/* Timeline Body (Rooms) */}
                 {Array.from(groupedByRoom.entries()).map(([roomName, roomShowtimes]) => (
                    <div key={roomName} className="flex border-b border-gray-100 group min-h-[160px]">
                        <div className="w-48 shrink-0 border-r border-gray-100 p-6 flex flex-col justify-center bg-white z-20">
                            <span className="text-xs font-bold text-yellow-600 mb-1 uppercase tracking-wider">PHÒNG CHIẾU</span>
                            <span className="font-headline font-bold text-lg text-gray-800">{roomName}</span>
                        </div>
                        <div className="flex-1 relative bg-white">
                           {/* Background Vertical Grid Lines */}
                           <div className="absolute inset-0 pointer-events-none">
                              {Array.from({length: totalHours + 1}).map((_, i) => (
                                 <div key={i} className="absolute top-0 bottom-0 border-l border-dashed border-gray-200" style={{ left: `${(i / totalHours) * 100}%` }}></div>
                              ))}
                           </div>
                           
                           {/* Showtime Blocks */}
                           {roomShowtimes.map(st => {
                              const left = getLeftPercent(st.startTime);
                              const width = getWidthPercent(st.movieDuration || 120);
                              
                              const startTimeMs = new Date(st.startTime).getTime();
                              const endTimeMs = startTimeMs + (st.movieDuration || 120) * 60 * 1000;
                              const nowMs = Date.now();
                              const isPast = nowMs > endTimeMs;
                              const isPlaying = nowMs >= startTimeMs && nowMs <= endTimeMs;
                              const isSoldOut = st.soldSeats === st.totalSeats && st.totalSeats > 0;
                              
                              let bgClass = 'bg-white border-gray-200 text-gray-800'; // isFuture
                              if (isPast) bgClass = 'bg-red-50 border-red-200 text-red-900';
                              if (isPlaying) bgClass = 'bg-sky-50 border-sky-200 text-sky-900';
                              
                              const formatTimeOnly = (d: Date) => d.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
                              
                              return (
                                 <div 
                                     key={st.id} 
                                     onClick={() => setViewingShowtime(st)}
                                     className={`absolute top-4 bottom-4 rounded-2xl p-3 shadow-sm border flex flex-col justify-between cursor-pointer group/item transition-all hover:scale-[1.02] hover:shadow-md hover:z-30 overflow-hidden ${bgClass}`}
                                     style={{ left: `calc(${left}% + 4px)`, width: `calc(${width}% - 8px)`, minWidth: '120px' }}
                                 >
                                     <div>
                                         <p className="font-headline font-bold text-sm leading-tight line-clamp-2 pr-6" title={st.movieTitle}>
                                             {st.movieTitle}
                                         </p>
                                         <p className="text-[11px] font-medium opacity-70 mt-0.5">
                                             {formatTimeOnly(new Date(startTimeMs))} - {formatTimeOnly(new Date(endTimeMs))}
                                         </p>
                                         <div className="flex items-center gap-1.5 mt-2">
                                            <div className={`w-2 h-2 rounded-full ${isSoldOut ? 'bg-red-500' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'}`}></div>
                                            <span className="text-xs font-medium opacity-80">{st.soldSeats}/{st.totalSeats}</span>
                                         </div>
                                     </div>
                                     <div className="font-bold text-yellow-600 text-sm mt-1">
                                         {st.price.toLocaleString('vi-VN')} đ
                                     </div>
                                     
                                     {/* Edit Button overlay inside block */}
                                     <button 
                                         onClick={(e) => { e.stopPropagation(); openEdit(st); }}
                                         className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-white/80 hover:bg-sky-100 text-gray-500 hover:text-sky-600 transition-colors opacity-0 group-hover/item:opacity-100 shadow-sm backdrop-blur-sm"
                                         title="Sửa suất chiếu"
                                     >
                                         <span className="material-symbols-outlined text-[16px]">edit</span>
                                     </button>
                                 </div>
                              )
                           })}
                        </div>
                    </div>
                 ))}
                 
                 {rooms.length === 0 && (
                     <div className="p-10 text-center text-gray-500">
                         Chưa có phòng chiếu nào. Vui lòng thêm phòng chiếu trước.
                     </div>
                 )}
             </div>
           )}
        </div>
      </div>

      {/* Seat Map Modal */}
      {viewingShowtime && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6" onClick={() => setViewingShowtime(null)}>
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
               <div>
                   <h3 className="text-xl font-headline font-bold text-gray-900">{viewingShowtime.movieTitle}</h3>
                   <p className="text-sm text-gray-500 mt-1">
                       {viewingShowtime.roomName} • {formatDateTime(viewingShowtime.startTime)}
                   </p>
               </div>
               <div className="flex gap-2">
                   <button 
                       onClick={() => openEdit(viewingShowtime)} 
                       className="w-10 h-10 flex items-center justify-center rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                       title="Sửa suất chiếu"
                   >
                       <span className="material-symbols-outlined">edit</span>
                   </button>
                   <button 
                       onClick={() => deleteShowtime(viewingShowtime.id)} 
                       className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                       title="Xóa suất chiếu"
                   >
                       <span className="material-symbols-outlined">delete</span>
                   </button>
                   <div className="w-px h-10 bg-gray-200 mx-1"></div>
                   <button 
                       onClick={() => setViewingShowtime(null)} 
                       className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
                   >
                       <span className="material-symbols-outlined">close</span>
                   </button>
               </div>
            </div>
            
            {/* Body Modal */}
            <div className="p-6 overflow-y-auto">
               <div className="flex items-center gap-6 mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                   <div className="flex-1">
                       <span className="block text-xs text-gray-500 uppercase font-bold mb-1">Ghế đã bán</span>
                       <span className="text-2xl font-headline font-bold text-gray-900">{viewingShowtime.soldSeats} <span className="text-lg text-gray-400 font-medium">/ {viewingShowtime.totalSeats}</span></span>
                   </div>
                   <div className="w-px h-10 bg-gray-200"></div>
                   <div className="flex-1">
                       <span className="block text-xs text-gray-500 uppercase font-bold mb-1">Giá vé</span>
                       <span className="text-2xl font-headline font-bold text-yellow-600">{viewingShowtime.price.toLocaleString('vi-VN')} đ</span>
                   </div>
               </div>

               <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/20 shadow-sm overflow-hidden">
                  {/* Screen */}
                  <div className="mb-12 perspective-screen">
                    <div className="h-10 w-3/4 mx-auto bg-gradient-to-b from-primary/40 to-transparent rounded-t-full screen-curve flex items-end justify-center pb-2">
                      <span className="text-primary font-headline font-bold tracking-widest uppercase text-xs">Màn hình</span>
                    </div>
                  </div>
                  
                  {/* Seat Grid */}
                  <div className="overflow-x-auto pb-4 custom-scrollbar relative">
                    <div className="min-w-[600px] flex flex-col gap-3 items-center">
                      {ROWS.map((row) => (
                        <div key={row} className={`flex items-center gap-4 ${row === 'C' ? 'mt-4' : ''}`}>
                          <span className="w-6 text-center font-headline font-bold text-on-surface-variant">
                            {row}
                          </span>
                          <div className="flex gap-2">
                            {[1, 2].map((seatNum) => {
                               const seatStr = `${row}${seatNum}`;
                               const seatObj = viewingShowtime.seats.find(s => s.seatNumber === seatStr);
                               return renderAdminSeat(seatObj, seatStr);
                            })}
                            <div className="w-4" />
                            {[3, 4, 5, 6].map((seatNum) => {
                               const seatStr = `${row}${seatNum}`;
                               const seatObj = viewingShowtime.seats.find(s => s.seatNumber === seatStr);
                               return renderAdminSeat(seatObj, seatStr);
                            })}
                            <div className="w-4" />
                            {[7, 8].map((seatNum) => {
                               const seatStr = `${row}${seatNum}`;
                               const seatObj = viewingShowtime.seats.find(s => s.seatNumber === seatStr);
                               return renderAdminSeat(seatObj, seatStr);
                            })}
                          </div>
                          <span className="w-6 text-center font-headline font-bold text-on-surface-variant">
                            {row}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {viewingShowtime.seats.length === 0 && (
                      <p className="text-gray-500 italic py-10 text-center">Chưa có thông tin sơ đồ ghế.</p>
                  )}
                  
                  <div className="flex justify-center gap-8 mt-10">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-t-lg rounded-b-sm bg-surface-container-high border border-outline-variant/30" />
                      <span className="text-sm text-on-surface-variant">Còn trống</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-t-lg rounded-b-sm bg-amber-500 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-[14px]">schedule</span>
                      </div>
                      <span className="text-sm text-on-surface-variant">Đang giữ chỗ</span>
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
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 space-y-6">
            <h3 className="text-xl font-headline font-bold text-gray-900 border-b border-gray-100 pb-4">
                {editingId === null ? 'Thêm suất chiếu mới' : 'Sửa suất chiếu'}
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Phim</label>
                <select
                  value={form.movieId || ''}
                  onChange={(e) => setForm((f) => ({ ...f, movieId: Number(e.target.value) }))}
                  disabled={editingId !== null}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sky-200 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="">Chọn phim</option>
                  {movies.map((movie) => (
                    <option key={movie.id} value={movie.id}>
                      {movie.title} ({movie.duration} phút)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Phòng</label>
                <select
                  value={form.roomId || ''}
                  onChange={(e) => setForm((f) => ({ ...f, roomId: Number(e.target.value) }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sky-200 outline-none"
                >
                  <option value="">Chọn phòng</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Giá vé (VND)</label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={form.price || ''}
                  onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value || 0) }))}
                  disabled={editingId !== null}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sky-200 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Bắt đầu chiếu</label>
                <input
                  type="datetime-local"
                  value={form.startTime}
                  onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                  disabled={editingId !== null}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sky-200 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
            </div>

            <div className="text-sm bg-sky-50 border border-sky-100 rounded-xl px-4 py-3 text-sky-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">info</span>
              <div>Khoảng chiếu: <strong>{formatDateTime(form.startTime)} - {formatDateTime(previewEndTime)}</strong></div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl text-gray-600 font-bold hover:bg-gray-100 transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => void saveShowtime()}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-sky-600 text-white font-bold hover:bg-sky-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {saving ? 'Đang lưu...' : 'Lưu suất chiếu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
