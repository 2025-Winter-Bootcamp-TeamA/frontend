'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, FileUp, User, Monitor } from 'lucide-react';

// 외부 컴포넌트 임포트
import SuitabilityChart from '@/components/ai-interview/SuitabilityChart';
import CompanyList from '@/components/ai-interview/CompanyList';
import AnalysisSummary from '@/components/ai-interview/AnalysisSummary';
import { EmptyState, AnalyzingState } from '@/components/ai-interview/States';
import ReportModal from '@/components/ai-interview/ReportModal';


// --- [Constants & Mock Data] ---
const INITIAL_COMPANIES = [
    { id: 1, name: 'Toss', category: '금융/핀테크', logo: '/logos/toss.svg', baseScore: 70, favorite: false },
    { id: 2, name: 'Woowahan', category: '배달/커머스', logo: '/logos/baemin.svg', baseScore: 65, favorite: false },
    { id: 3, name: 'Line', category: '메신저/플랫폼', logo: '/logos/line.svg', baseScore: 60, favorite: false },
    { id: 4, name: 'Karrot', category: '지역/커뮤니티', logo: '/logos/daangn.svg', baseScore: 55, favorite: false },
    { id: 5, name: 'ZigZag', category: '패션/커머스', logo: '/logos/zigzag.svg', baseScore: 50, favorite: false },
    { id: 6, name: 'Bucketplace', category: '인테리어', logo: '/logos/ohou.svg', baseScore: 45, favorite: false },
    { id: 7, name: 'Musinsa', category: '패션/커머스', logo: '/logos/musinsa.svg', baseScore: 58, favorite: false },
    { id: 8, name: 'Coupang', category: '이커머스', logo: '/logos/coupang.svg', baseScore: 62, favorite: false },
];

const KEYWORDS = [
    'React', 'Next.js', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Redux', 'AWS', 'SSR', 
    'Zustand', 'Recoil', 'React Query', 'Framer Motion', 'Git', 'Java', 'Python', 'Django'
];

    /**
     * [비즈니스 로직 커스텀 훅]
     * 선택 로직과 계산 로직을 UI와 분리하여 가독성을 높입니다.
     */
function useAnalysisResult() {
const [companies, setCompanies] = useState(INITIAL_COMPANIES);
const [selectedCompany, setSelectedCompany] = useState<any>(null);
const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
const [totalScore, setTotalScore] = useState(0);

// 즐겨찾기 기준 정렬
const sortedCompanies = useMemo(() => {
    return [...companies].sort((a, b) => (a.favorite === b.favorite ? 0 : a.favorite ? -1 : 1));
}, [companies]);

// 기업 선택/해제 토글
const toggleCompany = useCallback((company: any) => {
    setSelectedCompany((prev: any) => (prev?.id === company.id ? null : company));
}, []);

// 키워드 다중 선택 토글
const toggleKeyword = useCallback((tag: string) => {
    setSelectedKeywords(prev => 
    prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
}, []);

// 즐겨찾기 상태 변경
const toggleFavorite = useCallback((e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, favorite: !c.favorite } : c));
}, []);

    // 적합도 실시간 계산
useEffect(() => {
    if (selectedCompany && selectedKeywords.length > 0) {
    const score = Math.min(selectedCompany.baseScore + (selectedKeywords.length * 5), 100);
    setTotalScore(score);
    } else {
    setTotalScore(0);
    }
}, [selectedCompany, selectedKeywords]);

return {
        sortedCompanies,
        selectedCompany,
        selectedKeywords,
        totalScore,
        toggleCompany,
        toggleKeyword,
        toggleFavorite
    };
    }

export default function AIInterviewPage() {
    const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태 추가
    const [step, setStep] = useState<'empty' | 'analyzing' | 'result'>('result');
    const [showDropdown, setShowDropdown] = useState(false);
    
    const {
        sortedCompanies,
        selectedCompany,
        selectedKeywords,
        totalScore,
        toggleCompany,
        toggleKeyword,
        toggleFavorite
    } = useAnalysisResult();

    const handleStartAnalysis = () => {
        setShowDropdown(false);
        setStep('analyzing');
        setTimeout(() => setStep('result'), 3000);
    };

    return (
        <div className="min-h-[calc(100vh-70px)] bg-[#1A1B1E] overflow-hidden flex flex-col text-white">
        <div className="max-w-[1400px] mx-auto w-full h-full flex flex-col p-6 lg:p-10">
            
            {/* --- [HEADER SECTION] --- */}
            <header className="flex justify-between items-center mb-5">
            <div className="space-y-1">
                <h1 className="text-4xl font-black tracking-tighter uppercase">내 이력서 분석</h1>
            </div>

            <div className="relative">
                <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                >
                <FileUp size={20} /> {step === 'result' ? '다시 등록하기' : '등록하기'}
                </button>
                
                <AnimatePresence>
                {showDropdown && (
                    <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-60 bg-[#212226] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                    >
                    <DropdownButton onClick={handleStartAnalysis} icon={<User size={18} className="text-blue-400" />} text="마이페이지에서 선택" hasBorder />
                    <DropdownButton onClick={handleStartAnalysis} icon={<Monitor size={18} className="text-purple-400" />} text="내 컴퓨터에서 선택" />
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
            </header>

            {/* --- [MAIN CONTENT SECTION] --- */}
            <main>
            <AnimatePresence mode="wait">
                {step === 'empty' && <EmptyState key="empty" />}
                {step === 'analyzing' && <AnalyzingState key="analyzing" />}
                {step === 'result' && (
                <motion.div 
                    key="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
                >
                    {/* 좌측: 적합도 차트 */}
                    <section className="lg:col-span-4">
                    <SuitabilityChart 
                        selectedCompany={selectedCompany} 
                        selectedKeywords={selectedKeywords} 
                        totalScore={totalScore} 
                        keywords={KEYWORDS} 
                        onToggleKeyword={toggleKeyword} 
                    />
                    </section>

                    {/* 중앙: 기업 리스트 */}
                    <section className="lg:col-span-4">
                    <CompanyList 
                        companies={sortedCompanies} 
                        selectedCompany={selectedCompany} 
                        onSelect={toggleCompany} 
                        onFavorite={toggleFavorite} 
                    />
                    </section>

                    {/* 우측: 리포트 요약 */}
                    <section className="lg:col-span-4">
                    <AnalysisSummary onOpenModal={() => setIsModalOpen(true)} />
                        <ReportModal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            selectedCompany={selectedCompany || sortedCompanies[0]}
                            selectedKeywords={selectedKeywords}
                            totalScore={totalScore}
                        />
                    </section>
                </motion.div>
                )}
            </AnimatePresence>
            </main>
        </div>

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