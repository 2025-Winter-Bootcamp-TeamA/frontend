"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRightLeft, Info, Plus, Building2, Link as LinkIcon, AlertCircle } from "lucide-react";
import Image from "next/image";
import { searchTechStacks, getExternalLogoUrl } from "@/services/trendService";
import { TechStackData } from "@/types/trend";
import { api } from "@/lib/api"; 
import JobCard from "./JobCard"; 

// 인터페이스 정의
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
  initialBaseStack: StackData; 
  allStacks: StackData[]; 
  onBack: () => void;
}

interface JobData {
    id: number;
    company_name: string;
    title: string;
    url: string;
    deadline: string;
    logo_url?: string;
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

export default function StackComparison({ initialBaseStack, allStacks, onBack }: StackComparisonProps) {
  const [leftStack, setLeftStack] = useState<StackData | null>(initialBaseStack);
  const [rightStack, setRightStack] = useState<StackData | null>(null);

  const [leftSearchTerm, setLeftSearchTerm] = useState("");
  const [rightSearchTerm, setRightSearchTerm] = useState("");
  
  const debouncedLeftSearch = useDebounce(leftSearchTerm, 300);
  const debouncedRightSearch = useDebounce(rightSearchTerm, 300);

  const [leftApiStacks, setLeftApiStacks] = useState<StackData[]>([]);
  const [rightApiStacks, setRightApiStacks] = useState<StackData[]>([]);
  const [isLeftSearching, setIsLeftSearching] = useState(false);
  const [isRightSearching, setIsRightSearching] = useState(false);

  // ✅ 교집합 공고 데이터 상태
  const [commonJobs, setCommonJobs] = useState<JobData[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 왼쪽 검색 API 연동
  useEffect(() => {
    const searchStacks = async () => {
      if (!debouncedLeftSearch.trim()) {
        setLeftApiStacks([]);
        return;
      }
      setIsLeftSearching(true);
      try {
        const results = await searchTechStacks(debouncedLeftSearch);
        const formatted = results.map((stack: TechStackData, index: number) => ({
          id: stack.id,
          name: stack.name,
          count: 0,
          growth: 0,
          color: index % 2 === 0 ? "from-blue-500 to-indigo-500" : "from-green-500 to-emerald-500",
          logo: stack.logo || getExternalLogoUrl(stack.name),
          themeColor: "#3B82F6",
          description: stack.description || "상세 설명이 없습니다.",
          officialSite: stack.docs_url || "#",
        }));
        setLeftApiStacks(formatted);
      } catch (error) {
        setLeftApiStacks([]);
      } finally {
        setIsLeftSearching(false);
      }
    };
    searchStacks();
  }, [debouncedLeftSearch]);

  // 오른쪽 검색 API 연동
  useEffect(() => {
    const searchStacks = async () => {
      if (!debouncedRightSearch.trim()) {
        setRightApiStacks([]);
        return;
      }
      setIsRightSearching(true);
      try {
        const results = await searchTechStacks(debouncedRightSearch);
        const formatted = results.map((stack: TechStackData, index: number) => ({
          id: stack.id,
          name: stack.name,
          count: 0,
          growth: 0,
          color: index % 2 === 0 ? "from-blue-500 to-indigo-500" : "from-green-500 to-emerald-500",
          logo: stack.logo || getExternalLogoUrl(stack.name),
          themeColor: "#3B82F6",
          description: stack.description || "상세 설명이 없습니다.",
          officialSite: stack.docs_url || "#",
        }));
        setRightApiStacks(formatted);
      } catch (error) {
        setRightApiStacks([]);
      } finally {
        setIsRightSearching(false);
      }
    };
    searchStacks();
  }, [debouncedRightSearch]);

  // ✅ 두 스택이 모두 선택되었을 때 공통 공고 분석 실행
  useEffect(() => {
    if (leftStack && rightStack) {
        findCommonJobs();
    } else {
        setCommonJobs([]);
    }
  }, [leftStack, rightStack]);

  // ✅ 공통 공고 찾기 함수 (API 연동)
  const findCommonJobs = async () => {
    if (!leftStack || !rightStack) return;
    setIsAnalyzing(true);
    setCommonJobs([]);

    try {
        // 두 기술 스택의 채용 공고를 병렬로 가져옴
        const [jobsLeftRes, jobsRightRes] = await Promise.all([
            api.get(`/jobs/by-tech/${leftStack.id}/`).catch(() => ({ data: [] })),
            api.get(`/jobs/by-tech/${rightStack.id}/`).catch(() => ({ data: [] }))
        ]);

        // 데이터 파싱 (배열 형태 확인)
        const jobsLeft = Array.isArray(jobsLeftRes.data) ? jobsLeftRes.data : jobsLeftRes.data.results || [];
        const jobsRight = Array.isArray(jobsRightRes.data) ? jobsRightRes.data : jobsRightRes.data.results || [];

        // 교집합 찾기 (공고 ID 기준)
        const rightIds = new Set(jobsRight.map((j: any) => j.id));
        const intersection = jobsLeft.filter((j: any) => rightIds.has(j.id));

        // JobData 형식으로 매핑
        const mappedCommonJobs = intersection.map((item: any) => ({
            id: item.id,
            company_name: item.corp?.name || "기업명 없음",
            title: item.title,
            url: item.url,
            deadline: item.expiry_date || "채용시 마감",
            logo_url: item.corp?.logo_url
        }));

        setCommonJobs(mappedCommonJobs);

    } catch (error) {
        console.error("Analysis failed:", error);
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleSelect = (side: "left" | "right", stack: StackData) => {
    if (side === "left") {
        setLeftStack(stack);
        setLeftSearchTerm("");
    } else {
        setRightStack(stack);
        setRightSearchTerm("");
    }
  };

  const getFilteredStacks = (side: "left" | "right") => {
    const term = side === "left" ? debouncedLeftSearch : debouncedRightSearch;
    const otherStack = side === "left" ? rightStack : leftStack;
    
    let candidates = allStacks.filter(s => s.id !== otherStack?.id);

    if (term) {
        const apiResults = side === "left" ? leftApiStacks : rightApiStacks;
        const apiCandidates = apiResults.filter(s => s.id !== otherStack?.id);
        
        const existingIds = new Set(apiCandidates.map(s => s.id));
        const filteredDefaults = candidates.filter(s => 
            !existingIds.has(s.id) && s.name.toLowerCase().includes(term.toLowerCase())
        );
        candidates = [...apiCandidates, ...filteredDefaults];
    }

    return candidates;
  };

  return (
    <div className="w-full h-full min-h-[500px] relative flex flex-col overflow-visible bg-[#25262B]/50 rounded-[32px]">
      
      {/* Header */}
      <div className="flex items-center justify-between p-1 mt-3 ml-3">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-blue-400" />
          기술 스택 비교 분석
        </h3>
        <button onClick={onBack} className="text-gray-500 hover:text-white transition-colors bg-gray-800/50 p-2 rounded-full">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Stack Selectors & VS - overflow-visible로 검색 드롭다운이 잘리지 않도록 */}
      <div className="flex items-start justify-center gap-4 md:gap-16 mb-8 relative pt-6 overflow-visible">
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

        <div className="flex flex-col items-center justify-center pt-8 z-10">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-800 border-4 border-[#25262B] shadow-xl">
                <span className="text-xl font-black italic text-gray-500 select-none">VS</span>
            </div>
        </div>

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

      {/* Result Section */}
      <AnimatePresence mode="wait">
        {leftStack && rightStack && (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-4 space-y-4"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Descriptions */}
                    <div className="bg-[#1A1B1E] p-5 rounded-2xl border border-gray-800 shadow-sm flex flex-col justify-between">
                        <h4 className="text-gray-500 text-[18px] font-bold mb-4 uppercase tracking-wider flex items-center gap-2">
                            <Info className="w-6 h-6" /> 기술 설명
                        </h4>
                        <div className="space-y-4">
                            <div>
                                <span className="text-blue-400 font-bold text-xm mb-1 block">{leftStack.name}</span>
                                <p className="text-sm text-gray-300 leading-relaxed line-clamp-6">
                                    {leftStack.description || "설명 데이터가 없습니다."}
                                </p>
                            </div>
                            <div className="border-t border-gray-800 pt-3">
                                <span className="text-purple-400 font-bold text-xm mb-1 block">{rightStack.name}</span>
                                <p className="text-sm text-gray-300 leading-relaxed line-clamp-6">
                                    {rightStack.description || "설명 데이터가 없습니다."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Mention Count Bar */}
                    <div className="bg-[#1A1B1E] p-5 rounded-2xl border border-gray-800 shadow-sm flex flex-col justify-start">
                         <h4 className="text-gray-500 text-[18px] font-bold mb-8 uppercase tracking-wider flex items-center gap-2">
                            <Building2 className="w-6 h-6" /> 언급량 차이 비교
                         </h4>
                         <div className="flex items-center justify-between text-xm text-gray-400 mb-2">
                            <span className="text-blue-400 font-bold">{leftStack.name}</span>
                            <span className="text-purple-400 font-bold">{rightStack.name}</span>
                         </div>
                         <div className="flex items-center h-8 gap-1 w-full rounded-lg overflow-hidden bg-gray-800 relative">
                            <div 
                                style={{ width: `${(leftStack.count / (leftStack.count + rightStack.count || 1)) * 100}%` }} 
                                className="h-full bg-blue-600 relative group min-w-[10%] transition-all duration-1000 ease-out flex items-center pl-3"
                            >
                                <span className="text-[14px] font-bold text-white/90 whitespace-nowrap">
                                    {leftStack.count.toLocaleString()}
                                </span>
                            </div>
                            <div 
                                style={{ width: `${(rightStack.count / (leftStack.count + rightStack.count || 1)) * 100}%` }} 
                                className="h-full bg-purple-600 relative group min-w-[10%] transition-all duration-1000 ease-out flex items-center justify-end pr-3"
                            >
                                <span className="text-[14px] font-bold text-white/90 whitespace-nowrap">
                                    {rightStack.count.toLocaleString()}
                                </span>
                            </div>
                         </div>
                    </div>
                </div>

                {/* ✅ 2. Co-occurring Jobs (API 연동됨) */}
                <div className="bg-[#1A1B1E] p-5 rounded-2xl border border-gray-800 shadow-sm">
                    <h4 className="text-gray-500 text-[18px] font-bold mb-4 uppercase tracking-wider flex items-center gap-2">
                        <LinkIcon className="w-6 h-6" /> 교집합 관련 채용 공고
                        <span className="bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded text-[14px] ml-1">
                            {commonJobs.length}
                        </span>
                    </h4>
                    
                    {isAnalyzing ? (
                        <div className="py-8 text-center text-sm text-gray-500 animate-pulse">
                            두 기술이 함께 언급된 공고를 찾는 중...
                        </div>
                    ) : commonJobs.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                            {commonJobs.map((job) => (
                                <JobCard
                                    key={job.id}
                                    id={job.id}
                                    company={job.company_name}
                                    position={job.title}
                                    logo={job.logo_url}
                                    deadline={job.deadline}
                                    url={job.url} 
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="py-8 flex flex-col items-center justify-center text-center text-gray-500">
                            <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-sm">두 기술 스택이 동시에 언급된 채용 공고가 없습니다.</p>
                        </div>
                    )}
                </div>

            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 하단 StackSlot 컴포넌트는 기존 디자인을 완벽히 유지합니다.
function StackSlot({ side, stack, searchTerm, onSearchChange, onRemove, onSelect, suggestions, isSearching }: any) {
    const [isFocused, setIsFocused] = useState(false);
    const isDropdownOpen = !stack && isFocused; // 포커스 있을 때만 드롭다운(블러 시 닫힘)

    return (
        <div className={`flex flex-col items-center gap-2 w-[140px] md:w-[180px] relative overflow-visible ${isDropdownOpen ? 'z-[200]' : 'z-20'}`}>
            <AnimatePresence mode="wait">
            {stack ? (
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
                            autoComplete="off"
                            spellCheck={false}
                            autoCorrect="off"
                            autoCapitalize="off"
                            onFocus={() => setIsFocused(true)} 
                            onBlur={() => setTimeout(() => setIsFocused(false), 200)} 
                            autoFocus
                            className="w-full bg-[#1A1B1E] border border-gray-600 rounded-lg py-2 pl-8 pr-2 text-sm text-white focus:border-blue-500 outline-none placeholder:text-gray-500 shadow-inner"
                        />
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
                    </div>

                    {isFocused && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#25262B] border border-gray-600 rounded-lg shadow-2xl z-[210] max-h-[200px] overflow-y-auto custom-scrollbar">
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