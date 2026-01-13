'use client';

import { useRef, useState, useEffect } from 'react';
import JobCard from './JobCard';

const MOCK_JOBS = [
    { 
        id: 1, 
        company: '네이버', 
        position: 'Backend Developer (Search)', 
        logo: 'https://upload.wikimedia.org/wikipedia/commons/2/22/Naver_Logotype.svg', 
        description: '수억 건의 데이터를 처리하는 검색 엔진의 백엔드 시스템을 설계하고 최적화합니다.' 
    },
    { 
        id: 2, 
        company: '카카오', 
        position: 'Frontend Developer (Wallet)', 
        logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Kakao_logo.svg', 
        description: '사용자의 일상을 바꾸는 카카오톡 내 자산 관리 및 결제 서비스의 UI를 개발합니다.' 
    },
    { 
        id: 3, 
        company: '라인', 
        position: 'iOS Developer', 
        logo: 'https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg', 
        description: '전 세계 2억 명 이상의 유저가 사용하는 글로벌 메신저 LINE의 모바일 앱을 고도화합니다.' 
    },
    { 
        id: 4, 
        company: '쿠팡', 
        position: 'Data Engineer (Logistics)', 
        logo: 'https://upload.wikimedia.org/wikipedia/commons/0/06/Coupang_logo.svg', 
        description: '로켓배송을 가능케 하는 물류 최적화 알고리즘을 위한 대규모 데이터 파이프라인을 구축합니다.' 
    },
    { 
        id: 5, 
        company: '업스테이지', 
        position: 'AI Software Engineer', 
        logo: 'https://raw.githubusercontent.com/UpstageAI/upstage-ai.github.io/master/static/img/logo.png', 
        description: '최신 LLM 기술을 활용하여 기업용 AI 솔루션의 성능을 높이고 시스템을 개발합니다.' 
    },
    { 
        id: 6, 
        company: '배달의 민족', 
        position: 'DevOps Engineer', 
        logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Woowa_Brothers_logo.svg', 
        description: '수천만 건의 주문을 처리하는 배달의민족 서비스의 안정적인 인프라를 운영하고 자동화합니다.' 
    }
];

export default function JobSection() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [scrollPosition, setScrollPosition] = useState<'start' | 'middle' | 'end'>('start');
    
    const isDown = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    const updateScrollStatus = () => {
        const el = scrollRef.current;
        if (!el) return;
        const { scrollLeft: sLeft, scrollWidth, clientWidth } = el;
        if (sLeft <= 10) setScrollPosition('start');
        else if (sLeft + clientWidth >= scrollWidth - 10) setScrollPosition('end');
        else setScrollPosition('middle');
    };

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
        const walk = (x - startX.current) * 2;
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
            <div className="border border-[#9FA0A8]/30 rounded-[20px] p-8 bg-transparent">
                <h3 className="text-white text-xl font-bold mb-8 ml-2">추천 채용 공고</h3>

                {/* relative 컨테이너: 이 안에서 화살표가 카드 높이의 중앙(top-1/2)에 위치하게 됩니다 */}
                <div className="relative">
                    
                    {/* 좌측 화살표 */}
                    <button 
                        onClick={() => scrollRef.current?.scrollBy({ left: -400, behavior: 'smooth' })}
                        className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 transition-all hover:scale-110 active:scale-95 ${
                            scrollPosition === 'start' ? 'text-[#9FA0A8]' : 'text-white'
                        }`}
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* 우측 화살표 (누락되었던 SVG 추가) */}
                    <button 
                        onClick={() => scrollRef.current?.scrollBy({ left: 400, behavior: 'smooth' })}
                        className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 transition-all hover:scale-110 active:scale-95 ${
                            scrollPosition === 'end' ? 'text-[#9FA0A8]' : 'text-white'
                        }`}
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* 카드 슬라이드 구역 */}
                    <div 
                        ref={scrollRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        className="flex gap-2 overflow-x-auto scroll-smooth cursor-grab select-none no-scrollbar px-16 py-2"
                    >
                        {MOCK_JOBS.map((job) => (
                            <div key={job.id} className="min-w-[300px] flex-shrink-0">
                                <JobCard {...job} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}