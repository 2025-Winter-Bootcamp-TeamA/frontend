'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Star, FileText, CheckCircle2, TrendingUp, AlertCircle, HelpCircle, Briefcase, Hash, ChevronRight, Info, Search, X } from 'lucide-react';
// ✅ [추가] 기술 스택 데이터를 가져오기 위해 서비스 임포트
import { fetchAllTechStacks } from '@/services/trendService';
import { api } from '@/lib/api';

// --- Mock Data: 이력서 본문 ---
const MOCK_RESUME_TEXT = `
안녕하세요, 사용자 경험을 중요시하는 프론트엔드 개발자입니다.
React와 TypeScript를 주력으로 사용하며, 재사용 가능한 컴포넌트 설계에 깊은 관심을 가지고 있습니다.
지난 프로젝트에서는 Next.js를 도입하여 초기 로딩 속도를 50% 개선하고 SEO 점수를 90점대로 끌어올린 경험이 있습니다.
또한 Redux Toolkit을 활용해 복잡한 전역 상태를 효율적으로 관리했습니다.
다만, 대규모 트래픽 처리를 위한 백엔드와의 최적화 협업 경험은 다소 부족하여, 현재 Node.js와 AWS를 학습하며 인프라에 대한 이해도를 높이고 있습니다.
사용자의 피드백을 적극적으로 수용하여 서비스를 지속적으로 고도화하는 개발자가 되겠습니다.
`;

// --- [공통] 이력서 자체 분석 ---
const COMMON_FEEDBACKS = [
    {
        id: 101,
        type: 'strength',
        targetText: '초기 로딩 속도를 50% 개선하고 SEO 점수를 90점대로',
        comment: '단순 경험 나열이 아닌, 구체적 수치(50%, 90점)로 성과를 증명하여 설득력이 높습니다.',
    },
    {
        id: 102,
        type: 'improvement',
        targetText: '백엔드와의 최적화 협업 경험은 다소 부족',
        comment: '단점을 언급하는 데 그치지 않고, 이를 보완하기 위한 구체적인 학습 프로젝트(예: 채팅 서버 구축 등)를 언급하면 더 좋습니다.',
    },
    {
        id: 103,
        type: 'strength',
        targetText: '재사용 가능한 컴포넌트 설계',
        comment: '효율성을 중요시하는 개발자의 자질이 잘 드러납니다. 디자인 시스템 구축 경험이 있다면 추가해 보세요.',
    }
];

// --- [기업별] 맞춤 적합도 분석 데이터 ---
const COMPANY_SPECIFIC_FEEDBACKS: Record<string, any[]> = {
    'Toss': [
        {
            id: 201,
            type: 'matching',
            targetText: '사용자의 피드백을 적극적으로 수용하여 서비스를 지속적으로 고도화',
            comment: "Toss는 'Customer Obsession(고객 집착)'을 핵심 가치로 둡니다. 피드백 기반 개선 경험은 Toss의 인재상과 정확히 일치합니다.",
        },
        {
            id: 202,
            type: 'matching',
            targetText: '복잡한 전역 상태를 효율적으로 관리',
            comment: "송금/결제 등 복잡한 상태 관리가 필수적인 핀테크 도메인에서 매우 중요한 역량입니다.",
        }
    ],
    'Kakao': [
        {
            id: 301,
            type: 'matching',
            targetText: '사용자 경험을 중요시하는',
            comment: "Kakao는 '전 국민이 쓰는 쉬운 서비스'를 지향합니다. 기술보다 UX를 앞단에 두는 태도는 카카오의 철학에 부합합니다.",
        },
        {
            id: 302,
            type: 'improvement',
            targetText: 'Next.js를 도입하여 초기 로딩 속도를 50% 개선',
            comment: "카카오톡 내 웹뷰 환경에서의 성능 최적화 경험(Lighthouse 점수 등)을 덧붙인다면 더욱 강력한 어필이 될 것입니다.",
        }
    ],
    'Naver': [
        {
            id: 401,
            type: 'matching',
            targetText: 'SEO 점수를 90점대로 끌어올린 경험',
            comment: "검색 엔진(Naver)의 특성상 SEO와 웹 표준 준수 경험은 매우 높게 평가받는 항목입니다.",
        },
        {
            id: 402,
            type: 'matching',
            targetText: '대규모 트래픽 처리를 위한 백엔드와의 최적화 협업',
            comment: "네이버는 국내 최대 트래픽을 다룹니다. 비록 부족하다고 적으셨지만, 이 부분에 대한 관심과 학습 의지는 긍정적인 평가 요소입니다.",
        }
    ],
    'Line': [
        {
            id: 501,
            type: 'matching',
            targetText: 'React와 TypeScript를 주력으로 사용',
            comment: "LINE의 글로벌 프론트엔드 표준 스택과 일치합니다. 글로벌 서비스 고려 사항(i18n 등)을 경험해 본 적이 있다면 추가해 보세요.",
        }
    ],
    'Coupang': [
        {
            id: 601,
            type: 'matching',
            targetText: '서비스를 지속적으로 고도화',
            comment: "Coupang의 'Wow the Customer' 리더십 원칙과 맞닿아 있습니다. 데이터(A/B 테스트 등)에 기반한 의사결정 경험을 추가하면 완벽합니다.",
        }
    ],
    'Baemin': [
        {
            id: 701,
            type: 'matching',
            targetText: '재사용 가능한 컴포넌트 설계',
            comment: "우아한형제들은 디자인 시스템(Woowahan Design System)을 적극적으로 운영합니다. 컴포넌트 추상화 능력이 큰 강점입니다.",
        }
    ],
    'Karrot': [
        {
            id: 801,
            type: 'matching',
            targetText: 'Node.js와 AWS를 학습하며 인프라에 대한 이해도',
            comment: "당근마켓은 개발자가 주도적으로 서비스를 만드는 문화를 가집니다. 풀스택 역량과 인프라 이해도는 큰 가산점입니다.",
        }
    ]
};

interface DashboardViewProps {
    resumeTitle: string;
    resumeText?: string | null; // DB에서 가져온 이력서 텍스트 (work_experiences + project_experiences 또는 PDF 원본)
    resumeId?: number; // 이력서 ID (API 호출용)
    resumeKeywords: string[];
    sortedCompanies: any[];
    selectedCompany: any;
    setSelectedCompany: (c: any) => void;
    toggleFavorite: (e: any, id: number) => void;
    matchScore: number;
    onOpenReport: () => void;
}

interface AnalysisFeedback {
    id: string;
    type: 'strength' | 'improvement' | 'matching';
    targetText?: string;
    comment: string;
}

interface CompanyWithJobPosting {
    id: number;
    name: string;
    logo_url?: string;
    address?: string;
    jobPostings: Array<{
        id: number;
        title: string;
        description?: string;
        url?: string;
        isAnalyzed?: boolean; // 분석 완료 여부
    }>;
    isAllAnalyzed?: boolean; // 모든 채용공고가 분석 완료되었는지
}

export default function DashboardView({
    resumeTitle, resumeText, resumeId, resumeKeywords, sortedCompanies, selectedCompany, setSelectedCompany, toggleFavorite, matchScore, onOpenReport
}: DashboardViewProps) {
    const [activeFeedbackId, setActiveFeedbackId] = useState<string | null>(null);
    const [analysisData, setAnalysisData] = useState<{
        positive_feedback?: string;
        negative_feedback?: string;
        enhancements_feedback?: string;
        question?: string; // 면접 질문 (줄바꿈으로 구분된 문자열)
    } | null>(null);
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
    const [companiesWithJobs, setCompaniesWithJobs] = useState<CompanyWithJobPosting[]>([]);
    const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
    const [selectedJobPostingId, setSelectedJobPostingId] = useState<number | null>(null);
    const [companySearchQuery, setCompanySearchQuery] = useState('');
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [searchResults, setSearchResults] = useState<CompanyWithJobPosting[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    
    // ✅ [추가] 기술 스택 로고 매핑 상태
    const [techLogos, setTechLogos] = useState<Record<string, string>>({});

    // ✅ [추가] 컴포넌트 마운트 시 기술 스택 정보 가져오기
    useEffect(() => {
        const loadTechLogos = async () => {
            try {
                // trendService의 fetchAllTechStacks 사용 (백엔드 API 호출)
                const stacks = await fetchAllTechStacks();
                
                // 검색 효율을 위해 { "react": "logo_url", "typescript": "logo_url" } 형태의 맵 생성
                const logoMap: Record<string, string> = {};
                stacks.forEach(stack => {
                    if (stack.logo) {
                        // 대소문자 무시 매칭을 위해 소문자로 키 저장
                        logoMap[stack.name.toLowerCase()] = stack.logo;
                    }
                });
                
                setTechLogos(logoMap);
            } catch (error) {
                console.error("기술 스택 로고 로딩 실패:", error);
            }
        };

        loadTechLogos();
    }, []);

    // ✅ [추가] 즐겨찾기 기업 목록 및 채용공고 가져오기
    useEffect(() => {
        const loadFavoriteCompaniesWithJobs = async () => {
            setIsLoadingCompanies(true);
            try {
                // ✅ 분석된 채용공고 목록 가져오기 (현재 이력서 기준)
                let analyzedJobPostingIds = new Set<number>();
                if (resumeId) {
                    try {
                        const matchingsResponse = await api.get('/resumes/matchings/');
                        const matchings = matchingsResponse.data.results || matchingsResponse.data || [];
                        matchings.forEach((matching: any) => {
                            if (matching.resume === resumeId) {
                                analyzedJobPostingIds.add(matching.job_posting);
                            }
                        });
                    } catch (error) {
                        console.log('분석된 채용공고 목록 가져오기 실패:', error);
                    }
                }

                // 즐겨찾기 기업 목록 가져오기
                const bookmarksResponse = await api.get('/jobs/corp-bookmarks/');
                const bookmarks = bookmarksResponse.data.results || bookmarksResponse.data || [];
                
                // 즐겨찾기 기업 ID 수집
                const favoriteCorpIds = new Set(bookmarks.map((b: any) => b.corp.id));
                
                // ✅ 분석된 채용공고가 있는 기업 ID 찾기
                // 분석된 채용공고 ID를 가지고, 각 채용공고가 속한 기업을 찾기
                let analyzedCorpIds = new Set<number>();
                
                if (analyzedJobPostingIds.size > 0) {
                    // 분석된 채용공고가 있는 경우, 모든 기업 목록을 가져와서
                    // 각 기업의 채용공고를 확인하여 분석된 채용공고가 있는 기업을 찾기
                    try {
                        // 모든 기업 목록 가져오기 (빈 검색어로 전체 목록 조회)
                        const allCorpsResponse = await api.get('/jobs/corps/');
                        const allCorps = allCorpsResponse.data || [];
                        
                        // 각 기업의 채용공고를 확인하여 분석된 채용공고가 있는 기업 찾기
                        // 제한 없이 모든 기업 확인
                        const corpChecks = await Promise.all(
                            allCorps.map(async (corp: any) => {
                                try {
                                    // 모든 페이지의 채용공고 가져오기
                                    let jobPostings: any[] = [];
                                    let nextUrl: string | null = `/jobs/corps/${corp.id}/job-postings/`;
                                    
                                    while (nextUrl) {
                                        try {
                                            const jobsResponse: any = await api.get(nextUrl);
                                            let pageJobPostings: any[] = [];
                                            
                                            if (Array.isArray(jobsResponse.data)) {
                                                pageJobPostings = jobsResponse.data;
                                                nextUrl = null;
                                            } else if (jobsResponse.data?.results && Array.isArray(jobsResponse.data.results)) {
                                                pageJobPostings = jobsResponse.data.results;
                                                nextUrl = jobsResponse.data.next || null;
                                                if (nextUrl && !nextUrl.startsWith('http')) {
                                                    nextUrl = nextUrl.startsWith('/') ? nextUrl : `/${nextUrl}`;
                                                }
                                            } else {
                                                nextUrl = null;
                                            }
                                            
                                            jobPostings = [...jobPostings, ...pageJobPostings];
                                            
                                            // 분석된 채용공고를 찾으면 즉시 반환 (성능 최적화)
                                            if (pageJobPostings.some((job: any) => analyzedJobPostingIds.has(job.id))) {
                                                return corp.id;
                                            }
                                        } catch (error) {
                                            nextUrl = null;
                                        }
                                    }
                                    
                                    // 모든 페이지를 확인한 후 분석된 채용공고가 있는지 확인
                                    const hasAnalyzedJob = jobPostings.some((job: any) => analyzedJobPostingIds.has(job.id));
                                    return hasAnalyzedJob ? corp.id : null;
                                } catch (error) {
                                    return null;
                                }
                            })
                        );
                        
                        corpChecks.forEach((corpId) => {
                            if (corpId !== null) {
                                analyzedCorpIds.add(corpId);
                            }
                        });
                    } catch (error) {
                        console.log('모든 기업 목록 가져오기 실패:', error);
                    }
                }
                
                // ✅ 즐겨찾기 기업 + 분석된 채용공고가 있는 기업 모두 포함
                const allCorpIds = new Set([...Array.from(favoriteCorpIds), ...Array.from(analyzedCorpIds)]);
                
                if (allCorpIds.size === 0) {
                    setCompaniesWithJobs([]);
                    setIsLoadingCompanies(false);
                    return;
                }

                // ✅ 각 기업의 채용공고 가져오기
                const companiesData = await Promise.all(
                    Array.from(allCorpIds).map(async (corpId) => {
                        const corpIdNum = Number(corpId);
                        if (isNaN(corpIdNum)) return null;
                        try {
                            // 기업 정보 가져오기 (bookmark에서 가져온 정보 우선 사용)
                            let corp = bookmarks.find((b: any) => b.corp.id === corpIdNum)?.corp;
                            
                            // 기업 정보가 없으면 API로 가져오기
                            if (!corp) {
                                try {
                                    const corpResponse = await api.get(`/jobs/corps/${corpIdNum}/`);
                                    corp = corpResponse.data;
                                } catch (error) {
                                    console.error(`기업 ${corpIdNum} 정보 가져오기 실패:`, error);
                                    return null;
                                }
                            }
                            
                            // 채용공고 가져오기 (모든 페이지 가져오기)
                            let jobPostings: any[] = [];
                            let nextUrl: string | null = `/jobs/corps/${corpIdNum}/job-postings/`;
                            
                            // 페이지네이션 처리: 모든 페이지의 채용공고 가져오기
                            while (nextUrl) {
                                try {
                                    const jobsResponse: any = await api.get(nextUrl);
                                    let pageJobPostings: any[] = [];
                                    
                                    if (Array.isArray(jobsResponse.data)) {
                                        pageJobPostings = jobsResponse.data;
                                        nextUrl = null; // 배열이면 페이지네이션 없음
                                    } else if (jobsResponse.data?.results && Array.isArray(jobsResponse.data.results)) {
                                        pageJobPostings = jobsResponse.data.results;
                                        // 다음 페이지 URL 처리 (절대 URL이면 그대로, 상대 URL이면 BASE_URL 추가)
                                        nextUrl = jobsResponse.data.next || null;
                                        if (nextUrl && !nextUrl.startsWith('http')) {
                                            // 상대 URL인 경우 BASE_URL 추가
                                            nextUrl = nextUrl.startsWith('/') ? nextUrl : `/${nextUrl}`;
                                        }
                                    } else {
                                        nextUrl = null;
                                    }
                                    
                                    jobPostings = [...jobPostings, ...pageJobPostings];
                                } catch (error) {
                                    console.error(`기업 ${corpIdNum}의 채용공고 페이지 가져오기 실패:`, error);
                                    nextUrl = null;
                                }
                            }
                            
                            const analyzedJobs = jobPostings.map((job: any) => ({
                                id: job.id,
                                title: job.title,
                                description: job.description,
                                url: job.url,
                                isAnalyzed: analyzedJobPostingIds.has(job.id),
                            }));
                            
                            // 모든 채용공고가 분석 완료되었는지 확인
                            const isAllAnalyzed = analyzedJobs.length > 0 && analyzedJobs.every((job: any) => job.isAnalyzed);
                            
                            return {
                                id: corp.id,
                                name: corp.name,
                                logo_url: corp.logo_url,
                                address: corp.address,
                                jobPostings: analyzedJobs,
                                isAllAnalyzed,
                            };
                        } catch (error) {
                            console.error(`기업 ${corpIdNum}의 정보 가져오기 실패:`, error);
                            return null;
                        }
                    })
                );

                // null 제거 및 필터링
                // ✅ 분석된 채용공고가 있는 기업은 채용공고가 없어도 표시
                const validCompanies = companiesData.filter(c => {
                    if (c === null) return false;
                    // 분석된 채용공고가 있는 기업은 채용공고가 없어도 표시
                    const hasAnalyzedJob = c.jobPostings.some((job: any) => job.isAnalyzed);
                    return c.jobPostings.length > 0 || hasAnalyzedJob;
                }) as CompanyWithJobPosting[];
                
                // 분석된 채용공고가 있는 기업을 먼저, 그 다음 나머지 기업 표시
                const companiesWithAnalyzedJobs = validCompanies.filter(c => 
                    c.jobPostings.some((job: any) => job.isAnalyzed)
                );
                const companiesWithoutAnalyzedJobs = validCompanies.filter(c => 
                    !c.jobPostings.some((job: any) => job.isAnalyzed)
                );
                
                setCompaniesWithJobs([...companiesWithAnalyzedJobs, ...companiesWithoutAnalyzedJobs]);
            } catch (error) {
                console.error('기업 목록 가져오기 실패:', error);
                setCompaniesWithJobs([]);
            } finally {
                setIsLoadingCompanies(false);
            }
        };

        if (!isSearchMode) {
            loadFavoriteCompaniesWithJobs();
        }
    }, [isSearchMode, resumeId]);

    // ✅ [추가] 기업 검색 (부분 일치 검색 지원)
    useEffect(() => {
        const searchCompanies = async () => {
            // 검색어가 없으면 결과 초기화
            if (!companySearchQuery || !companySearchQuery.trim()) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                // ✅ 분석된 채용공고 목록 가져오기 (현재 이력서 기준)
                let analyzedJobPostingIds = new Set<number>();
                if (resumeId) {
                    try {
                        const matchingsResponse = await api.get('/resumes/matchings/');
                        const matchings = matchingsResponse.data.results || matchingsResponse.data || [];
                        matchings.forEach((matching: any) => {
                            if (matching.resume === resumeId) {
                                analyzedJobPostingIds.add(matching.job_posting);
                            }
                        });
                    } catch (error) {
                        console.log('분석된 채용공고 목록 가져오기 실패:', error);
                    }
                }

                // ✅ 백엔드 API: /api/v1/jobs/corps/?corp_name={query}
                // Corp 모델 (corp 테이블)에서 name__icontains로 부분 일치 검색 수행
                // is_deleted=False인 기업만 조회
                const searchUrl = `/jobs/corps/?corp_name=${encodeURIComponent(companySearchQuery.trim())}`;
                console.log('기업 검색 API 호출:', searchUrl);
                
                const response = await api.get(searchUrl);
                console.log('기업 검색 응답:', response.data);
                const corps = response.data || [];
                
                if (corps.length === 0) {
                    console.log('검색 결과 없음 - DB에 해당 기업이 없거나 채용공고가 없을 수 있습니다.');
                }

                // ✅ 각 기업의 채용공고 가져오기
                // 백엔드 API: /api/v1/jobs/corps/{corp_id}/job-postings/
                // JobPosting 모델 (job_posting 테이블)에서 해당 기업의 채용공고 조회
                const companiesData = await Promise.all(
                    corps.map(async (corp: any) => {
                        try {
                            // ✅ 모든 페이지의 채용공고 가져오기
                            let jobPostings: any[] = [];
                            let nextUrl: string | null = `/jobs/corps/${corp.id}/job-postings/`;
                            
                            while (nextUrl) {
                                try {
                                    const jobsResponse: any = await api.get(nextUrl);
                                    let pageJobPostings: any[] = [];
                                    
                                    if (Array.isArray(jobsResponse.data)) {
                                        pageJobPostings = jobsResponse.data;
                                        nextUrl = null;
                                    } else if (jobsResponse.data?.results && Array.isArray(jobsResponse.data.results)) {
                                        pageJobPostings = jobsResponse.data.results;
                                        nextUrl = jobsResponse.data.next || null;
                                        if (nextUrl && !nextUrl.startsWith('http')) {
                                            nextUrl = nextUrl.startsWith('/') ? nextUrl : `/${nextUrl}`;
                                        }
                                    } else {
                                        nextUrl = null;
                                    }
                                    
                                    jobPostings = [...jobPostings, ...pageJobPostings];
                                } catch (error) {
                                    console.error(`기업 ${corp.name}의 채용공고 페이지 가져오기 실패:`, error);
                                    nextUrl = null;
                                }
                            }
                            
                            const analyzedJobs = jobPostings.map((job: any) => ({
                                id: job.id,
                                title: job.title,
                                description: job.description,
                                url: job.url,
                                isAnalyzed: analyzedJobPostingIds.has(job.id), // 분석 여부 표시
                            }));
                            
                            // 모든 채용공고가 분석 완료되었는지 확인
                            const isAllAnalyzed = analyzedJobs.length > 0 && analyzedJobs.every((job: any) => job.isAnalyzed);
                            
                            return {
                                id: corp.id,
                                name: corp.name,
                                logo_url: corp.logo_url,
                                address: corp.address,
                                jobPostings: analyzedJobs,
                                isAllAnalyzed,
                            };
                        } catch (error) {
                            console.error(`기업 ${corp.name}의 채용공고 가져오기 실패:`, error);
                            return {
                                id: corp.id,
                                name: corp.name,
                                logo_url: corp.logo_url,
                                address: corp.address,
                                jobPostings: [],
                            };
                        }
                    })
                );

                // 채용공고가 있는 기업만 표시
                const companiesWithJobs = companiesData.filter(c => c.jobPostings.length > 0);
                console.log(`검색 결과: ${corps.length}개 기업 중 ${companiesWithJobs.length}개 기업에 채용공고가 있음`);
                setSearchResults(companiesWithJobs);
            } catch (error: any) {
                console.error('기업 검색 실패:', error);
                console.error('에러 상세:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                    url: error.config?.url,
                });
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        const debounceTimer = setTimeout(() => {
            if (isSearchMode) {
                searchCompanies();
            }
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [companySearchQuery, isSearchMode, resumeId]);

    // ✅ [추가] 채용공고의 분석 완료 상태 업데이트 함수
    const updateJobPostingAnalyzedStatus = useCallback((jobPostingId: number, isAnalyzed: boolean) => {
        // 즐겨찾기 기업 목록 업데이트
        setCompaniesWithJobs(prev => prev.map(company => {
            const updatedJobPostings = company.jobPostings.map(job => 
                job.id === jobPostingId ? { ...job, isAnalyzed } : job
            );
            // 모든 채용공고가 분석 완료되었는지 확인
            const isAllAnalyzed = updatedJobPostings.length > 0 && updatedJobPostings.every(job => job.isAnalyzed);
            return {
                ...company,
                jobPostings: updatedJobPostings,
                isAllAnalyzed,
            };
        }));
        
        // 검색 결과 업데이트
        setSearchResults(prev => prev.map(company => {
            const updatedJobPostings = company.jobPostings.map(job => 
                job.id === jobPostingId ? { ...job, isAnalyzed } : job
            );
            // 모든 채용공고가 분석 완료되었는지 확인
            const isAllAnalyzed = updatedJobPostings.length > 0 && updatedJobPostings.every(job => job.isAnalyzed);
            return {
                ...company,
                jobPostings: updatedJobPostings,
                isAllAnalyzed,
            };
        }));
    }, []);

    // ✅ [추가] 채용공고 선택 시 분석 데이터 가져오기
    useEffect(() => {
        const fetchAnalysis = async () => {
            if (!resumeId || !selectedJobPostingId) {
                setAnalysisData(null);
                setIsLoadingAnalysis(false);
                return;
            }

            // ✅ 새로운 채용공고 선택 시 즉시 로딩 상태로 전환
            setAnalysisData(null);
            setIsLoadingAnalysis(true);

            try {
                // 먼저 기존 매칭 데이터가 있는지 확인 (GET)
                try {
                    const matchingsResponse = await api.get('/resumes/matchings/');
                    const matchings = matchingsResponse.data.results || matchingsResponse.data || [];
                    const existingMatching = matchings.find((m: any) => 
                        m.resume === resumeId && m.job_posting === selectedJobPostingId
                    );

                    if (existingMatching) {
                        setAnalysisData({
                            positive_feedback: existingMatching.positive_feedback,
                            negative_feedback: existingMatching.negative_feedback,
                            enhancements_feedback: existingMatching.enhancements_feedback,
                            question: existingMatching.question,
                        });
                        setIsLoadingAnalysis(false);
                        
                        // ✅ 분석 완료 표시 업데이트
                        updateJobPostingAnalyzedStatus(selectedJobPostingId, true);
                        return;
                    }
                } catch (error) {
                    console.log('기존 매칭 데이터 조회 실패, 새로 생성합니다:', error);
                }

                // 기존 데이터가 없으면 새로 생성 (POST)
                const response = await api.post(`/resumes/${resumeId}/match/${selectedJobPostingId}/`);
                setAnalysisData({
                    positive_feedback: response.data.positive_feedback,
                    negative_feedback: response.data.negative_feedback,
                    enhancements_feedback: response.data.enhancements_feedback,
                    question: response.data.question,
                });
                
                // ✅ 분석 완료 표시 업데이트
                updateJobPostingAnalyzedStatus(selectedJobPostingId, true);
            } catch (error) {
                console.error('분석 데이터 가져오기 실패:', error);
                setAnalysisData(null);
            } finally {
                setIsLoadingAnalysis(false);
            }
        };

        fetchAnalysis();
    }, [resumeId, selectedJobPostingId]);

    // 분석 데이터를 피드백 형식으로 변환
    const currentFeedbacks = useMemo((): AnalysisFeedback[] => {
        if (!analysisData) return [];

        const feedbacks: AnalysisFeedback[] = [];

        if (analysisData.positive_feedback) {
            feedbacks.push({
                id: 'positive',
                type: 'strength',
                comment: analysisData.positive_feedback,
            });
        }

        if (analysisData.negative_feedback) {
            feedbacks.push({
                id: 'negative',
                type: 'improvement',
                comment: analysisData.negative_feedback,
            });
        }

        if (analysisData.enhancements_feedback) {
            feedbacks.push({
                id: 'enhancements',
                type: 'improvement',
                comment: analysisData.enhancements_feedback,
            });
        }

        return feedbacks;
    }, [analysisData]);

    const getHighlightStyle = (type: string, isActive: boolean) => {
        switch (type) {
            case 'strength':
                return isActive 
                    ? 'bg-blue-500/30 text-blue-200 underline decoration-blue-500 decoration-2' 
                    : 'text-blue-400 underline decoration-blue-500/50 decoration-2 hover:bg-blue-500/20';
            case 'matching':
                return isActive 
                    ? 'bg-green-500/30 text-green-200 underline decoration-green-500 decoration-2' 
                    : 'text-green-400 underline decoration-green-500/50 decoration-2 hover:bg-green-500/20';
            case 'improvement':
                return isActive 
                    ? 'bg-orange-500/30 text-orange-200 underline decoration-orange-500 decoration-2' 
                    : 'text-orange-400 underline decoration-orange-500/50 decoration-2 hover:bg-orange-500/20';
            default: return '';
        }
    };

    const renderHighlightedText = (text: string) => {
        let parts: Array<{ text: string; type: string; id: string }> = [{ text, type: 'normal', id: '0' }];

        currentFeedbacks.forEach((fb) => {
            const newParts: Array<{ text: string; type: string; id: string }> = [];
            parts.forEach((part) => {
                if (part.type !== 'normal') {
                    newParts.push(part);
                    return;
                }
                if (fb.targetText) {
                    const split = part.text.split(fb.targetText);
                    if (split.length > 1) {
                        newParts.push({ text: split[0], type: 'normal', id: '0' });
                        newParts.push({ text: fb.targetText, type: fb.type, id: fb.id });
                        newParts.push({ text: split[1], type: 'normal', id: '0' });
                    } else {
                        newParts.push(part);
                    }
                } else {
                    newParts.push(part);
                }
            });
            parts = newParts;
        });

        return (
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-base">
                {parts.map((part, idx) => (
                    part.type === 'normal' ? (
                        <span key={idx}>{part.text}</span>
                    ) : (
                        <span 
                            key={idx}
                            className={`relative font-bold cursor-pointer transition-all px-0.5 rounded ${getHighlightStyle(part.type, activeFeedbackId === part.id)}`}
                            onMouseEnter={() => setActiveFeedbackId(part.id)}
                            onMouseLeave={() => setActiveFeedbackId(null)}
                        >
                            {part.text}
                        </span>
                    )
                ))}
            </p>
        );
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start"
        >
            {/* ================= LEFT COLUMN (3/12) ================= */}
            <div className="lg:col-span-3 flex flex-col gap-6 min-h-[800px] max-h-[calc(100vh-8rem)]">
                
                {/* 1. 기업 목록 */}
                <section className="flex-1 bg-[#212226] border border-white/5 rounded-[24px] p-5 flex flex-col overflow-hidden min-h-0 max-h-[600px]">
                    <div className="flex items-center justify-between mb-4 flex-shrink-0">
                        <h3 className="text-sm font-bold text-gray-400 flex items-center gap-2 uppercase tracking-wider">
                            <Briefcase size={14} /> {isSearchMode ? '기업 검색' : '즐겨찾기 기업'}
                        </h3>
                        <button
                            onClick={() => {
                                setIsSearchMode(!isSearchMode);
                                setCompanySearchQuery('');
                                setSearchResults([]);
                            }}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            {isSearchMode ? '즐겨찾기' : '검색'}
                        </button>
                    </div>

                    {/* 검색 입력창 */}
                    {isSearchMode && (
                        <div className="relative mb-4 flex-shrink-0">
                            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={companySearchQuery}
                                onChange={(e) => setCompanySearchQuery(e.target.value)}
                                placeholder="기업명 검색"
                                className="w-full pl-10 pr-10 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                            />
                            {companySearchQuery && (
                                <button
                                    onClick={() => setCompanySearchQuery('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 min-h-0">
                        {isSearchMode ? (
                            // 검색 모드
                            isSearching ? (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                                </div>
                            ) : searchResults.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-gray-500 text-xs">
                                    {companySearchQuery.trim() ? '검색 결과가 없습니다.' : '기업명을 입력해주세요.'}
                                </div>
                            ) : (
                                searchResults.map((company) => (
                                    <div key={company.id} className="space-y-1">
                                        {/* 기업 정보 */}
                                        <div 
                                            onClick={() => {
                                                // 첫 번째 채용공고를 자동 선택
                                                if (company.jobPostings.length > 0) {
                                                    const firstJob = company.jobPostings[0];
                                                    setSelectedJobPostingId(firstJob.id);
                                                    setSelectedCompany({
                                                        ...company,
                                                        jobPostingId: firstJob.id,
                                                        jobPostingTitle: firstJob.title,
                                                    });
                                                }
                                            }}
                                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 select-none ${
                                                selectedCompany?.id === company.id ? 'bg-green-600/20 border-green-500/50' : 'bg-white/5 border-transparent hover:bg-white/10'
                                            }`}
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center shrink-0">
                                                {company.logo_url ? (
                                                    <img src={company.logo_url} alt={company.name} className="w-full h-full object-contain" />
                                                ) : (
                                                    <span className="text-xs text-gray-400">{company.name.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className={`text-sm font-bold truncate ${selectedCompany?.id === company.id ? 'text-green-100' : 'text-gray-300'}`}>
                                                    {company.name}
                                                </h4>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {company.jobPostings.length}개 채용공고
                                                    </p>
                                                    {/* 모든 채용공고가 분석 완료된 경우 표시 */}
                                                    {company.isAllAnalyzed && (
                                                        <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded border border-green-500/30 shrink-0">
                                                            전체 분석완료
                                                        </span>
                                                    )}
                                                    {/* 채용공고가 1개이고 분석 완료된 경우 표시 (isAllAnalyzed가 없을 때 대비) */}
                                                    {!company.isAllAnalyzed && company.jobPostings.length === 1 && company.jobPostings[0].isAnalyzed && (
                                                        <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded border border-green-500/30 shrink-0">
                                                            분석완료
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* 채용공고 목록 (선택된 기업만 표시) */}
                                        {(selectedCompany?.id === company.id || company.jobPostings.some((job: any) => job.id === selectedJobPostingId)) && company.jobPostings.length > 1 && (
                                            <div className="ml-4 space-y-1">
                                                {company.jobPostings.map((job: any) => (
                                                    <div
                                                        key={job.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedJobPostingId(job.id);
                                                            setSelectedCompany({
                                                                ...company,
                                                                jobPostingId: job.id,
                                                                jobPostingTitle: job.title,
                                                            });
                                                        }}
                                                        className={`p-2 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between gap-2 ${
                                                            selectedJobPostingId === job.id
                                                                ? 'bg-blue-600/20 border-blue-500/50 text-blue-100'
                                                                : 'bg-white/5 border-transparent hover:bg-white/10 text-gray-400'
                                                        }`}
                                                    >
                                                        <p className="truncate flex-1">{job.title}</p>
                                                        {job.isAnalyzed && (
                                                            <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded border border-green-500/30 shrink-0">
                                                                분석완료
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )
                        ) : (
                            // 즐겨찾기 모드
                            isLoadingCompanies ? (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                                </div>
                            ) : companiesWithJobs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500 text-xs gap-2">
                                    <Info size={24} />
                                    <span>즐겨찾기한 기업이 없습니다.</span>
                                    <span className="text-[10px] text-gray-600">검색 버튼을 눌러 기업을 찾아보세요.</span>
                                </div>
                            ) : (
                                companiesWithJobs.map((company) => (
                                    <div key={company.id} className="space-y-1">
                                        {/* 기업 정보 */}
                                        <div 
                                        onClick={() => {
                                            // 첫 번째 채용공고를 자동 선택
                                            if (company.jobPostings.length > 0) {
                                                const firstJob = company.jobPostings[0];
                                                setSelectedJobPostingId(firstJob.id);
                                                setSelectedCompany({
                                                    ...company,
                                                    jobPostingId: firstJob.id,
                                                    jobPostingTitle: firstJob.title,
                                                });
                                            }
                                        }}
                                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 select-none ${
                                            selectedCompany?.id === company.id ? 'bg-green-600/20 border-green-500/50' : 'bg-white/5 border-transparent hover:bg-white/10'
                                        }`}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center shrink-0">
                                            {company.logo_url ? (
                                                <img src={company.logo_url} alt={company.name} className="w-full h-full object-contain" />
                                            ) : (
                                                <span className="text-xs text-gray-400">{company.name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className={`text-sm font-bold truncate ${selectedCompany?.id === company.id ? 'text-green-100' : 'text-gray-300'}`}>
                                                {company.name}
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs text-gray-500 truncate">
                                                    {company.jobPostings.length}개 채용공고
                                                </p>
                                                {/* 모든 채용공고가 분석 완료된 경우 표시 */}
                                                {company.isAllAnalyzed && (
                                                    <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded border border-green-500/30 shrink-0">
                                                        전체 분석완료
                                                    </span>
                                                )}
                                                {/* 채용공고가 1개이고 분석 완료된 경우 표시 (isAllAnalyzed가 없을 때 대비) */}
                                                {!company.isAllAnalyzed && company.jobPostings.length === 1 && company.jobPostings[0].isAnalyzed && (
                                                    <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded border border-green-500/30 shrink-0">
                                                        분석완료
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* 채용공고 목록 (선택된 기업만 표시) */}
                                    {(selectedCompany?.id === company.id || company.jobPostings.some((job: any) => job.id === selectedJobPostingId)) && company.jobPostings.length > 1 && (
                                        <div className="ml-4 space-y-1">
                                            {company.jobPostings.map((job: any) => (
                                                <div
                                                    key={job.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedJobPostingId(job.id);
                                                        setSelectedCompany({
                                                            ...company,
                                                            jobPostingId: job.id,
                                                            jobPostingTitle: job.title,
                                                        });
                                                    }}
                                                    className={`p-2 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between gap-2 ${
                                                        selectedJobPostingId === job.id
                                                            ? 'bg-blue-600/20 border-blue-500/50 text-blue-100'
                                                            : 'bg-white/5 border-transparent hover:bg-white/10 text-gray-400'
                                                    }`}
                                                >
                                                    <p className="truncate flex-1">{job.title}</p>
                                                    {job.isAnalyzed && (
                                                        <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded border border-green-500/30 shrink-0">
                                                            분석완료
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    </div>
                                ))
                            )
                        )}
                    </div>
                </section>

                {/* 2. 내 키워드 (My Tech Stack) - ✅ 로고 이미지 추가됨 */}
                <section className="h-[250px] bg-[#212226] border border-white/5 rounded-[24px] p-5 flex flex-col">
                    <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
                        <Hash size={14} /> My Tech Stack
                    </h3>
                    <div className="flex flex-wrap gap-2 content-start overflow-y-auto custom-scrollbar">
                        {resumeKeywords.map((k, i) => {
                            // 소문자로 변환하여 매핑된 로고 찾기
                            const logoUrl = techLogos[k.toLowerCase()];
                            return (
                                <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-gray-300 flex items-center gap-2 transition-colors hover:bg-white/10">
                                    {/* 로고가 있으면 이미지 표시, 없으면 텍스트만 */}
                                    {logoUrl && (
                                        <img 
                                            src={logoUrl} 
                                            alt={k} 
                                            className="w-4 h-4 object-contain"
                                            onError={(e) => { e.currentTarget.style.display = 'none'; }} // 이미지 로드 실패 시 숨김
                                        />
                                    )}
                                    {k}
                                </span>
                            );
                        })}
                    </div>
                </section>
            </div>

            {/* ================= CENTER COLUMN (6/12) ================= */}
            <div className="lg:col-span-6 flex flex-col gap-6 min-h-[800px]">
                
                {/* 3. 이력서 뷰어 */}
                <section className="flex-[2] bg-[#212226] border border-white/5 rounded-[24px] p-8 flex flex-col relative overflow-hidden group min-h-[400px] max-h-[500px]">
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${selectedCompany ? 'from-blue-500 via-green-500 to-orange-500' : 'from-blue-500 to-orange-500'} opacity-50`} />
                    
                    <div className="flex justify-between items-center mb-6 flex-shrink-0">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <FileText size={18} className="text-blue-400" /> 
                            {resumeTitle}
                        </h3>
                        <div className="flex gap-3 text-xs font-bold">
                             <span className="flex items-center gap-1.5 text-blue-400"><span className="w-2 h-2 rounded-full bg-blue-500"></span> 강점</span>
                             <span className="flex items-center gap-1.5 text-orange-400"><span className="w-2 h-2 rounded-full bg-orange-500"></span> 보완점</span>
                             {selectedCompany && (
                                 <motion.span 
                                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center gap-1.5 text-green-400"
                                 >
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span> 기업 적합
                                 </motion.span>
                             )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#1A1B1E] rounded-xl p-6 border border-white/5 shadow-inner min-h-0">
                        {resumeText ? (
                            renderHighlightedText(resumeText)
                        ) : (
                            <div className="text-gray-400 text-sm text-center py-8">
                                이력서 텍스트를 불러오는 중이거나 텍스트가 없습니다.
                            </div>
                        )}
                    </div>
                </section>

                {/* 4. AI 면접 질문 */}
                <section className="flex-1 bg-[#212226] border border-white/5 rounded-[24px] p-6 flex flex-col overflow-hidden min-h-[300px] max-h-[400px]">
                    <h3 className="text-sm font-bold text-purple-400 mb-4 flex items-center gap-2 uppercase tracking-wider flex-shrink-0">
                        <HelpCircle size={16} /> AI Interview Questions
                    </h3>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 min-h-0">
                        {(() => {
                            // ✅ DB에서 가져온 질문 파싱
                            if (analysisData?.question) {
                                // question 필드는 "- 질문1\n- 질문2\n..." 형식으로 저장됨
                                const questions = analysisData.question
                                    .split('\n')
                                    .map(q => q.trim())
                                    .filter(q => q.length > 0 && q.startsWith('-'))
                                    .map(q => q.substring(1).trim()); // "- " 제거
                                
                                if (questions.length > 0) {
                                    return questions.map((question, index) => (
                                        <div 
                                            key={index}
                                            className="bg-purple-500/5 border border-purple-500/10 p-4 rounded-xl flex gap-3 hover:bg-purple-500/10 transition-colors"
                                        >
                                            <span className="flex items-center justify-center w-5 h-5 rounded bg-purple-500/20 text-purple-400 text-xs font-bold shrink-0">
                                                Q{index + 1}
                                            </span>
                                            <p className="text-gray-200 text-sm font-medium">
                                                {question}
                                            </p>
                                        </div>
                                    ));
                                }
                            }
                            
                            // 질문이 없을 때 기본 메시지
                            return (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
                                    <Info size={24} />
                                    <span className="text-xs">
                                        {selectedJobPostingId 
                                            ? '채용공고를 선택하면 AI 면접 질문이 생성됩니다.' 
                                            : '채용공고를 선택하면 AI 면접 질문이 표시됩니다.'}
                                    </span>
                                </div>
                            );
                        })()}
                    </div>
                </section>
            </div>

            {/* ================= RIGHT COLUMN (3/12) ================= */}
            <div className="lg:col-span-3 flex flex-col gap-6 min-h-[800px]">
                
                {/* 5. 상세 피드백 리스트 */}
                <section className="flex-1 bg-[#212226] border border-white/5 rounded-[24px] p-5 flex flex-col overflow-hidden max-h-[700px]">
                    <div className="flex justify-between items-center mb-4 flex-shrink-0">
                        <h3 className="text-sm font-bold text-gray-400 flex items-center gap-2 uppercase tracking-wider">
                            <CheckCircle2 size={14} /> Analysis Details
                        </h3>
                        {selectedCompany && (
                            <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
                                {selectedCompany.name || selectedCompany.jobPostingTitle} Fit
                            </span>
                        )}
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1 min-h-0">
                        {isLoadingAnalysis ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                                <span className="text-sm font-medium">분석 중입니다...</span>
                                <span className="text-xs text-gray-600">이력서와 채용공고를 분석하고 있습니다.</span>
                            </div>
                        ) : currentFeedbacks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
                                <Info size={24} />
                                <span className="text-xs">분석 데이터가 없습니다.</span>
                            </div>
                        ) : (
                            <>
                                {currentFeedbacks.map((fb) => (
                            <div 
                                key={fb.id}
                                onMouseEnter={() => setActiveFeedbackId(fb.id)}
                                onMouseLeave={() => setActiveFeedbackId(null)}
                                className={`p-4 rounded-xl border transition-all cursor-pointer relative select-none ${
                                    fb.type === 'strength' 
                                        ? (activeFeedbackId === fb.id ? 'bg-blue-500/10 border-blue-500/50' : 'bg-blue-500/5 border-blue-500/10')
                                    : fb.type === 'matching'
                                        ? (activeFeedbackId === fb.id ? 'bg-green-500/10 border-green-500/50 ring-1 ring-green-500/30' : 'bg-green-500/5 border-green-500/10')
                                    : (activeFeedbackId === fb.id ? 'bg-orange-500/10 border-orange-500/50' : 'bg-orange-500/5 border-orange-500/10')
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    {fb.type === 'strength' && <TrendingUp size={14} className="text-blue-400" />}
                                    {fb.type === 'matching' && <CheckCircle2 size={14} className="text-green-400" />}
                                    {fb.type === 'improvement' && <AlertCircle size={14} className="text-orange-400" />}
                                    
                                    <span className={`text-xs font-bold uppercase ${
                                        fb.type === 'strength' ? 'text-blue-400' : 
                                        fb.type === 'matching' ? 'text-green-400' : 'text-orange-400'
                                    }`}>
                                        {fb.type === 'strength' ? 'Strength' : 
                                         fb.type === 'matching' ? 'Company Fit' : 'Suggestion'}
                                    </span>
                                </div>
                                
                                {fb.type === 'matching' && (
                                    <div className="mb-2 text-[10px] text-green-300 bg-green-900/30 px-2 py-1 rounded inline-block">
                                        🎯 기업 가치관 / 프로젝트 매칭
                                    </div>
                                )}

                                <p className="text-xs text-gray-500 mb-2 line-clamp-1 italic">"{fb.targetText}"</p>
                                <p className="text-sm text-gray-200 leading-snug font-medium">
                                    {fb.comment}
                                </p>
                            </div>
                                ))}
                            </>
                        )}
                    </div>
                </section>

                {/* 6. 통합 리포트 버튼 */}
                <button 
                    onClick={onOpenReport}
                    className="h-20 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-[24px] flex items-center justify-center gap-4 shadow-xl shadow-blue-900/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] group"
                >
                    <div className="bg-white/10 p-2.5 rounded-xl group-hover:bg-white/20 transition-colors">
                        <FileText size={24} className="text-white" />
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-lg leading-none">통합 리포트 확인</p>
                        <p className="text-xs text-blue-200 mt-1 opacity-80">상세 분석 및 PDF 저장</p>
                    </div>
                    <ChevronRight size={20} className="text-white/50 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </motion.div>
    );
}