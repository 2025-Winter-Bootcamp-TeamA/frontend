'use client';

import { useState, useEffect, useMemo } from "react";
import { useRouter } from 'next/navigation';
import { Search, AlertCircle } from 'lucide-react';
import JobCard from './JobCard';
import { api } from "@/lib/api"; 
import { getAuthTokens } from "@/lib/auth"; 

import LoginCheckModal from "@/components/LoginCheckModal";
import LoginModal from "@/components/LoginModal"; 

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
    const [favorites, setFavorites] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [searchQuery, setSearchQuery] = useState("");
    const [showLoginCheck, setShowLoginCheck] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const handleMoreClick = () => {
        router.push('/map');
    };

    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            setJobs([]); 

            try {
                const savedFavs = localStorage.getItem("job_favorites");
                if (savedFavs) {
                    setFavorites(JSON.parse(savedFavs));
                }

                let allJobs: any[] = [];

                if (techStackId === 0) {
                    // ✅ [우회 로직] 전체 공고 API 부재 시 Top 5 기술 공고 병합
                    try {
                        const rankingRes = await api.get('/trends/ranking/');
                        
                        // 🛠️ [수정] 응답 데이터가 배열인지 객체(results)인지 확인
                        const rankingData = Array.isArray(rankingRes.data) 
                            ? rankingRes.data 
                            : rankingRes.data.results || [];

                        const topStacks = rankingData.slice(0, 5);

                        // 각 기술별 공고 병렬 호출 (에러 나도 무시하고 빈 배열 반환)
                        const promises = topStacks.map((stack: any) => 
                            api.get(`/by-tech/${stack.tech_stack.id}/`)
                               .then(res => Array.isArray(res.data) ? res.data : res.data.results || [])
                               .catch(() => [])
                        );
                        
                        const results = await Promise.all(promises);

                        // 결과 병합
                        results.forEach(data => {
                            allJobs = [...allJobs, ...data];
                        });

                        // 중복 제거 (ID 기준)
                        const uniqueJobsMap = new Map();
                        allJobs.forEach(job => uniqueJobsMap.set(job.id, job));
                        allJobs = Array.from(uniqueJobsMap.values());

                    } catch (err) {
                        console.error("Top 5 공고 수집 중 오류:", err);
                    }

                } else {
                    // 특정 기술 공고 호출
                    try {
                        const response = await api.get(`/by-tech/${techStackId}/`);
                        allJobs = Array.isArray(response.data) ? response.data : response.data.results || [];
                    } catch (error) {
                        console.error(`기술 ID ${techStackId} 공고 로딩 실패:`, error);
                    }
                }

                // 데이터 매핑
                const mappedData = allJobs.map((item: any) => ({
                    id: item.id,
                    company_name: item.corp?.name || "기업명 없음",
                    title: item.title,
                    url: item.url,
                    deadline: item.expiry_date || null, 
                    logo_url: item.corp?.logo_url 
                }));

                setJobs(mappedData);

            } catch (error) {
                console.error("최종 공고 처리 실패:", error);
                setJobs([]);
            } finally {
                setLoading(false);
            }
        };

        if (techStackId !== undefined && techStackId !== null) {
            fetchJobs();
        }
    }, [techStackId]);

    const handleToggleFavorite = (e: React.MouseEvent, id: number) => {
        e.preventDefault(); 
        e.stopPropagation();

        const { accessToken } = getAuthTokens();
        if (!accessToken) {
            setShowLoginCheck(true); 
            return;
        }

        const nextFavorites = favorites.includes(id)
            ? favorites.filter(favId => favId !== id)
            : [...favorites, id];
        
        setFavorites(nextFavorites);
        localStorage.setItem("job_favorites", JSON.stringify(nextFavorites));
    };

    const processedJobs = useMemo(() => {
        let filtered = jobs;
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = jobs.filter(job => 
                job.company_name.toLowerCase().includes(query) || 
                job.title.toLowerCase().includes(query)
            );
        }

        return [...filtered].sort((a, b) => {
            const aFav = favorites.includes(a.id);
            const bFav = favorites.includes(b.id);

            if (aFav && !bFav) return -1;
            if (!aFav && bFav) return 1;

            const dateA = a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER;
            const dateB = b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER;
            
            return dateA - dateB;
        });
    }, [jobs, favorites, searchQuery]);

    return (
        <section className="w-full h-full flex flex-col bg-[#25262B] rounded-2xl border border-white/5 overflow-hidden relative shadow-lg">
            
            <LoginCheckModal 
                isOpen={showLoginCheck} 
                onClose={() => setShowLoginCheck(false)}
                onConfirm={() => {
                    setShowLoginCheck(false);
                    setShowLoginModal(true);
                }}
            />
            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

            <div className="p-5 border-b border-white/5 flex flex-col gap-4 bg-[#2C2E33]/50 flex-shrink-0">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-white flex items-center gap-2 truncate">
                        {techStackId === 0 ? "🔥 인기 기술 채용 공고" : `💼 ${techStackName} 관련 공고`}
                    </h3>
                    <span 
                        onClick={handleMoreClick}
                        className="text-xs text-gray-500 cursor-pointer hover:text-blue-400 transition-colors whitespace-nowrap"
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
                        placeholder="기업명, 공고 제목으로 검색..."
                        className="w-full h-10 bg-[#1A1B1E] border border-white/10 rounded-xl pl-9 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors shadow-inner"
                    />
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm gap-2">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p>로딩 중...</p>
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
                            isFavorite={favorites.includes(job.id)}
                            onToggleFavorite={handleToggleFavorite}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm py-10 gap-3 opacity-60">
                        <AlertCircle size={32} strokeWidth={1.5} />
                        <p>
                            {searchQuery 
                                ? `'${searchQuery}' 검색 결과가 없습니다.` 
                                : "등록된 채용 공고가 없습니다."}
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}