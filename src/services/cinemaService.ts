import apiClient from './apiClient';

export type CinemaDto = {
  id: number;
  name: string;
  address?: string;
};

export const cinemaService = {
  getAll: async (): Promise<CinemaDto[]> => {
    const response = await apiClient.get('/cinemas');
    return response.data;
  },
};
