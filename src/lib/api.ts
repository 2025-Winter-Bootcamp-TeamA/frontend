import axios from 'axios';
import { getAuthTokens, refreshAccessToken, clearAuthTokens } from './auth';

// [수정 핵심] 환경 변수 대신 프록시 경로를 직접 사용합니다.
// 이렇게 하면 무조건 Next.js Rewrites를 거쳐서 백엔드로 가므로 Mixed Content 에러가 해결됩니다.
const BASE_URL = '/api/proxy/api/v1'; 

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // [추가] 쿠키 등을 주고받을 때 필요할 수 있습니다 (백엔드 설정에 따라 다름)
  withCredentials: true, 
});

// --- 아래 인터셉터 코드는 기존과 동일합니다 ---

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
        // 토큰 갱신 에러 발생 시 로그아웃
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