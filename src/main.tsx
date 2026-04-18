import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx'; // Đây là file App.tsx tổng mà mình đã hợp nhất ở bước trước
import './assets/index.css'; // File CSS chính của bạn

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);