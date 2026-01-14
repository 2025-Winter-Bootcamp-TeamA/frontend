'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Star, CheckCircle2, Lightbulb, MessageCircle } from 'lucide-react';

export default function ReportModal({ isOpen, onClose, selectedCompany, selectedKeywords, totalScore }: any) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-10">
        {/* 배경 블러 처리 */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* 리포트 본문 */}
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="relative w-full max-w-4xl bg-[#1E1F22] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* 상단 헤더: PDF 다운로드 및 닫기 */}
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#25262B]">
            <div>
              <h2 className="text-2xl font-black tracking-tighter text-blue-500">AI 분석 리포트</h2>
              <p className="text-white/40 text-xs mt-1 uppercase font-bold tracking-widest">사용자에게 맞춤 제공되었습니다.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-white/10">
                <Download size={18} /> PDF 저장
              </button>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white">
                <X size={24} />
              </button>
            </div>
          </div>

          {/* 리포트 내용 스크롤 영역 */}
          <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar space-y-12">
            
            {/* 1. 하이라이트: 최고 매칭 기업 */}
            <section className="bg-blue-600/5 border border-blue-500/20 rounded-[32px] p-8 flex flex-col lg:flex-row items-center gap-8">
              <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center p-4 shadow-2xl">
                <Star className="text-blue-600 fill-blue-600" size={48} />
              </div>
              <div className="flex-1 text-center lg:text-left">
                <h3 className="text-3xl font-black mb-2">현재 선택하신 기업은 <span className="text-blue-500">{selectedCompany.name}</span> 입니다.</h3>
                <p className="text-white/60 leading-relaxed max-w-xl">
                  선택하신 <span className="text-purple-400 font-bold">{selectedKeywords.join(', ')}</span> 스택과 기업의 핵심 요구 사항이 **{totalScore}%** 일치합니다.
                </p>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 2. 상세 역량 분석 */}
              <div className="space-y-6">
                <h4 className="flex items-center gap-2 font-bold text-lg"><Lightbulb className="text-yellow-400" /> 상세 역량 분석</h4>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-6 space-y-4">
                  <div className="space-y-2">
                    <p className="text-blue-400 font-bold text-sm">강점 (Strengths)</p>
                    <p className="text-sm text-white/60 leading-relaxed">SW 우수상 수상 이력을 통해 검증된 **실무 기반의 문제 해결 능력**이 돋보입니다. 특히 DevRoad 프로젝트에서의 복잡한 데이터 시스템 설계 경험은 {selectedCompany.name}의 시니어 엔지니어들에게도 매력적인 요소입니다.</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-purple-400 font-bold text-sm">보완점 (Opportunities)</p>
                    <p className="text-sm text-white/60 leading-relaxed">최신 기술 스택에 대한 이해도는 높으나, 실제 프로덕션 환경에서의 **대규모 트래픽 분산 처리**에 대한 기술적 근거를 면접 시 더 구체적으로 준비해야 합니다.</p>
                  </div>
                </div>
              </div>

              {/* 3. 구체적 예상 질문 */}
              <div className="space-y-6">
                <h4 className="flex items-center gap-2 font-bold text-lg"><MessageCircle className="text-green-400" /> 커스텀 예상 질문</h4>
                <div className="space-y-3">
                  {[
                    "DevRoad 프로젝트에서 Next.js를 도입하며 가장 중점을 두었던 성능 최적화 포인트는 무엇인가요?",
                    "SW에서 우수상을 수상할 당시, 본인이 맡았던 핵심 기술적 기여와 팀 내 갈등 해결 방식에 대해 설명해주세요.",
                    "MSA 구조로 시스템을 확장한다면, 현재 설계된 데이터 아키텍처에서 어떤 병목 현상이 발생할 것으로 예상하시나요?"
                  ].map((q, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-xl text-sm text-white/80 leading-snug">
                      <span className="text-green-400 font-bold mr-2">Q{i+1}.</span> {q}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. 지원 및 면접 준비 전략 요약 */}
            <section className="space-y-6">
              <h4 className="flex items-center gap-2 font-bold text-lg"><CheckCircle2 className="text-blue-400" /> 실전 지원 가이드</h4>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <StrategyCard title="지원서 포인트" content="sw 활동을 단순 참여가 아닌 '성과 지표' 중심으로 기술하세요." color="blue" />
                <StrategyCard title="기술 면접 팁" content="선택하신 TypeScript의 제네릭 활용 사례를 실제 코드 예시와 함께 준비하세요." color="purple" />
                <StrategyCard title="마지막 한마디" content="DevRoad 서비스를 통해 얻은 취준생에 대한 통찰력을 기업 서비스와 연결해 보세요." color="green" />
              </div>
            </section>
          </div>

          {/* 하단 푸터 */}
          <div className="p-8 border-t border-white/5 bg-[#1A1B1E] flex justify-center">
            <button onClick={onClose} className="text-white/30 hover:text-white font-bold transition-colors">리포트 닫기</button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function StrategyCard({ title, content, color }: any) {
  const colors: any = { blue: 'text-blue-400', purple: 'text-purple-400', green: 'text-green-400' };
  return (
    <div className="bg-white/5 border border-white/5 p-5 rounded-2xl">
      <p className={`font-bold text-xs uppercase mb-2 ${colors[color]}`}>{title}</p>
      <p className="text-sm text-white/60 leading-relaxed">{content}</p>
    </div>
  );
}