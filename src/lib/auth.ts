/**
 * Google OAuth 로그인 시작
 */
export async function startGoogleLogin() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(
      `${API_URL}/api/v1/auth/google/start/`
    );
    
    if (!response.ok) {
      throw new Error("OAuth URL을 가져올 수 없습니다.");
    }
    
    const data = await response.json();
    
    // Google 로그인 페이지로 리다이렉트
    window.location.href = data.redirectUrl;
  } catch (error) {
    console.error("Google 로그인 시작 실패:", error);
    throw error;
  }
}

/**
 * JWT 토큰 저장
 */
export function setAuthTokens(accessToken: string, refreshToken: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
}

/**
 * 프로필 이미지 URL 저장
 */
export function setUserProfileImage(imageUrl: string) {
  if (typeof window === "undefined" || !imageUrl) return;
  localStorage.setItem("user_profile_image", imageUrl);
}

/**
 * 저장된 JWT 토큰 가져오기
 */
export function getAuthTokens() {
  if (typeof window === "undefined") {
    return { accessToken: null, refreshToken: null };
  }
  return {
    accessToken: localStorage.getItem("access_token"),
    refreshToken: localStorage.getItem("refresh_token"),
  };
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

/**
 * 저장된 프로필 이미지 가져오기
 */
export function getUserProfileImage(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("user_profile_image");
}

/**
 * 토큰 및 사용자 정보 삭제 (리다이렉트 없음)
 * api.ts 등에서 사용하기 위해 분리함
 */
export function clearAuthTokens() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_profile_image");
  }
}

/**
 * 로그아웃 (토큰 삭제 후 홈으로 이동)
 */
export function logout() {
  clearAuthTokens(); // 위에서 만든 함수 재사용
  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
}

/**
 * 인증된 API 요청 (fetch wrapper)
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getAccessToken();
  
  const headers: HeadersInit = {
    ...options.headers,
  };

  if (token) {
    (headers as any).Authorization = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // 401 에러 시 자동 로그아웃
  if (response.status === 401) {
    logout();
    throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.");
  }
  
  return response;
}

/**
 * JWT 토큰 갱신
 */
export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) return null;
  
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(
      `${API_URL}/api/v1/users/token/refresh/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      }
    );
    
    if (!response.ok) {
      throw new Error("토큰 갱신 실패");
    }
    
    const data = await response.json();
    setAuthTokens(data.access, data.refresh);
    
    return data.access;
  } catch (error) {
    console.error("토큰 갱신 중 오류 발생:", error);
    logout(); // 갱신 실패 시 로그아웃 처리
    return null;
  }
}