"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, TrendingUp, Share2, Scale, ExternalLink } from "lucide-react";
import TrendChart from "./TrendChart";
import StackComparison, { StackData } from "./Comparison";
import StackRelationAnalysis from "./RelationAnalysis";

// API 서비스 및 타입
import { searchTechStacks } from "@/services/trendService";

// --- 헬퍼 함수: 디바운스 ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// 초기 화면용 기본 데이터
const DEFAULT_STACKS: (StackData & { officialSite: string })[] = [
  {
    id: 1,
    name: "React",
    count: 12540,
    growth: 12.5,
    color: "from-blue-500 to-cyan-400",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png",
    themeColor: "#3B82F6",
    description: "Meta가 개발한 컴포넌트 기반 UI 라이브러리",
    officialSite: "https://react.dev"
  },
  {
    id: 2,
    name: "Next.js",
    count: 8230,
    growth: 24.8,
    color: "from-gray-600 to-gray-900",
    logo: "https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_light_background.png",
    themeColor: "#000000",
    description: "React 기반의 풀스택 웹 프레임워크",
    officialSite: "https://nextjs.org"
  }
];

// 차트 데이터 (수정됨: Props 호환)
const MOCK_CHART_DATA = [
  { year: "2024.01", company: 45, community: 30 },
  { year: "2024.02", company: 52, community: 35 },
  { year: "2024.03", company: 48, community: 40 },
  { year: "2024.04", company: 60, community: 45 },
  { year: "2024.05", company: 65, community: 55 },
  { year: "2024.06", company: 75, community: 60 },
];

export default function Dashboard() {
    const [activeStack, setActiveStack] = useState(DEFAULT_STACKS[0]);
    const [viewMode, setViewMode] = useState<"chart" | "compare" | "graph">("chart");
    
    // 검색 상태
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const [filteredStacks, setFilteredStacks] = useState(DEFAULT_STACKS);
    const [isSearching, setIsSearching] = useState(false);

    // 연관 노드 (수정됨: Props 호환)
    const relatedNodes: string[] = ["Next.js", "TypeScript", "Tailwind CSS", "Redux", "Vite"];

    // ✅ 검색 로직
    useEffect(() => {
        const fetchStacks = async () => {
            if (!debouncedSearchQuery.trim()) {
                setFilteredStacks(DEFAULT_STACKS); 
                return;
            }

            setIsSearching(true);
            try {
                const apiResults = await searchTechStacks(debouncedSearchQuery);

                const formattedResults = apiResults.map((stack, index) => {
                    // 로고가 없으면 UI Avatar 서비스 사용
                    const fallbackLogo = `https://ui-avatars.com/api/?name=${encodeURIComponent(stack.name)}&background=random&color=fff&size=128`;
                    
                    return {
                        id: stack.id,
                        name: stack.name,
                        count: Math.floor(Math.random() * 5000) + 1000, 
                        growth: parseFloat((Math.random() * 20).toFixed(1)),
                        color: index % 2 === 0 ? "from-blue-500 to-indigo-500" : "from-green-500 to-emerald-500",
                        // 로고가 있으면 쓰고, 없으면 fallback 사용
                        logo: stack.logo || fallbackLogo,
                        themeColor: "#3B82F6", 
                        description: stack.docs_url || "상세 설명이 없습니다.",
                        officialSite: stack.docs_url || "#"
                    };
                });

                setFilteredStacks(formattedResults);
            } catch (error) {
                console.error("Stack search failed:", error);
                setFilteredStacks([]); 
            } finally {
                setIsSearching(false);
            }
        };

        fetchStacks();
    }, [debouncedSearchQuery]);

    // 이미지 에러 핸들러 (개별 함수로 분리)
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, name: string) => {
        const target = e.target as HTMLImageElement;
        // 이미 fallback 로직이 있어도, 이미지 로드 자체가 실패하면 다시 fallback으로 교체
        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;
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
                            src={activeStack.logo} 
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
                        <span>언급량 {activeStack.count.toLocaleString()}회</span>
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

            {/* 오른쪽: 검색창 */}
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
                                                    src={stack.logo} 
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

                {/* 뷰 모드 버튼들 */}
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

        {/* 메인 컨텐츠 */}
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
                            <StackRelationAnalysis mainStackName={activeStack.name} mainLogo={activeStack.logo} relatedNodes={relatedNodes} onClose={() => setViewMode("chart")} />
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