import api from '@/lib/api';
import { CATEGORY_INFO } from '@/constants/mockTrends';
import { CategoryDetail, TechStackData } from '@/types/trend';

// 목데이터 사용 여부 (검색 로직에서는 무시됨)
const USE_MOCK = true; 

// 캐싱 변수
let cachedAllStacks: TechStackData[] | null = null;

// 페이지네이션 응답 타입
interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: TechStackData[];
}

export const getTrendDataByCategory = async (category: string): Promise<CategoryDetail> => {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(CATEGORY_INFO[category] || CATEGORY_INFO.frontend); 
      }, 500);
    });
  }
  const response = await api.get<CategoryDetail>(`/trends/${category}/`);
  return response.data;
};

/**
 * 전체 기술 스택 가져오기 (페이지네이션 자동 처리)
 */
const fetchAllTechStacks = async (): Promise<TechStackData[]> => {
  if (cachedAllStacks && cachedAllStacks.length > 0) return cachedAllStacks;

  let allStacks: TechStackData[] = [];
  let page = 1;
  let hasNextPage = true;

  try {
    while (hasNextPage) {
      const response = await api.get<TechStackData[] | PaginatedResponse>('/trends/tech-stacks/', {
        params: { page: page }
      });
      const data = response.data;

      if (Array.isArray(data)) {
        allStacks = data;
        hasNextPage = false;
        break;
      }

      if ('results' in data) {
        allStacks = [...allStacks, ...data.results];
        if (data.next) {
          page++;
        } else {
          hasNextPage = false;
        }
      } else {
        hasNextPage = false;
      }
    }

    cachedAllStacks = allStacks;
    console.log(`Loaded ${allStacks.length} stacks.`);
    return allStacks;

  } catch (error) {
    console.error('Failed to fetch all stacks:', error);
    return allStacks.length > 0 ? allStacks : [];
  }
};

/**
 * ✅ [수정됨] 기술 스택 검색 API
 * - api.defaults가 undefined일 경우 오류가 나지 않도록 안전하게 접근(Optional Chaining)
 */
export const searchTechStacks = async (query: string): Promise<TechStackData[]> => {
  try {
    const allStacks = await fetchAllTechStacks();
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    
    // 1. 필터링
    const filtered = allStacks.filter((stack) => 
      stack.name.toLowerCase().includes(lowerQuery)
    );

    // 2. 정렬 (정확도 순)
    const sorted = filtered.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();

      if (nameA === lowerQuery) return -1;
      if (nameB === lowerQuery) return 1;

      const startsA = nameA.startsWith(lowerQuery);
      const startsB = nameB.startsWith(lowerQuery);
      if (startsA && !startsB) return -1;
      if (!startsA && startsB) return 1;

      return nameA.localeCompare(nameB);
    });

    // 3. 로고 URL 정규화
    // ⚠️ [수정] api.defaults?.baseURL로 안전하게 접근하고, 타입이 문자열인지 확인
    // (api.defaults가 없거나 baseURL이 설정되지 않았을 경우 빈 문자열 처리)
    const baseURL = (api.defaults?.baseURL as string) || '';
    let serverOrigin = '';

    try {
      // baseURL이 존재하고 유효한 URL(http로 시작)일 때만 Origin 추출
      if (baseURL && baseURL.startsWith('http')) {
        const urlObj = new URL(baseURL);
        serverOrigin = urlObj.origin; 
      }
    } catch (e) {
      console.warn("Base URL parsing failed", e);
    }
    
    return sorted.map(stack => {
      let logoUrl = stack.logo;
      
      if (logoUrl && !logoUrl.startsWith('http')) {
        const cleanPath = logoUrl.startsWith('/') ? logoUrl : `/${logoUrl}`;
        
        // Origin이 파악되었을 때만 도메인을 붙임
        if (serverOrigin) {
          logoUrl = `${serverOrigin}${cleanPath}`;
        }
      }
      return { ...stack, logo: logoUrl };
    });

  } catch (error) {
    console.error('Tech stack search error:', error);
    return [];
  }
};