'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, CheckCircle2, AlertCircle, TrendingUp, Target } from 'lucide-react';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    // ✅ [수정] 타입을 'any'로 변경하여 호환성 문제 해결
    selectedCompany: any; 
    selectedKeywords: string[];
    totalScore: number;
}

const MOCK_RESUME_TEXT = `
안녕하세요, 사용자 경험을 중요시하는 프론트엔드 개발자입니다.
React와 TypeScript를 주력으로 사용하며, 재사용 가능한 컴포넌트 설계에 깊은 관심을 가지고 있습니다.
지난 프로젝트에서는 Next.js를 도입하여 초기 로딩 속도를 50% 개선하고 SEO 점수를 90점대로 끌어올린 경험이 있습니다.
또한 Redux Toolkit을 활용해 복잡한 전역 상태를 효율적으로 관리했습니다.
다만, 대규모 트래픽 처리를 위한 백엔드와의 최적화 협업 경험은 다소 부족하여, 현재 Node.js와 AWS를 학습하며 인프라에 대한 이해도를 높이고 있습니다.
사용자의 피드백을 적극적으로 수용하여 서비스를 지속적으로 고도화하는 개발자가 되겠습니다.
`;

// 기업 적합도를 포함한 Mock Data
const ANALYSIS_FEEDBACKS = [
    { type: 'strength', text: '초기 로딩 속도를 50% 개선', comment: '구체적 수치로 성과 증명' },
    { type: 'matching', text: '사용자 피드백 수용 및 서비스 고도화', comment: '기업 핵심 가치(Customer Obsession)와 일치' },
    { type: 'improvement', text: '백엔드와의 최적화 협업 경험 부족', comment: '구체적 학습 계획 및 토이 프로젝트 추가 추천' },
];

const AI_QUESTIONS = [
    "핵심 가치인 '고객 집착' 관점에서, 본인이 수행했던 가장 기억에 남는 UX 개선 사례를 설명해주세요.",
    "Redux Toolkit을 도입하면서 느꼈던 장점과, 만약 다른 상태 관리 라이브러리를 쓴다면 어떤 점이 달랐을지 비교해 보세요.",
    "대규모 트래픽 처리를 위해 현재 학습 중인 내용을 실제 프로젝트에 어떻게 적용할 계획인가요?"
];

export default function ReportModal({ isOpen, onClose, selectedCompany, selectedKeywords, totalScore }: ReportModalProps) {
    if (!isOpen) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-6">
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
                    />

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                        animate={{ opacity: 1, scale: 1, y: 0 }} 
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-4xl h-[90vh] bg-[#1A1B1E] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/10"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#212226]">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <FileText className="text-blue-400" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">AI 역량 분석 통합 리포트</h2>
                                    {/* ✅ selectedCompany가 null/undefined일 경우 안전하게 처리 */}
                                    <p className="text-sm text-gray-400">Analysis Result for {selectedCompany?.name || 'General Report'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={handlePrint}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 transition-colors"
                                >
                                    <Download size={16} /> PDF 저장
                                </button>
                                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-[#151619]">
                            <div className="max-w-[800px] mx-auto bg-white text-black rounded-sm shadow-xl min-h-[1000px] p-12 flex flex-col gap-10">
                                
                                <div className="border-b-2 border-black/10 pb-6 flex justify-between items-end">
                                    <div>
                                        <h1 className="text-3xl font-black text-gray-900 mb-2">COMPETENCY REPORT</h1>
                                        <p className="text-gray-500 font-medium">AI-Powered Resume Analysis</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-5xl font-black text-blue-600">{totalScore}</div>
                                        <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Match Score</div>
                                    </div>
                                </div>

                                {/* 상세 분석 */}
                                <div>
                                    <h3 className="text-lg font-bold uppercase tracking-wider text-gray-400 mb-4 border-l-4 border-blue-600 pl-3">
                                        Resume Analysis
                                    </h3>
                                    <div className="bg-gray-50 p-6 rounded-xl text-gray-700 leading-relaxed text-sm whitespace-pre-wrap font-medium mb-6">
                                        {MOCK_RESUME_TEXT.split('\n').map((line, i) => (
                                            <p key={i} className="mb-1">{line}</p>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        {ANALYSIS_FEEDBACKS.map((fb, i) => (
                                            <div key={i} className={`p-4 rounded-lg border flex flex-col gap-2
                                                ${fb.type === 'strength' ? 'bg-blue-50 border-blue-100' : 
                                                  fb.type === 'matching' ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'}`}>
                                                
                                                <div className="flex items-center gap-2 font-bold">
                                                    {fb.type === 'strength' && <TrendingUp size={16} className="text-blue-600" />}
                                                    {fb.type === 'matching' && <Target size={16} className="text-green-600" />}
                                                    {fb.type === 'improvement' && <AlertCircle size={16} className="text-orange-600" />}
                                                    <span className={
                                                        fb.type === 'strength' ? 'text-blue-800' :
                                                        fb.type === 'matching' ? 'text-green-800' : 'text-orange-800'
                                                    }>
                                                        {fb.type === 'strength' ? '강점 (Strength)' : 
                                                         fb.type === 'matching' ? '기업 적합 (Company Fit)' : '보완 제안 (Suggestion)'}
                                                    </span>
                                                </div>
                                                <p className="font-semibold text-gray-800">"{fb.text}"</p>
                                                <p className="text-gray-600 text-sm">{fb.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* AI 질문 */}
                                <div>
                                    <h3 className="text-lg font-bold uppercase tracking-wider text-gray-400 mb-4 border-l-4 border-gray-800 pl-3">
                                        Expected Questions
                                    </h3>
                                    <ul className="space-y-4">
                                        {AI_QUESTIONS.map((q, i) => (
                                            <li key={i} className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs font-bold shrink-0">Q{i+1}</span>
                                                <p className="text-gray-800 font-medium">{q}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Target Keywords */}
                                <div>
                                    <h3 className="text-lg font-bold uppercase tracking-wider text-gray-400 mb-4 border-l-4 border-purple-600 pl-3">
                                        Keywords
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedKeywords.map((k, i) => (
                                            <span key={i} className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-full text-sm font-bold text-gray-600">
                                                #{k}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}