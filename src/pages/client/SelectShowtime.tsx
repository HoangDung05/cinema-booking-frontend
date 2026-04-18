import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { movieService } from '../../services/movieService';
import { parseLocalDateTimeLoose } from '../../utils/localDateTime';
import { formatShowtimeWindowFromIso } from '../../utils/showtimeRange';

const FIXED_CINEMA_NAME = 'Group3 Cinema – Chi nhánh trung tâm';

type MovieBrief = {
  id: number;
  title: string;
  posterUrl?: string;
  duration?: number;
};

type ShowtimeApi = {
  id: number;
  startTime: string;
  price: number;
};

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(base: Date, n: number): Date {
  const x = new Date(base);
  x.setDate(x.getDate() + n);
  return startOfDay(x);
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDayMonth(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}`;
}

function formatDateLongVi(d: Date): string {
  return d.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function SelectShowtime() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const passedMovie = (location.state as { movie?: MovieBrief } | null)?.movie;
  const queryMovieId = searchParams.get('movieId');
  const resolvedMovieId =
    passedMovie?.id ??
    (queryMovieId && !Number.isNaN(Number(queryMovieId)) ? Number(queryMovieId) : null);

  const [movie, setMovie] = useState<MovieBrief | null>(passedMovie ?? null);
  const [showtimes, setShowtimes] = useState<ShowtimeApi[]>([]);
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);

  const weekDays = useMemo(() => {
    const base = startOfDay(new Date());
    return Array.from({ length: 7 }, (_, i) => addDays(base, i));
  }, []);

  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfDay(new Date()));
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [resolvedMovieId]);

  useEffect(() => {
    if (passedMovie) {
      setMovie(passedMovie);
      return;
    }
    if (resolvedMovieId != null) {
      movieService
        .getMovieById(resolvedMovieId)
        .then((m) =>
          setMovie({
            id: m.id,
            title: m.title,
            posterUrl: m.posterUrl,
            duration: m.duration,
          })
        )
        .catch(() => setMovie(null));
    } else {
      setMovie(null);
    }
  }, [passedMovie, resolvedMovieId]);

  useEffect(() => {
    if (resolvedMovieId == null) {
      setShowtimes([]);
      return;
    }
    setLoadingShowtimes(true);
    movieService
      .getShowtimesByMovieId(resolvedMovieId)
      .then(setShowtimes)
      .catch(() => setShowtimes([]))
      .finally(() => setLoadingShowtimes(false));
  }, [resolvedMovieId]);

  useEffect(() => {
    setSelectedShowtimeId(null);
  }, [selectedDate]);

  const showtimesForDay = useMemo(() => {
    return showtimes
      .filter((st) => isSameDay(parseLocalDateTimeLoose(st.startTime), selectedDate))
      .sort(
        (a, b) =>
          parseLocalDateTimeLoose(a.startTime).getTime() - parseLocalDateTimeLoose(b.startTime).getTime()
      );
  }, [showtimes, selectedDate]);

  const selectedShowtime = useMemo(
    () => showtimes.find((s) => s.id === selectedShowtimeId) ?? null,
    [showtimes, selectedShowtimeId]
  );

  const selectedTimeLabel =
    selectedShowtime != null
      ? formatShowtimeWindowFromIso(selectedShowtime.startTime, movie?.duration)
      : null;

  const handleContinue = () => {
    if (!movie || selectedShowtimeId == null || selectedShowtime == null) return;
    navigate('/book/seats', {
      state: {
        booking: {
          movie,
          dateDisplay: formatDateLongVi(selectedDate),
          timeLabel:
            selectedTimeLabel ??
            formatShowtimeWindowFromIso(selectedShowtime.startTime, movie?.duration),
          showtimeId: selectedShowtime.id,
          cinemaName: FIXED_CINEMA_NAME,
          startTime: selectedShowtime.startTime,
          price: selectedShowtime.price,
        },
      },
    });
  };

  if (resolvedMovieId == null) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h1 className="text-2xl font-headline font-bold text-on-surface mb-3">Chưa chọn phim</h1>
        <p className="text-on-surface-variant mb-6">Vui lòng chọn phim từ trang chi tiết hoặc trang chủ.</p>
        <Link to="/" className="text-primary font-headline font-bold hover:underline">
          Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Stepper */}
      <div className="flex items-center justify-center mb-16">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline font-bold shadow-md">
              1
            </div>
            <span className="text-sm font-headline font-bold text-primary">Lịch chiếu</span>
          </div>
          <div className="w-16 h-1 bg-surface-container-high rounded-full overflow-hidden">
            <div className="w-1/2 h-full bg-primary"></div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-headline font-bold">
              2
            </div>
            <span className="text-sm font-headline font-semibold text-on-surface-variant">Chọn ghế</span>
          </div>
          <div className="w-16 h-1 bg-surface-container-high rounded-full"></div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-headline font-bold">
              3
            </div>
            <span className="text-sm font-headline font-semibold text-on-surface-variant">Thanh toán</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-8">
          <h1 className="text-3xl font-headline font-bold text-on-surface mb-8">Chọn ngày</h1>

          <div className="flex gap-3 overflow-x-auto pb-4 mb-12 scrollbar-hide">
            {weekDays.map((day, index) => {
              const isSelected = isSameDay(day, selectedDate);
              const isTodayCard = index === 0;
              return (
                <button
                  key={day.getTime()}
                  type="button"
                  onClick={() => setSelectedDate(day)}
                  className={`flex flex-col items-center justify-center min-w-[88px] py-4 rounded-2xl border transition-colors shrink-0 ${
                    isSelected
                      ? 'bg-primary text-on-primary border-primary/20 shadow-md'
                      : 'bg-surface-container-lowest text-on-surface border-outline-variant/20 hover:bg-surface-container-low'
                  }`}
                >
                  {isTodayCard ? (
                    <>
                      <span
                        className={`text-sm font-headline font-bold mb-1 ${isSelected ? 'text-on-primary' : 'text-on-surface'}`}
                      >
                        Hôm nay
                      </span>
                      <span className={`text-xl font-headline font-bold ${isSelected ? '' : 'text-on-surface'}`}>
                        {formatDayMonth(day)}
                      </span>
                    </>
                  ) : (
                    <span className={`text-xl font-headline font-bold ${isSelected ? '' : 'text-on-surface'}`}>
                      {formatDayMonth(day)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">Chọn giờ chiếu</h2>
          <p className="text-sm text-on-surface-variant mb-6">{FIXED_CINEMA_NAME}</p>

          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/20 shadow-sm">
            {loadingShowtimes ? (
              <div className="flex justify-center py-12">
                <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              </div>
            ) : showtimesForDay.length === 0 ? (
              <p className="text-on-surface-variant text-center py-8">Không có suất chiếu cho ngày đã chọn.</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {showtimesForDay.map((st) => {
                  const label = formatShowtimeWindowFromIso(st.startTime, movie?.duration);
                  const isPicked = selectedShowtimeId === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setSelectedShowtimeId(st.id)}
                      className={`px-4 py-3 rounded-xl font-headline font-bold transition-colors border border-outline-variant/10 min-w-[9.5rem] text-center text-sm sm:text-base ${
                        isPicked
                          ? 'bg-primary text-on-primary shadow-md'
                          : 'bg-surface-container-low text-on-surface hover:bg-primary/15'
                      }`}
                    >
                      <span className="leading-snug whitespace-normal">{label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/20 shadow-lg sticky top-24">
            <div className="flex gap-4 mb-6 pb-6 border-b border-outline-variant/20">
              <div className="w-20 rounded-lg overflow-hidden shrink-0 aspect-[2/3] bg-surface-container-high">
                <img
                  src={
                    movie?.posterUrl ||
                    'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=200'
                  }
                  alt={movie ? `Áp phích ${movie.title}` : 'Poster'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h3 className="font-headline font-bold text-on-surface mb-1 line-clamp-2">
                  {movie?.title ?? 'Đang tải…'}
                </h3>
                {movie?.duration != null ? (
                  <p className="text-sm text-on-surface-variant">{movie.duration} phút</p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary mt-0.5">calendar_today</span>
                <div>
                  <p className="text-sm text-on-surface-variant">Ngày</p>
                  <p className="font-headline font-bold text-on-surface">{formatDateLongVi(selectedDate)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary mt-0.5">schedule</span>
                <div>
                  <p className="text-sm text-on-surface-variant">Giờ chiếu</p>
                  <p className="font-headline font-bold text-on-surface">{selectedTimeLabel ?? '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary mt-0.5">location_on</span>
                <div>
                  <p className="text-sm text-on-surface-variant">Rạp</p>
                  <p className="font-headline font-bold text-on-surface">{FIXED_CINEMA_NAME}</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              disabled={selectedShowtimeId == null}
              className="w-full py-4 bg-primary text-on-primary rounded-xl font-headline font-bold hover:bg-primary/90 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              Tiếp tục chọn ghế
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
