'use client';

import { motion } from 'framer-motion';
import { FileUp, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/authStore'; // ✅ authStore 임포트

export function EmptyState() {
  return (
    <motion.div 
      key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="w-full h-[600px] border-2 border-dashed border-white/5 rounded-[32px] flex flex-col items-center justify-center text-white/20"
    >
      <div className="p-6 bg-white/5 rounded-full mb-4">
        <FileUp size={48} />
      </div>
      <p className="text-lg font-medium">이력서를 등록하면 AI 분석 대시보드가 활성화됩니다.</p>
    </motion.div>
  );
}

export function AnalyzingState() {
  // ✅ 로그인한 사용자 정보 가져오기
  const { user } = useAuthStore();
  const displayName = user?.name || '사용자';

  return (
    <motion.div 
      key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="w-full h-[600px] bg-white/5 rounded-[32px] flex flex-col items-center justify-center border border-white/10 overflow-hidden"
    >
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="mb-8">
        <Sparkles size={80} className="text-blue-500 opacity-50" />
      </motion.div>
      {/* {displayName}으로 변경 */}
      <h2 className="text-2xl font-bold mb-4 tracking-tighter">AI가 {displayName}님의 역량을 정밀 분석 중입니다...</h2>
      <div className="w-64 h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 3 }} className="h-full bg-blue-600" />
      </div>
    </motion.div>
  );
}