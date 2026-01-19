'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Star, CheckCircle2, Lightbulb, MessageCircle } from 'lucide-react';
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCompany: any;
  selectedKeywords: string[];
  totalScore: number;
}

export default function ReportModal({ isOpen, onClose, selectedCompany, selectedKeywords, totalScore }: ReportModalProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${selectedCompany?.name || 'Analysis'}_Report.pdf`);
    } catch (error) {
      console.error('PDF Download Error:', error);
    }
  };

  if (!isOpen || !selectedCompany) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-10">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="relative w-full max-w-4xl bg-[#1E1F22] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          <div className="p-6 lg:p-8 border-b border-white/5 flex justify-between items-center bg-[#25262B]">
            <div>
              <h2 className="text-xl lg:text-2xl font-black tracking-tighter text-blue-500">AI 상세 분석 리포트</h2>
              <p className="text-white/40 text-xs mt-1 uppercase font-bold tracking-widest">사용자 맞춤형 정밀 분석 결과</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleDownloadPDF} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-white/10">
                <Download size={18} /> PDF 저장
              </button>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white">
                <X size={24} />
              </button>
            </div>
          </div>

          <div ref={reportRef} className="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar space-y-8 lg:space-y-12 bg-[#1E1F22]">
            <section className="bg-blue-600/5 border border-blue-500/20 rounded-[32px] p-8 flex flex-col lg:flex-row items-center gap-8">
              <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center p-4 shadow-2xl shrink-0">
                <Star className="text-blue-600 fill-blue-600" size={48} />
              </div>
              <div className="flex-1 text-center lg:text-left">
                <h3 className="text-2xl lg:text-3xl font-black mb-2 text-white">
                  <span className="text-blue-500">{selectedCompany.name}</span> 적합도 분석 결과
                </h3>
                <p className="text-white/60 leading-relaxed max-w-xl">
                  이력서의 <span className="text-purple-400 font-bold">{selectedKeywords.join(', ')}</span> 스택과 기업의 핵심 요구 사항이 <span className="text-white font-bold">{totalScore}%</span> 일치합니다.
                </p>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h4 className="flex items-center gap-2 font-bold text-lg text-white"><Lightbulb className="text-yellow-400" /> 상세 역량 분석</h4>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-6 space-y-4">
                  <div className="space-y-2">
                    <p className="text-blue-400 font-bold text-sm">강점 (Strengths)</p>
                    <p className="text-sm text-white/60 leading-relaxed">SW 우수상 수상 이력을 통해 검증된 **실무 기반의 문제 해결 능력**이 돋보입니다.</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-purple-400 font-bold text-sm">보완점 (Opportunities)</p>
                    <p className="text-sm text-white/60 leading-relaxed">최신 기술 스택에 대한 이해도는 높으나, 실제 프로덕션 환경 경험을 더 강조해야 합니다.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="flex items-center gap-2 font-bold text-lg text-white"><MessageCircle className="text-green-400" /> 커스텀 예상 질문</h4>
                <div className="space-y-3">
                  {["대규모 트래픽 분산 처리 경험에 대해 설명해주세요.", "React의 렌더링 최적화 전략은 무엇인가요?", "팀 내 갈등 해결 경험이 있나요?"].map((q, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-xl text-sm text-white/80 leading-snug">
                      <span className="text-green-400 font-bold mr-2">Q{i+1}.</span> {q}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}