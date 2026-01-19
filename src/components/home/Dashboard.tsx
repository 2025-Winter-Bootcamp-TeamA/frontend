"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, TrendingUp, Share2, Scale, X, Sparkles, Star, Globe, ExternalLink } from "lucide-react";
import Image from "next/image";
import TrendChart from "./TrendChart";
import StackComparison, { StackData } from "./Comparison";
import StackRelationAnalysis from "./RelationAnalysis";

// --- 데이터 및 헬퍼 함수 ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const CUSTOM_STACKS: (StackData & { officialSite: string })[] = [
  {
    id: 1,
    name: "React",
    count: 12540,
    growth: 12.5,
    color: "from-blue-500 to-cyan-400",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png",
    themeColor: "#3B82F6",
    description: "Meta가 개발한 컴포넌트 기반 UI 라이브러리입니다.",
    usage: ["Frontend", "SPA"],
    companyCount: 8200,
    communityCount: 4340,
    officialSite: "https://react.dev"
  },
  {
    id: 2,
    name: "Next.js",
    count: 9200,
    growth: 24.8,
    color: "from-gray-600 to-gray-400",
    logo: "https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_light_background.png",
    themeColor: "#ffffff",
    description: "React 기반의 풀스택 웹 프레임워크입니다.",
    usage: ["Fullstack", "SSR"],
    companyCount: 6100,
    communityCount: 3100,
    officialSite: "https://nextjs.org"
  },
  {
    id: 3,
    name: "TypeScript",
    count: 8800,
    growth: 15.2,
    color: "from-blue-600 to-blue-500",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Typescript_logo_2020.svg/1200px-Typescript_logo_2020.svg.png",
    themeColor: "#3178C6",
    description: "JavaScript에 정적 타입을 추가한 상위 집합 언어입니다.",
    usage: ["Language", "Type Safety"],
    companyCount: 5800,
    communityCount: 3000,
    officialSite: "https://www.typescriptlang.org"
  }
];

const RELATED_NODES: Record<string, string[]> = {
  "React": ["Redux", "Zustand", "Next.js", "Vite", "React Query", "Tailwind"],
  "Next.js": ["Vercel", "React", "Turbo", "ISR", "Server Actions"],
  "TypeScript": ["JavaScript", "Zod", "NestJS", "TypeORM", "VS Code"],
};

const MOCK_CHART_DATA = [
  { year: "2019", company: 2400, community: 4000 },
  { year: "2020", company: 3500, community: 4500 },
  { year: "2021", company: 5800, community: 5200 },
  { year: "2022", company: 8200, community: 6100 },
  { year: "2023", company: 9800, community: 7500 },
  { year: "2024", company: 12500, community: 8900 },
  { year: "2025", company: 15400, community: 9200 },
];

export default function StackDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [viewMode, setViewMode] = useState<"chart" | "graph" | "compare">("chart");
  
  // 초기값: React (빈 화면 방지)
  const [selectedStack, setSelectedStack] = useState<StackData>(CUSTOM_STACKS[0]);
  const [isDefault, setIsDefault] = useState(true);
  
  // ✅ [추가] 드롭다운 표시 여부 상태
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [favorites, setFavorites] = useState<number[]>([]);

  // 현재 보여줄 스택 (없으면 기본값)
  const activeStack = selectedStack || CUSTOM_STACKS[0];

  // 검색 필터링 + 즐겨찾기 정렬
  const filteredSuggestions = CUSTOM_STACKS
    .filter((stack) =>
      stack.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aFav = favorites.includes(a.id);
      const bFav = favorites.includes(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0;
    });

  // ✅ 검색어 변경 핸들러 (입력 시 드롭다운 열기)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true); 
  };

  const clearSearch = () => {
      setSearchTerm("");
      setShowDropdown(false); // X 버튼 누르면 드롭다운 닫기
  };
  
  // ✅ 항목 선택 핸들러 (선택 시 드롭다운 닫기)
  const handleSelectStack = (stack: StackData) => {
      setSearchTerm(stack.name);
      setSelectedStack(stack);
      setIsDefault(false);
      setViewMode("chart");
      setShowDropdown(false); // 중요: 선택 후 목록 숨김
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const relatedNodes = RELATED_NODES[activeStack.name] || [];
  const isFavorite = favorites.includes(activeStack.id);

  return (
    <section className="w-full h-full">
      <div 
        className="w-full bg-[#25262B] rounded-[24px] lg:rounded-[32px] p-6 lg:p-8 border border-gray-800 shadow-2xl relative overflow-hidden transition-all duration-500 flex flex-col min-h-[600px] lg:h-full"
      >
        
        {/* 헤더 영역 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4 lg:mb-6 relative z-30 min-h-[60px] flex-shrink-0">
          <AnimatePresence mode="wait">
            <motion.div 
                key={activeStack.id} 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }} 
                className="flex items-center gap-4"
            >
              <div className="w-14 h-14 lg:w-16 lg:h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 p-3 relative group">
                <Image src={activeStack.logo} alt={activeStack.name} width={40} height={40} className="object-contain" unoptimized />
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              </div>
              
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl lg:text-3xl font-bold text-white">{activeStack.name}</h2>
                  
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => toggleFavorite(activeStack.id)}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors group"
                      title="즐겨찾기 추가"
                    >
                      <Star 
                        className={`w-5 h-5 transition-all ${isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-500 group-hover:text-gray-300"}`} 
                      />
                    </button>

                    <a 
                      href={(activeStack as any).officialSite} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-500 hover:text-blue-400 group"
                      title="공식 문서로 이동"
                    >
                      <Globe className="w-5 h-5" />
                    </a>
                  </div>

                  <span className="ml-1 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-bold rounded-full flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +{activeStack.growth}%
                  </span>
                </div>
                
                <p className="text-gray-400 text-xs lg:text-sm flex items-center gap-2">
                    {isDefault && <span className="text-blue-400 font-semibold bg-blue-400/10 px-1.5 py-0.5 rounded text-[10px]">Sample</span>}
                    {activeStack.description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-4 hidden md:flex">
                <button onClick={() => setViewMode(viewMode === "graph" ? "chart" : "graph")} className={`group flex flex-col items-center gap-1 transition-transform hover:scale-105 ${viewMode === "compare" ? "opacity-50 hover:opacity-100" : ""}`}>
                    <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center border transition-all ${viewMode === "graph" ? "bg-blue-600 border-white text-white" : "bg-gray-800 border-gray-600 text-gray-400 group-hover:border-blue-400 group-hover:text-white"}`}>
                        <Share2 className="w-4 h-4 lg:w-5 lg:h-5" />
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium group-hover:text-blue-400">연관분석</span>
                </button>
                <div className="w-px h-8 bg-gray-700" />
                <button onClick={() => setViewMode(viewMode === "compare" ? "chart" : "compare")} className={`group flex flex-col items-center gap-1 transition-transform hover:scale-105 ${viewMode === "graph" ? "opacity-50 hover:opacity-100" : ""}`}>
                    <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center border transition-all ${viewMode === "compare" ? "bg-purple-600 border-white text-white" : "bg-gray-800 border-gray-600 text-gray-400 group-hover:border-purple-400 group-hover:text-white"}`}>
                        <Scale className="w-4 h-4 lg:w-5 lg:h-5" />
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium group-hover:text-purple-400">기술비교</span>
                </button>
            </motion.div>

            {/* 검색창 */}
            <div className="relative w-full md:w-[320px]">
                <input 
                    type="text" 
                    placeholder="기술 스택 검색..." 
                    value={searchTerm} 
                    onChange={handleSearchChange} // ✅ 변경 핸들러 적용
                    onFocus={() => setShowDropdown(true)} // ✅ 포커스 시 드롭다운 다시 열기
                    className="w-full bg-[#1A1B1E] text-white pl-10 pr-4 py-3 lg:pl-12 lg:pr-4 lg:py-4 rounded-xl border border-gray-700 focus:border-blue-500 outline-none transition-all placeholder:text-gray-600 shadow-lg text-sm lg:text-base" 
                />
                <Search className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 lg:w-5 lg:h-5" />
                {searchTerm && <button onClick={clearSearch} className="absolute right-3 lg:right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>}
                
                {/* ✅ 검색 결과 드롭다운: showDropdown 상태에 따라 표시 */}
                {searchTerm && showDropdown && filteredSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#25262B] border border-gray-600 rounded-xl shadow-2xl z-50 overflow-hidden max-h-[300px] overflow-y-auto custom-scrollbar">
                        {filteredSuggestions.map(s => {
                            const isFav = favorites.includes(s.id);
                            return (
                                <button key={s.id} onClick={() => handleSelectStack(s)} className="w-full text-left px-4 py-3 hover:bg-gray-700/50 text-sm text-gray-300 flex items-center justify-between border-b border-gray-700/50 last:border-0 group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 relative grayscale hover:grayscale-0 flex-shrink-0">
                                            <Image src={s.logo} alt={s.name} fill className="object-contain" unoptimized />
                                        </div>
                                        <span className={isFav ? "text-yellow-400 font-bold" : "text-gray-300"}>{s.name}</span>
                                    </div>
                                    
                                    <div 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFavorite(s.id);
                                        }}
                                        className="p-1 rounded-full hover:bg-white/10 transition-colors"
                                    >
                                        <Star 
                                            className={`w-4 h-4 ${isFav ? "fill-yellow-400 text-yellow-400" : "text-gray-600 group-hover:text-gray-400"}`} 
                                        />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 영역 */}
        <div className="relative z-10 flex-1 w-full min-h-0 overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="wait">
                <div className="w-full h-full relative min-h-[300px]">
                    {viewMode === "compare" && (
                            <motion.div 
                            key="compare-view" 
                            initial={{ opacity: 0, scale: 0.95 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            exit={{ opacity: 0, scale: 0.95 }} 
                            transition={{ duration: 0.3 }} 
                            className="absolute inset-0 pb-20 pr-2"
                            >
                            <StackComparison initialBaseStack={activeStack} allStacks={CUSTOM_STACKS} onBack={() => setViewMode("chart")} />
                            </motion.div>
                    )}
                    {viewMode === "graph" && (
                            <motion.div key="node-graph" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }} className="absolute inset-0 overflow-hidden">
                            <StackRelationAnalysis mainStackName={activeStack.name} mainLogo={activeStack.logo} relatedNodes={relatedNodes} onClose={() => setViewMode("chart")} />
                        </motion.div>
                    )}
                    {viewMode === "chart" && (
                        <motion.div key="trend-chart" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="absolute inset-0 pt-4 w-full h-full pb-10">
                            <TrendChart color={activeStack.themeColor} data={MOCK_CHART_DATA} />
                        </motion.div>
                    )}
                </div>
            </AnimatePresence>
        </div>
      </div>
    </section>
  );
}