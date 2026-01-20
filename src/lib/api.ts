import axios from 'axios';
import { getSession, signOut } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  // 백엔드 URL 구조에 맞춰 /api/v1을 유지합니다.
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: localStorage 대신 NextAuth 세션에서 토큰을 가져옵니다.
api.interceptors.request.use(
  async (config) => {
    // 클라이언트 측에서 현재 세션 정보를 가져옵니다.
    const session = await getSession();
    
    // 지난번 [...nextauth]/route.ts에서 설정한 대로 
    // session.user 안에 백엔드에서 받은 access 토큰이 들어있습니다.
    const token = (session?.user as any)?.access;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 401 에러(토큰 만료 등) 시 처리
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 토큰이 만료되어 401 에러가 발생한 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // [중요] NextAuth를 사용하면 리프레시 토큰 로직은 
      // 보통 [...nextauth]/route.ts의 jwt 콜백에서 처리하는 것이 가장 깔끔합니다.
      // 여기서는 토큰이 완전히 만료된 경우 로그아웃 처리를 하거나 에러를 던집니다.
      
      console.error("인증이 만료되었습니다. 다시 로그인해주세요.");
      // 필요 시 자동 로그아웃 실행
      // signOut({ callbackUrl: '/' }); 
    }

    return Promise.reject(error);
  }
);

export default api;