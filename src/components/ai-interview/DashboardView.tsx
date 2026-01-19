'use client';

import { motion } from 'framer-motion';
// ✅ [수정됨] ExternalLink, Briefcase 아이콘 추가 임포트
import { Star, FileText, CheckCircle2, AlertCircle, HelpCircle, ChevronRight, Sparkles, Hash, ExternalLink, Briefcase } from 'lucide-react';
import Countup from '@/components/ai-interview/Countup';

interface DashboardViewProps {
    resumeTitle: string;
    resumeKeywords: string[];
    sortedCompanies: any[];
    selectedCompany: any;
    setSelectedCompany: (c: any) => void;
    toggleFavorite: (e: any, id: number) => void;
    matchScore: number;
    onOpenReport: () => void;
}

export default function DashboardView({
    resumeTitle, resumeKeywords, sortedCompanies, selectedCompany, setSelectedCompany, toggleFavorite, matchScore, onOpenReport
}: DashboardViewProps) {

    // 기업 선택 전 빈 화면
    if (!selectedCompany) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-[3.5fr_4.5fr_4fr] gap-8 h-full items-start">
                <section className="h-[750px] bg-[#212226] border border-white/5 rounded-[32px] p-6 opacity-50 flex flex-col items-center justify-center text-center">
                    <p className="text-sm text-[#9FA0A8]">기업을 먼저 선택해주세요.</p>
                </section>
                <section className="bg-[#212226] border border-white/5 rounded-[32px] p-6 h-[750px] flex flex-col">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
                        <Star className="text-yellow-400 fill-yellow-400" size={20} /> 기업 선택
                    </h3>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                        {sortedCompanies.map((c) => (
                            <div key={c.id} onClick={() => setSelectedCompany(c)} className="p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center"><img src={c.logo} alt="" className="w-full h-full object-contain" /></div>
                                    <div><h4 className="font-bold text-gray-200">{c.name}</h4></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                <section className="h-[750px] bg-[#212226] border border-white/5 rounded-[32px] flex flex-col items-center justify-center text-center p-10">
                    <Sparkles size={64} className="text-white/10 mb-6" />
                    <h3 className="text-2xl font-bold text-white mb-2">분석 대기 중</h3>
                    <p className="text-[#9FA0A8]">중앙 리스트에서 기업을 선택하면<br/>'{resumeTitle}' 이력서와의 적합도를 분석합니다.</p>
                </section>
            </div>
        );
    }

    return (
        <motion.div 
            key="dashboard"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-[3.5fr_4.5fr_4fr] gap-6 h-full items-start"
        >
            {/* [좌측] 적합도 파이차트 + 이력서 키워드 */}
            <section className="flex flex-col gap-6 h-[750px]">
                <div className="flex-1 bg-[#212226] border border-white/5 rounded-[32px] p-6 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-600/5 blur-3xl" />
                    <div className="relative z-10 text-center">
                        <h4 className="text-blue-400 font-bold text-xs tracking-widest uppercase mb-6">Match Score</h4>
                        <div className="relative w-36 h-36 mx-auto mb-6">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 144 144">
                                <circle cx="72" cy="72" r="60" stroke="#333" strokeWidth="12" fill="none" />
                                <motion.circle 
                                    cx="72" cy="72" r="60" stroke="#3B82F6" strokeWidth="12" fill="none" 
                                    strokeDasharray="377" 
                                    strokeDashoffset={377 - (377 * matchScore) / 100}
                                    initial={{ strokeDashoffset: 377 }}
                                    animate={{ strokeDashoffset: 377 - (377 * matchScore) / 100 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-black text-white leading-none">
                                    <Countup value={matchScore} />
                                </span>
                                <span className="text-sm font-bold text-gray-500 mt-1">%</span>
                            </div>
                        </div>
                        <div className="bg-white/5 rounded-full px-4 py-1.5 text-xs text-gray-300 inline-block">
                            {selectedCompany.name} 기업과 내 이력서의 적합도
                        </div>
                    </div>
                </div>

                <div className="flex-[1.2] bg-[#212226] border border-white/5 rounded-[32px] p-6 flex flex-col">
                    <h4 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                        <Hash size={16} className="text-purple-400" /> 내 기술 키워드
                    </h4>
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                        <div className="flex flex-wrap gap-2">
                            {resumeKeywords.map((k, i) => (
                                <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-300">
                                    {k}
                                </span>
                            ))}
                            {resumeKeywords.length === 0 && <span className="text-gray-500 text-xs">추출된 키워드가 없습니다.</span>}
                        </div>
                    </div>
                </div>
            </section>

            {/* [중앙] 기업 선택 리스트 */}
            <section className="bg-[#212226] border border-white/5 rounded-[32px] p-6 h-[750px] flex flex-col">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
                    <Star className="text-yellow-400 fill-yellow-400" size={20} /> 기업 목록
                </h3>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                    {sortedCompanies.map((c) => (
                        <motion.div 
                            layout
                            key={c.id} 
                            onClick={() => setSelectedCompany(c)} 
                            className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${selectedCompany?.id === c.id ? 'bg-blue-600 border-blue-500 shadow-xl shadow-blue-900/20' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-sm">
                                    <img src={c.logo} alt="" className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <h4 className={`font-bold ${selectedCompany?.id === c.id ? 'text-white' : 'text-gray-200'}`}>{c.name}</h4>
                                    <p className={`text-xs ${selectedCompany?.id === c.id ? 'text-blue-200' : 'text-gray-500'}`}>{c.category}</p>
                                </div>
                            </div>
                            <button onClick={(e) => toggleFavorite(e, c.id)} className="p-2 hover:bg-white/10 rounded-full transition-colors z-10">
                                <Star size={20} fill={c.favorite ? "#EAB308" : "none"} className={c.favorite ? 'text-yellow-500' : selectedCompany?.id === c.id ? 'text-white/50' : 'text-gray-600'} />
                            </button>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* [우측] 분석 결과 + 통합 리포트 버튼 */}
            <section className="h-[750px] flex flex-col gap-6">
                <motion.div 
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} 
                    className="flex-1 bg-[#212226] border border-white/5 rounded-[32px] p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar"
                >
                    {/* 강점 */}
                    <div>
                        <h4 className="flex items-center gap-2 text-green-400 font-bold mb-3 text-sm uppercase tracking-wider">
                            <CheckCircle2 size={16} /> Resume Strengths
                        </h4>
                        <p className="text-gray-300 text-sm leading-relaxed bg-green-500/5 border border-green-500/10 p-4 rounded-xl">
                            <span className="text-white font-bold">{resumeKeywords[0] || '보유 기술'}</span> 프로젝트 경험이 풍부하며, 
                            {selectedCompany.name}의 실무 역량과 일치합니다.
                        </p>
                    </div>

                    {/* 단점 */}
                    <div>
                        <h4 className="flex items-center gap-2 text-red-400 font-bold mb-3 text-sm uppercase tracking-wider">
                            <AlertCircle size={16} /> Weaknesses
                        </h4>
                        <p className="text-gray-300 text-sm leading-relaxed bg-red-500/5 border border-red-500/10 p-4 rounded-xl">
                            대규모 트래픽 처리 경험이 부족하여 시스템 설계 심화 질문 대비가 필요합니다.
                        </p>
                    </div>

                    {/* AI 질문 */}
                    <div>
                        <h4 className="flex items-center gap-2 text-purple-400 font-bold mb-3 text-sm uppercase tracking-wider">
                            <HelpCircle size={16} /> AI Interview Question
                        </h4>
                        <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl">
                            <p className="text-white font-bold text-sm leading-snug">
                                "이력서에 기재하신 {resumeKeywords[0] || '프로젝트'} 경험에서 발생했던 가장 큰 기술적 이슈는 무엇이었나요?"
                            </p>
                        </div>
                    </div>

                    {/* ✅ [추가됨] 채용공고 보러가기 버튼 (Wanted 링크) */}
                    <div className="mt-auto pt-2">
                        <a 
                            href={`https://www.wanted.co.kr/search?query=${encodeURIComponent(selectedCompany.name)}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full bg-[#1A1B1E] hover:bg-[#25262B] border border-white/10 rounded-2xl p-4 flex items-center justify-between group transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <Briefcase size={18} className="text-blue-400" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                                        {selectedCompany.name} 채용공고 보러가기
                                    </p>
                                    <p className="text-xs text-[#9FA0A8]">Wanted에서 현직자 연봉과 공고 확인</p>
                                </div>
                            </div>
                            <ExternalLink size={16} className="text-[#9FA0A8] group-hover:text-white transition-colors" />
                        </a>
                    </div>
                </motion.div>

                {/* 통합 리포트 버튼 */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-[28px] p-[1px] shrink-0"
                >
                    <button 
                        onClick={onOpenReport}
                        className="w-full bg-[#212226] hover:bg-[#2C2D33] rounded-[27px] py-5 flex flex-col items-center justify-center gap-1 transition-all group"
                    >
                        <div className="flex items-center gap-2">
                            <FileText className="text-blue-400 group-hover:scale-110 transition-transform" size={20} />
                            <span className="text-lg font-black text-white group-hover:text-blue-400 transition-colors">통합 리포트 확인하기</span>
                        </div>
                        <p className="text-white/40 text-xs">상세 분석 결과 및 면접 가이드 모달 열기</p>
                    </button>
                </motion.div>
            </section>
        </motion.div>
    );
}