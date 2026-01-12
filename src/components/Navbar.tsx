'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    // 로그인 모달 상태는 나중에 구현할 때 사용할 예정
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); 
    const pathname = usePathname();

    const navItems = [
        { name: '홈 피드', href: '/' },
        { name: '트렌드 분석', href: '/trend' },
        { name: '채용 지도', href: '/map' },
        { name: 'AI 면접', href: '/ai-interview' },
    ];

    return (
        <nav className="bg-[#1A1B1E] sticky top-0 z-50 border-b border-white/5 w-full">
        <div className="flex justify-between items-center h-[70px] px-6"> 
            
            {/* 왼쪽 그룹: 로고와 데스크탑 메뉴 */}
            <div className="flex items-center gap-10"> 
            <Link href="/" className="flex items-center">
                <Image 
                src="/logo.png" 
                alt="DevRoad 로고" 
                width={34} 
                height={34} 
                className="object-contain"
                />
            </Link>

            {/* 데스크탑 메뉴 영역 */}
            <div className="hidden md:flex items-center gap-10">
                {navItems.map((item, index) => (
                <div key={item.name} className="flex items-center">
                    <Link
                    href={item.href}
                    className={`text-[18px] transition-all duration-300 ease-in-out hover:text-white py-1 ${
                        pathname === item.href 
                        ? 'text-white font-bold' 
                        : 'text-[#9FA0A8]'
                    }`}
                    >
                    {item.name}
                    </Link>
                    
                    {/* 구분선 설정 */}
                    {index === 2 && (
                    <span className="text-[#3a3b3e] ml-5 -mr-5 text-[16px] select-none">|</span>
                    )}
                </div>
                ))}
            </div>
            </div>

            {/* 오른쪽 영역: 로그인 및 모바일 버튼 */}
            <div className="flex items-center">
            <div className="hidden md:block">
                <button
                onClick={() => setIsLoginModalOpen(true)}
                className="text-[#9FA0A8] text-[18px] transition-colors duration-300 hover:text-white"
                >
                로그인
                </button>
            </div>

            {/* 모바일 햄버거 버튼 */}
            <div className="md:hidden">
                <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-[#9FA0A8] hover:text-white p-2"
                >
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                </svg>
                </button>
            </div>
            </div>
        </div>

        {/* [추가된 부분] 모바일 전용 메뉴 리스트: isOpen이 true일 때만 보임 */}
        <div className={`${isOpen ? 'block' : 'hidden'} md:hidden bg-[#1A1B1E] border-t border-white/5 px-6 pb-6`}>
            <div className="pt-4 space-y-4">
            {navItems.map((item) => (
                <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)} // 클릭 시 메뉴 닫기
                className={`block text-[18px] transition-colors duration-300 ease-in-out hover:text-white ${
                    pathname === item.href ? 'text-white font-bold' : 'text-[#9FA0A8]'
                }`}
                >
                {item.name}
                </Link>
            ))}
            {/* 모바일 전용 로그인 버튼 */}
            <button
                onClick={() => {
                setIsOpen(false);
                setIsLoginModalOpen(true);
                }}
                className="block w-full text-left text-[#9FA0A8] text-[18px] pt-4 border-t border-white/5 transition-colors duration-300 hover:text-white"
            >
                로그인
            </button>
            </div>
        </div>
        </nav>
    );
}