import api from '@/lib/api';
import { AxiosResponse } from 'axios';
import { CategoryDetail, TechStackData } from '@/types/trend';

// 페이지네이션 응답 타입
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * ✅ [핵심] 기술 스택 이름을 기반으로 외부 CDN(Simple Icons) 주소 생성
 */
const getExternalLogoUrl = (name: string): string => {
    // Simple Icons 슬러그 규칙 (소문자, 공백/특수문자 제거 및 변환)
    const slug = name.toLowerCase()
        .replace(/\./g, 'dot')      // . -> dot
        .replace(/\s+/g, '')        // 공백 제거
        .replace(/\+/g, 'plus')     // + -> plus
        .replace(/#/g, 'sharp');    // # -> sharp

    return `https://cdn.simpleicons.org/${slug}`;
};

/**
 * 이미지 URL 정규화 (백엔드 로고 우선, 없으면 외부 CDN)
 */
const normalizeLogoUrl = (url: string | null, name: string): string => {
    // 1. 백엔드 DB에 로고 URL이 있는 경우
    if (url) {
        if (url.startsWith('http')) return url;
        const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        return `${baseURL}${url.startsWith('/') ? '' : '/'}${url}`;
    }
    // 2. 없으면 외부 CDN 주소 생성
    return getExternalLogoUrl(name);
};

/**
 * ✅ [핵심] 모든 페이지의 데이터를 순회하여 가져오는 함수
 */
const fetchAllPages = async (initialUrl: string): Promise<TechStackData[]> => {
    let allResults: TechStackData[] = [];
    let nextUrl: string | null = initialUrl;

    try {
        while (nextUrl) {
            // nextUrl이 http로 시작하면 baseURL 무시됨 (정상 동작)
            const response: AxiosResponse<PaginatedResponse<TechStackData>> = await api.get(nextUrl);
            const data = response.data;

            if (data.results && Array.isArray(data.results)) {
                allResults = [...allResults, ...data.results];
            }

            nextUrl = data.next; // 다음 페이지 URL (없으면 null)
        }
    } catch (error) {
        console.error("Pagination fetch failed:", error);
    }

    return allResults;
};

// 카테고리별 트렌드 조회
export const getTrendDataByCategory = async (category: string): Promise<CategoryDetail> => {
    try {
        const response = await api.get<CategoryDetail>(`/trends/${category}/`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch category trend:", error);
        throw error;
    }
};

/**
 * ✅ 기술 스택 검색 (전체 데이터 캐싱 + 필터링)
 */
let cachedAllStacks: TechStackData[] | null = null;

export const searchTechStacks = async (query: string): Promise<TechStackData[]> => {
    try {
        // 1. 캐시 없으면 전체 데이터 로딩 (페이지네이션 순회)
        if (!cachedAllStacks || cachedAllStacks.length === 0) {
            cachedAllStacks = await fetchAllPages('/trends/tech-stacks/');
        }

        // 2. 데이터 가공 (로고 URL 생성)
        const formattedStacks = cachedAllStacks.map(stack => ({
            ...stack,
            logo: normalizeLogoUrl(stack.logo, stack.name)
        }));

        // 3. 검색어 필터링
        if (!query.trim()) {
            return formattedStacks; 
        }

        const lowerQuery = query.toLowerCase();
        
        return formattedStacks.filter(stack => 
            stack.name.toLowerCase().includes(lowerQuery) ||
            (stack.description && stack.description.toLowerCase().includes(lowerQuery))
        );

    } catch (error) {
        console.error("Failed to search tech stacks:", error);
        return [];
    }
};

export const fetchAllTechStacks = async (): Promise<TechStackData[]> => {
    return searchTechStacks('');
};