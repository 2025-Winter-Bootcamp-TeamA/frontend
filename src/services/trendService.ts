// src/services/trendService.ts
import api from '@/lib/api';
import { CATEGORY_INFO } from '@/constants/mockTrends';
import { CategoryDetail } from '@/types/trend';

// true면 목데이터 사용, false면 실제 API 호출
const USE_MOCK = true; 


export const getTrendDataByCategory = async (category: string): Promise<CategoryDetail> => {
  if (USE_MOCK) {
    // 목데이터를를 반환 (0.5초 지연으로 네트워크 느낌만 냄)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(CATEGORY_INFO[category] || CATEGORY_INFO.frontend);
      }, 500);
    });
  }

  // 
  const response = await api.get<CategoryDetail>(`/trends/${category}/`);
  return response.data;
};