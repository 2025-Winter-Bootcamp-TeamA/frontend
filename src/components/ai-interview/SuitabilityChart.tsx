'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Plus, CheckCircle2, Building2, Tag, MousePointerClick } from 'lucide-react';
import CountUp from './Countup';

interface Props {
  selectedCompany: any;
  selectedKeywords: string[];
  totalScore: number;
  keywords: string[];
  onToggleKeyword: (tag: string) => void;
}

export default function SuitabilityChart({ 
  selectedCompany, 
  selectedKeywords, 
  totalScore, 
  keywords, 
  onToggleKeyword 
}: Props) {
  
  const hasCompany = !!selectedCompany;
  const hasKeywords = selectedKeywords.length > 0;

  return (
    /* ✅ overflow-hidden을 추가하여 하단 키워드가 둥근 모서리 밖으로 나가지 않게 차단합니다 */
    <div className="bg-[#212226] border border-white/10 rounded-[32px] p-8 h-[600px] flex flex-col shadow-2xl overflow-hidden relative">
      <h3 className="text-white/40 text-[11px] font-bold uppercase tracking-widest mb-8">매칭 적합도 분석</h3>
      
      {/* 상단 게이지/가이드 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 relative">
        <AnimatePresence mode="wait">
          {hasCompany && hasKeywords ? (
            <motion.div 
              key="gauge" 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0 }} 
              className="w-full flex flex-col items-center"
            >
              <div className="h-56 w-full relative">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie 
                      data={[{ value: totalScore }, { value: 100 - totalScore }]} 
                      startAngle={180} endAngle={0} 
                      innerRadius={85} outerRadius={110} cy="75%"
                      dataKey="value" stroke="none" 
                      isAnimationActive={true} 
                      animationBegin={200}
                      animationDuration={1500}
                      animationEasing="ease-out"
                    >
                      <Cell fill="#6366f1" />
                      <Cell fill="#ffffff05" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-10">
                  <p className="text-5xl font-black tracking-tighter">
                    <CountUp value={totalScore} />%
                  </p>
                  <span className="text-white/20 text-[10px] font-bold mt-1 uppercase tracking-widest">suitability</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="hint" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-8"
            >
              <div className="flex items-center gap-6">
                <div className={`p-5 rounded-2xl border transition-all duration-500 ${hasCompany ? 'bg-blue-500/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'bg-white/5 border-white/5 opacity-20'}`}>
                  <Building2 size={40} className={hasCompany ? 'text-blue-400' : 'text-white'} />
                </div>
                <Plus size={20} className="text-white/10 mt-[-20px]" />
                <div className={`p-5 rounded-2xl border transition-all duration-500 ${hasKeywords ? 'bg-purple-500/10 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'bg-white/5 border-white/5 opacity-20'}`}>
                  <Tag size={40} className={hasKeywords ? 'text-purple-400' : 'text-white'} />
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-white/40 text-sm font-medium leading-relaxed">
                  {!hasCompany ? "분석할 회사를 먼저 선택해주세요." : "매칭해볼 기술 키워드를 선택해주세요."}
                </p>
                <div className="flex justify-center items-center gap-2 text-white/10 text-[11px] font-bold">
                  <MousePointerClick size={14} className="animate-bounce" /> CLICK TO START
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ✅ 하단 키워드 리스트 영역: max-h를 조금 더 줄여 안전하게 배치합니다 */}
      <div className="mt-6 pb-2">
        <h3 className="text-white/40 text-[11px] font-bold uppercase mb-4 tracking-widest">내 기술 키워드</h3>
        <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto pr-2 custom-scrollbar">
          {keywords.map(tag => (
            <button 
              key={tag} 
              onClick={() => onToggleKeyword(tag)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                selectedKeywords.includes(tag) 
                ? 'bg-purple-600/20 border-purple-500 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]' 
                : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'
              }`}
            >
              {selectedKeywords.includes(tag) && <CheckCircle2 size={12} />}
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}