"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, TrendingUp, Scale, ExternalLink, Star, Trophy, AlertCircle } from "lucide-react"; // ArrowLeft 제거
import TrendChart from "./TrendChart";
import StackComparison, { StackData } from "./Comparison";
import StackRelationAnalysis from "./RelationAnalysis";
import JobSection from "./JobSection";
import { api } from "@/lib/api"; 
import { getAuthTokens } from "@/lib/auth"; 

import LoginCheckModal from "@/components/LoginCheckModal";
import LoginModal from "@/components/LoginModal";

import { searchTechStacks, getTechStackRelations, RelatedTechStackRelation, getExternalLogoUrl, fetchAllTechStacks } from "@/services/trendService";
import { TechStackData } from "@/types/trend";

// 커스텀 노드 아이콘
const NetworkIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="3" />
    <circle cx="6" cy="6" r="2" />
    <circle cx="18" cy="6" r="2" />
    <circle cx="6" cy="18" r="2" />
    <circle cx="18" cy="18" r="2" />
    <line x1="10" y1="10" x2="7.5" y2="7.5" />
    <line x1="14" y1="10" x2="16.5" y2="7.5" />
    <line x1="10" y1="14" x2="7.5" y2="16.5" />
    <line x1="14" y1="14" x2="16.5" y2="16.5" />
  </svg>
);

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

interface DashboardStackData extends StackData {
  officialSite: string;
  created_at?: string; 
}

interface TechTrendResponse {
    id: number;
    tech_stack: {
        id: number;
        name: string;
        description: string;
        logo: string | null;
        docs_url: string | null;
        created_at: string;
    };
    mention_count: number;
    change_rate: number;
    reference_date: string;
}

const EMPTY_STACK: DashboardStackData = {
    id: 0,
    name: "",
    count: 0,
    growth: 0,
    color: "",
    logo: "",
    themeColor: "",
    description: "",
    officialSite: "",
    created_at: ""
};

const MOCK_CHART_DATA = [
  { year: "2024.01", company: 45, community: 30 },
  { year: "2024.02", company: 52, community: 35 },
  { year: "2024.03", company: 48, community: 40 },
  { year: "2024.04", company: 60, community: 45 },
  { year: "2024.05", company: 65, community: 55 },
  { year: "2024.06", company: 75, community: 60 },
];

export default function Dashboard() {
    const [isLanding, setIsLanding] = useState(true); 
    const [activeStack, setActiveStack] = useState<DashboardStackData>(EMPTY_STACK);
    const [viewMode, setViewMode] = useState<"chart" | "compare" | "graph">("chart");
    
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    
    const [filteredStacks, setFilteredStacks] = useState<DashboardStackData[]>([]); 
    const [topStacks, setTopStacks] = useState<DashboardStackData[]>([]); 
    const [isSearching, setIsSearching] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    
    const [relatedStacks, setRelatedStacks] = useState<RelatedTechStackRelation[]>([]);
    const [isLoadingRelations, setIsLoadingRelations] = useState(false);

    const [stackFavorites, setStackFavorites] = useState<number[]>([]);

    const [showLoginCheck, setShowLoginCheck] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const formatSearchResults = (apiResults: TechStackData[]): DashboardStackData[] => {
        return apiResults.map((stack, index) => ({
            id: stack.id,
            name: stack.name,
            count: 0,
            growth: 0,
            color: index % 2 === 0 ? "from-blue-500 to-indigo-500" : "from-green-500 to-emerald-500",
            logo: stack.logo || getExternalLogoUrl(stack.name), 
            themeColor: "#3B82F6", 
            description: stack.description || "상세 설명이 없습니다.",
            officialSite: stack.docs_url || "#",
            created_at: stack.created_at
        }));
    };

    const formatRankingData = (trends: TechTrendResponse[]): DashboardStackData[] => {
        return trends.map((trend, index) => ({
            id: trend.tech_stack.id,
            name: trend.tech_stack.name,
            count: trend.mention_count, 
            growth: trend.change_rate,  
            color: index % 2 === 0 ? "from-blue-500 to-indigo-500" : "from-green-500 to-emerald-500",
            logo: trend.tech_stack.logo || getExternalLogoUrl(trend.tech_stack.name),
            themeColor: "#3B82F6",
            description: trend.tech_stack.description || "상세 설명이 없습니다.",
            officialSite: trend.tech_stack.docs_url || "#",
            created_at: trend.tech_stack.created_at
        }));
    };

    // 초기 데이터 로드 (Top 5)
    useEffect(() => {
        const loadInitialData = async () => {
            setIsInitialLoading(true);
            try {
                // ✅ 백엔드에서 즐겨찾기 목록 가져오기
                const { accessToken } = getAuthTokens();
                if (accessToken) {
                    try {
                        const bookmarksResponse = await api.get('/trends/tech-bookmarks/');
                        const bookmarks = bookmarksResponse.data.results || bookmarksResponse.data || [];
                        const favoriteIds = bookmarks.map((b: any) => {
                            const techStack = b.tech_stack || b;
                            return techStack.tech_stack_id || techStack.id;
                        });
                        setStackFavorites(favoriteIds);
                    } catch (error) {
                        console.error('즐겨찾기 목록 불러오기 실패:', error);
                    }
                }

                // ✅ article_stack_count가 많은 순서대로 Top 5 가져오기
                // 모든 페이지를 가져오기 위해 fetchAllTechStacks 사용
                const allStacksData = await fetchAllTechStacks();

                if (allStacksData && allStacksData.length > 0) {
                    // article_stack_count로 정렬하고 상위 5개만 선택
                    // 숫자로 변환하여 정확한 정렬 보장
                    const sortedStacks = [...allStacksData].sort((a: any, b: any) => {
                        const countA = Number(a.article_stack_count) || 0;
                        const countB = Number(b.article_stack_count) || 0;
                        return countB - countA; // 내림차순 정렬
                    });
                    
                    const top5Stacks = sortedStacks.slice(0, 5);
                    
                    const formattedTop5 = top5Stacks.map((stack: any, index: number) => ({
                        id: stack.id,
                        name: stack.name,
                        count: Number(stack.article_stack_count) || 0, // article_stack_count를 count로 사용
                        growth: 0,
                        color: index % 2 === 0 ? "from-blue-500 to-indigo-500" : "from-green-500 to-emerald-500",
                        logo: stack.logo || getExternalLogoUrl(stack.name),
                        themeColor: "#3B82F6",
                        description: stack.description || "상세 설명이 없습니다.",
                        officialSite: stack.docs_url || "#",
                        created_at: stack.created_at
                    }));
                    setTopStacks(formattedTop5);
                    setActiveStack(formattedTop5[0]); 
                } else {
                    setTopStacks([]);
                    setActiveStack(EMPTY_STACK);
                }
            } catch (e) {
                console.error("Initial load error:", e);
                setTopStacks([]);
            } finally {
                setIsInitialLoading(false);
            }
        };
        loadInitialData();
    }, []);

    // ✅ [추가] Navbar에서 'resetDashboard' 이벤트 발생 시 Top 5 화면으로 복귀
    useEffect(() => {
        const handleReset = () => {
            setIsLanding(true);
            setSearchQuery("");
            setFilteredStacks([]);
            // Top 5 중 1위를 배경으로 설정 (선택 사항)
            if (topStacks.length > 0) {
                setActiveStack(topStacks[0]);
            }
        };

        window.addEventListener('resetDashboard', handleReset);
        return () => window.removeEventListener('resetDashboard', handleReset);
    }, [topStacks]);

    // 검색 로직
    useEffect(() => {
        if (isInitialLoading) return;

        if (debouncedSearchQuery.trim().length > 0) {
            const fetchStacks = async () => {
                setIsSearching(true);
                try {
                    const apiResults = await searchTechStacks(debouncedSearchQuery);
                    const formattedResults = formatSearchResults(apiResults);
                    setFilteredStacks(formattedResults);
                } catch (error) {
                    console.error("Stack search failed:", error);
                    setFilteredStacks([]); 
                } finally {
                    setIsSearching(false);
                }
            };
            fetchStacks();
        }
    }, [debouncedSearchQuery, isInitialLoading]);

    // 연관 기술 스택 로드
    useEffect(() => {
        if (!activeStack?.id) {
            setRelatedStacks([]);
            return;
        }

        const loadRelations = async () => {
            setRelatedStacks([]);
            setIsLoadingRelations(true);
            try {
                const relationsData = await getTechStackRelations(activeStack.id);
                
                const allRelatedStacks: RelatedTechStackRelation[] = [];
                if (relationsData && relationsData.relationships) {
                    Object.keys(relationsData.relationships).forEach(relType => {
                        const items = relationsData.relationships[relType];
                        if (Array.isArray(items)) {
                            allRelatedStacks.push(...items);
                        }
                    });
                }
                
                const uniqueStacksMap = new Map<number, RelatedTechStackRelation>();
                allRelatedStacks.forEach(relation => {
                    const stackId = relation.tech_stack.id;
                    if (!uniqueStacksMap.has(stackId) || uniqueStacksMap.get(stackId)!.weight < relation.weight) {
                        uniqueStacksMap.set(stackId, relation);
                    }
                });
                
                const uniqueStacks = Array.from(uniqueStacksMap.values());
                const sortedByWeight = uniqueStacks.sort((a, b) => b.weight - a.weight);
                
                setRelatedStacks(sortedByWeight);
            } catch (error) {
                console.error("Failed to load tech stack relations:", error);
                setRelatedStacks([]);
            } finally {
                setIsLoadingRelations(false);
            }
        };

        loadRelations();
    }, [activeStack?.id]);

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, name: string) => {
        const target = e.target as HTMLImageElement;
        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128&bold=true`;
    };

    const toggleStackFavorite = async (id: number) => {
        const { accessToken } = getAuthTokens();
        
        if (!accessToken) {
            setShowLoginCheck(true); 
            return;
        }

        try {
            const isFavorite = stackFavorites.includes(id);
            
            if (isFavorite) {
                // 즐겨찾기 제거
                try {
                    // 즐겨찾기 ID 찾기
                    const bookmarksResponse = await api.get('/trends/tech-bookmarks/');
                    const bookmarks = bookmarksResponse.data.results || bookmarksResponse.data || [];
                    const bookmarkToDelete = bookmarks.find((b: any) => {
                        const techStack = b.tech_stack || b;
                        return (techStack.tech_stack_id || techStack.id) === id;
                    });
                    
                    if (bookmarkToDelete) {
                        await api.delete(`/trends/tech-bookmarks/${bookmarkToDelete.tech_bookmark_id || bookmarkToDelete.id}/`);
                        const nextFavorites = stackFavorites.filter(favId => favId !== id);
                        setStackFavorites(nextFavorites);
                        // 즐겨찾기 변경 이벤트 발생
                        window.dispatchEvent(new CustomEvent('favoriteChanged', { detail: { type: 'tech', action: 'removed', id } }));
                    }
                } catch (error) {
                    console.error('즐겨찾기 제거 실패:', error);
                }
            } else {
                // 즐겨찾기 추가
                try {
                    await api.post('/trends/tech-bookmarks/', { tech_id: id });
                    const nextFavorites = [...stackFavorites, id];
                    setStackFavorites(nextFavorites);
                    // 즐겨찾기 변경 이벤트 발생
                    window.dispatchEvent(new CustomEvent('favoriteChanged', { detail: { type: 'tech', action: 'added', id } }));
                } catch (error) {
                    console.error('즐겨찾기 추가 실패:', error);
                }
            }
        } catch (error) {
            console.error('즐겨찾기 토글 실패:', error);
        }
    };

    const handleTopStackClick = (stack: DashboardStackData) => {
        setActiveStack(stack);
        setIsLanding(false); 
        setSearchQuery("");
        setFilteredStacks([]);
    };

    return (
      <div className="w-full h-full">
        <LoginCheckModal 
            isOpen={showLoginCheck} 
            onClose={() => setShowLoginCheck(false)}
            onConfirm={() => {
                setShowLoginCheck(false);
                setShowLoginModal(true);
            }}
        />
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

        <div className="grid grid-cols-1 gap-6 h-full lg:grid-cols-12 min-h-0">
            
            <div className="h-[800px] lg:col-span-9 lg:h-full lg:min-h-0 flex flex-col gap-6 p-6 bg-[#212226] rounded-[32px] border border-white/5 relative overflow-hidden shadow-2xl">
                
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 relative z-10">
                    
                    {isLanding ? (
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-500/10 rounded-xl">
                                <Trophy className="text-blue-400" size={48} />
                            </div>
                            <div>
                                <h2 className="text-4xl font-bold text-white mb-2">전체 언급량 Top 5</h2>
                                <p className="text-gray-400 text-xl">검색창으로 원하는 기술 스택을 검색해보세요.</p>
                            </div>
                        </div>
                    ) : (
                        activeStack.id !== 0 ? (
                            <div className="flex items-start gap-4 max-w-2xl">
                                {/* ✅ 뒤로가기 버튼 삭제됨 */}
                                
                                <div className={`w-20 h-20 shrink-0 rounded-2xl bg-gradient-to-br ${activeStack.color} p-[2px] shadow-lg`}>
                                    <div className="w-full h-full bg-[#2A2B30] rounded-2xl flex items-center justify-center p-3 overflow-hidden">
                                        <img 
                                            src={activeStack.logo || ""} 
                                            alt={activeStack.name} 
                                            className="w-full h-full object-contain"
                                            onError={(e) => handleImageError(e, activeStack.name)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-3xl font-bold text-white tracking-tight">{activeStack.name}</h2>
                                        <button 
                                            onClick={() => toggleStackFavorite(activeStack.id)}
                                            className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                                        >
                                            <Star 
                                                size={20} 
                                                fill={stackFavorites.includes(activeStack.id) ? "#FACC15" : "none"} 
                                                className={stackFavorites.includes(activeStack.id) ? "text-yellow-400" : "text-gray-400"}
                                            />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3 text-[#9FA0A8] text-sm mb-2">
                                        <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">
                                            {activeStack.description}
                                        </p>
                                        {activeStack.count > 0 && <span>언급량 {activeStack.count?.toLocaleString()}회</span>}
                                        
                                        {activeStack.officialSite && activeStack.officialSite !== '#' && (
                                            <>
                                                {activeStack.count > 0 && <span className="w-1 h-1 rounded-full bg-white/20" />}
                                                
                                                <a 
                                                    href={activeStack.officialSite} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="hover:text-blue-400 transition-colors flex items-center gap-1"
                                                >
                                                    공식문서 연결 <ExternalLink size={14}/>
                                                </a>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 opacity-50">
                                <AlertCircle className="text-gray-400" size={24} />
                                <div>
                                    <h2 className="text-xl font-bold text-white">기술 스택 정보 없음</h2>
                                    <p className="text-gray-400 text-xs">오른쪽 검색창을 통해 기술 스택을 찾아보세요.</p>
                                </div>
                            </div>
                        )
                    )}

                    {/* 오른쪽: 검색창 및 토글 */}
                    <div className="flex items-center gap-4 w-full xl:w-auto">
                        <div className="relative flex-1 group transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] w-full xl:w-72 focus-within:xl:w-[480px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-blue-400 transition-colors" size={20} />
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="기술 스택 검색..."
                                className="w-full h-16 bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 text-xl text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all shadow-inner"
                            />
                            
                            <AnimatePresence>
                                {(searchQuery.length > 0) && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full left-0 right-0 mt-2 bg-[#2A2B30] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 max-h-60 overflow-y-auto"
                                    >
                                        {isSearching ? (
                                            <div className="p-4 text-center text-white/40 text-xl">DB 검색 중...</div>
                                        ) : filteredStacks.length > 0 ? (
                                            filteredStacks.map(stack => (
                                                <button
                                                    key={stack.id}
                                                    onClick={() => {
                                                        setActiveStack(stack);
                                                        setIsLanding(false); 
                                                        setSearchQuery(""); 
                                                        setFilteredStacks([]); 
                                                    }}
                                                    className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-white/10 p-1 flex items-center justify-center overflow-hidden shrink-0">
                                                        <img 
                                                            src={stack.logo || ""} 
                                                            alt={stack.name} 
                                                            className="w-full h-full object-contain" 
                                                            onError={(e) => handleImageError(e, stack.name)}
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-white text-xl font-medium truncate">{stack.name}</div>
                                                        <div className="text-white/40 text-sm truncate max-w-[180px]">{stack.description}</div>
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-white/40 text-sm">검색 결과가 없습니다.</div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {!isLanding && activeStack.id !== 0 && (
                            <div className="flex p-1.5 bg-white/5 rounded-2xl border border-white/10">
                                <button onClick={() => setViewMode("chart")} className={`p-3 rounded-xl transition-all ${viewMode === "chart" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white"}`}>
                                    <TrendingUp size={28} />
                                </button>
                                <button onClick={() => setViewMode("graph")} className={`p-3 rounded-xl transition-all ${viewMode === "graph" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white"}`}>
                                    <NetworkIcon size={28} />
                                </button>
                                <button onClick={() => setViewMode("compare")} className={`p-3 rounded-xl transition-all ${viewMode === "compare" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white"}`}>
                                    <Scale size={28} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 relative min-h-0">
                    <AnimatePresence mode="wait">
                        <div className="w-full h-full">
{isLanding ? (
    <motion.div 
        key="landing-top5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="h-full flex flex-col justify-center items-center py-10 px-4"
    >
        {topStacks.length === 0 ? (
            <div className="text-center text-gray-500 opacity-60">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4" />
                <p>데이터 분석 중...</p>
            </div>
        ) : (
            <div className="flex flex-col gap-16 w-full max-w-7xl">
                {/* Top 3 Podium Section */}
                <div className="flex flex-col md:flex-row items-end justify-center gap-6 md:gap-4 lg:gap-8">
                    
                    {/* Rank 2 */}
                    {topStacks[1] && (
                        <motion.button
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            onClick={() => handleTopStackClick(topStacks[1])}
                            className="order-2 md:order-1 w-full md:w-64 group relative"
                        >
                            <div className="absolute inset-0 bg-slate-400/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative bg-[#2A2B30]/60 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 flex flex-col items-center gap-4 hover:border-gray-400/30 transition-all shadow-2xl">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-400/20 border border-gray-400/50 px-4 py-1 rounded-full text-gray-300 text-sm font-bold shadow-lg">2등</div>
                                <div className="w-20 h-20 bg-white/5 rounded-2xl p-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                    <img src={topStacks[1].logo} alt="" className="w-full h-full object-contain drop-shadow-md" onError={(e) => handleImageError(e, topStacks[1].name)} />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{topStacks[1].name}</h3>
                                    <p className="text-sm text-blue-400 font-medium mt-1">{topStacks[1].count.toLocaleString()} <span className="text-[14px] text-gray-500">언급량</span></p>
                                </div>
                            </div>
                        </motion.button>
                    )}

                    {/* Rank 1 - Highlighted */}
                    {topStacks[0] && (
                        <motion.button
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            whileHover={{ y: -12, scale: 1.05 }}
                            onClick={() => handleTopStackClick(topStacks[0])}
                            className="order-1 md:order-2 w-full md:w-80 group relative mb-0 md:mb-12"
                        >
                            <div className="absolute inset-0 bg-yellow-500/10 blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity" />
                            <div className="relative bg-[#2A2B30]/80 backdrop-blur-2xl border-2 border-yellow-500/20 rounded-[40px] p-10 flex flex-col items-center gap-6 hover:border-yellow-500/40 transition-all shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-2 rounded-full text-black font-black shadow-[0_10px_20px_-5px_rgba(234,179,8,0.4)] flex items-center gap-2">
                                    <Trophy size={18} fill="yellow" /> 1등 언급 기술
                                </div>
                                <div className="w-28 h-28 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-3xl p-5 flex items-center justify-center ring-1 ring-yellow-500/20 group-hover:scale-110 transition-transform duration-500">
                                    <img src={topStacks[0].logo} alt="" className="w-full h-full object-contain drop-shadow-2xl" onError={(e) => handleImageError(e, topStacks[0].name)} />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-yellow-400 transition-colors">{topStacks[0].name}</h3>
                                    <div className="flex flex-col items-center gap-1 mt-2">
                                        <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">{topStacks[0].count.toLocaleString()}</span>
                                        <span className="text-[14px] text-gray-500 uppercase tracking-widest font-black">전체 언급량</span>
                                    </div>
                                </div>
                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-2">
                                    <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.5, delay: 0.5 }} className="h-full bg-gradient-to-r from-yellow-500 to-orange-500" />
                                </div>
                            </div>
                        </motion.button>
                    )}

                    {/* Rank 3 */}
                    {topStacks[2] && (
                        <motion.button
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            onClick={() => handleTopStackClick(topStacks[2])}
                            className="order-3 w-full md:w-64 group relative"
                        >
                            <div className="absolute inset-0 bg-orange-700/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative bg-[#2A2B30]/60 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 flex flex-col items-center gap-4 hover:border-orange-700/30 transition-all shadow-2xl">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-700/20 border border-orange-700/50 px-4 py-1 rounded-full text-orange-400 text-xm font-bold shadow-lg">3등</div>
                                <div className="w-20 h-20 bg-white/5 rounded-2xl p-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                    <img src={topStacks[2].logo} alt="" className="w-full h-full object-contain drop-shadow-md" onError={(e) => handleImageError(e, topStacks[2].name)} />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{topStacks[2].name}</h3>
                                    <p className="text-sm text-blue-400 font-medium mt-1">{topStacks[2].count.toLocaleString()} <span className="text-[14px] text-gray-500">언급량</span></p>
                                </div>
                            </div>
                        </motion.button>
                    )}
                </div>

                {/* Rank 4 & 5 Mini Cards */}
                <div className="flex flex-wrap justify-center gap-6">
                    {topStacks.slice(3, 5).map((stack, idx) => (
                        <motion.button
                            key={stack.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 + idx * 0.1 }}
                            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.05)" }}
                            onClick={() => handleTopStackClick(stack)}
                            className="w-full md:w-80 bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4 transition-all group"
                        >
                            <div className="w-12 h-12 bg-white/10 rounded-xl p-2.5 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
                                <img src={stack.logo} alt="" className="w-full h-full object-contain" onError={(e) => handleImageError(e, stack.name)} />
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-xm font-bold text-gray-500">{idx + 4}등</span>
                                    <h4 className="text-base font-bold text-white truncate">{stack.name}</h4>
                                </div>
                                <p className="text-sm text-gray-400 mt-0.5">{stack.count.toLocaleString()} 언급량</p>
                            </div>
                            <ExternalLink size={14} className="text-gray-600 group-hover:text-blue-400 transition-colors" />
                        </motion.button>
                    ))}
                </div>
            </div>
        )}
    </motion.div>
                            ) : (
                                <>
                                    {viewMode === "compare" && (
                                        <motion.div key="compare" className="absolute inset-0 pb-4 pr-2">
                                            <StackComparison initialBaseStack={activeStack} allStacks={topStacks} onBack={() => setViewMode("chart")} />
                                        </motion.div>
                                    )}
                                    {viewMode === "graph" && (
                                        <motion.div key="node-graph" className="absolute inset-0 overflow-hidden">
                                            <StackRelationAnalysis 
                                                mainStackName={activeStack.name} 
                                                mainLogo={activeStack.logo || ""} 
                                                mainStackDescription={activeStack.description} 
                                                relatedStacks={relatedStacks}
                                                onClose={() => setViewMode("chart")}
                                                onStackSelect={(stackId: number) => {
                                                    (async () => {
                                                        try {
                                                            const allData = await searchTechStacks("");
                                                            const targetStack = allData.find(s => s.id === stackId);
                                                            if (targetStack) {
                                                                const formatted = formatSearchResults([targetStack]);
                                                                if (formatted.length > 0) {
                                                                    setActiveStack(formatted[0]);
                                                                    setViewMode("chart"); 
                                                                }
                                                            }
                                                        } catch (error) {
                                                            console.error("Failed to load tech stack:", error);
                                                        }
                                                    })();
                                                }}
                                            />
                                        </motion.div>
                                    )}
                                    {viewMode === "chart" && (
                                        <motion.div key="trend-chart" className="absolute inset-0 pt-4 w-full h-full pb-10">
                                            <TrendChart color={activeStack.themeColor} data={MOCK_CHART_DATA} />
                                        </motion.div>
                                    )}
                                </>
                            )}
                        </div>
                    </AnimatePresence>
                </div>
            </div>

            <div className="lg:col-span-3 h-full min-h-[400px]">
                <JobSection 
                    techStackId={isLanding ? 0 : activeStack.id} 
                    techStackName={isLanding ? "전체" : activeStack.name} 
                />
            </div>

        </div>
      </div>
    );
}