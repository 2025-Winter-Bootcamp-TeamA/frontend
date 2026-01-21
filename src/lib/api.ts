import axios from 'axios';
import { getAuthTokens, refreshAccessToken, clearAuthTokens } from './auth';

// ✅ [수정됨] 환경변수(localhost:8000) 뒤에 API 버전(/api/v1)을 붙임
const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1`;

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});

// --- 인터셉터 설정 (그대로 유지) ---

api.interceptors.request.use(
  async (config) => {
    const { accessToken } = getAuthTokens();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    // Django 호환성: URL 끝에 슬래시(/) 자동 추가
    if (config.url && !config.url.endsWith('/') && !config.url.includes('?')) {
      config.url += '/';
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("토큰 갱신 실패:", refreshError);
      }
      
      clearAuthTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;