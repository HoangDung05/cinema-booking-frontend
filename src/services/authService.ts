import apiClient from './apiClient';

export const authService = {
  login: async (credentials: any) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData: any) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  }
};
