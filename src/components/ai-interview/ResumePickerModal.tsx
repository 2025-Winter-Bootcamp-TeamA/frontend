'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Resume } from '@/types';

interface ResumePickerModalProps {
    open: boolean;
    resumes: Resume[];
    isLoading?: boolean;
    onClose: () => void;
    onSelect: (r: Resume) => void;
}

export default function ResumePickerModal({ open, resumes, isLoading = false, onClose, onSelect }: ResumePickerModalProps) {
    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    {/* 백그라운드 오버레이 */}
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        onClick={onClose} 
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
                    />
                    
                    {/* 모달 컨텐츠 */}
                    <motion.div 
                        initial={{ scale: 0.96, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        exit={{ scale: 0.96, opacity: 0 }}
                        className="relative w-[min(500px,92vw)] rounded-[24px] border border-white/10 bg-[#1A1B1E] p-6 shadow-2xl"
                    >
                        <div className="text-lg font-bold text-white mb-4">마이페이지 이력서 선택</div>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                            {isLoading ? (
                                <div className="text-center text-gray-500 py-8">
                                    이력서 목록을 불러오는 중...
                                </div>
                            ) : resumes.length > 0 ? (
                                resumes.map((r) => (
                                    <button 
                                        key={r.id} 
                                        onClick={() => onSelect(r)} 
                                        className="w-full rounded-2xl border border-white/10 bg-[#25262B] p-4 text-left transition-all hover:border-white/30 hover:bg-[#2C2D33] active:scale-[0.99]"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="min-w-0">
                                                <div className="truncate text-sm font-semibold text-white">{r.title}</div>
                                                <div className="mt-1 text-xs text-[#9FA0A8]">
                                                    등록일: {r.createdAt}
                                                </div>
                                            </div>
                                            <span className="shrink-0 rounded-full bg-blue-600 px-3 py-1 text-[11px] font-bold text-white">선택</span>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="text-center text-gray-500 py-8">
                                    등록된 이력서가 없습니다.
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}