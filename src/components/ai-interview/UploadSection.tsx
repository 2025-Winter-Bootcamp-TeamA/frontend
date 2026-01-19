'use client';

import { motion } from 'framer-motion';
import { UploadCloud, Monitor, User } from 'lucide-react';

interface UploadSectionProps {
    onUploadClick: () => void;
    onMyPageClick: () => void;
}

export default function UploadSection({ onUploadClick, onMyPageClick }: UploadSectionProps) {
    return (
        <motion.div 
            key="empty"
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.98 }}
            className="h-[600px] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.01] hover:bg-white/[0.02] transition-all cursor-pointer group p-10"
            onClick={onUploadClick} // 영역 전체 클릭 시 파일 선택
        >
            <div className="w-32 h-32 rounded-full bg-blue-600/5 flex items-center justify-center mb-8 border border-blue-600/10 group-hover:scale-110 transition-transform duration-500">
                <UploadCloud size={56} className="text-blue-500 opacity-60" />
            </div>
            <h2 className="text-4xl font-black mb-4 tracking-tighter text-white">분석할 이력서를 업로드하세요</h2>
            <p className="text-[#9FA0A8] max-w-md leading-relaxed mb-10 text-lg text-center">
                도영님의 이력서를 바탕으로 <span className="text-blue-400 font-bold">최적의 기술 스택</span>과<br />
                <span className="text-blue-400 font-bold">가장 적합한 기업</span>을 분석해 드립니다.
            </p>
            
            <div className="flex gap-4">
                <button 
                    onClick={(e) => { e.stopPropagation(); onMyPageClick(); }} 
                    className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all flex items-center gap-2"
                >
                    <User size={20} /> 마이페이지 불러오기
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); onUploadClick(); }}
                    className="px-8 py-4 bg-white text-black font-black rounded-2xl shadow-xl hover:bg-gray-100 transition-all active:scale-95 flex items-center gap-2"
                >
                    <Monitor size={20} /> 내 컴퓨터에서 찾기
                </button>
            </div>
            <p className="mt-6 text-xs text-white/20">지원 형식: PDF, DOC, DOCX (최대 10MB)</p>
        </motion.div>
    );
}