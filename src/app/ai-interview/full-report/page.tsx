'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, FileUp, User, Monitor, FileSearch, Search, Sparkles, AlertCircle, HelpCircle, Star, CheckCircle2 } from 'lucide-react';

// 외부 컴포넌트 및 데이터
import CompanyList from '@/components/ai-interview/CompanyList';
import { AnalyzingState } from '@/components/ai-interview/States';
import { CATEGORY_INFO } from '@/constants/mockTrends';
import type { Resume } from '@/app/mypage/_models/resume.types';
import { mockResumes } from '@/app/mypage/_models/resume.mock';

// --- [Mock Data] ---
const INITIAL_COMPANIES = [
    { id: 1, name: 'Toss', category: '금융/핀테크', logo: '/logos/toss.svg', baseScore: 65, favorite: false },
    { id: 2, name: 'Woowahan', category: '배달/커머스', logo: '/logos/baemin.svg', baseScore: 60, favorite: false },
    { id: 3, name: 'Line', category: '메신저/플랫폼', logo: '/logos/line.svg', baseScore: 55, favorite: false },
    { id: 4, name: 'Karrot', category: '지역/커뮤니티', logo: '/logos/daangn.svg', baseScore: 50, favorite: false },
    { id: 5, name: 'ZigZag', category: '패션/커머스', logo: '/logos/zigzag.svg', baseScore: 45, favorite: false },
    { id: 6, name: 'Bucketplace', category: '인테리어', logo: '/logos/ohou.svg', baseScore: 40, favorite: false },
];

export default function AIInterviewPage() {
    const searchParams = useSearchParams();
    
    // --- [State Management] ---
    const [step, setStep] = useState<'empty' | 'analyzing' | 'result'>('empty');
    const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
    const [isResumePickerOpen, setIsResumePickerOpen] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    // ✅ 데이터 관리 상태
    const [companies, setCompanies] = useState(INITIAL_COMPANIES);
    const [selectedCompany, setSelectedCompany] = useState<any>(null);
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
    const [keywordSearch, setKeywordSearch] = useState('');

    // --- [Logic 1: 데이터 추출 및 즐겨찾기 정렬] ---
    const allTechKeywords = useMemo(() => {
        const keywords = new Set<string>();
        Object.values(CATEGORY_INFO).forEach((cat: any) => {
            [...cat.company.nodes, ...cat.community.nodes].forEach(node => keywords.add(node.id));
        });
        return Array.from(keywords).sort();
    }, []);

    // ✅ 즐겨찾기 된 기업을 최상단으로 정렬
    const sortedCompanies = useMemo(() => {
        return [...companies].sort((a, b) => (a.favorite === b.favorite ? 0 : a.favorite ? -1 : 1));
    }, [companies]);

    // --- [Logic 2: 인터랙션 핸들러] ---
    const toggleKeyword = (k: string) => {
        setSelectedKeywords(prev => prev.includes(k) ? prev.filter(item => item !== k) : [...prev, k]);
    };

    const toggleFavorite = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setCompanies(prev => prev.map(c => c.id === id ? { ...c, favorite: !c.favorite } : c));
    };

    // ✅ 실시간 적합도 계산 (기업 기본 점수 + 선택 키워드당 5점)
    const matchScore = useMemo(() => {
        if (!selectedCompany) return 0;
        const base = selectedCompany.baseScore;
        const bonus = selectedKeywords.length * 5;
        return Math.min(base + bonus, 100);
    }, [selectedCompany, selectedKeywords]);

    const handleStartAnalysis = () => {
        setStep('analyzing');
        setTimeout(() => setStep('result'), 3000);
    };

    return (
        <div className="min-h-screen bg-[#1A1B1E] text-white p-6 lg:p-10 flex flex-col">
            {/* --- [HEADER SECTION] --- */}
            <header className="max-w-[1440px] mx-auto w-full flex justify-between items-center mb-8">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tighter uppercase">AI 역량 분석 리포트</h1>
                    <p className="text-sm text-[#9FA0A8]">
                        {selectedResume ? `선택된 이력서: ${selectedResume.title}` : '이력서를 등록하여 기업별 맞춤 전략을 확인하세요.'}
                    </p>
                </div>
                <button onClick={() => setStep('empty')} className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-white/10 transition-all">
                    <FileUp size={18} /> 이력서 등록하기
                </button>
            </header>

            <main className="max-w-[1440px] mx-auto w-full flex-1">
                <AnimatePresence mode="wait">
                    {step === 'empty' && (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[600px] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.01]">
                            <FileSearch size={64} className="text-white/10 mb-6" />
                            <h2 className="text-2xl font-bold mb-2">분석된 이력서가 없습니다</h2>
                            <p className="text-[#9FA0A8] mb-8 text-center">등록 버튼을 통해 이력서를 제출하시면<br />AI 분석이 즉시 시작됩니다.</p>
                            <button onClick={handleStartAnalysis} className="bg-blue-600 px-8 py-4 rounded-2xl font-black shadow-lg shadow-blue-600/20 hover:bg-blue-500 active:scale-95 transition-all">지금 분석 시작하기</button>
                        </motion.div>
                    )}

                    {step === 'analyzing' && <AnalyzingState key="analyzing" />}

                    {step === 'result' && (
                        <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start h-full">
                            
                            {/* 1️⃣ 좌측: 81개 키워드 다중 선택 탐색기 */}
                            <section className="lg:col-span-3 bg-[#212226] border border-white/5 rounded-[32px] p-6 h-[750px] flex flex-col">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-400"><Sparkles size={18} /> 기술 스택 선택</h3>
                                <div className="relative mb-5">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                    <input type="text" placeholder="기술 검색..." value={keywordSearch} onChange={(e) => setKeywordSearch(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 transition-all" />
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-wrap gap-2 content-start">
                                    {allTechKeywords.filter(k => k.toLowerCase().includes(keywordSearch.toLowerCase())).map(k => (
                                        <button key={k} onClick={() => toggleKeyword(k)} className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${selectedKeywords.includes(k) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}>
                                            {k} {selectedKeywords.includes(k) && '✓'}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* 2️⃣ 중앙: 추천 기업 리스트 (즐겨찾기 상단 정렬 적용) */}
                            <section className="lg:col-span-4 h-[750px] overflow-y-auto custom-scrollbar">
                                <div className="space-y-4">
                                    {sortedCompanies.map((c) => (
                                        <div key={c.id} onClick={() => setSelectedCompany(c)} className={`p-6 rounded-[28px] border transition-all cursor-pointer flex items-center justify-between ${selectedCompany?.id === c.id ? 'bg-blue-600/10 border-blue-600 shadow-lg' : 'bg-[#212226] border-white/5 hover:border-white/20'}`}>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-white p-2 shadow-inner flex items-center justify-center">
                                                    <img src={c.logo} alt="" className="w-full h-full object-contain" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold">{c.name}</h4>
                                                    <p className="text-xs text-[#9FA0A8]">{c.category}</p>
                                                </div>
                                            </div>
                                            <button onClick={(e) => toggleFavorite(e, c.id)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                                <Star size={20} fill={c.favorite ? "#EAB308" : "none"} className={c.favorite ? 'text-yellow-500' : 'text-white/20'} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* 3️⃣ 우측: 적합도 파이 차트 및 AI 리포트 */}
                            <section className="lg:col-span-5 h-[750px] overflow-y-auto custom-scrollbar pr-2 space-y-6">
                                <AnimatePresence mode="wait">
                                    {!selectedCompany || selectedKeywords.length === 0 ? (
                                        <motion.div key="guide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center p-10 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[32px]">
                                            <HelpCircle size={48} className="text-white/10 mb-4" />
                                            <p className="text-[#9FA0A8] text-sm leading-relaxed">기업과 분석할 키워드들을 선택해 주세요.<br />도영님만을 위한 맞춤 면접 리포트가 완성됩니다.</p>
                                        </motion.div>
                                    ) : (
                                        <motion.div key="report" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                            
                                            {/* ✅ 실시간 적합도 파이 차트 섹션 */}
                                            <div className="bg-[#212226] border border-white/5 rounded-[32px] p-8 flex items-center justify-between shadow-2xl relative overflow-hidden group">
                                                <div className="space-y-2 relative z-10">
                                                    <h4 className="text-sm font-black text-blue-400 uppercase tracking-widest">Match Score</h4>
                                                    <p className="text-3xl font-black text-white">{matchScore}%</p>
                                                    <p className="text-xs text-[#9FA0A8]">선택한 {selectedKeywords.length}개 기술 기반 적합도</p>
                                                </div>
                                                {/* 파이 차트 (SVG 기반) */}
                                                <div className="relative w-28 h-28">
                                                    <svg className="w-full h-full transform -rotate-90">
                                                        <circle cx="56" cy="56" r="50" fill="transparent" stroke="currentColor" strokeWidth="10" className="text-white/5" />
                                                        <motion.circle cx="56" cy="56" r="50" fill="transparent" stroke="currentColor" strokeWidth="10" strokeDasharray={314} initial={{ strokeDashoffset: 314 }} animate={{ strokeDashoffset: 314 - (314 * matchScore) / 100 }} transition={{ duration: 1, ease: "easeOut" }} className="text-blue-500" />
                                                    </svg>
                                                    <div className="absolute inset-0 flex items-center justify-center font-bold text-lg">{matchScore}%</div>
                                                </div>
                                            </div>

                                            {/* 분석 리포트 카드 (장단점, 보완점, 질문) */}
                                            <div className="bg-[#212226] border border-white/5 rounded-[32px] p-8 space-y-8">
                                                <div>
                                                    <h4 className="text-xs font-black text-green-400 uppercase tracking-widest mb-4 flex items-center gap-2"><CheckCircle2 size={14} /> 강점 분석</h4>
                                                    <p className="text-sm leading-relaxed text-[#9FA0A8]">{selectedKeywords[0]}를 활용한 프로젝트 경험이 {selectedCompany.name}의 최신 스택 방향성과 일치합니다.</p>
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-black text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2"><AlertCircle size={14} /> 보완 필요한 역량</h4>
                                                    <p className="text-sm leading-relaxed text-[#9FA0A8]">{selectedKeywords.length > 2 ? '다양한 기술을 보유하셨으나' : '더 많은 기술 연계가 필요하며'}, 특히 인프라 자동화 관점에서의 숙련도가 요구됩니다.</p>
                                                </div>
                                                <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-6 rounded-2xl border border-white/10 shadow-lg group-hover:scale-[1.02] transition-transform">
                                                    <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2"><HelpCircle size={14} /> AI 추천 질문</h4>
                                                    <p className="text-lg font-bold italic leading-snug">"{selectedCompany.name}에서 {selectedKeywords[0]}와 {selectedKeywords[1] || '관련 기술'}을 결합하여 성능을 2배 이상 끌어올린다면 어떤 아키텍처를 제안하시겠습니까?"</p>
                                                    <button className="w-full mt-6 py-4 bg-white text-black font-black rounded-2xl hover:bg-gray-200 active:scale-95 transition-all">이 질문으로 모의 면접 시작하기</button>
                                                </div>
                                            </div>

                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </section>

                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <ScrollbarStyles />
        </div>
    );
}

// --- [Sub-Components for Readability] ---

/** 드롭다운 내 공통 버튼 컴포넌트 */
function DropdownButton({ onClick, icon, text, hasBorder = false }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`w-full flex items-center gap-4 px-6 py-5 text-sm hover:bg-white/5 text-left font-medium transition-colors ${hasBorder ? 'border-b border-white/5' : ''}`}
    >
      {icon} {text}
    </button>
  );
}

function ResumePickerModal({
    open,
    resumes,
    onClose,
    onSelect,
}: {
    open: boolean;
    resumes: Resume[];
    onClose: () => void;
    onSelect: (r: Resume) => void;
}) {
    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.96, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.96, opacity: 0, y: 10 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="relative w-[min(720px,92vw)] rounded-[24px] border border-white/10 bg-[#1A1B1E] p-6 shadow-2xl"
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="text-lg font-bold text-white">마이페이지 이력서 선택</div>
                                <div className="mt-1 text-sm text-[#9FA0A8]">
                                    분석할 이력서를 하나 선택하세요.
                                </div>
                            </div>
                            <button
                                className="rounded-xl bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                                onClick={onClose}
                                aria-label="닫기"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mt-5 space-y-3">
                            {resumes.map((r) => (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => onSelect(r)}
                                    className="w-full rounded-2xl border border-white/10 bg-[#25262B] p-4 text-left transition-all hover:border-white/30 hover:bg-[#2C2D33] active:scale-[0.99]"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="min-w-0">
                                            <div className="truncate text-sm font-semibold text-white">
                                                {r.title}
                                            </div>
                                            <div className="mt-1 text-xs text-[#9FA0A8]">
                                                {r.company ? `${r.company} · ` : ''}등록일: {r.createdAt}
                                            </div>
                                        </div>
                                        <span className="shrink-0 rounded-full bg-blue-600 px-3 py-1 text-[11px] font-bold text-white">
                                            선택
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

/** 전역 스크롤바 스타일 컴포넌트 */
function ScrollbarStyles() {
  return (
    <style jsx global>{`
      .custom-scrollbar::-webkit-scrollbar { width: 5px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.05); 
        border-radius: 20px;
        transition: background 0.3s ease;
      }
      .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); }
      .custom-scrollbar::-webkit-scrollbar-thumb:active { background: rgba(255, 255, 255, 0.3); }
    `}</style>
  );
}