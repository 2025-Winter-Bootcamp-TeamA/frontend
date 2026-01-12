'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TREND_DATA = [
    { id: 1, title: '2026년, 미래는 얼마나 가까이 있을까', date: '2026.01.07', desc: '안녕하세요, 에디터 요니입니다. 새해의 감흥이 떨어지지 않도록...', img: '/trend1.jpg' },
    { id: 2, title: 'AI가 바꾸는 개발 환경의 미래', date: '2026.01.08', desc: '최근 AI 기술의 발전으로 개발자들의 업무 방식이...', img: '/trend2.jpg' },
    { id: 3, title: 'Next.js 15, 무엇이 달라졌나', date: '2026.01.09', desc: 'Next.js의 새로운 업데이트 소식을 전해드립니다...', img: '/trend3.jpg' },
    { id: 4, title: '웹 성능 최적화의 모든 것', date: '2026.01.10', desc: '더 빠른 웹사이트를 위한 렌더링 전략...', img: '/trend4.jpg' },
    { id: 5, title: 'Tailwind CSS 활용 꿀팁', date: '2026.01.11', desc: '효율적인 스타일링을 위한 실무 가이드...', img: '/trend5.jpg' },
    { id: 6, title: '커리어 성장을 위한 로드맵', date: '2026.01.12', desc: '주니어 개발자에서 시니어로 가는 길...', img: '/trend6.jpg' },
];

export default function TrendSection() {
    const [page, setPage] = useState(0);
    const totalPages = Math.ceil(TREND_DATA.length / 3);

    // 무한 루프 내비게이션 로직
    const handleNext = () => setPage((prev) => (prev + 1) % totalPages);
    const handlePrev = () => setPage((prev) => (prev - 1 + totalPages) % totalPages);

    return (
        <section className="w-full">
        <h3 className="text-white text-xl font-bold mb-8">위클리 트렌드 리포트</h3>
        
        <div className="relative overflow-hidden w-full min-h-[480px]">
            <AnimatePresence mode="wait">
            <motion.div
                key={page}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }} // 슉슉 부드럽게 넘어가는 효과
                className="flex flex-col gap-4 w-full"
            >
                {TREND_DATA.slice(page * 3, (page + 1) * 3).map((item) => (
                <div key={item.id} className="flex justify-between items-center bg-[#25262B] p-5 rounded-[20px] border border-[#9FA0A8]/30 hover:border-[#9FA0A8] transition-all cursor-pointer group w-full">
                    <div className="flex-1 pr-4 min-w-0">
                    <span className="text-[#9FA0A8] text-[11px]">이스트 | {item.date}</span>
                    <h4 className="text-white text-lg font-bold mt-1 mb-2 truncate">{item.title}</h4>
                    <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">{item.desc}</p>
                    </div>
                    <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-[#1A1B1E]">
                    <img src={item.img} alt="Trend" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                </div>
                ))}
            </motion.div>
            </AnimatePresence>
        </div>

        {/* 하단 화살표 (제자리 돌아오는 무한 루프) */}
        <div className="flex justify-center gap-4 mt-8">
            <button 
            onClick={handlePrev}
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/5 transition-all"
            >
            &lt;
            </button>
            <button 
            onClick={handleNext}
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/5 transition-all"
            >
            &gt;
            </button>
        </div>
        </section>
    );
}