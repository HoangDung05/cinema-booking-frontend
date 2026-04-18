import apiClient from './apiClient';

/** Dữ liệu phim từ API (đồng bộ với entity Movie backend) */
export type MovieDto = {
  id?: number;
  title: string;
  description?: string;
  duration: number;
  releaseDate?: string;
  posterUrl?: string;
  trailerUrl?: string;
  status: 'NOW_SHOWING' | 'COMING_SOON' | 'ENDED';
};

export const movieService = {
  getMovieById: async (id: number) => {
    const response = await apiClient.get(`/movies/${id}`);
    return response.data;
  },

  getNowShowingMovies: async () => {
    const response = await apiClient.get('/movies/now-showing');
    return response.data;
  },

  getComingSoonMovies: async () => {
    const response = await apiClient.get('/movies/coming-soon');
    return response.data;
  },

  searchMovies: async (keyword: string): Promise<MovieDto[]> => {
    const response = await apiClient.get(`/movies/search?keyword=${encodeURIComponent(keyword)}`);
    return response.data;
  },

  getShowtimesByMovieId: async (movieId: number) => {
    const response = await apiClient.get(`/movies/${movieId}/showtimes`);
    return response.data;
  },

  /** Danh sách đầy đủ (admin) */
  getAllMovies: async (): Promise<MovieDto[]> => {
    const response = await apiClient.get('/movies');
    return response.data;
  },

  createMovie: async (movie: Omit<MovieDto, 'id'>) => {
    const response = await apiClient.post('/movies', movie);
    return response.data as MovieDto;
  },

  updateMovie: async (id: number, movie: Omit<MovieDto, 'id'>) => {
    const response = await apiClient.put(`/movies/${id}`, movie);
    return response.data as MovieDto;
  },

  deleteMovie: async (id: number) => {
    await apiClient.delete(`/movies/${id}`);
  },
};
