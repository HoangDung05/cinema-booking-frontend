import apiClient from './apiClient';

export type UserProfilePayload = {
  fullName: string;
  email?: string;
  phone: string;
  avatarUrl?: string;
};

export const userService = {
  getMyProfile: async (email: string) => {
    const response = await apiClient.get(`/users/me?email=${email}`);
    return response.data;
  },

  updateMyProfile: async (email: string, payload: UserProfilePayload) => {
    const response = await apiClient.put(`/users/me?email=${encodeURIComponent(email)}`, payload);
    return response.data;
  },

  changeMyPassword: async (email: string, currentPassword: string, newPassword: string) => {
    const response = await apiClient.put(`/users/me/change-password?email=${encodeURIComponent(email)}`, {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};
