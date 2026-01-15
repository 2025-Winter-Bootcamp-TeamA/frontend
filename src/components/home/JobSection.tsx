'use client';

import { useRef, useState, useEffect } from 'react';
import JobCard from './JobCard';

// 추천 채용 공고 Mock 데이터
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
    
    // 드래그 슬라이드 로직을 위한 Ref
    const isDown = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    // 스크롤 위치에 따른 화살표 상태 업데이트
    const updateScrollStatus = () => {
        const el = scrollRef.current;
        if (!el) return;
        const { scrollLeft: sLeft, scrollWidth, clientWidth } = el;
        
        if (sLeft <= 10) setScrollPosition('start');
        else if (sLeft + clientWidth >= scrollWidth - 10) setScrollPosition('end');
        else setScrollPosition('middle');
    };

    // 마우스 드래그 핸들러
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

    const getScrollStep = () => {
        const el = scrollRef.current;
        if (!el) return 336; // 320(카드) + 16(gap-4) fallback

        const firstChild = el.firstElementChild as HTMLElement | null;
        const cardWidth = firstChild?.offsetWidth ?? 320;

        // flex gap은 브라우저에서 gap/columnGap로 노출될 수 있음
        const styles = window.getComputedStyle(el);
        const gapRaw = styles.columnGap || styles.gap || '16px';
        const gap = Number.parseFloat(gapRaw) || 16;

        return cardWidth + gap;
    };

    const scrollByOneCard = (direction: -1 | 1) => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollBy({ left: direction * getScrollStep(), behavior: 'smooth' });
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

                {/* 화살표를 위한 좌우 여백(px-12)이 확보된 컨테이너 */}
                <div className="relative px-12">
                    
                    {/* 좌측 화살표 */}
                    <button 
                        onClick={() => scrollRef.current?.scrollBy({ left: -450, behavior: 'smooth' })}
                        className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 transition-all hover:scale-110 active:scale-95 ${
                            scrollPosition === 'start' ? 'text-[#9FA0A8] opacity-30 cursor-default' : 'text-white opacity-100 hover:text-blue-400'
                        }`}
                        disabled={scrollPosition === 'start'}
                    >
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* 우측 화살표 */}
                    <button 
                        onClick={() => scrollRef.current?.scrollBy({ left: 450, behavior: 'smooth' })}
                        className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 transition-all hover:scale-110 active:scale-95 ${
                            scrollPosition === 'end' ? 'text-[#9FA0A8] opacity-30 cursor-default' : 'text-white opacity-100 hover:text-blue-400'
                        }`}
                        disabled={scrollPosition === 'end'}
                    >
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* 슬라이드 영역 (화살표 바깥쪽에 위치) */}
                    <div 
                        ref={scrollRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        className="flex gap-4 overflow-x-auto scroll-smooth cursor-grab select-none no-scrollbar py-2 snap-x snap-mandatory scroll-px-[calc(50%-160px)]"
                    >
                        {MOCK_JOBS.map((job) => (
                            <div key={job.id} className="w-[320px] flex-shrink-0 snap-center">
                                <JobCard {...job} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}