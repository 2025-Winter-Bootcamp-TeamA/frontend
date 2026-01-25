"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRightLeft, Info, Plus, Building2, Link as LinkIcon, AlertCircle, Trophy, Star, MessageSquare, Briefcase } from "lucide-react";
import Image from "next/image";
import { searchTechStacks, getExternalLogoUrl } from "@/services/trendService";
import { TechStackData } from "@/types/trend";
import { api } from "@/lib/api"; 
import JobCard from "./JobCard"; 

export interface StackData {
  id: number;
  name: string;
  postCount: number; 
  jobCount: number; 
  growth: number;
  color: string;
  logo: string;
  themeColor: string;
  description?: string;
  usage?: string[];
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

  const [favoriteStacks, setFavoriteStacks] = useState<StackData[]>([]);
  const [commonJobs, setCommonJobs] = useState<JobData[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [compareMode, setCompareMode] = useState<'posts' | 'jobs'>('jobs');

  useEffect(() => {
    if (initialBaseStack) {
        updateStackWithDetail(initialBaseStack, "left");
    }
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
        try {
            const response = await api.get('/trends/tech-bookmarks/'); 
            const bookmarks = response.data.results || response.data || [];
            
            const formattedFavorites = bookmarks.map((item: any) => {
                const tech = item.tech_stack || item;
                return {
                    id: tech.id || tech.tech_stack_id,
                    name: tech.name,
                    postCount: Number(tech.article_stack_count) || 0,
                    jobCount: Number(tech.job_stack_count) || 0,
                    growth: 0,
                    color: "from-gray-500 to-gray-700",
                    logo: tech.logo || getExternalLogoUrl(tech.name),
                    themeColor: "#ffffff",
                    description: tech.description,
                };
            });
            setFavoriteStacks(formattedFavorites);
        } catch (error) {
            console.error("Failed to fetch favorites:", error);
            setFavoriteStacks([]);
        }
    };
    fetchFavorites();
  }, []);

  useEffect(() => {
    const searchStacks = async () => {
      if (!debouncedLeftSearch.trim()) {
        setLeftApiStacks([]);
        return;
      }
      setIsLeftSearching(true);
      try {
        const results = await searchTechStacks(debouncedLeftSearch);
        const formatted = results.map((stack: any, index: number) => ({
          id: stack.id,
          name: stack.name,
          postCount: Number(stack.article_stack_count) || 0,
          jobCount: Number(stack.job_stack_count) || 0,
          growth: 0,
          color: index % 2 === 0 ? "from-blue-500 to-indigo-500" : "from-green-500 to-emerald-500",
          logo: stack.logo || getExternalLogoUrl(stack.name),
          themeColor: "#3B82F6",
          description: stack.description || "상세 설명이 없습니다.",
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

  useEffect(() => {
    const searchStacks = async () => {
      if (!debouncedRightSearch.trim()) {
        setRightApiStacks([]);
        return;
      }
      setIsRightSearching(true);
      try {
        const results = await searchTechStacks(debouncedRightSearch);
        const formatted = results.map((stack: any, index: number) => ({
          id: stack.id,
          name: stack.name,
          postCount: Number(stack.article_stack_count) || 0,
          jobCount: Number(stack.job_stack_count) || 0,
          growth: 0,
          color: index % 2 === 0 ? "from-blue-500 to-indigo-500" : "from-green-500 to-emerald-500",
          logo: stack.logo || getExternalLogoUrl(stack.name),
          themeColor: "#3B82F6",
          description: stack.description || "상세 설명이 없습니다.",
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

  useEffect(() => {
    if (leftStack && rightStack) {
        findCommonJobs();
    } else {
        setCommonJobs([]);
    }
  }, [leftStack, rightStack]);

  const updateStackWithDetail = async (stack: StackData, side: "left" | "right") => {
      try {
          const response = await api.get(`/trends/tech-stacks/${stack.id}/`);
          const detailData = response.data;

          const updatedStack: StackData = {
              ...stack,
              postCount: Number(detailData.article_stack_count) || 0,
              jobCount: Number(detailData.job_stack_count) || 0,
              description: detailData.description || stack.description,
              logo: detailData.logo || stack.logo
          };

          if (side === "left") setLeftStack(updatedStack);
          else setRightStack(updatedStack);

      } catch (error) {
          console.error(`Failed to fetch details for ${stack.name}:`, error);
          if (side === "left") setLeftStack(stack);
          else setRightStack(stack);
      }
  };

  const findCommonJobs = async () => {
    if (!leftStack || !rightStack) return;
    setIsAnalyzing(true);
    setCommonJobs([]);

    try {
        const [jobsLeftRes, jobsRightRes] = await Promise.all([
            api.get(`/jobs/by-tech/${leftStack.id}/`).catch(() => ({ data: [] })),
            api.get(`/jobs/by-tech/${rightStack.id}/`).catch(() => ({ data: [] }))
        ]);

        const jobsLeft = Array.isArray(jobsLeftRes.data) ? jobsLeftRes.data : jobsLeftRes.data.results || [];
        const jobsRight = Array.isArray(jobsRightRes.data) ? jobsRightRes.data : jobsRightRes.data.results || [];

        const rightIds = new Set(jobsRight.map((j: any) => j.id));
        const intersection = jobsLeft.filter((j: any) => rightIds.has(j.id));

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
        updateStackWithDetail(stack, "left");
    } else {
        setRightStack(stack);
        setRightSearchTerm("");
        updateStackWithDetail(stack, "right");
    }
  };

  const getFilteredStacks = (side: "left" | "right") => {
    const term = side === "left" ? debouncedLeftSearch : debouncedRightSearch;
    
    if (term) {
        const apiResults = side === "left" ? leftApiStacks : rightApiStacks;
        const otherStack = side === "left" ? rightStack : leftStack;
        return apiResults.filter(s => s.id !== otherStack?.id);
    }
    return favoriteStacks;
  };

  const getCount = (stack: StackData | null) => {
      if (!stack) return 0;
      return compareMode === 'jobs' ? stack.jobCount : stack.postCount;
  };

  // ✅ 그래프 계산 로직 수정
  const leftCount = getCount(leftStack);
  const rightCount = getCount(rightStack);
  const totalCount = leftCount + rightCount;

  // Total이 0이면 너비도 0% (색상 표시 안 함 -> 회색 배경만 보임)
  const leftWidth = totalCount === 0 ? 0 : (leftCount / totalCount) * 100;
  const rightWidth = totalCount === 0 ? 0 : (rightCount / totalCount) * 100;

  return (
    <div className="w-full h-full min-h-[500px] relative flex flex-col overflow-visible bg-[#25262B]/50 rounded-[32px]">
      
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
            favorites={favoriteStacks}
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
            favorites={favoriteStacks}
        />
      </div>

      <AnimatePresence mode="wait">
        {leftStack && rightStack && (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-4 space-y-4"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#1A1B1E] p-5 rounded-2xl border border-gray-800 shadow-sm flex flex-col justify-start gap-4">
                        <h4 className="text-gray-500 text-[18px] font-bold uppercase tracking-wider flex items-center gap-2">
                            <Info className="w-6 h-6" /> 기술 설명
                        </h4>
                        <div className="space-y-4">
                            <div>
                                <span className="text-blue-400 font-bold text-xm mb-1 block">{leftStack.name}</span>
                                <p className="text-sx text-gray-300 leading-relaxed line-clamp-6">
                                    {leftStack.description || "설명 데이터가 없습니다."}
                                </p>
                            </div>
                            <div className="border-t border-gray-800 pt-3">
                                <span className="text-purple-400 font-bold text-xm mb-1 block">{rightStack.name}</span>
                                <p className="text-sx text-gray-300 leading-relaxed line-clamp-6">
                                    {rightStack.description || "설명 데이터가 없습니다."}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1A1B1E] p-6 rounded-2xl border border-gray-800 shadow-sm flex flex-col">
                         <div className="flex items-center justify-between mb-6">
                             <h4 className="text-gray-500 text-[18px] font-bold uppercase tracking-wider flex items-center gap-2">
                                <Building2 className="w-6 h-6" /> 언급량 대결
                             </h4>
                             <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-700">
                                 <button
                                     onClick={() => setCompareMode('jobs')}
                                     className={`px-3 py-1 text-xm font-bold rounded-md flex items-center gap-1 transition-colors ${compareMode === 'jobs' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                                 >
                                     <Briefcase className="w-4 h-4" /> 채용공고
                                 </button>
                                 <button
                                     onClick={() => setCompareMode('posts')}
                                     className={`px-3 py-1 text-xm font-bold rounded-md flex items-center gap-1 transition-colors ${compareMode === 'posts' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                                 >
                                     <MessageSquare className="w-4 h-4" /> 커뮤니티
                                 </button>
                             </div>
                         </div>
                         
                         <div className="flex justify-between items-end mb-4">
                            <div className="text-left">
                                <div className="text-3xl font-black text-blue-400">
                                    {leftCount.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500 font-bold mt-1">
                                    {compareMode === 'jobs' ? '채용 공고' : '커뮤니티'}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-black text-purple-400">
                                    {rightCount.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500 font-bold mt-1">
                                    {compareMode === 'jobs' ? '채용 공고' : '커뮤니티'}
                                </div>
                            </div>
                         </div>

                         {/* Visual Bar - Updated Logic: No text inside bar, gray if 0 */}
                         <div className="relative h-14 w-full rounded-xl overflow-hidden bg-gray-800 flex shadow-inner">
                            {/* Left Bar */}
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${leftWidth}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 relative flex items-center justify-start"
                            >
                                {/* 내부 텍스트 제거됨 */}
                                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                            </motion.div>

                            {/* Right Bar */}
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${rightWidth}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-l from-purple-600 to-purple-400 relative flex items-center justify-end"
                            >
                                {/* 내부 텍스트 제거됨 */}
                                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                            </motion.div>

                            {/* 중앙 구분선: 데이터가 있을 때만 표시 */}
                            {totalCount > 0 && (
                                <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-900/50 -translate-x-1/2 z-20 blur-[1px]"></div>
                            )}
                         </div>

                         
                    </div>
                </div>

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

function StackSlot({ side, stack, searchTerm, onSearchChange, onRemove, onSelect, suggestions, isSearching, favorites }: any) {
    const [isFocused, setIsFocused] = useState(false);
    const isDropdownOpen = !stack && isFocused; // 포커스 있을 때만 드롭다운(블러 시 닫힘)

    const displayList = searchTerm ? suggestions : favorites;
    const isShowingFavorites = !searchTerm && isFocused;

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
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
}