'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, CheckCircle2, AlertCircle, TrendingUp, Target, BrainCircuit, Hash, Building2 } from 'lucide-react';

interface AnalysisFeedback {
    id: string;
    type: 'strength' | 'improvement' | 'matching';
    targetText?: string;
    comment: string;
}

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    resumeTitle: string;
    resumeText: string | null;
    selectedCompany: any;
    selectedKeywords: string[];
    feedbacks: AnalysisFeedback[];
    questions: string[];
    totalScore: number;
    jobPostingTitle?: string;
}

export default function ReportModal({ 
    isOpen, onClose, resumeTitle, resumeText, selectedCompany, selectedKeywords, feedbacks, questions, totalScore, jobPostingTitle 
}: ReportModalProps) {
    if (!isOpen) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-6 print:p-0 print:block print:static">
                    {/* ✅ [수정] PDF 출력 스타일 최적화 (여백 제거) */}
                    <style>{`
                        @media print {
                            @page { margin: 10mm; size: auto; } /* 기본 마진 설정 */
                            
                            /* 메인 컨텐츠 숨김 (Visibility로 공간은 유지하되 내용은 숨김) */
                            body * {
                                visibility: hidden;
                            }

                            /* 모달 내부 컨텐츠만 표시 */
                            #printable-root, #printable-root * {
                                visibility: visible;
                            }

                            /* HTML/Body 높이 제한 해제 (무한 스크롤 방지) */
                            html, body {
                                height: auto !important;
                                min-height: 100% !important;
                                overflow: visible !important;
                                background: white !important;
                            }

                            /* 모달 컨테이너를 문서 최상단에 절대 위치 */
                            #printable-root {
                                position: absolute !important;
                                left: 0 !important;
                                top: 0 !important;
                                width: 100% !important;
                                height: auto !important;
                                margin: 0 !important;
                                padding: 0 !important;
                                overflow: visible !important; /* 스크롤바 해제 */
                                background: white !important;
                                color: black !important;
                                border: none !important;
                                box-shadow: none !important;
                                z-index: 99999 !important;
                                transform: none !important; /* Framer Motion 간섭 제거 */
                            }

                            #printable-content {
                                width: 100% !important;
                                max-width: none !important;
                                padding: 0 !important;
                                margin: 0 !important;
                                border: none !important;
                                box-shadow: none !important;
                                overflow: visible !important;
                            }

                            .custom-scrollbar {
                                height: auto !important;
                                overflow: visible !important;
                                max-height: none !important;
                            }

                            .no-print { display: none !important; }

                            /* 간격 강제 조정 (화면상 큰 간격을 인쇄 시 축소) */
                            .print-compact-gap { gap: 1rem !important; }
                            .print-compact-padding { padding: 1.5rem !important; }
                            .print-no-min-height { min-height: 0 !important; }

                            /* 페이지 넘김 방지 */
                            .print-break-inside {
                                break-inside: avoid;
                                page-break-inside: avoid;
                                margin-bottom: 1.5rem;
                            }
                            
                            p, span, div, h1, h2, h3, h4, li { color: black !important; }
                            .print-color-box { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                        }
                    `}</style>

                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose} 
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm no-print" 
                    />

                    <motion.div 
                        id="printable-root"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                        animate={{ opacity: 1, scale: 1, y: 0 }} 
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-4xl h-[90vh] bg-[#1A1B1E] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/10 print:h-auto print:rounded-none print:border-none print:shadow-none"
                    >
                        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#212226] no-print shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg"><FileText className="text-blue-400" size={24} /></div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">AI 역량 분석 통합 리포트</h2>
                                    <p className="text-sm text-gray-400">Analysis for {selectedCompany?.name || 'General'} - {resumeTitle}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 transition-colors">
                                    <Download size={16} /> PDF 저장
                                </button>
                                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* ✅ [수정] 인쇄용 클래스 추가 (print-compact-*) */}
                        <div id="printable-content" className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-[#151619] print:bg-white print:p-0">
                            <div className="max-w-[800px] mx-auto bg-white text-black rounded-sm shadow-xl min-h-[1000px] p-12 flex flex-col gap-10 print:shadow-none print:p-8 print:gap-6 print:min-h-0 print:w-full print:max-w-none print-compact-gap print-compact-padding print-no-min-height">
                                
                                <div className="border-b-2 border-black/10 pb-6 print:pb-4 flex justify-between items-end print-break-inside">
                                    <div>
                                        <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">COMPETENCY REPORT</h1>
                                        <p className="text-gray-500 font-medium text-sm">AI-Powered Resume Analysis by DevRoad</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        {selectedCompany?.logo_url ? (
                                            <img src={selectedCompany.logo_url} alt={selectedCompany.name} className="h-10 w-auto object-contain mb-2" />
                                        ) : (
                                            <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center mb-2"><Building2 className="text-gray-400" size={24} /></div>
                                        )}
                                        <div className="text-right">
                                            <h2 className="text-lg font-bold text-gray-900 leading-tight">{selectedCompany?.name || 'Company Name'}</h2>
                                            <p className="text-sm text-gray-500 font-medium">{jobPostingTitle || '채용공고 정보 없음'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="print-break-inside">
                                    <h3 className="text-lg font-bold uppercase tracking-wider text-gray-800 mb-4 border-l-4 border-blue-600 pl-3 flex items-center gap-2 print:mb-2">
                                        <Hash size={18} className="text-blue-600"/> Tech Stack
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedKeywords.length > 0 ? selectedKeywords.map((k, i) => (
                                            <span key={i} className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-full text-sm font-bold text-gray-700 print-color-box">{k}</span>
                                        )) : <span className="text-gray-400 text-sm">분석된 기술 스택이 없습니다.</span>}
                                    </div>
                                </div>

                                <div className="print-break-inside">
                                    <h3 className="text-lg font-bold uppercase tracking-wider text-gray-800 mb-4 border-l-4 border-green-600 pl-3 flex items-center gap-2 print:mb-2">
                                        <Target size={18} className="text-green-600"/> Detailed Analysis
                                    </h3>
                                    {feedbacks.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-4 print:gap-3">
                                            {feedbacks.map((fb, i) => (
                                                <div key={i} className={`p-4 rounded-lg border flex flex-col gap-2 print-break-inside print-color-box ${fb.type==='strength'?'bg-blue-50 border-blue-100':fb.type==='matching'?'bg-green-50 border-green-100':'bg-orange-50 border-orange-100'}`}>
                                                    <div className="flex items-center gap-2 font-bold">
                                                        {fb.type==='strength' && <TrendingUp size={16} className="text-blue-600"/>}
                                                        {fb.type==='matching' && <CheckCircle2 size={16} className="text-green-600"/>}
                                                        {fb.type==='improvement' && <AlertCircle size={16} className="text-orange-600"/>}
                                                        <span className={fb.type==='strength'?'text-blue-800':fb.type==='matching'?'text-green-800':'text-orange-800'}>
                                                            {fb.type==='strength'?'강점 (Strength)':fb.type==='matching'?'기업 적합 (Company Fit)':'보완 제안 (Suggestion)'}
                                                        </span>
                                                    </div>
                                                    {fb.targetText && <p className="font-semibold text-gray-800 text-sm border-l-2 border-black/10 pl-2 italic">"{fb.targetText}"</p>}
                                                    <p className="text-gray-600 text-sm leading-relaxed">{fb.comment}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="text-gray-400 italic">상세 분석 데이터가 없습니다.</p>}
                                </div>

                                <div className="print-break-inside">
                                    <h3 className="text-lg font-bold uppercase tracking-wider text-gray-800 mb-4 border-l-4 border-purple-600 pl-3 flex items-center gap-2 print:mb-2">
                                        <BrainCircuit size={18} className="text-purple-600"/> AI Interview Questions
                                    </h3>
                                    {questions.length > 0 ? (
                                        <ul className="space-y-4 print:space-y-3">
                                            {questions.map((q, i) => (
                                                <li key={i} className="flex gap-4 items-start bg-purple-50 p-5 rounded-xl border border-purple-100 print-break-inside print-color-box print:p-4">
                                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold shrink-0 shadow-md print-color-box">Q{i+1}</span>
                                                    <p className="text-gray-800 font-medium leading-relaxed">{q}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : <p className="text-gray-400 italic">생성된 면접 질문이 없습니다.</p>}
                                </div>

                                {resumeText && (
                                    <div className="print-break-inside">
                                        <h3 className="text-lg font-bold uppercase tracking-wider text-gray-800 mb-4 border-l-4 border-gray-400 pl-3 flex items-center gap-2 print:mb-2">
                                            <FileText size={18} className="text-gray-600"/> Resume Content
                                        </h3>
                                        <div className="bg-gray-50 p-6 rounded-xl text-gray-600 leading-relaxed text-xs whitespace-pre-wrap font-mono border border-gray-200 print-color-box print:p-4">{resumeText}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}