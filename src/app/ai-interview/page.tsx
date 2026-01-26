'use client';

import { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Monitor, ArrowRightLeft, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export const dynamic = 'force-dynamic';

import { AnalyzingState } from '@/components/ai-interview/States';
import UploadSection from '@/components/ai-interview/UploadSection';
import ResumePickerModal from '@/components/ai-interview/ResumePickerModal';
import ReportModal from '@/components/ai-interview/ReportModal';
import DashboardView from '@/components/ai-interview/DashboardView'; 

import { useSimulation } from '@/hooks/useSimulation';
import type { Resume } from '@/types';
import { api } from '@/lib/api';

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

function AIInterviewContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState<'empty' | 'analyzing' | 'result'>('empty');
    const [showDropdown, setShowDropdown] = useState(false);
    const [isResumePickerOpen, setIsResumePickerOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false); 
    const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [isLoadingResumes, setIsLoadingResumes] = useState(false);

    const [taskId, setTaskId] = useState<string | null>(null);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [analyzingResumeId, setAnalyzingResumeId] = useState<number | null>(null);

    const [reportData, setReportData] = useState<{
        feedbacks: any[];
        questions: string[];
        jobPostingTitle?: string;
    }>({ feedbacks: [], questions: [], jobPostingTitle: undefined });

    const simulationData = useSimulation();

    const fetchResumeDetails = async (resumeId: number): Promise<Resume> => {
        const response = await api.get(`/resumes/${resumeId}/`);
        const resumeData = response.data;
        return {
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
    };

    const { data: analysisData, error: pollingError } = useQuery({
        queryKey: ['analysisStatus', taskId],
        queryFn: async () => {
            if (!taskId) return null;
            const { data } = await api.get(`/resumes/analyze/status/${taskId}/`);
            return data;
        },
        enabled: !!taskId && step === 'analyzing',
        refetchInterval: 2000,
    });

    useEffect(() => {
        if (!analysisData || step !== 'analyzing') return;

        if (analysisData.status === 'SUCCESS') {
            const finishAnalysis = async () => {
                setTaskId(null);
                const resumeIdToFetch = analyzingResumeId;
                
                if (!resumeIdToFetch) {
                    setAnalysisError('분석된 이력서 ID 오류');
                    setStep('empty');
                    setAnalyzingResumeId(null);
                    return;
                }
                
                try {
                    const detailedResume = await fetchResumeDetails(resumeIdToFetch);
                    setSelectedResume(detailedResume);
                    setStep('result');
                } catch (error) {
                    setAnalysisError('분석 결과 로드 실패');
                    setStep('empty');
                } finally {
                    setAnalyzingResumeId(null);
                }
            };
            finishAnalysis();
        } else if (analysisData.status === 'FAILURE') {
            setTaskId(null);
            setAnalysisError(analysisData.result || '분석 실패');
            setStep('empty');
            setAnalyzingResumeId(null);
        }
    }, [analysisData, step, analyzingResumeId]);

    useEffect(() => {
        if (pollingError) {
            setTaskId(null);
            setAnalysisError('분석 상태 확인 오류');
            setStep('empty');
            setAnalyzingResumeId(null);
        }
    }, [pollingError]);

   const resumeKeywords = useMemo(() => {
        if (!selectedResume) return [];
        if (selectedResume.techStacks && selectedResume.techStacks.length > 0) {
            return selectedResume.techStacks.map(item => item.techStack.name);
        }
        return ['React', 'TypeScript', 'Node.js', 'AWS'];
    }, [selectedResume]);

    const resumeMatchScore = useMemo(() => {
        if (!simulationData.selectedCompany) return 0;
        return Math.min(simulationData.selectedCompany.baseScore + (resumeKeywords.length * 8), 98);
    }, [simulationData.selectedCompany, resumeKeywords]);

    const fetchResumes = async () => {
        setIsLoadingResumes(true);
        try {
            const response = await api.get('/resumes/');
            const resumeList = response.data.results || response.data || [];
            
            const formattedResumes: Resume[] = resumeList.map((resumeData: any) => ({
                id: resumeData.resume_id || resumeData.id,
                title: resumeData.resume_title || resumeData.title,
                url: resumeData.resume_url || resumeData.url,
                extractedText: null,
                techStacks: resumeData.tech_stacks?.map((ts: any) => ({
                    techStack: {
                        id: ts.tech_stack?.id || ts.id,
                        name: ts.tech_stack?.name || ts.name,
                        logo: ts.tech_stack?.logo || null,
                        docsUrl: ts.tech_stack?.docs_url || null,
                        createdAt: '',
                    }
                })) || [],
                createdAt: resumeData.created_at,
                updatedAt: resumeData.updated_at,
            }));
            setResumes(formattedResumes);
        } catch (error) {
            setResumes([]);
        } finally {
            setIsLoadingResumes(false);
        }
    };

    useEffect(() => {
        const resumeIdParam = searchParams?.get('resumeId');
        if (resumeIdParam && !taskId && step !== 'result') {
            const rid = parseInt(resumeIdParam, 10);
            const autoLoad = async () => {
                try {
                    const detailedResume = await fetchResumeDetails(rid);
                    if ((detailedResume.techStacks && detailedResume.techStacks.length > 0) || detailedResume.extractedText) {
                        setSelectedResume(detailedResume);
                        setStep('result');
                        return;
                    }
                } catch (e) {}
                handleStartAnalysis(rid);
            };
            autoLoad();
        } else if (searchParams?.get('pickResume') === '1') {
            setIsResumePickerOpen(true);
        }
    }, [searchParams]);

    useEffect(() => {
        if (isResumePickerOpen) fetchResumes();
    }, [isResumePickerOpen]);

    useEffect(() => {
        const handleReset = () => {
            setStep('empty');
            setSelectedResume(null);
            setShowDropdown(false);
            setTaskId(null);
            setAnalysisError(null);
            setAnalyzingResumeId(null);
            router.replace('/ai-interview');
        };
        window.addEventListener('resetAIInterview', handleReset);
        return () => window.removeEventListener('resetAIInterview', handleReset);
    }, [router]);

    const handleStartAnalysis = async (resumeId: number) => {
        setAnalysisError(null);
        setStep('analyzing');
        setAnalyzingResumeId(resumeId);
        setShowDropdown(false);
        setIsResumePickerOpen(false);

        try {
            const response = await api.post(`/resumes/${resumeId}/analyze/`);
            setTaskId(response.data.task_id);
        } catch (error: any) {
            const message = error.response?.data?.error || "이력서 분석 실패";
            setAnalysisError(message);
            setStep('empty');
            setAnalyzingResumeId(null);
        }
    };
    
    const handleSelectResume = async (resume: Resume) => {
        setIsResumePickerOpen(false);
        setStep('analyzing');
        setAnalyzingResumeId(resume.id);

        try {
            const detailedResume = await fetchResumeDetails(resume.id);
            if ((detailedResume.techStacks && detailedResume.techStacks.length > 0) || detailedResume.extractedText) {
                setSelectedResume(detailedResume);
                setStep('result');
                setAnalyzingResumeId(null);
                return;
            }
        } catch (error) { console.error(error); }

        handleStartAnalysis(resume.id);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setStep('analyzing');
        setAnalysisError(null);
        setAnalyzingResumeId(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', file.name.replace(/\.[^/.]+$/, "")); 
            
            const uploadResponse = await api.post('/resumes/', formData);
            const newResume = uploadResponse.data;
            const resumeId = newResume.resume_id || newResume.id;
            handleStartAnalysis(resumeId);
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || '업로드 중 오류 발생';
            setAnalysisError(errorMessage);
            setStep('empty');
        }
    };
    
    useEffect(() => {
        if (analysisError) {
            alert(analysisError);
            setAnalysisError(null);
        }
    }, [analysisError]);

    const handleDeleteResume = async (id: number) => {
        if (!confirm("정말 삭제하시겠습니까?")) return;
        try {
            await api.delete(`/resumes/${id}/`);
            alert("이력서가 삭제되었습니다.");
            fetchResumes();
        } catch (error) { alert("삭제 실패"); }
    };
    
    const triggerFileUpload = () => fileInputRef.current?.click();

    return (
        // ✅ [수정] print:h-auto print:overflow-visible로 인쇄 시 스크롤 제한 해제
        <div className="h-[calc(100vh-80px)] bg-[#1A1B1E] flex flex-col items-center justify-start text-white overflow-hidden print:h-auto print:overflow-visible print:bg-white">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx" />
            
            <div className="max-w-[1800px] w-full h-full flex flex-col p-6 lg:p-10 scale-[0.95] origin-top">
                <header className="flex justify-between items-center mb-4 shrink-0">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black tracking-tighter uppercase">AI 역량 분석 리포트</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {step !== 'empty' && (
                            <>
                                <button 
                                    onClick={() => setIsReportModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full font-bold text-sm shadow-lg hover:shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
                                >
                                    <FileText size={16} />
                                    <span>통합 리포트</span>
                                </button>

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
                            </>
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

                <main className="flex-1 min-h-0">
                    <AnimatePresence mode="wait">
                        {step === 'empty' && (
                            <UploadSection onUploadClick={triggerFileUpload} onMyPageClick={() => setIsResumePickerOpen(true)} />
                        )}

                        {step === 'analyzing' && <AnalyzingState key="analyzing" />}

                        {step === 'result' && selectedResume && (
                            <DashboardView 
                                key="dashboard"
                                resumeTitle={selectedResume.title || '나의 이력서'}
                                resumeText={selectedResume.extractedText || null}
                                resumeId={selectedResume.id}
                                resumeKeywords={resumeKeywords}
                                selectedCompany={simulationData.selectedCompany}
                                setSelectedCompany={simulationData.toggleCompany} 
                                toggleFavorite={simulationData.toggleFavorite}
                                matchScore={resumeMatchScore}
                                onOpenReport={() => setIsReportModalOpen(true)}
                                onDataUpdate={setReportData}
                            />
                        )}
                    </AnimatePresence>
                </main>
            </div>
            
            <ScrollbarStyles />

            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                resumeTitle={selectedResume?.title || 'Unknown'}
                resumeText={selectedResume?.extractedText || null}
                selectedCompany={simulationData.selectedCompany}
                selectedKeywords={resumeKeywords}
                feedbacks={reportData.feedbacks}
                questions={reportData.questions}
                totalScore={resumeMatchScore}
                jobPostingTitle={reportData.jobPostingTitle} // ✅ 제목 전달
            />
        </div>
    );
}

export default function AIInterviewPage() {
    return (
        <Suspense fallback={<div className="h-screen bg-[#1A1B1E] text-white flex items-center justify-center">Loading...</div>}>
            <AIInterviewContent />
        </Suspense>
    );
}