'use client';

import { useState, useEffect, useMemo } from "react";
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

export default function JobSection({ techStackId, techStackName }: JobSectionProps) {
    const router = useRouter();
    const [jobs, setJobs] = useState<JobPostingData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    
    // 현재 표시 모드: bookmark(즐겨찾기), recommend(추천), tech(기술검색)
    const [mode, setMode] = useState<"bookmark" | "recommend" | "tech">("recommend");

    const handleMoreClick = () => {
        router.push('/map');
    };

    useEffect(() => {
        let isMounted = true;

        const fetchJobs = async () => {
            setLoading(true);
            setJobs([]); // 로딩 시작 시 기존 리스트 초기화

            try {
                let fetchedJobs: any[] = [];

                // ========================================================
                // CASE A: 기술 스택 선택됨 (검색 결과) -> 무조건 해당 기술 공고만 조회
                // ========================================================
                if (techStackId !== 0) {
                    if(isMounted) setMode("tech");
                    try {
                        // urls.py에 정의된 /by-tech/<id>/ 엔드포인트 호출
                        const response = await api.get(`/jobs/by-tech/${techStackId}/`);
                        fetchedJobs = Array.isArray(response.data) ? response.data : response.data.results || [];
                    } catch (error) {
                        console.error(`기술 ID ${techStackId} 공고 로딩 실패:`, error);
                    }
                } 
                
                // ========================================================
                // CASE B: 초기 화면 (전체/랜딩) -> [즐겨찾기] 시도 후 없으면 [추천]
                // ========================================================
                else {
                    const { accessToken } = getAuthTokens();
                    let bookmarksFound = false;

                    // (1) 즐겨찾기 시도
                    if (accessToken) {
                        try {
                            const bookmarksResponse = await api.get('/jobs/corp-bookmarks/');
                            const bookmarks = bookmarksResponse.data.results || bookmarksResponse.data || [];
                            
                            if (bookmarks.length > 0) {
                                // 즐겨찾기한 기업들의 공고 병렬 호출
                                const promises = bookmarks.map((bookmark: any) => {
                                    // corp 객체 또는 corp_id 숫자 모두 대응
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
                                    if(isMounted) setMode("bookmark");
                                }
                            }
                        } catch (err) {
                            console.error("즐겨찾기 조회 실패 (추천으로 넘어감):", err);
                        }
                    }

                    // (2) 즐겨찾기 실패 또는 데이터 없음 -> 추천(상위 기업) 공고 조회
                    if (!bookmarksFound) {
                        if(isMounted) setMode("recommend");
                        try {
                            // 기업 목록 조회
                            const corpsResponse = await api.get('/jobs/corps/');
                            const corpsList = Array.isArray(corpsResponse.data) ? corpsResponse.data : corpsResponse.data.results || [];
                            
                            // 상위 5개 기업 공고 조회
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

                // ========================================================
                // 데이터 정제 및 상태 업데이트
                // ========================================================
                if (isMounted) {
                    const uniqueJobsMap = new Map();
                    fetchedJobs.forEach((item: any) => {
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
                    
                    // 마감일 있는 것 우선, 그 다음 최신순(ID 역순) 정렬
                    const sortedJobs = Array.from(uniqueJobsMap.values()).sort((a: any, b: any) => {
                        if (a.deadline && !b.deadline) return -1;
                        if (!a.deadline && b.deadline) return 1;
                        return b.id - a.id;
                    });

                    setJobs(sortedJobs as JobPostingData[]);
                }

            } catch (error) {
                console.error("JobSection Fatal Error:", error);
                if (isMounted) setJobs([]);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchJobs();

        return () => {
            isMounted = false;
        };
    }, [techStackId]); // techStackId가 바뀔 때마다 실행

    // 클라이언트 사이드 검색 필터 (기업명/제목)
    const processedJobs = useMemo(() => {
        let filtered = jobs;
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = jobs.filter(job => 
                job.company_name.toLowerCase().includes(query) || 
                job.title.toLowerCase().includes(query)
            );
        }
        return filtered;
    }, [jobs, searchQuery]);

    const renderHeader = () => {
        if (mode === "bookmark") {
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
                        placeholder="리스트 내 검색..."
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
                ) : processedJobs.length > 0 ? (
                    processedJobs.map((job) => (
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
                            {mode === "tech" 
                                ? `'${techStackName}' 관련 공고가 없습니다.` 
                                : "등록된 채용 공고가 없습니다."}
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}