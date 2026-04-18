import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { movieService } from '../../services/movieService';

type Movie = {
  id: number;
  title: string;
  description: string;
  duration: number;
  releaseDate: string;
  posterUrl: string;
  trailerUrl: string;
  status: string;
};

export default function MovieDetails() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [id]);

  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) {
        setError('Không tìm thấy mã phim.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const movieId = Number(id);
        if (Number.isNaN(movieId)) {
          setError('Mã phim không hợp lệ.');
          return;
        }

        const movieData = await movieService.getMovieById(movieId);
        setMovie(movieData);
      } catch (err) {
        console.error('Failed to fetch movie details:', err);
        setError('Không thể tải thông tin phim.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24">
        <h1 className="text-3xl font-headline font-bold text-on-surface mb-3">Không tìm thấy phim</h1>
        <p className="text-on-surface-variant mb-6">{error || 'Phim không tồn tại hoặc đã bị xóa.'}</p>
        <Link to="/" className="text-primary font-headline font-bold hover:underline">
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Movie Backdrop & Header */}
      <div className="relative w-full bg-on-background pt-20">
        <div className="absolute inset-0 h-[60vh] w-full overflow-hidden">
          <img src={movie.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=2000'} alt={`Hình nền ${movie.title}`} className="w-full h-full object-cover opacity-40 blur-sm scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-on-background via-on-background/80 to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 pt-12 pb-20">
          <div className="flex flex-col md:flex-row gap-12 items-end">
            {/* Poster */}
            <div className="w-64 md:w-80 shrink-0 rounded-2xl overflow-hidden shadow-2xl border-4 border-surface-container-lowest/10 z-10">
              <img src={movie.posterUrl || 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=600'} alt={`Áp phích ${movie.title}`} className="w-full h-auto object-cover" />
            </div>
            
            {/* Info */}
            <div className="flex-grow text-surface-container-lowest z-10">
              <div className="flex flex-wrap gap-3 mb-4">
                <span className="px-3 py-1 bg-primary/20 text-primary-fixed border border-primary/30 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-sm">{movie.status === 'NOW_SHOWING' ? 'Đang chiếu' : 'Sắp chiếu'}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-headline font-extrabold mb-4 tracking-tight text-shadow-editorial">{movie.title}</h1>
              
              <div className="flex flex-wrap items-center gap-6 text-surface-variant font-medium mb-8">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline-variant">schedule</span>
                  <span>{movie.duration} phút</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline-variant">calendar_today</span>
                  <span>Khởi chiếu: {movie.releaseDate}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/book/showtime"
                  state={{
                    movie: {
                      id: movie.id,
                      title: movie.title,
                      posterUrl: movie.posterUrl,
                      duration: movie.duration,
                    },
                  }}
                  className="px-8 py-4 bg-primary text-on-primary rounded-xl font-headline font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">confirmation_number</span>
                  Mua vé
                </Link>
                {movie.trailerUrl && (
                  <a
                    href={movie.trailerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-8 py-4 bg-surface-container-lowest/10 text-surface-container-lowest border border-surface-container-lowest/30 rounded-xl font-headline font-bold hover:bg-surface-container-lowest/20 transition-all backdrop-blur-sm flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined">play_circle</span>
                    Xem trailer
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-headline font-bold text-on-surface mb-6">Mô tả phim</h2>
        <p className="text-lg text-on-surface-variant leading-relaxed mb-12">
          {movie.description || 'Chưa cập nhật nội dung phim.'}
        </p>
      </div>
    </>
  );
}
