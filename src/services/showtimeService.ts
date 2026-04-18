import apiClient from './apiClient';

export type SeatStatusDTO = {
  id: number;
  seatNumber: string;
  seatType: string;
  booked: boolean;
};

export type ShowtimeDto = {
  id: number;
  startTime: string;
  price: number;
  movie?: { id: number; title: string; duration?: number };
  room?: { id: number; name: string };
};

export type ShowtimeWritePayload = {
  movieId: number;
  roomId: number;
  startTime: string;
  price: number;
};

export const showtimeService = {
  // Lấy các ghế của 1 suất chiếu
  getSeatsByShowtimeId: async (id: number): Promise<SeatStatusDTO[]> => {
    const response = await apiClient.get<SeatStatusDTO[]>(`/showtimes/${id}/seats`);
    return response.data;
  },

  getAllShowtimes: async (): Promise<ShowtimeDto[]> => {
    const response = await apiClient.get<ShowtimeDto[]>('/showtimes');
    return response.data;
  },

  createShowtime: async (payload: ShowtimeWritePayload): Promise<ShowtimeDto> => {
    const response = await apiClient.post<ShowtimeDto>('/admin/showtimes', {
      movie: { id: payload.movieId },
      room: { id: payload.roomId },
      startTime: payload.startTime,
      price: payload.price,
    });
    return response.data;
  },

  updateShowtime: async (id: number, payload: ShowtimeWritePayload): Promise<ShowtimeDto> => {
    const response = await apiClient.put<ShowtimeDto>(`/admin/showtimes/${id}`, {
      movie: { id: payload.movieId },
      room: { id: payload.roomId },
      startTime: payload.startTime,
      price: payload.price,
    });
    return response.data;
  },

  deleteShowtime: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/showtimes/${id}`);
  },
};
