'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, CheckCircle2, AlertCircle, HelpCircle, Star, HelpCircle as HelpIcon } from 'lucide-react';

interface SimulationViewProps {
    simulationData: any;
}

export default function SimulationView({ simulationData }: SimulationViewProps) {
    const {
        allTechKeywords, selectedKeywords, keywordSearch, setKeywordSearch, toggleKeyword,
        sortedCompanies, selectedCompany, setSelectedCompany, toggleFavorite, matchScore
    } = simulationData;

    return (
        <motion.div 
            key="simulation"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            // ✅ [수정됨] 비율 조정: 왼쪽(3.5) / 중앙(4.5) / 오른쪽(4)
            className="grid grid-cols-1 lg:grid-cols-[3.5fr_4.5fr_4fr] gap-8 items-start h-full"
        >
            {/* 1. 키워드 탐색기 */}
            <section className="bg-[#212226] border border-white/5 rounded-[32px] p-6 h-[750px] flex flex-col">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-400"><Sparkles size={18} /> 기술 스택 시뮬레이션</h3>
                <div className="relative mb-5">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input type="text" placeholder="기술 검색..." value={keywordSearch} onChange={(e) => setKeywordSearch(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 transition-all" />
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-wrap gap-2 content-start">
                    {allTechKeywords.filter((k: string) => k.toLowerCase().includes(keywordSearch.toLowerCase())).map((k: string) => (
                        <button key={k} onClick={() => toggleKeyword(k)} className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${selectedKeywords.includes(k) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}>
                            {k} {selectedKeywords.includes(k) && '✓'}
                        </button>
                    ))}
                </div>
            </section>

            {/* 2. 기업 리스트 */}
            <section className="h-[750px] overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                    {sortedCompanies.map((c: any) => (
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

            {/* 3. 시뮬레이션 결과 */}
            <section className="h-[750px] overflow-y-auto custom-scrollbar pr-2 space-y-6">
                <AnimatePresence mode="wait">
                    {!selectedCompany || selectedKeywords.length === 0 ? (
                        <motion.div key="guide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center p-10 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[32px]">
                            <HelpIcon size={48} className="text-white/10 mb-4" />
                            <p className="text-[#9FA0A8] text-sm leading-relaxed">기업과 키워드를 선택하여<br />가상 면접 결과를 확인해보세요.</p>
                        </motion.div>
                    ) : (
                        <motion.div key="report" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <div className="bg-[#212226] border border-white/5 rounded-[32px] p-8 flex items-center justify-between shadow-2xl relative overflow-hidden group">
                                <div className="space-y-2 relative z-10">
                                    <h4 className="text-sm font-black text-blue-400 uppercase tracking-widest">Simulated Score</h4>
                                    <p className="text-3xl font-black text-white">{matchScore}%</p>
                                    <p className="text-xs text-[#9FA0A8]">선택 키워드 {selectedKeywords.length}개 기준</p>
                                </div>
                                <div className="relative w-28 h-28">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="56" cy="56" r="50" fill="transparent" stroke="currentColor" strokeWidth="10" className="text-white/5" />
                                        <motion.circle cx="56" cy="56" r="50" fill="transparent" stroke="currentColor" strokeWidth="10" strokeDasharray={314} initial={{ strokeDashoffset: 314 }} animate={{ strokeDashoffset: 314 - (314 * matchScore) / 100 }} transition={{ duration: 1, ease: "easeOut" }} className="text-blue-500" />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center font-bold text-lg">{matchScore}%</div>
                                </div>
                            </div>
                            
                            <div className="bg-[#212226] border border-white/5 rounded-[32px] p-8 space-y-8">
                                <div>
                                    <h4 className="text-xs font-black text-green-400 uppercase tracking-widest mb-4 flex items-center gap-2"><CheckCircle2 size={14} /> 강점 시뮬레이션</h4>
                                    <p className="text-sm leading-relaxed text-[#9FA0A8]">선택하신 <span className="text-white font-bold">{selectedKeywords[0]}</span> 기술은 {selectedCompany.name}에서 우대하는 핵심 역량입니다.</p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2"><HelpCircle size={14} /> 예상 질문</h4>
                                    <p className="text-lg font-bold italic leading-snug">"{selectedCompany.name} 서비스에 {selectedKeywords[0]}를 도입할 때 발생할 수 있는 보안 이슈는 무엇이라고 생각합니까?"</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
        </motion.div>
    );
}