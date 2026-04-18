import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

export default function Home() {
  const [activeTab, setActiveTab] = useState<'now_showing' | 'coming_soon'>('now_showing');
  const [nowShowing, setNowShowing] = useState<Movie[]>([]);
  const [comingSoon, setComingSoon] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        const [nowShowingData, comingSoonData] = await Promise.all([
          movieService.getNowShowingMovies(),
          movieService.getComingSoonMovies()
        ]);
        setNowShowing(nowShowingData);
        setComingSoon(comingSoonData);
      } catch (error) {
        console.error("Failed to fetch movies:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMovies();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <div className="relative h-[80vh] w-full overflow-hidden bg-on-background">
        <img src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=2000" alt="Hero Movie" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-on-background via-on-background/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-12 md:p-24 max-w-7xl mx-auto">
          <div className="flex gap-3 mb-6">
            <span className="px-3 py-1 bg-primary/20 text-primary-fixed border border-primary/30 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-sm">Nổi bật</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-headline font-extrabold text-surface-container-lowest mb-6 tracking-tight text-shadow-editorial">Thế Giới Điện Ảnh</h1>
          <p className="text-lg md:text-xl text-surface-variant max-w-2xl mb-10 font-medium leading-relaxed">Trải nghiệm những bộ phim bom tấn với chất lượng hình ảnh và âm thanh đỉnh cao nhất tại Group3 Cinema.</p>
          <div className="flex gap-4">
            <button
               onClick={() => {
                 document.getElementById('movies-section')?.scrollIntoView({ behavior: 'smooth' });
               }}
               className="px-8 py-4 bg-primary text-on-primary rounded-xl font-headline font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 flex items-center gap-2">
              <span className="material-symbols-outlined">confirmation_number</span>
              Đặt vé ngay
            </button>
          </div>
        </div>
      </div>

      {/* Trending Now / Quick Filters */}
      <div id="movies-section" className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
        <div className="bg-surface-container-lowest rounded-2xl shadow-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-outline-variant/20">
          <div className="flex gap-4 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
             <button 
               onClick={() => setActiveTab('now_showing')}
               className={`px-6 py-2 rounded-full font-headline font-bold whitespace-nowrap transition-colors ${activeTab === 'now_showing' ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'}`}>
               Phim đang chiếu
             </button>
             <button 
               onClick={() => setActiveTab('coming_soon')}
               className={`px-6 py-2 rounded-full font-headline font-bold whitespace-nowrap transition-colors ${activeTab === 'coming_soon' ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'}`}>
               Phim sắp chiếu
             </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}

      {activeTab === 'now_showing' && (
        <section className="max-w-7xl mx-auto px-6 py-20 pb-40 fade-in-up">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-headline font-bold text-on-surface mb-2">Phim đang chiếu</h2>
              <p className="text-on-surface-variant">Trải nghiệm điện ảnh tuyệt vời.</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
          ) : nowShowing.length === 0 ? (
            <p className="text-center text-on-surface-variant py-20 text-lg">Hệ thống đang cập nhật danh sách phim đang chiếu.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {nowShowing.map((movie) => (
                <Link key={movie.id} to={`/movie/${movie.id}`} className="group cursor-pointer flex flex-col h-full">
                  <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-4 shadow-md group-hover:shadow-xl transition-all duration-300">
                    <img 
                      src={movie.posterUrl || 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=600'} 
                      alt={movie.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-surface-container-high" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-on-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                      <button className="w-full py-3 bg-primary text-on-primary rounded-xl font-headline font-bold shadow-lg">Mua Vé</button>
                    </div>
                  </div>
                  <h3 className="text-lg font-headline font-bold text-on-surface mb-1 group-hover:text-primary transition-colors flex-grow line-clamp-2">{movie.title}</h3>
                  <p className="text-sm text-on-surface-variant mb-2">{movie.duration} phút</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'coming_soon' && (
        <section className="bg-surface-container-low py-20 pb-40">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-headline font-bold text-on-surface mb-2">Phim sắp chiếu</h2>
                <p className="text-on-surface-variant">Đánh dấu vào lịch của bạn ngay.</p>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              </div>
            ) : comingSoon.length === 0 ? (
               <p className="text-center text-on-surface-variant py-20 text-lg">Hiện chưa có thông tin phim sắp khởi chiếu.</p>
            ) : (
              <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide">
                {comingSoon.map((movie) => (
                  <div key={movie.id} className="min-w-[300px] md:min-w-[400px] w-full max-w-[400px] bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/20 group cursor-pointer flex flex-col">
                    <div className="relative h-48 sm:h-56 overflow-hidden">
                      <img 
                        src={movie.posterUrl || 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=800'} 
                        alt={movie.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-surface-container-high" 
                      />
                      <div className="absolute top-4 left-4 bg-surface-container-lowest/90 backdrop-blur-sm px-3 py-1 rounded-lg shadow-sm">
                        <span className="font-bold text-sm text-primary">{movie.releaseDate}</span>
                      </div>
                    </div>
                    <div className="p-6 flex-grow flex flex-col">
                      <h3 className="text-xl font-headline font-bold text-on-surface mb-2">{movie.title}</h3>
                      <p className="text-sm text-on-surface-variant mb-4 line-clamp-2">{movie.description || 'Chưa cập nhật nội dung'}</p>
                      <div className="mt-auto">
                        <button className="text-primary font-headline font-bold hover:underline flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">notifications</span> Nhắc tôi
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
