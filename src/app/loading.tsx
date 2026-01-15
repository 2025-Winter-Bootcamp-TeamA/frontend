'use client';

import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#1A1B1E]">
      <div className="flex flex-col items-center gap-5">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-12 w-12 rounded-full border-4 border-white/10 border-t-blue-500"
        />
        <div className="text-base md:text-lg font-bold text-white/70">
          로딩 중입니다...
        </div>
      </div>
    </div>
  );
}

