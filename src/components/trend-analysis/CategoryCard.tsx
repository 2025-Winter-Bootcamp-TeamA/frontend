'use client';

import Link from 'next/link';

interface CategoryCardProps {
    id: string;
    name: string;
    color: string;
    }

export default function CategoryCard({ id, name, color }: CategoryCardProps) {
    return (
        <div className="flex flex-col items-center group">
            {/* 노드 그래픽 구역: 나중에 D3.js 미니 버전으로 교체 가능 */}
            <div className="relative w-56 h-56 flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* 디자인 초안 느낌의 연결선과 원들 */}
                <line x1="50" y1="50" x2="20" y2="30" stroke={color} strokeWidth="1.5" className="opacity-40" />
                <line x1="50" y1="50" x2="80" y2="40" stroke={color} strokeWidth="1.5" className="opacity-40" />
                <line x1="50" y1="50" x2="45" y2="85" stroke={color} strokeWidth="1.5" className="opacity-40" />
                <circle cx="50" cy="50" r="14" fill={color} className="shadow-lg" />
                <circle cx="20" cy="30" r="9" fill={color} className="opacity-80" />
                <circle cx="80" cy="40" r="7" fill={color} className="opacity-60" />
                <circle cx="45" cy="85" r="6" fill={color} className="opacity-50" />
                
                {/* 호버 시 퍼지는 효과 */}
                <circle cx="50" cy="50" r="18" fill="transparent" stroke={color} strokeWidth="1" className="opacity-0 group-hover:opacity-40 animate-ping" />
                </svg>
            </div>

            {/* 버튼 스타일 UI */}
            <Link 
                href={`/trend-analysis/${id}`}
                className="px-8 py-2.5 rounded-full border text-sm font-bold transition-all hover:bg-white/5"
                style={{ borderColor: `${color}66`, color: color }}
            >
                {name} &gt;
            </Link>
        </div>
    );
}