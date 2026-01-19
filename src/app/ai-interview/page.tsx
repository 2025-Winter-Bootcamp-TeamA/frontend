'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Monitor, ArrowRightLeft } from 'lucide-react';

// 컴포넌트 임포트
import { AnalyzingState } from '@/components/ai-interview/States';
import UploadSection from '@/components/ai-interview/UploadSection';
import ResumePickerModal from '@/components/ai-interview/ResumePickerModal';
import ViewSwitcher from '@/components/ai-interview/ViewSwitcher';
import ReportModal from '@/components/ai-interview/ReportModal';

// 뷰 컴포넌트
import DashboardView from '@/components/ai-interview/DashboardView'; 
import SimulationView from '@/components/ai-interview/SimulationView';

// Hook & Data
import { useSimulation } from '@/hooks/useSimulation';
import type { Resume } from '@/app/mypage/_models/resume.types';
import { mockResumes } from '@/app/mypage/_models/resume.mock';

// 하위 컴포넌트
function DropdownButton({ onClick, icon, text, hasBorder = false }: any) {
    return (
        <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-5 text-sm hover:bg-white/5 text-left font-medium transition-colors ${hasBorder ? 'border-b border-white/5' : ''}`}>
            {icon} {text}
        </button>
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

export default function AIInterviewPage() {
    const searchParams = useSearchParams();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- State ---
    const [step, setStep] = useState<'empty' | 'analyzing' | 'result'>('empty');
    const [viewMode, setViewMode] = useState<'dashboard' | 'simulation'>('dashboard');
    
    const [showDropdown, setShowDropdown] = useState(false);
    const [isResumePickerOpen, setIsResumePickerOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false); 
    
    const [selectedResume, setSelectedResume] = useState<Resume | null>(null);

    // 공통 데이터 훅
    const simulationData = useSimulation();

    // 이력서용 키워드
    const resumeKeywords = selectedResume 
        ? ['React', 'TypeScript', 'Next.js', 'Tailwind'] 
        : [];

    // 이력서용 매칭 점수
    const resumeMatchScore = useMemo(() => {
        if (!simulationData.selectedCompany) return 0;
        return Math.min(simulationData.selectedCompany.baseScore + (resumeKeywords.length * 8), 98);
    }, [simulationData.selectedCompany, resumeKeywords]);

    useEffect(() => {
        if (searchParams?.get('pickResume') === '1') {
            setIsResumePickerOpen(true);
        }
    }, [searchParams]);

    // 핸들러
    const handleStartAnalysis = () => {
        setShowDropdown(false);
        setStep('analyzing');
        setTimeout(() => setStep('result'), 3000);
    };
    
    const handleSelectResume = (resume: Resume) => {
        setSelectedResume(resume);
        setIsResumePickerOpen(false);
        setViewMode('dashboard'); 
        handleStartAnalysis();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
             setSelectedResume({ 
                id: '999', 
                title: e.target.files[0].name, 
                createdAt: '2026.01.20', 
                company: '',
                tags: [] 
            });
            setViewMode('dashboard');
            handleStartAnalysis();
        }
    };
    
    const triggerFileUpload = () => fileInputRef.current?.click();

    return (
        // ✅ [수정됨] justify-center -> justify-start, pt-4 추가 (위쪽 정렬 및 상단 여백 최소화)
        <div className="h-screen bg-[#1A1B1E] overflow-hidden flex flex-col items-center justify-start pt-4 text-white">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx" />

            {/* ✅ [수정됨] origin-center -> origin-top (축소 시 위쪽 기준으로 축소되어 상단 공백 제거) */}
            <div className="max-w-[1600px] w-full h-full flex flex-col p-6 lg:p-10 scale-[0.95] origin-top">
                
                {/* --- HEADER --- */}
                <header className="flex justify-between items-center mb-2">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tighter uppercase">AI 역량 분석 리포트</h1>
                        <p className="text-sm text-[#9FA0A8]">
                            {selectedResume ? `분석 중인 이력서: ${selectedResume.title}` : '이력서를 등록하여 맞춤형 분석을 받아보세요.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {step === 'result' && (
                            <ViewSwitcher currentView={viewMode} onChange={setViewMode} />
                        )}

                        {step !== 'empty' && (
                            <div className="relative">
                                <button 
                                    onClick={() => setShowDropdown(!showDropdown)} 
                                    className="w-12 h-12 rounded-full bg-[#25262B] border border-white/10 flex items-center justify-center hover:bg-[#2C2D33] transition-colors group"
                                >
                                    <ArrowRightLeft size={20} className="text-white group-hover:text-blue-400 transition-colors" />
                                </button>
                                <AnimatePresence>
                                    {showDropdown && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-3 w-60 bg-[#212226] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                                            <DropdownButton onClick={() => { setShowDropdown(false); setIsResumePickerOpen(true); }} icon={<User size={18} className="text-blue-400" />} text="마이페이지에서 선택" hasBorder />
                                            <DropdownButton onClick={triggerFileUpload} icon={<Monitor size={18} className="text-purple-400" />} text="내 컴퓨터에서 선택" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </header>

                <ResumePickerModal open={isResumePickerOpen} resumes={mockResumes} onClose={() => setIsResumePickerOpen(false)} onSelect={handleSelectResume} />

                {/* --- MAIN CONTENT --- */}
                <main className="flex-1">
                    <AnimatePresence mode="wait">
                        {step === 'empty' && (
                            <UploadSection onUploadClick={triggerFileUpload} onMyPageClick={() => setIsResumePickerOpen(true)} />
                        )}

                        {step === 'analyzing' && <AnalyzingState key="analyzing" />}

                        {step === 'result' && (
                            viewMode === 'dashboard' ? (
                                <DashboardView 
                                    key="dashboard"
                                    resumeTitle={selectedResume?.title || '나의 이력서'}
                                    resumeKeywords={resumeKeywords}
                                    sortedCompanies={simulationData.sortedCompanies}
                                    selectedCompany={simulationData.selectedCompany}
                                    setSelectedCompany={simulationData.toggleCompany} 
                                    toggleFavorite={simulationData.toggleFavorite}
                                    matchScore={resumeMatchScore}
                                    onOpenReport={() => setIsReportModalOpen(true)}
                                />
                            ) : (
                                <SimulationView 
                                    key="simulation"
                                    simulationData={simulationData}
                                />
                            )
                        )}
                    </AnimatePresence>
                </main>
            </div>
            
            <ScrollbarStyles />

            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                selectedCompany={simulationData.selectedCompany}
                selectedKeywords={viewMode === 'simulation' ? simulationData.selectedKeywords : resumeKeywords}
                totalScore={viewMode === 'simulation' ? simulationData.matchScore : resumeMatchScore}
            />
        </div>
    );
}