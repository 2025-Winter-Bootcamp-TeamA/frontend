'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { Search, Briefcase, Star, TrendingUp, RefreshCw } from 'lucide-react';
import JobCard from './JobCard';
import { api } from "@/lib/api";
import { getAuthTokens } from "@/lib/auth"; 

interface JobPostingData {
    id: number;
    company_name: string;
    title: string;
    url: string;
    deadline: string | null; 
    logo_url?: string; 
}

interface JobSectionProps {
    techStackId: number;   
    techStackName: string; 
}

// 디바운스 훅
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
      const handler = setTimeout(() => setDebouncedValue(value), delay);
      return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export default function JobSection({ techStackId, techStackName }: JobSectionProps) {
    const router = useRouter();
    
    // 현재 화면에 보여줄 공고 리스트
    const [jobs, setJobs] = useState<JobPostingData[]>([]);
    
    // 원래 보여주던(추천/즐겨찾기/기술) 공고 리스트 (검색어 지웠을 때 복구용)
    const [initialJobs, setInitialJobs] = useState<JobPostingData[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 300); 
    
    const [mode, setMode] = useState<"bookmark" | "recommend" | "tech" | "search">("recommend");
    const [prevMode, setPrevMode] = useState<"bookmark" | "recommend" | "tech">("recommend"); 

    const handleMoreClick = () => {
        router.push('/map');
    };

    // 1. 초기 데이터 로드 (추천 / 즐겨찾기 / 기술별 공고)
    useEffect(() => {
        let isMounted = true;

        const fetchInitialJobs = async () => {
            setLoading(true);
            setSearchQuery(""); // 모드 변경 시 검색어 초기화
            
            try {
                let fetchedJobs: any[] = [];
                let currentMode: "bookmark" | "recommend" | "tech" = "recommend";

                // ----------------------------------------------------------------
                // [충돌 해결 1] 로직 병합
                // 1. 특정 기술 스택을 선택했을 때 -> 내 코드(HEAD) 사용
                // 2. 대시보드(0)일 때 -> 팀원 코드(Main)의 "기술+기업 즐겨찾기 병합" 로직 사용
                // ----------------------------------------------------------------
                
                if (techStackId !== 0) {
                    // [CASE 1] 특정 기술 스택 관련 공고
                    if(isMounted) {
                        currentMode = "tech";
                        setMode("tech");
                        setPrevMode("tech");
                    }
                    try {
                        const response = await api.get(`/jobs/by-tech/${techStackId}/`);
                        fetchedJobs = Array.isArray(response.data) ? response.data : response.data.results || [];
                    } catch (error) {
                        console.error(`기술 ID ${techStackId} 공고 로딩 실패:`, error);
                    }
                } else {
                    // [CASE 2] 대시보드 (팀원 코드 적용 - 즐겨찾기 기술 + 즐겨찾기 기업)
                    try {
                        const { accessToken } = getAuthTokens();
                        let allJobs: any[] = []; // 팀원 로직을 위한 임시 배열

                        if (accessToken) {
                            // 1) 즐겨찾기 기술의 채용공고
                            const techBookmarksRes = await api.get('/trends/tech-bookmarks/').catch(() => ({ data: [] }));
                            const techBookmarks = Array.isArray(techBookmarksRes.data) 
                                ? techBookmarksRes.data 
                                : techBookmarksRes.data?.results || [];
                            
                            const techIds = techBookmarks.map((b: any) => b.tech_stack?.id ?? b.tech_stack_id).filter(Boolean);
                            
                            const techPromises = techIds.map((tid: number) =>
                                api.get(`/jobs/by-tech/${tid}/`).then(res => Array.isArray(res.data) ? res.data : res.data?.results || []).catch(() => [])
                            );
                            const techJobArrays = await Promise.all(techPromises);
                            techJobArrays.forEach(arr => { allJobs = [...allJobs, ...arr]; });

                            // 2) 즐겨찾기 기업의 채용공고
                            const corpBookmarksRes = await api.get('/jobs/corp-bookmarks/').catch(() => ({ data: { results: [] } }));
                            const corpBookmarks = corpBookmarksRes.data?.results || corpBookmarksRes.data || [];
                            
                            const corpPromises = (corpBookmarks as any[]).map((b: any) => {
                                const corpId = b.corp?.id ?? b.corp_id;
                                if (!corpId) return Promise.resolve([]);
                                return api.get(`/jobs/corps/${corpId}/job-postings/`)
                                    .then(res => Array.isArray(res.data) ? res.data : res.data?.results || [])
                                    .catch(() => []);
                            });
                            const corpJobArrays = await Promise.all(corpPromises);
                            corpJobArrays.forEach(arr => { allJobs = [...allJobs, ...arr]; });

                            fetchedJobs = allJobs;
                        }

                        // 즐겨찾기가 하나도 없으면 추천 공고 로드
                        if (fetchedJobs.length > 0) {
                             if(isMounted) {
                                currentMode = "bookmark";
                                setMode("bookmark");
                                setPrevMode("bookmark");
                            }
                        } else {
                            if(isMounted) {
                                currentMode = "recommend";
                                setMode("recommend");
                                setPrevMode("recommend");
                            }
                            const corpsResponse = await api.get('/jobs/corps/');
                            const corpsList = Array.isArray(corpsResponse.data) ? corpsResponse.data : corpsResponse.data.results || [];
                            
                            // 상위 5개 기업의 공고만 가져옴 (추천)
                            const targetCorps = corpsList.slice(0, 5);
                            const corpJobPromises = targetCorps.map((corp: any) => 
                                api.get(`/jobs/corps/${corp.id}/job-postings/`)
                                    .then(res => Array.isArray(res.data) ? res.data : res.data.results || [])
                                    .catch(() => [])
                            );

                            const corpJobsResults = await Promise.all(corpJobPromises);
                            fetchedJobs = corpJobsResults.flat();
                        }
                    } catch (err) {
                        console.error("공고 수집 중 오류:", err);
                    }
                }

                if (isMounted) {
                    const formattedJobs = formatJobs(fetchedJobs);
                    setJobs(formattedJobs);
                    setInitialJobs(formattedJobs); 
                }

            } catch (error) {
                console.error("JobSection Fatal Error:", error);
                if (isMounted) setJobs([]);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchInitialJobs();

        return () => {
            isMounted = false;
        };
    }, [techStackId]); 

    // 2. 검색어 변경 감지 및 전체 검색 실행 (우회 로직 적용)
    useEffect(() => {
        const performSearch = async () => {
            // 검색어가 비어있으면 초기 상태로 복구
            if (!debouncedSearchQuery.trim()) {
                if (mode === "search") {
                    setMode(prevMode);
                    setJobs(initialJobs);
                }
                return;
            }

            setLoading(true);
            setMode("search"); 

            try {
                // ✅ [수정] 백엔드에 전체 공고 API가 없으므로 프론트엔드에서 직접 찾기
                // 1. 전체 기업 목록 가져오기 (page_size를 크게 설정)
                const corpsResponse = await api.get('/jobs/corps/', { params: { page_size: 1000 } });
                const corpsList = Array.isArray(corpsResponse.data) ? corpsResponse.data : corpsResponse.data.results || [];

                // 2. 검색어에 맞는 기업 필터링 (기업명 검색)
                const searchLower = debouncedSearchQuery.toLowerCase();
                const matchedCorps = corpsList.filter((c: any) => c.name.toLowerCase().includes(searchLower));

                // 3. 해당 기업들의 공고 가져오기 (병렬 호출)
                if (matchedCorps.length > 0) {
                    const promises = matchedCorps.map((corp: any) => 
                        api.get(`/jobs/corps/${corp.id}/job-postings/`)
                           .then(res => Array.isArray(res.data) ? res.data : res.data.results || [])
                           .catch(() => [])
                    );
                    
                    const results = await Promise.all(promises);
                    const allFoundJobs = results.flat();
                    setJobs(formatJobs(allFoundJobs));
                } else {
                    setJobs([]);
                }

            } catch (error) {
                console.error("전체 검색 실패:", error);
                setJobs([]);
            } finally {
                setLoading(false);
            }
        };

        performSearch();
    }, [debouncedSearchQuery, initialJobs, prevMode]);


    // 데이터 포맷팅 유틸리티
    const formatJobs = (rawJobs: any[]): JobPostingData[] => {
        const uniqueJobsMap = new Map();
        rawJobs.forEach((item: any) => {
            if (item && item.id && !uniqueJobsMap.has(item.id)) {
                uniqueJobsMap.set(item.id, {
                    id: item.id,
                    company_name: item.corp?.name || "기업명 확인 불가",
                    title: item.title,
                    url: item.url,
                    deadline: item.expiry_date || null, 
                    logo_url: item.corp?.logo_url 
                });
            }
        });
        
        return Array.from(uniqueJobsMap.values()).sort((a: any, b: any) => {
            if (a.deadline && !b.deadline) return -1;
            if (!a.deadline && b.deadline) return 1;
            return b.id - a.id;
        }) as JobPostingData[];
    };

    const renderHeader = () => {
        if (mode === "search") {
            return (
                <h1 className="font-bold text-white flex items-center gap-2 truncate text-xl lg:text-2xl">
                    <Search className="text-white" size={24} />
                    '{debouncedSearchQuery}' 검색 결과 ({jobs.length})
                </h1>
            );
        } else if (mode === "bookmark") {
            return (
                <h1 className="font-bold text-white flex items-center gap-2 truncate text-xl lg:text-2xl">
                    <Star className="text-yellow-400 fill-yellow-400" size={24} />
                    즐겨찾기 공고
                </h1>
            );
        } else if (mode === "tech") {
            return (
                <h1 className="font-bold text-white flex items-center gap-2 truncate text-xl lg:text-2xl">
                    <Briefcase className="text-blue-400" size={24} />
                    {techStackName} 관련 공고
                </h1>
            );
        } else {
            return (
                <h1 className="font-bold text-white flex items-center gap-2 truncate text-xl lg:text-2xl">
                    <TrendingUp className="text-red-400" size={24} />
                    추천 채용 공고
                </h1>
            );
        }
    };

    return (
        <section className="w-full h-full flex flex-col bg-[#25262B] rounded-[32px] border border-white/5 overflow-hidden relative shadow-lg">
            <div className="p-5 border-b border-white/5 flex flex-col gap-4 bg-[#2C2E33]/50 flex-shrink-0">
                <div className="flex justify-between items-center">
                    {/* [충돌 해결 2] 내 코드(renderHeader) 유지 - 아이콘/상태별 제목 표시 */}
                    {renderHeader()}
                    <span 
                        onClick={handleMoreClick}
                        className="text-sm text-gray-500 cursor-pointer hover:text-blue-400 transition-colors whitespace-nowrap"
                    >
                        더보기
                    </span>
                </div>

                <div className="relative w-full group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors" size={16} />
                    {/* [충돌 해결 3] 팀원 코드(input attributes) 적용 - autoComplete 등 속성 개선 */}
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoComplete="off"
                        spellCheck={false}
                        autoCorrect="off"
                        autoCapitalize="off"
                        placeholder="기업명, 공고 제목으로 검색..."
                        className="w-full h-14 bg-[#1A1B1E] border border-white/10 rounded-xl pl-9 pr-4 text-xm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors shadow-inner"
                    />
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-[#1e1f23]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm gap-2">
                        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                        <p>공고를 불러오는 중...</p>
                    </div>
                ) : jobs.length > 0 ? (
                    jobs.map((job) => (
                        <JobCard
                            key={job.id}
                            id={job.id}
                            company={job.company_name}
                            position={job.title}
                            logo={job.logo_url}
                            deadline={job.deadline}
                            url={job.url}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm py-10 gap-3 opacity-60">
                        <Briefcase size={40} strokeWidth={1.5} className="text-gray-600" />
                        <p className="text-center">
                            {mode === "search"
                                ? `'${searchQuery}' 검색 결과가 없습니다.`
                                : mode === "tech" 
                                    ? `'${techStackName}' 관련 공고가 없습니다.` 
                                    : "등록된 채용 공고가 없습니다."}
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}