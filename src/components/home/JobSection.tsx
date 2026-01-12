'use client';

import { useRef, useState, useEffect } from 'react';
import JobCard from './JobCard';

const MOCK_JOBS = [
    { id: 1, company: 'Toss', position: 'Frontend Developer', logo: 'https://static.toss.im/png-icons/timeline/symbol-toss-blue.png', description: 'DevRoad에 로그인 후 이력서를 기입한 뒤, 매칭률을 확인해보세요!' },
    { id: 2, company: 'Toss', position: 'Frontend Developer', logo: 'https://static.toss.im/png-icons/timeline/symbol-toss-blue.png', description: 'DevRoad에 로그인 후 이력서를 기입한 뒤, 매칭률을 확인해보세요!' },
    { id: 3, company: 'Toss', position: 'Frontend Developer', logo: 'https://static.toss.im/png-icons/timeline/symbol-toss-blue.png', description: 'DevRoad에 로그인 후 이력서를 기입한 뒤, 매칭률을 확인해보세요!' },
    { id: 4, company: 'Toss', position: 'Frontend Developer', logo: 'https://static.toss.im/png-icons/timeline/symbol-toss-blue.png', description: 'DevRoad에 로그인 후 이력서를 기입한 뒤, 매칭률을 확인해보세요!' },
    { id: 5, company: 'Toss', position: 'Frontend Developer', logo: 'https://static.toss.im/png-icons/timeline/symbol-toss-blue.png', description: 'DevRoad에 로그인 후 이력서를 기입한 뒤, 매칭률을 확인해보세요!' },
    { id: 6, company: 'Toss', position: 'Frontend Developer', logo: 'https://static.toss.im/png-icons/timeline/symbol-toss-blue.png', description: 'DevRoad에 로그인 후 이력서를 기입한 뒤, 매칭률을 확인해보세요!' },
    ];

    export default function JobSection() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [scrollPosition, setScrollPosition] = useState<'start' | 'middle' | 'end'>('start');
    
    // 드래그 상태 관리용 Ref
    const isDown = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    // 스크롤 위치 감지 (양 끝 화살표 색상 변경용)
    const updateScrollStatus = () => {
        const el = scrollRef.current;
        if (!el) return;
        const { scrollLeft: sLeft, scrollWidth, clientWidth } = el;
        
        if (sLeft <= 15) setScrollPosition('start');
        else if (sLeft + clientWidth >= scrollWidth - 15) setScrollPosition('end');
        else setScrollPosition('middle');
    };

    // 마우스 드래그 이벤트 핸들러
    const handleMouseDown = (e: React.MouseEvent) => {
        isDown.current = true;
        if (scrollRef.current) {
        scrollRef.current.classList.add('cursor-grabbing');
        startX.current = e.pageX - scrollRef.current.offsetLeft;
        scrollLeft.current = scrollRef.current.scrollLeft;
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDown.current || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX.current) * 2; // 드래그 속도 조절
        scrollRef.current.scrollLeft = scrollLeft.current - walk;
    };

    const handleMouseUp = () => {
        isDown.current = false;
        scrollRef.current?.classList.remove('cursor-grabbing');
    };

    useEffect(() => {
        const el = scrollRef.current;
        if (el) {
        el.addEventListener('scroll', updateScrollStatus);
        updateScrollStatus();
        return () => el.removeEventListener('scroll', updateScrollStatus);
        }
    }, []);

return (
    <section className="w-full">
        {/* 1. 외곽선 색상을 #9FA0A8로 변경 */}
        <div className="border border-[#9FA0A8] rounded-[20px] p-8 relative overflow-hidden bg-transparent">
            <h3 className="text-white text-xl font-bold mb-8 ml-2">추천 채용 공고</h3>

            {/* 좌우 화살표 버튼 */}
            <button 
            onClick={() => scrollRef.current?.scrollBy({ left: -400, behavior: 'smooth' })}
            className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 transition-all ${
                scrollPosition === 'start' ? 'text-[#9FA0A8]' : 'text-white'
            }`}
            >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            </button>

            <button 
            onClick={() => scrollRef.current?.scrollBy({ left: 400, behavior: 'smooth' })}
            className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 transition-all ${
                scrollPosition === 'end' ? 'text-[#9FA0A8]' : 'text-white'
            }`}
            >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            </button>

            {/* 2. 스크롤바 제거 (no-scrollbar 클래스 사용) */}
            <div 
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="flex gap-2 overflow-x-auto scroll-smooth cursor-grab select-none no-scrollbar px-6 py-2"
            style={{ 
                msOverflowStyle: 'none', 
                scrollbarWidth: 'none',
            }}
            >
            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar {
                display: none;
                }
            `}</style>
            {MOCK_JOBS.map((job) => (
                <div key={job.id} className="min-w-[300px] flex-shrink-0">
                <JobCard {...job} />
                </div>
            ))}
            </div>
        </div>
        </section>
    );
}