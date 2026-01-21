'use client';

import { useState, useEffect, useMemo } from "react";
import { useRouter } from 'next/navigation';
import JobCard from './JobCard';
import { api } from "@/lib/api"; 

interface JobPostingData {
    id: number;
    company_name: string;
    title: string;
    url: string;
    deadline: string | null; // ✅ null 허용
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

    const handleMoreClick = () => {
        router.push('/map');
    };

    useEffect(() => {
        const fetchFilteredJobs = async () => {
            setLoading(true);
            setJobs([]); 

            try {
                const savedFavs = localStorage.getItem("job_favorites");
                if (savedFavs) {
                    setFavorites(JSON.parse(savedFavs));
                }

                // API 호출
                const response = await api.get(`/by-tech/${techStackId}/`);
                
                const rawData = Array.isArray(response.data) ? response.data : response.data.results || [];
                
                const mappedData = rawData.map((item: any) => ({
                    id: item.id,
                    company_name: item.corp?.name || "기업명 없음", 
                    title: item.title,
                    url: item.url,
                    // ✅ DB에 마감일이 없으면 null로 설정
                    deadline: item.expiry_date || null, 
                    logo_url: item.corp?.logo_url 
                }));

                setJobs(mappedData);

            } catch (error) {
                console.error(`${techStackName} 채용공고 로딩 실패:`, error);
                setJobs([]);
            } finally {
                setLoading(false);
            }
        };

        if (techStackId) {
            fetchFilteredJobs();
        }
    }, [techStackId, techStackName]);

    const handleToggleFavorite = (e: React.MouseEvent, id: number) => {
        e.preventDefault(); 
        e.stopPropagation();

        const nextFavorites = favorites.includes(id)
            ? favorites.filter(favId => favId !== id)
            : [...favorites, id];
        
        setFavorites(nextFavorites);
        localStorage.setItem("job_favorites", JSON.stringify(nextFavorites));
    };

    // 정렬 로직 (1. 즐겨찾기, 2. 마감일 순, 3. 마감일 없으면 맨 뒤)
    const sortedJobs = useMemo(() => {
        return [...jobs].sort((a, b) => {
            const aFav = favorites.includes(a.id);
            const bFav = favorites.includes(b.id);

            // 1순위: 즐겨찾기
            if (aFav && !bFav) return -1;
            if (!aFav && bFav) return 1;

            // 2순위: 마감일 비교
            // 마감일이 없으면(null) 아주 큰 숫자로 취급해 맨 뒤로 보냄
            const dateA = a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER;
            const dateB = b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER;
            
            return dateA - dateB;
        });
    }, [jobs, favorites]);

    return (
        <section className="w-full h-full flex flex-col bg-[#25262B] rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#2C2E33]/50 flex-shrink-0">
                <h3 className="font-bold text-white flex items-center gap-2 truncate">
                    💼 {techStackName} 관련 공고
                </h3>
                <span 
                    onClick={handleMoreClick}
                    className="text-xs text-gray-500 cursor-pointer hover:text-blue-400 transition-colors whitespace-nowrap"
                >
                    더보기
                </span>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {loading ? (
                    <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                        로딩 중...
                    </div>
                ) : sortedJobs.length > 0 ? (
                    sortedJobs.map((job) => (
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
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm py-10">
                        <p>'{techStackName}' 관련 공고가 없습니다.</p>
                    </div>
                )}
            </div>
        </section>
    );
}