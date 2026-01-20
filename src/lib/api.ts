import axios from 'axios';
import { getAuthTokens, refreshAccessToken, clearAuthTokens } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  // 백엔드 URL 구조에 맞춰 /api/v1을 유지합니다.
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: JWT 토큰을 헤더에 추가
api.interceptors.request.use(
  async (config) => {
    const { accessToken } = getAuthTokens();
    
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    // FormData인 경우 Content-Type을 제거하여 axios가 자동으로 boundary를 설정하도록 함
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 401 에러 시 토큰 갱신 시도
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 토큰 만료로 401 에러 발생 시
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 토큰 갱신 시도
        const newAccessToken = await refreshAccessToken();
        
        if (newAccessToken) {
          // 새 토큰으로 원래 요청 재시도
          // Authorization 헤더를 명시적으로 설정
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } else {
          // 토큰 갱신 실패 시 로그아웃
          clearAuthTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그아웃
        console.error("토큰 갱신 실패. 다시 로그인해주세요.", refreshError);
        clearAuthTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;