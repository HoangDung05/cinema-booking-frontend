import apiClient from './apiClient';

export type RoomDto = {
  id: number;
  name: string;
  cinema?: { id: number; name: string; address?: string };
};

export type RoomWritePayload = {
  name: string;
  cinemaId: number;
};

export const roomService = {
  getAllRooms: async (): Promise<RoomDto[]> => {
    const response = await apiClient.get('/rooms/allrooms');
    return response.data;
  },

  createRoom: async (payload: RoomWritePayload) => {
    const response = await apiClient.post('/rooms', payload);
    return response.data as RoomDto;
  },

  updateRoom: async (id: number, payload: RoomWritePayload) => {
    const response = await apiClient.put(`/rooms/${id}`, payload);
    return response.data as RoomDto;
  },

  deleteRoom: async (id: number) => {
    await apiClient.delete(`/rooms/${id}`);
  },
};
