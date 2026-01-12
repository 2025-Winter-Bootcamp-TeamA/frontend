'use client';

import { useRef } from 'react';

const TOP_5 = [
    { rank: 1, name: 'React', category: '웹/앱 프레임워크', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg' },
    { rank: 2, name: 'Angular', category: '웹 프레임워크', logo: 'https://angular.io/assets/images/logos/angular/angular.svg' },
    { rank: 3, name: 'Vue.js', category: '웹 프레임워크', logo: 'https://vuejs.org/images/logo.png' },
    { rank: 4, name: 'Spring', category: '백엔드 프레임워크', logo: 'https://spring.io/images/projects/spring-edf462fec682b9d74b53f6b70495876a.svg' },
    { rank: 5, name: 'Django', category: '웹 프레임워크', logo: 'https://static.djangoproject.com/img/logos/django-logo-negative.png' },
];

    const CATEGORIES = ['Front', 'Back', 'AI', 'Mobile', 'Data', 'DevOps', 'Security'];

export default function Top5Section() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const isDown = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    // 드래그 시작 핸들러
    const handleMouseDown = (e: React.MouseEvent) => {
        isDown.current = true;
        if (scrollRef.current) {
        scrollRef.current.classList.add('cursor-grabbing');
        startX.current = e.pageX - scrollRef.current.offsetLeft;
        scrollLeft.current = scrollRef.current.scrollLeft;
        }
    };

    // 드래그 중 핸들러
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDown.current || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX.current) * 2; // 드래그 속도 조절
        scrollRef.current.scrollLeft = scrollLeft.current - walk;
    };

    // 드래그 종료 핸들러
    const handleMouseUp = () => {
        isDown.current = false;
        scrollRef.current?.classList.remove('cursor-grabbing');
    };

    return (
        <div className="border border-[#9FA0A8]/30 rounded-[20px] p-8 sticky top-10 bg-[#1A1B1E] w-full min-h-[600px] shadow-xl">
        <div className="flex items-center gap-3 mb-8">
            <span className="text-2xl font-bold">🔥</span>
            <h3 className="text-white text-xl font-bold uppercase">요즘 뜨는 Top 5</h3>
        </div>

        {/* 카테고리 탭: 드래그 기능 적용 및 스크롤바 제거 */}
        <div 
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="flex gap-3 mb-10 overflow-x-auto no-scrollbar pb-2 cursor-grab select-none active:cursor-grabbing transition-all"
        >
            {CATEGORIES.map((tab) => (
            <span 
                key={tab} 
                className="px-5 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-400 cursor-pointer hover:text-white hover:border-white/30 transition-all shrink-0"
            >
                {tab}
            </span>
            ))}
        </div>

        <div className="flex flex-col gap-8">
            {TOP_5.map((item) => (
            <div key={item.rank} className="flex items-center gap-5 group cursor-pointer">
                <div className="w-14 h-14 bg-white rounded-xl overflow-hidden flex items-center justify-center p-3 shrink-0 group-hover:scale-110 transition-transform">
                <img src={item.logo} alt={item.name} className="object-contain" />
                </div>
                <div className="overflow-hidden">
                <p className="text-[#9FA0A8] text-xs uppercase mb-1 font-medium">{item.category}</p>
                <h4 className="text-white font-bold text-lg truncate">{item.name}</h4>
                </div>
            </div>
            ))}
        </div>
        </div>
    );
}