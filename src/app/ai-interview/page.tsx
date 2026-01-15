'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, FileUp, User, Monitor, FileSearch, UploadCloud } from 'lucide-react'; // UploadCloud 아이콘 추가

// 외부 컴포넌트 임포트 (기존과 동일)
import SuitabilityChart from '@/components/ai-interview/SuitabilityChart';
import CompanyList from '@/components/ai-interview/CompanyList';
import AnalysisSummary from '@/components/ai-interview/AnalysisSummary';
import { AnalyzingState } from '@/components/ai-interview/States';
import ReportModal from '@/components/ai-interview/ReportModal';

import type { Resume } from '@/app/mypage/_models/resume.types';
import { mockResumes } from '@/app/mypage/_models/resume.mock';

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

function useAnalysisResult() {
    const [companies, setCompanies] = useState(INITIAL_COMPANIES);
    const [selectedCompany, setSelectedCompany] = useState<any>(null);
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
    const [totalScore, setTotalScore] = useState(0);

    const sortedCompanies = useMemo(() => {
        return [...companies].sort((a, b) => (a.favorite === b.favorite ? 0 : a.favorite ? -1 : 1));
    }, [companies]);

    const toggleCompany = useCallback((company: any) => {
        setSelectedCompany((prev: any) => (prev?.id === company.id ? null : company));
    }, []);

    const toggleKeyword = useCallback((tag: string) => {
        setSelectedKeywords(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    }, []);

    const toggleFavorite = useCallback((e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setCompanies(prev => prev.map(c => c.id === id ? { ...c, favorite: !c.favorite } : c));
    }, []);

    useEffect(() => {
        if (selectedCompany && selectedKeywords.length > 0) {
            const score = Math.min(selectedCompany.baseScore + (selectedKeywords.length * 5), 100);
            setTotalScore(score);
        } else {
            setTotalScore(0);
        }
    }, [selectedCompany, selectedKeywords]);

    return {
        sortedCompanies, selectedCompany, selectedKeywords, totalScore,
        toggleCompany, toggleKeyword, toggleFavorite
    };
}

export default function AIInterviewPage() {
    const searchParams = useSearchParams();
    const fileInputRef = useRef<HTMLInputElement>(null); // ✅ 내 컴퓨터 파일 업로드용 Ref

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [step, setStep] = useState<'empty' | 'analyzing' | 'result'>('empty');
    const [showDropdown, setShowDropdown] = useState(false);
    const [isResumePickerOpen, setIsResumePickerOpen] = useState(false);
    const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
    
    const {
        sortedCompanies, selectedCompany, selectedKeywords, totalScore,
        toggleCompany, toggleKeyword, toggleFavorite
    } = useAnalysisResult();

    useEffect(() => {
        if (searchParams?.get('pickResume') === '1') {
            setIsResumePickerOpen(true);
        }
    }, [searchParams]);

    const handleStartAnalysis = () => {
        setShowDropdown(false);
        setStep('analyzing');
        setTimeout(() => setStep('result'), 3000);
    };

    const handlePickFromMyPage = () => {
        setShowDropdown(false);
        setIsResumePickerOpen(true);
    };

    const handleSelectResume = (resume: Resume) => {
        setSelectedResume(resume);
        setIsResumePickerOpen(false);
        handleStartAnalysis();
    };

    // ✅ 파일 선택 핸들러
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // 실제 파일 업로드 로직 대신 바로 분석 시작
            handleStartAnalysis();
        }
    };

    return (
        <div className="min-h-[calc(100vh-70px)] bg-[#1A1B1E] overflow-hidden flex flex-col text-white">
            {/* ✅ 숨겨진 파일 입력창 */}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx" />

            <div className="max-w-[1400px] mx-auto w-full h-full flex flex-col p-6 lg:p-10">
                
                {/* --- [HEADER SECTION] --- */}
                <header className="flex justify-between items-center mb-5">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tighter uppercase">내 이력서 분석</h1>
                        <p className="text-sm text-[#9FA0A8]">
                            {selectedResume ? `선택된 이력서: ${selectedResume.title}` : '이력서를 선택해 분석을 시작하세요.'}
                        </p>
                    </div>

                    <div className="relative">
                        
                        <AnimatePresence>
                            {showDropdown && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                    className="absolute right-0 mt-3 w-60 bg-[#212226] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                                >
                                    <DropdownButton onClick={handlePickFromMyPage} icon={<User size={18} className="text-blue-400" />} text="마이페이지에서 선택" hasBorder />
                                    <DropdownButton onClick={() => fileInputRef.current?.click()} icon={<Monitor size={18} className="text-purple-400" />} text="내 컴퓨터에서 선택" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </header>

                <ResumePickerModal
                    open={isResumePickerOpen}
                    resumes={mockResumes}
                    onClose={() => setIsResumePickerOpen(false)}
                    onSelect={handleSelectResume}
                />

                {/* --- [MAIN CONTENT SECTION] --- */}
                <main>
                    <AnimatePresence mode="wait">
                        {/* ✅ [EMPTY STATE: 새롭게 디자인된 업로드 화면] */}
                        {step === 'empty' && (
                            <motion.div 
                                key="empty"
                                initial={{ opacity: 0, scale: 0.98 }} 
                                animate={{ opacity: 1, scale: 1 }} 
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="h-[600px] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.01] hover:bg-white/[0.02] transition-all cursor-pointer group p-10"
                                onClick={() => fileInputRef.current?.click()} // 영역 전체 클릭 시 파일 선택창 열림
                            >
                                <div className="w-32 h-32 rounded-full bg-blue-600/5 flex items-center justify-center mb-8 border border-blue-600/10 group-hover:scale-110 transition-transform duration-500">
                                    <UploadCloud size={56} className="text-blue-500 opacity-60" />
                                </div>
                                <h2 className="text-4xl font-black mb-4 tracking-tighter text-white">분석할 이력서를 업로드하세요</h2>
                                <p className="text-[#9FA0A8] max-w-md leading-relaxed mb-10 text-lg text-center">
                                    도영님의 이력서를 바탕으로 <span className="text-blue-400 font-bold">최적의 기술 스택</span>과<br />
                                    <span className="text-blue-400 font-bold">가장 적합한 기업</span>을 분석해 드립니다.
                                </p>
                                
                                <div className="flex gap-4">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                        className="px-8 py-4 bg-white text-black font-black rounded-2xl shadow-xl hover:bg-gray-100 transition-all active:scale-95 flex items-center gap-2"
                                    >
                                        <Monitor size={20} /> 내 컴퓨터에서 찾기
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setIsResumePickerOpen(true); }} 
                                        className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all flex items-center gap-2"
                                    >
                                        <User size={20} /> 마이페이지 불러오기
                                    </button>
                                </div>
                                <p className="mt-6 text-xs text-white/20">지원 형식: PDF, DOC, DOCX (최대 10MB)</p>
                            </motion.div>
                        )}

                        {step === 'analyzing' && <AnalyzingState key="analyzing" />}

                        {/* ✅ [RESULT STATE: 기존 로직 그대로 유지] */}
                        {step === 'result' && (
                            <motion.div 
                                key="result"
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
                            >
                                <section className="lg:col-span-4">
                                    <SuitabilityChart 
                                        selectedCompany={selectedCompany} 
                                        selectedKeywords={selectedKeywords} 
                                        totalScore={totalScore} 
                                        keywords={KEYWORDS} 
                                        onToggleKeyword={toggleKeyword} 
                                    />
                                </section>

                                <section className="lg:col-span-4">
                                    <CompanyList 
                                        companies={sortedCompanies} 
                                        selectedCompany={selectedCompany} 
                                        onSelect={toggleCompany} 
                                        onFavorite={toggleFavorite} 
                                    />
                                </section>

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

// ... (하단 DropdownButton, ResumePickerModal, ScrollbarStyles는 기존 코드 유지)
function DropdownButton({ onClick, icon, text, hasBorder = false }: any) {
    return (
        <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-5 text-sm hover:bg-white/5 text-left font-medium transition-colors ${hasBorder ? 'border-b border-white/5' : ''}`}>
            {icon} {text}
        </button>
    );
}

function ResumePickerModal({ open, resumes, onClose, onSelect }: { open: boolean; resumes: Resume[]; onClose: () => void; onSelect: (r: Resume) => void; }) {
    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                    <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-[min(500px,92vw)] rounded-[24px] border border-white/10 bg-[#1A1B1E] p-6 shadow-2xl">
                        <div className="text-lg font-bold text-white mb-4">마이페이지 이력서 선택</div>
                        <div className="space-y-3">
                            {resumes.map((r) => (
                                <button key={r.id} onClick={() => onSelect(r)} className="w-full rounded-2xl border border-white/10 bg-[#25262B] p-4 text-left transition-all hover:border-white/30 hover:bg-[#2C2D33] active:scale-[0.99]">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="min-w-0">
                                            <div className="truncate text-sm font-semibold text-white">{r.title}</div>
                                            <div className="mt-1 text-xs text-[#9FA0A8]">{r.company ? `${r.company} · ` : ''}등록일: {r.createdAt}</div>
                                        </div>
                                        <span className="shrink-0 rounded-full bg-blue-600 px-3 py-1 text-[11px] font-bold text-white">선택</span>
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

function ScrollbarStyles() {
    return (
        <style jsx global>{`
            .custom-scrollbar::-webkit-scrollbar { width: 5px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 20px; transition: background 0.3s ease; }
            .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); }
            .custom-scrollbar::-webkit-scrollbar-thumb:active { background: rgba(255, 255, 255, 0.3); }
        `}</style>
    );
}