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
 * ✅ 기술 스택 검색 (백엔드 API의 search 파라미터 사용)
 */
let cachedAllStacks: TechStackData[] | null = null;

export const searchTechStacks = async (query: string): Promise<TechStackData[]> => {
    try {
        // 1. 검색어가 없으면 전체 데이터 반환 (캐시 사용)
        if (!query.trim()) {
            if (!cachedAllStacks || cachedAllStacks.length === 0) {
                cachedAllStacks = await fetchAllPages('/trends/tech-stacks/');
            }
            return cachedAllStacks.map(stack => ({
                ...stack,
                logo: normalizeLogoUrl(stack.logo, stack.name)
            }));
        }

        // 2. 검색어가 있으면 백엔드 API의 search 파라미터 사용
        // 백엔드에서 이름만 부분 일치 검색 수행
        const searchUrl = `/trends/tech-stacks/?search=${encodeURIComponent(query.trim())}`;
        const searchResults = await fetchAllPages(searchUrl);

        // 3. 데이터 가공 (로고 URL 생성)
        return searchResults.map(stack => ({
            ...stack,
            logo: normalizeLogoUrl(stack.logo, stack.name)
        }));

    } catch (error) {
        console.error("Failed to search tech stacks:", error);
        return [];
    }
};

export const fetchAllTechStacks = async (): Promise<TechStackData[]> => {
    return searchTechStacks('');
};