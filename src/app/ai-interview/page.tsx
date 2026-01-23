'use client';

// 1. Suspense 추가
import { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Monitor, ArrowRightLeft } from 'lucide-react';

// 동적 렌더링 강제 (정적 생성 방지)
export const dynamic = 'force-dynamic';

// 컴포넌트 임포트
import { AnalyzingState } from '@/components/ai-interview/States';
import UploadSection from '@/components/ai-interview/UploadSection';
import ResumePickerModal from '@/components/ai-interview/ResumePickerModal';
import ReportModal from '@/components/ai-interview/ReportModal';
import DashboardView from '@/components/ai-interview/DashboardView'; 

import { useSimulation } from '@/hooks/useSimulation';
import type { Resume } from '@/types';
import { api } from '@/lib/api';

// --- 헬퍼 컴포넌트 ---
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

// 2. 알맹이 컴포넌트 (모든 로직은 여기로 이동)
function AIInterviewContent() {
    const searchParams = useSearchParams();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState<'empty' | 'analyzing' | 'result'>('empty');
    const [showDropdown, setShowDropdown] = useState(false);
    const [isResumePickerOpen, setIsResumePickerOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false); 
    const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [isLoadingResumes, setIsLoadingResumes] = useState(false);

    const simulationData = useSimulation();

   const resumeKeywords = useMemo(() => {
        if (!selectedResume) return [];
        // techStacks가 있다면 이름만 추출, 없으면 기본값
        if (selectedResume.techStacks && selectedResume.techStacks.length > 0) {
            return selectedResume.techStacks.map(item => item.techStack.name);
        }
        return ['React', 'TypeScript', 'Next.js', 'Tailwind', 'Node.js', 'AWS'];
    }, [selectedResume]);

    const resumeMatchScore = useMemo(() => {
        if (!simulationData.selectedCompany) return 0;
        return Math.min(simulationData.selectedCompany.baseScore + (resumeKeywords.length * 8), 98);
    }, [simulationData.selectedCompany, resumeKeywords]);

    // 이력서 목록 불러오기
    const fetchResumes = async () => {
        setIsLoadingResumes(true);
        try {
            const response = await api.get('/resumes/');
            const resumeList = response.data.results || response.data || [];
            
            // API 응답을 Resume 타입으로 변환
            const formattedResumes: Resume[] = resumeList.map((resumeData: any) => ({
                id: resumeData.resume_id || resumeData.id,
                title: resumeData.resume_title || resumeData.title,
                url: resumeData.resume_url || resumeData.url,
                extractedText: null, // 목록에서는 텍스트를 가져오지 않음
                techStacks: resumeData.tech_stacks?.map((ts: any) => ({
                    techStack: {
                        id: ts.tech_stack?.id || ts.id,
                        name: ts.tech_stack?.name || ts.name,
                        logo: ts.tech_stack?.logo || ts.tech_stack?.image || ts.image || null,
                        docsUrl: ts.tech_stack?.docs_url || ts.tech_stack?.link || ts.link || null,
                        createdAt: '',
                    }
                })) || [],
                createdAt: resumeData.created_at,
                updatedAt: resumeData.updated_at,
            }));
            
            setResumes(formattedResumes);
        } catch (error) {
            console.error('이력서 목록 불러오기 실패:', error);
            setResumes([]);
        } finally {
            setIsLoadingResumes(false);
        }
    };

    // 쿼리 파라미터에서 resumeId를 받아서 이력서 자동 로드
    useEffect(() => {
        const resumeId = searchParams?.get('resumeId');
        if (resumeId) {
            // API에서 이력서 정보 불러오기
            const fetchResume = async () => {
                try {
                    const response = await api.get(`/resumes/${resumeId}/`);
                    const resumeData = response.data;
                    
                    // API 응답을 Resume 타입으로 변환
                    const resume: Resume = {
                        id: resumeData.resume_id || resumeData.id,
                        title: resumeData.resume_title || resumeData.title,
                        url: resumeData.resume_url || resumeData.url,
                        extractedText: resumeData.extracted_text || null, // DB에서 합쳐진 텍스트
                        techStacks: resumeData.tech_stacks?.map((ts: any) => ({
                            techStack: {
                                id: ts.tech_stack?.id || ts.id,
                                name: ts.tech_stack?.name || ts.name,
                                logo: ts.tech_stack?.logo || ts.tech_stack?.image || ts.image || null,
                                docsUrl: ts.tech_stack?.docs_url || ts.tech_stack?.link || ts.link || null,
                                createdAt: '',
                            }
                        })) || [],
                        createdAt: resumeData.created_at,
                        updatedAt: resumeData.updated_at,
                    };
                    
                    setSelectedResume(resume);
                    setShowDropdown(false);
                    setStep('analyzing');
                    setTimeout(() => setStep('result'), 3000);
                } catch (error) {
                    console.error('이력서 불러오기 실패:', error);
                    alert('이력서를 불러올 수 없습니다.');
                }
            };
            
            fetchResume();
        } else if (searchParams?.get('pickResume') === '1') {
            setIsResumePickerOpen(true);
        }
    }, [searchParams]);

    // 이력서 선택 모달이 열릴 때 목록 불러오기
    useEffect(() => {
        if (isResumePickerOpen) {
            fetchResumes();
        }
    }, [isResumePickerOpen]);

    const handleStartAnalysis = () => {
        setShowDropdown(false);
        setStep('analyzing');
    };
    
    const handleSelectResume = async (resume: Resume) => {
        // 이력서 상세 정보 가져오기 (텍스트 포함)
        handleStartAnalysis();
        try {
            const response = await api.get(`/resumes/${resume.id}/`);
            const resumeData = response.data;
            
             const detailedResume: Resume = {
                 ...resume,
                 extractedText: resumeData.extracted_text || null, // DB에서 합쳐진 텍스트
                 techStacks: resumeData.tech_stacks?.map((ts: any) => ({
                    techStack: {
                        id: ts.tech_stack?.id || ts.id,
                        name: ts.tech_stack?.name || ts.name,
                        logo: ts.tech_stack?.logo || ts.tech_stack?.image || ts.image || null,
                        docsUrl: ts.tech_stack?.docs_url || ts.tech_stack?.link || ts.link || null,
                        createdAt: '',
                    }
                })) || resume.techStacks,
             };
            
            setSelectedResume(detailedResume);
            setIsResumePickerOpen(false);
            
            // 인위적인 지연 (UX를 위해)
            setTimeout(() => setStep('result'), 1500);
        } catch (error) {
            console.error('이력서 상세 정보 불러오기 실패:', error);
            setSelectedResume(resume);
            setIsResumePickerOpen(false);
            setStep('result');
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        handleStartAnalysis();
        
        try {
            // 1. 이력서 업로드
            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', file.name.replace(/\.[^/.]+$/, "")); // 확장자 제외 제목
            
            const uploadResponse = await api.post('/resumes/', formData);
            const newResume = uploadResponse.data;
            const resumeId = newResume.resume_id || newResume.id;

            // 2. 이력서 분석 및 경험 추출 시작 (경험 데이터 분석 엔드포인트 호출)
            await api.post(`/resumes/${resumeId}/analyze/`);

            // 3. 분석된 상세 데이터 가져오기
            const detailResponse = await api.get(`/resumes/${resumeId}/`);
            const resumeData = detailResponse.data;

            const formattedResume: Resume = {
                id: resumeData.resume_id || resumeData.id,
                title: resumeData.resume_title || resumeData.title,
                url: resumeData.resume_url || resumeData.url,
                extractedText: resumeData.extracted_text || null,
                techStacks: resumeData.tech_stacks?.map((ts: any) => ({
                    techStack: {
                        id: ts.tech_stack?.id || ts.id,
                        name: ts.tech_stack?.name || ts.name,
                        logo: ts.tech_stack?.logo || ts.tech_stack?.image || ts.image || null,
                        docsUrl: ts.tech_stack?.docs_url || ts.tech_stack?.link || ts.link || null,
                        createdAt: '',
                    }
                })) || [],
                createdAt: resumeData.created_at,
                updatedAt: resumeData.updated_at,
            };

            setSelectedResume(formattedResume);
            setStep('result');
            
        } catch (error: any) {
            console.error('이력서 처리 중 오류 발생:', error);
            const errorMessage = error.response?.data?.error || '이력서 분석 중 오류가 발생했습니다. 다시 시도해주세요.';
            alert(errorMessage);
            setStep('empty');
        }
    };

    // ✅ [추가] 이력서 삭제 함수
    const handleDeleteResume = async (id: number) => {
        if (!confirm("정말로 이 이력서를 삭제하시겠습니까? (삭제 후 복구 불가)")) return;

        try {
            await api.delete(`/resumes/${id}/`); // 백엔드 삭제 요청
            alert("이력서가 삭제되었습니다.");
            fetchResumes(); // 목록 새로고침
        } catch (error) {
            console.error("이력서 삭제 실패:", error);
            alert("삭제 중 오류가 발생했습니다.");
        }
    };
    
    const triggerFileUpload = () => fileInputRef.current?.click();

    return (
        <div className="min-h-screen bg-[#1A1B1E] overflow-y-auto flex flex-col items-center justify-start text-white">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx" />
            
            {/* ✅ max-w-[1800px] */}
            <div className="max-w-[1800px] w-full min-h-full flex flex-col p-6 lg:p-10 scale-[0.95] origin-top">
                <header className="flex justify-between items-center mb-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black tracking-tighter uppercase">AI 역량 분석 리포트</h1>
                    </div>

                    <div className="flex items-center gap-4">

                        {step !== 'empty' && (
                            <div className="relative">
                                <button 
                                    onClick={() => setShowDropdown(!showDropdown)} 
                                    className="w-10 h-10 rounded-full bg-[#25262B] border border-white/10 flex items-center justify-center hover:bg-[#2C2D33] transition-colors group"
                                >
                                    <ArrowRightLeft size={18} className="text-white group-hover:text-blue-400 transition-colors" />
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

                <ResumePickerModal 
                    open={isResumePickerOpen} 
                    resumes={resumes} 
                    isLoading={isLoadingResumes}
                    onClose={() => setIsResumePickerOpen(false)} 
                    onSelect={handleSelectResume} 
                    onDelete={handleDeleteResume}
                />

                <main className="flex-1">
                    <AnimatePresence mode="wait">
                        {step === 'empty' && (
                            <UploadSection onUploadClick={triggerFileUpload} onMyPageClick={() => setIsResumePickerOpen(true)} />
                        )}

                        {step === 'analyzing' && <AnalyzingState key="analyzing" />}

                        {step === 'result' && (
                            // ✅ [수정] 항상 DashboardView만 렌더링 (SimulationView 제거)
                            <DashboardView 
                                key="dashboard"
                                resumeTitle={selectedResume?.title || '나의 이력서'}
                                resumeText={selectedResume?.extractedText || null}
                                resumeId={selectedResume?.id}
                                resumeKeywords={resumeKeywords}
                                sortedCompanies={simulationData.sortedCompanies}
                                selectedCompany={simulationData.selectedCompany}
                                setSelectedCompany={simulationData.toggleCompany} 
                                toggleFavorite={simulationData.toggleFavorite}
                                matchScore={resumeMatchScore}
                                onOpenReport={() => setIsReportModalOpen(true)}
                            />
                        )}
                    </AnimatePresence>
                </main>
            </div>
            
            <ScrollbarStyles />

            {/* ✅ [수정] any 타입 캐스팅으로 에러 회피 */}
            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                selectedCompany={simulationData.selectedCompany as any} 
                selectedKeywords={resumeKeywords}
                totalScore={resumeMatchScore}
            />
        </div>
    );
}

// 3. 껍데기 페이지 (Suspense 적용)
export default function AIInterviewPage() {
    return (
        <Suspense fallback={<div className="h-screen bg-[#1A1B1E] text-white flex items-center justify-center">Loading...</div>}>
            <AIInterviewContent />
        </Suspense>
    );
}