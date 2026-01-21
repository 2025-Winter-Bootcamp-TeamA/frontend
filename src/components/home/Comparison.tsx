"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRightLeft, CheckCircle2, Building2, Info, Plus } from "lucide-react";
import Image from "next/image";
import { searchTechStacks, getExternalLogoUrl } from "@/services/trendService";
import { TechStackData } from "@/types/trend";

// ✅ 데이터 타입 정의 (외부에서 쓸 수 있게 export)
export interface StackData {
  id: number;
  name: string;
  count: number;
  growth: number;
  color: string;
  logo: string;
  themeColor: string;
  description?: string;
  usage?: string[];
  companyCount?: number;
  communityCount?: number;
}

interface StackComparisonProps {
  initialBaseStack: StackData; // 대시보드에서 넘어온 초기 스택
  allStacks: StackData[];      // 검색할 전체 스택 리스트 (기존 데이터, 하위 호환성)
  onBack: () => void;          // 뒤로가기
}

// ✅ 내부 검색용 디바운스 훅
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function StackComparison({ initialBaseStack, allStacks, onBack }: StackComparisonProps) {
  // 1. 왼쪽(기준), 오른쪽(비교) 스택 상태 관리
  const [leftStack, setLeftStack] = useState<StackData | null>(initialBaseStack);
  const [rightStack, setRightStack] = useState<StackData | null>(null);

  // 2. 각 슬롯의 검색어 상태
  const [leftSearchTerm, setLeftSearchTerm] = useState("");
  const [rightSearchTerm, setRightSearchTerm] = useState("");
  
  const debouncedLeftSearch = useDebounce(leftSearchTerm, 300);
  const debouncedRightSearch = useDebounce(rightSearchTerm, 300);

  // 3. API에서 검색한 기술 스택 목록 (각 슬롯별로 독립적으로 관리)
  const [leftApiStacks, setLeftApiStacks] = useState<StackData[]>([]);
  const [rightApiStacks, setRightApiStacks] = useState<StackData[]>([]);
  const [isLeftSearching, setIsLeftSearching] = useState(false);
  const [isRightSearching, setIsRightSearching] = useState(false);

  // 왼쪽 슬롯 API 검색
  useEffect(() => {
    const searchStacks = async () => {
      if (!debouncedLeftSearch.trim()) {
        setLeftApiStacks([]);
        return;
      }

      setIsLeftSearching(true);
      try {
        const results = await searchTechStacks(debouncedLeftSearch);
        // TechStackData를 StackData로 변환
        const formatted = results.map((stack: TechStackData, index: number) => ({
          id: stack.id,
          name: stack.name,
          count: Math.floor(Math.random() * 5000) + 1000,
          growth: parseFloat((Math.random() * 20).toFixed(1)),
          color: index % 2 === 0 ? "from-blue-500 to-indigo-500" : "from-green-500 to-emerald-500",
          logo: stack.logo || getExternalLogoUrl(stack.name),
          themeColor: "#3B82F6",
          description: stack.description || "상세 설명이 없습니다.",
          officialSite: stack.docs_url || "#",
        }));
        setLeftApiStacks(formatted);
      } catch (error) {
        console.error("Failed to search tech stacks:", error);
        setLeftApiStacks([]);
      } finally {
        setIsLeftSearching(false);
      }
    };

    searchStacks();
  }, [debouncedLeftSearch]);

  // 오른쪽 슬롯 API 검색
  useEffect(() => {
    const searchStacks = async () => {
      if (!debouncedRightSearch.trim()) {
        setRightApiStacks([]);
        return;
      }

      setIsRightSearching(true);
      try {
        const results = await searchTechStacks(debouncedRightSearch);
        // TechStackData를 StackData로 변환
        const formatted = results.map((stack: TechStackData, index: number) => ({
          id: stack.id,
          name: stack.name,
          count: Math.floor(Math.random() * 5000) + 1000,
          growth: parseFloat((Math.random() * 20).toFixed(1)),
          color: index % 2 === 0 ? "from-blue-500 to-indigo-500" : "from-green-500 to-emerald-500",
          logo: stack.logo || getExternalLogoUrl(stack.name),
          themeColor: "#3B82F6",
          description: stack.description || "상세 설명이 없습니다.",
          officialSite: stack.docs_url || "#",
        }));
        setRightApiStacks(formatted);
      } catch (error) {
        console.error("Failed to search tech stacks:", error);
        setRightApiStacks([]);
      } finally {
        setIsRightSearching(false);
      }
    };

    searchStacks();
  }, [debouncedRightSearch]);

  // 3. 매칭률 계산 (Mock Logic)
  const getMatchingRate = () => {
    if (!leftStack || !rightStack) return 0;
    const seed = leftStack.name.length + rightStack.name.length;
    return Math.min(98, 70 + (seed % 30)); 
  };

  // 4. 스택 선택/삭제 핸들러
  const handleSelect = (side: "left" | "right", stack: StackData) => {
    if (side === "left") {
        setLeftStack(stack);
        setLeftSearchTerm("");
    } else {
        setRightStack(stack);
        setRightSearchTerm("");
    }
  };

  // 5. 검색 결과 필터링 (이미 선택된 반대편 스택은 제외)
  const getFilteredStacks = (side: "left" | "right") => {
    const term = side === "left" ? debouncedLeftSearch : debouncedRightSearch;
    const otherStack = side === "left" ? rightStack : leftStack;
    const apiResults = side === "left" ? leftApiStacks : rightApiStacks;
    
    if (!term) return []; // 검색어 없으면 빈 배열

    // API 검색 결과 사용 (부분 일치 검색 - 백엔드에서 이미 처리됨)
    const searchResults = apiResults.filter(s => 
        s.id !== otherStack?.id
    );

    // 기존 allStacks와 병합 (중복 제거)
    const existingIds = new Set(searchResults.map(s => s.id));
    const additionalStacks = allStacks.filter(s => 
        s.id !== otherStack?.id &&
        !existingIds.has(s.id) &&
        s.name.toLowerCase().includes(term.toLowerCase())
    );

    return [...searchResults, ...additionalStacks];
  };

  return (
    <div className="w-full h-full min-h-[500px] relative flex flex-col bg-[#25262B]/50 rounded-[32px]">
      
      {/* 상단 네비게이션 */}
      <div className="flex items-center justify-between mb-2 p-1">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-blue-400" />
          기술 스택 비교 분석
        </h3>
        <button onClick={onBack} className="text-gray-500 hover:text-white transition-colors bg-gray-800/50 p-2 rounded-full">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ================= 메인 슬롯 영역 (좌 vs 우) ================= */}
      <div className="flex items-start justify-center gap-4 md:gap-12 mb-8 relative pt-4">
        
        {/* Left Slot */}
        <StackSlot 
            side="left"
            stack={leftStack}
            searchTerm={leftSearchTerm}
            onSearchChange={setLeftSearchTerm}
            onRemove={() => setLeftStack(null)}
            onSelect={(s:any) => handleSelect("left", s)}
            suggestions={getFilteredStacks("left")}
            isSearching={isLeftSearching}
        />

        {/* Center: VS or Matching Rate */}
        <div className="flex flex-col items-center pt-8 z-10">
            {leftStack && rightStack ? (
                <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                     {/* ✅ 툴팁이 포함된 매칭률 정보 */}
                    <div className="group relative cursor-help">
                        <div className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm font-bold flex items-center gap-1.5 transition-all hover:bg-green-500/20">
                            <CheckCircle2 className="w-4 h-4" />
                            {getMatchingRate()}% 매칭
                            <Info className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
                        </div>
                        
                        {/* 툴팁 (Tooltip) */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 bg-gray-900 text-white text-xs p-3 rounded-xl shadow-2xl border border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center">
                            <p className="font-bold mb-1 text-green-400">매칭률(Matching Rate)이란?</p>
                            <p className="text-gray-300 leading-relaxed">
                                실제 채용 공고와 프로젝트 데이터에서 <br/>
                                <span className="text-white font-bold">두 기술이 함께 사용된 빈도</span>를<br/>
                                분석한 적합성 지표입니다.
                            </p>
                            <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 border-b border-r border-gray-700 rotate-45" />
                        </div>
                    </div>
                </div>
            ) : (
                <span className="text-3xl font-black italic text-gray-700 mt-2 select-none">VS</span>
            )}
        </div>

        {/* Right Slot */}
        <StackSlot 
            side="right"
            stack={rightStack}
            searchTerm={rightSearchTerm}
            onSearchChange={setRightSearchTerm}
            onRemove={() => setRightStack(null)}
            onSelect={(s:any) => handleSelect("right", s)}
            suggestions={getFilteredStacks("right")}
            isSearching={isRightSearching}
        />
      </div>

      {/* ================= 상세 비교 결과 그리드 ================= */}
      <AnimatePresence mode="wait">
        {leftStack && rightStack && (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-2 custom-scrollbar pb-4"
            >
                {/* A. Description */}
                <div className="col-span-1 md:col-span-2 bg-[#1A1B1E] p-5 rounded-2xl border border-gray-800 shadow-sm">
                    <h4 className="text-gray-500 text-[10px] font-bold mb-4 uppercase tracking-wider flex items-center gap-2">
                        <Info className="w-3 h-3" /> Core Description
                    </h4>
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <span className="text-blue-400 font-bold text-xs mb-2 block">{leftStack.name}</span>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                {leftStack.description || "설명 데이터가 없습니다."}
                            </p>
                        </div>
                        <div>
                            <span className="text-purple-400 font-bold text-xs mb-2 block">{rightStack.name}</span>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                {rightStack.description || "설명 데이터가 없습니다."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* B. Usage & Category */}
                <div className="col-span-1 md:col-span-2 bg-[#1A1B1E] p-5 rounded-2xl border border-gray-800 shadow-sm">
                    <h4 className="text-gray-500 text-[10px] font-bold mb-4 uppercase tracking-wider">Usage & Domain</h4>
                    <div className="flex justify-between items-start">
                        <div className="flex flex-wrap gap-2 max-w-[45%] justify-start content-start">
                            {(leftStack.usage || ["General"]).map(t => (
                                <span key={t} className="px-2.5 py-1 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-lg border border-blue-500/20">{t}</span>
                            ))}
                        </div>
                        <div className="w-px h-8 bg-gray-700 mx-2 self-center opacity-50" />
                        <div className="flex flex-wrap gap-2 max-w-[45%] justify-end content-start ml-auto">
                            {(rightStack.usage || ["General"]).map(t => (
                                <span key={t} className="px-2.5 py-1 bg-purple-500/10 text-purple-400 text-xs font-medium rounded-lg border border-purple-500/20 text-right">{t}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* C. Trend Volume */}
                <div className="col-span-1 md:col-span-2 bg-[#1A1B1E] p-5 rounded-2xl border border-gray-800 shadow-sm">
                     <h4 className="text-gray-500 text-[10px] font-bold mb-4 uppercase tracking-wider">Market Demand (2025)</h4>
                     
                     {/* 기업 언급량 바 */}
                     <div className="mb-2">
                        <div className="flex items-center gap-2 mb-3">
                            <Building2 className="w-4 h-4 text-gray-500" />
                            <span className="text-xs text-gray-400">기업 채용 공고 점유율</span>
                        </div>
                        <div className="flex items-center h-6 gap-1 w-full rounded-full overflow-hidden bg-gray-800">
                            <div 
                                style={{ width: `${(leftStack.count / (leftStack.count + rightStack.count)) * 100}%` }} 
                                className="h-full bg-blue-600 relative group min-w-[15%] transition-all duration-1000 ease-out"
                            >
                                <span className="absolute inset-0 flex items-center justify-start pl-3 text-[10px] font-bold text-white/90">
                                    {leftStack.count.toLocaleString()}
                                </span>
                            </div>
                            <div 
                                style={{ width: `${(rightStack.count / (leftStack.count + rightStack.count)) * 100}%` }} 
                                className="h-full bg-purple-600 relative group min-w-[15%] transition-all duration-1000 ease-out"
                            >
                                <span className="absolute inset-0 flex items-center justify-end pr-3 text-[10px] font-bold text-white/90">
                                    {rightStack.count.toLocaleString()}
                                </span>
                            </div>
                        </div>
                     </div>
                </div>

            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 🧩 하위 컴포넌트: 스택 슬롯 (선택됨/비어있음/검색 처리)
function StackSlot({ side, stack, searchTerm, onSearchChange, onRemove, onSelect, suggestions, isSearching }: any) {
    return (
        <div className="flex flex-col items-center gap-2 w-[140px] md:w-[180px] relative z-20">
            <AnimatePresence mode="wait">
            {stack ? (
                // 1. 스택이 선택된 상태
                <motion.div 
                    key="selected"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="relative group w-full flex flex-col items-center"
                >
                    <button 
                        onClick={onRemove}
                        className="absolute -top-2 -right-2 bg-gray-700 hover:bg-red-500 text-gray-400 hover:text-white rounded-full p-1.5 shadow-md transition-all z-20"
                        title="삭제하고 다시 검색"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                    <div className={`w-20 h-20 md:w-24 md:h-24 bg-gray-900 rounded-2xl border-2 flex items-center justify-center shadow-lg transition-all ${
                        side === 'left' ? 'border-blue-500/50 shadow-blue-900/20' : 'border-purple-500/50 shadow-purple-900/20'
                    }`}>
                        <Image src={stack.logo} alt={stack.name} width={50} height={50} className="object-contain" unoptimized />
                    </div>
                    <span className="text-white font-bold text-lg mt-3">{stack.name}</span>
                </motion.div>
            ) : (
                // 2. 비어있는 상태 (검색창)
                <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full relative"
                >
                    <div className="w-20 h-20 md:w-24 md:h-24 mx-auto bg-gray-800/30 rounded-2xl border-2 border-dashed border-gray-700 flex items-center justify-center mb-3">
                        <Plus className="w-8 h-8 text-gray-600" />
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={side === 'left' ? "기준 기술 검색" : "비교 기술 검색"}
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            autoFocus
                            className="w-full bg-[#1A1B1E] border border-gray-600 rounded-lg py-2 pl-8 pr-2 text-sm text-white focus:border-blue-500 outline-none placeholder:text-gray-500 shadow-inner"
                        />
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
                    </div>

                    {/* 자동완성 드롭다운 */}
                    {searchTerm && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#25262B] border border-gray-600 rounded-lg shadow-2xl z-50 max-h-[200px] overflow-y-auto custom-scrollbar">
                            {isSearching ? (
                                <div className="p-3 text-center text-xs text-gray-500">검색 중...</div>
                            ) : suggestions.length > 0 ? (
                                suggestions.map((s: StackData) => (
                                    <button
                                        key={s.id}
                                        onClick={() => onSelect(s)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-700/50 text-left transition-colors border-b border-gray-700/50 last:border-0"
                                    >
                                        <div className="w-6 h-6 relative grayscale hover:grayscale-0">
                                            <Image src={s.logo} alt={s.name} fill className="object-contain" unoptimized />
                                        </div>
                                        <span className="text-sm text-gray-200 font-medium">{s.name}</span>
                                    </button>
                                ))
                            ) : (
                                <div className="p-3 text-center text-xs text-gray-500">검색 결과가 없습니다.</div>
                            )}
                        </div>
                    )}
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
}