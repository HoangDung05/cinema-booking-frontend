import apiClient from './apiClient';
import axios from 'axios';

// Instance riêng cho chatbot - không đính kèm JWT để tránh lỗi 401 khi token hết hạn
const chatAxios = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' }
});

export type ChatMessage = { role: 'user' | 'model'; text: string };

export const chatbotService = {
  /**
   * Phương thức getSystemContext không còn cần thiết ở Frontend
   * vì Backend sẽ tự động xử lý (RAG) và chèn vào prompt.
   */
  getSystemContext: async (): Promise<string> => {
    return ''; // Không cần dùng nữa
  },

  /**
   * Gửi tin nhắn đến API Backend (/api/chat) và nhận về câu trả lời
   */
  sendMessage: async (userMessage: string, chatHistory: ChatMessage[], systemContext: string): Promise<string> => {
    try {
      // Dùng chatAxios (không có JWT) để endpoint /chat public hoạt động được
      const response = await chatAxios.post('/chat', {
        message: userMessage,
        history: chatHistory
      });

      return response.data.response;
    } catch (error: any) {
      console.error('Lỗi khi gọi API Chatbot Backend:', error);
      throw new Error(error.response?.data?.message || 'Lỗi kết nối tới máy chủ AI.');
    }
  }
};
