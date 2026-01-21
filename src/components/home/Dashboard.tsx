"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, TrendingUp, Share2, Scale, ExternalLink } from "lucide-react";
import TrendChart from "./TrendChart";
import StackComparison, { StackData } from "./Comparison";
import StackRelationAnalysis from "./RelationAnalysis";

// API 서비스 및 타입
import { searchTechStacks, getTechStackRelations, RelatedTechStackRelation, getExternalLogoUrl } from "@/services/trendService";
import { TechStackData } from "@/types/trend";

// --- 헬퍼 함수: 디바운스 ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// ✅ [핵심] StackData(기존) + 추가 필드(공식사이트, 생성일 등)를 합친 타입 정의
// 이를 통해 'created_at이 없다'는 오류를 해결합니다.
interface DashboardStackData extends StackData {
  officialSite: string;
  created_at?: string; // 선택적 속성으로 정의
}

// ✅ [핵심] 타입을 DashboardStackData[]로 명시
const DEFAULT_STACKS: DashboardStackData[] = [
  {
    id: 1,
    name: "React",
    count: 12540,
    growth: 12.5,
    color: "from-blue-500 to-cyan-400",
    logo: "https://cdn.simpleicons.org/react",
    themeColor: "#3B82F6",
    description: "Meta가 개발한 컴포넌트 기반 UI 라이브러리",
    officialSite: "https://react.dev",
    created_at: new Date().toISOString()
  },
];

const MOCK_CHART_DATA = [
  { year: "2024.01", company: 45, community: 30 },
  { year: "2024.02", company: 52, community: 35 },
  { year: "2024.03", company: 48, community: 40 },
  { year: "2024.04", company: 60, community: 45 },
  { year: "2024.05", company: 65, community: 55 },
  { year: "2024.06", company: 75, community: 60 },
];

export default function Dashboard() {
    // 상태 타입 명시
    const [activeStack, setActiveStack] = useState<DashboardStackData>(DEFAULT_STACKS[0]);
    const [viewMode, setViewMode] = useState<"chart" | "compare" | "graph">("chart");
    
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    
    // 상태 타입 명시
    const [filteredStacks, setFilteredStacks] = useState<DashboardStackData[]>([]); 
    const [isSearching, setIsSearching] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    
    // 관련 기술 스택 상태
    const [relatedStacks, setRelatedStacks] = useState<RelatedTechStackRelation[]>([]);
    const [isLoadingRelations, setIsLoadingRelations] = useState(false);

    // ✅ 데이터 포맷팅: API 데이터(TechStackData) -> 대시보드 데이터(DashboardStackData) 변환
    const formatApiData = (apiResults: TechStackData[]): DashboardStackData[] => {
        return apiResults.map((stack, index) => ({
            id: stack.id,
            name: stack.name,
            // 없는 데이터는 랜덤/기본값 처리
            count: Math.floor(Math.random() * 5000) + 1000, 
            growth: parseFloat((Math.random() * 20).toFixed(1)),
            color: index % 2 === 0 ? "from-blue-500 to-indigo-500" : "from-green-500 to-emerald-500",
            // trendService에서 처리된 logo 사용 (항상 정규화된 URL)
            logo: stack.logo || getExternalLogoUrl(stack.name), 
            themeColor: "#3B82F6", 
            description: stack.description || stack.docs_url || "상세 설명이 없습니다.",
            officialSite: stack.docs_url || "#",
            created_at: stack.created_at
        }));
    };

    // 초기 데이터 로딩 (전체 데이터)
    useEffect(() => {
        const loadAllData = async () => {
            setIsInitialLoading(true);
            try {
                // 빈 문자열 검색 = 전체 데이터 반환 (trendService에서 처리)
                const allData = await searchTechStacks("");
                
                if (allData.length > 0) {
                    const formatted = formatApiData(allData);
                    setFilteredStacks(formatted);
                    setActiveStack(formatted[0]); // 첫 번째 아이템 선택
                } else {
                    setFilteredStacks(DEFAULT_STACKS);
                }
            } catch (e) {
                console.error("Initial load error:", e);
                setFilteredStacks(DEFAULT_STACKS);
            } finally {
                setIsInitialLoading(false);
            }
        };
        loadAllData();
    }, []);

    // 검색 로직
    useEffect(() => {
        if (isInitialLoading) return;

        const fetchStacks = async () => {
            setIsSearching(true);
            try {
                const apiResults = await searchTechStacks(debouncedSearchQuery);
                const formattedResults = formatApiData(apiResults);
                setFilteredStacks(formattedResults);
            } catch (error) {
                console.error("Stack search failed:", error);
                setFilteredStacks([]); 
            } finally {
                setIsSearching(false);
            }
        };

        fetchStacks();
    }, [debouncedSearchQuery, isInitialLoading]);

    // activeStack 변경 시 관련 기술 스택 로드
    useEffect(() => {
        if (!activeStack?.id) {
            // activeStack이 없으면 관련 스택도 초기화
            setRelatedStacks([]);
            return;
        }

        const loadRelations = async () => {
            // 먼저 이전 데이터 초기화하여 중복 표시 방지
            setRelatedStacks([]);
            setIsLoadingRelations(true);
            try {
                const relationsData = await getTechStackRelations(activeStack.id);
                
                // 모든 관계 유형의 기술 스택을 하나의 배열로 합치기
                const allRelatedStacks: RelatedTechStackRelation[] = [];
                Object.keys(relationsData.relationships).forEach(relType => {
                    allRelatedStacks.push(...relationsData.relationships[relType]);
                });
                
                // 가중치 순으로 정렬 (높은 순서대로)
                // TODO: 언급량 순 정렬 (현재는 주석처리)
                // const sortedByMentionCount = allRelatedStacks.sort((a, b) => (b.tech_stack.count || 0) - (a.tech_stack.count || 0));
                const sortedByWeight = allRelatedStacks.sort((a, b) => b.weight - a.weight);
                
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

    // 이미지 에러 핸들러 (CDN에도 이미지가 없을 때)
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, name: string) => {
        const target = e.target as HTMLImageElement;
        // 텍스트 아이콘으로 대체
        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128&bold=true`;
    };

    return (
      <div className="w-full h-full flex flex-col gap-6 p-6 bg-[#212226] rounded-[32px] border border-white/5 relative overflow-hidden shadow-2xl">
        
        {/* 헤더 영역 */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 relative z-10">
            {/* 왼쪽: 현재 선택된 스택 정보 */}
            <div className="flex items-center gap-5">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${activeStack.color} p-[2px] shadow-lg`}>
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
                        <span className="px-2.5 py-1 rounded-full bg-white/10 text-xs font-medium text-emerald-400 border border-emerald-400/20 flex items-center gap-1">
                            <TrendingUp size={12} />
                            +{activeStack.growth}%
                        </span>
                    </div>
                    <div className="flex items-center gap-3 text-[#9FA0A8] text-sm">
                        <span>언급량 {activeStack.count?.toLocaleString()}회</span>
                        {activeStack.officialSite && activeStack.officialSite !== '#' && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-white/20" />
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
                </div>
            </div>

            {/* 오른쪽: 검색창 및 뷰 모드 설정 */}
            <div className="flex items-center gap-3 w-full xl:w-auto">
                <div className="relative flex-1 xl:w-64 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-blue-400 transition-colors" size={18} />
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="기술 스택 검색..."
                        className="w-full h-11 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all"
                    />
                    
                    {/* 검색 결과 드롭다운 */}
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
                                                setSearchQuery(""); 
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

                <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
                    <button onClick={() => setViewMode("chart")} className={`p-2 rounded-lg transition-all ${viewMode === "chart" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white"}`}>
                        <TrendingUp size={18} />
                    </button>
                    <button onClick={() => setViewMode("graph")} className={`p-2 rounded-lg transition-all ${viewMode === "graph" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white"}`}>
                        <Share2 size={18} />
                    </button>
                    <button onClick={() => setViewMode("compare")} className={`p-2 rounded-lg transition-all ${viewMode === "compare" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white"}`}>
                        <Scale size={18} />
                    </button>
                </div>
            </div>
        </div>

        {/* 메인 컨텐츠 영역 */}
        <div className="flex-1 relative min-h-0">
            <AnimatePresence mode="wait">
                <div className="w-full h-full">
                    {viewMode === "compare" && (
                        <motion.div key="compare" className="absolute inset-0 pb-20 pr-2">
                            <StackComparison initialBaseStack={activeStack} allStacks={DEFAULT_STACKS} onBack={() => setViewMode("chart")} />
                        </motion.div>
                    )}
                    {viewMode === "graph" && (
                        <motion.div key="node-graph" className="absolute inset-0 overflow-hidden">
                            <StackRelationAnalysis 
                                mainStackName={activeStack.name} 
                                mainLogo={activeStack.logo || ""} 
                                relatedStacks={relatedStacks}
                                onClose={() => setViewMode("chart")} 
                            />
                        </motion.div>
                    )}
                    {viewMode === "chart" && (
                        <motion.div key="trend-chart" className="absolute inset-0 pt-4 w-full h-full pb-10">
                            <TrendChart color={activeStack.themeColor} data={MOCK_CHART_DATA} />
                        </motion.div>
                    )}
                </div>
            </AnimatePresence>
        </div>
      </div>
    );
}