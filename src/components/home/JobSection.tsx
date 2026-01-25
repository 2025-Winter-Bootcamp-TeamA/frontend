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

                if (techStackId !== 0) {
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
                    const { accessToken } = getAuthTokens();
                    let bookmarksFound = false;

                    if (accessToken) {
                        try {
                            const bookmarksResponse = await api.get('/jobs/corp-bookmarks/');
                            const bookmarks = bookmarksResponse.data.results || bookmarksResponse.data || [];
                            
                            if (bookmarks.length > 0) {
                                const promises = bookmarks.map((bookmark: any) => {
                                    const corpId = bookmark.corp?.id || bookmark.corp_id || (typeof bookmark.corp === 'number' ? bookmark.corp : null);
                                    if (!corpId) return Promise.resolve([]);
                                    
                                    return api.get(`/jobs/corps/${corpId}/job-postings/`)
                                        .then(res => (Array.isArray(res.data) ? res.data : res.data.results || []))
                                        .catch(() => []);
                                });
                                
                                const results = await Promise.all(promises);
                                const bookmarkJobs = results.flat();
                                
                                if (bookmarkJobs.length > 0) {
                                    fetchedJobs = bookmarkJobs;
                                    bookmarksFound = true;
                                    if(isMounted) {
                                        currentMode = "bookmark";
                                        setMode("bookmark");
                                        setPrevMode("bookmark");
                                    }
                                }
                            }
                        } catch (err) {
                            console.error("즐겨찾기 조회 실패:", err);
                        }
                    }

                    if (!bookmarksFound) {
                        if(isMounted) {
                            currentMode = "recommend";
                            setMode("recommend");
                            setPrevMode("recommend");
                        }
                        try {
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

                        } catch (e) {
                            console.error("추천 기업 공고 조회 실패:", e);
                        }
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
                    즐겨찾기 기업 공고
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
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="기업명으로 검색..."
                        className="w-full h-12 bg-[#1A1B1E] border border-white/10 rounded-xl pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors shadow-inner"
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