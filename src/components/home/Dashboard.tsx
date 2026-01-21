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

import { searchTechStacks, getTechStackRelations, RelatedTechStackRelation, getExternalLogoUrl } from "@/services/trendService";
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
                const savedFavs = localStorage.getItem("stack_favorites");
                if (savedFavs) {
                    setStackFavorites(JSON.parse(savedFavs));
                }

                const response = await api.get('/trends/ranking/');
                
                const rankingData = Array.isArray(response.data) 
                    ? response.data 
                    : response.data.results || [];

                if (rankingData && rankingData.length > 0) {
                    const formattedTop5 = formatRankingData(rankingData.slice(0, 5));
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

    const toggleStackFavorite = (id: number) => {
        const { accessToken } = getAuthTokens();
        
        if (!accessToken) {
            setShowLoginCheck(true); 
            return;
        }

        const nextFavorites = stackFavorites.includes(id)
            ? stackFavorites.filter(favId => favId !== id)
            : [...stackFavorites, id];
        
        setStackFavorites(nextFavorites);
        localStorage.setItem("stack_favorites", JSON.stringify(nextFavorites));
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
                                <Trophy className="text-blue-400" size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">전체 언급량 Top 5</h2>
                                <p className="text-gray-400 text-sm">검색창으로 원하는 기술 스택을 검색해보세요.</p>
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
                                                    Official Docs <ExternalLink size={10}/>
                                                </a>
                                            </>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">
                                        {activeStack.description}
                                    </p>
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
                                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all shadow-inner"
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
                                            <div className="p-4 text-center text-white/40 text-sm">DB 검색 중...</div>
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
                                                        <div className="text-white text-sm font-medium truncate">{stack.name}</div>
                                                        <div className="text-white/40 text-xs truncate max-w-[180px]">{stack.description}</div>
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
                                    <TrendingUp size={20} />
                                </button>
                                <button onClick={() => setViewMode("graph")} className={`p-3 rounded-xl transition-all ${viewMode === "graph" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white"}`}>
                                    <NetworkIcon size={20} />
                                </button>
                                <button onClick={() => setViewMode("compare")} className={`p-3 rounded-xl transition-all ${viewMode === "compare" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white"}`}>
                                    <Scale size={20} />
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
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="h-full flex flex-col justify-center items-center pb-10"
                                >
                                    {topStacks.length === 0 ? (
                                        <div className="text-center text-gray-500 opacity-60">
                                            <AlertCircle className="w-12 h-12 mx-auto mb-2" />
                                            <p>현재 집계된 트렌드 데이터가 없습니다.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 w-full max-w-6xl">
                                            {topStacks.map((stack, index) => (
                                                <motion.button
                                                    key={stack.id}
                                                    whileHover={{ scale: 1.05, y: -5 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleTopStackClick(stack)}
                                                    className="relative group bg-[#2A2B30] border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-4 hover:bg-white/5 hover:border-blue-500/50 transition-all text-center shadow-lg"
                                                >
                                                    <div className={`absolute top-4 left-4 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border
                                                        ${index === 0 ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50" : 
                                                          index === 1 ? "bg-gray-400/20 text-gray-300 border-gray-400/50" :
                                                          index === 2 ? "bg-orange-700/20 text-orange-400 border-orange-700/50" :
                                                          "bg-white/5 text-white/50 border-white/10"}`}
                                                    >
                                                        {index + 1}
                                                    </div>

                                                    <div className="w-16 h-16 bg-white/10 rounded-xl p-2 flex items-center justify-center group-hover:bg-white/20 transition-colors mt-4">
                                                        <img 
                                                            src={stack.logo || ""} 
                                                            alt={stack.name} 
                                                            className="w-full h-full object-contain"
                                                            onError={(e) => handleImageError(e, stack.name)}
                                                        />
                                                    </div>
                                                    
                                                    <div>
                                                        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                                                            {stack.name}
                                                        </h3>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            언급량 {stack.count.toLocaleString()}회
                                                        </p>
                                                    </div>
                                                </motion.button>
                                            ))}
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