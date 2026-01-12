'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Hero() {
  // 크롬 웹스토어 또는 북마크 안내 링크 (현재는 플레이스홀더)
    const CHROME_EXTENSION_URL = "https://chrome.google.com/webstore"; 

    return (
        <section className="relative w-full h-[500px] flex flex-col items-center justify-center overflow-hidden bg-[#1A1B1E]">
        {/* 배경 그라데이션 효과 */}
        <div className="absolute inset-0 z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[80%] bg-blue-600/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[70%] bg-purple-600/10 blur-[100px] rounded-full" />
        </div>

        {/* 콘텐츠 영역 */}
        <div className="relative z-10 text-center px-6">
            <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white text-3xl md:text-5xl font-bold mb-6 leading-tight"
            >
            유행을 따라가다보면<br />
            자신만의 노하우가 생깁니다
            </motion.h1>
            
            <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-gray-400 text-lg md:text-xl mb-10"
            >
            이제 새 탭에서 커리어 성장이 시작됩니다.
            </motion.p>

            {/* Chrome에 추가 버튼 */}
            <motion.a
            href={CHROME_EXTENSION_URL}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="inline-flex items-center gap-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-blue-500/20 transition-all"
            >
            {/* 구글 로고 외부 링크 활용 */}
            <img 
                src="https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Chrome_icon_%28February_2022%29.svg" 
                alt="Chrome" 
                className="w-6 h-6" 
            />
            <span className="text-lg">Chrome에 추가</span>
            </motion.a>
        </div>
        </section>
    );
}