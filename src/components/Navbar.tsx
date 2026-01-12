'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import LoginModal from './LoginModal';
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { data: session } = useSession();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); 
    const pathname = usePathname();

    // 마이페이지를 메뉴 리스트에서 제거
    const navItems = [
        { name: '홈 피드', href: '/' },
        { name: '트렌드 분석', href: '/trend' },
        { name: '채용 지도', href: '/map' },
        { name: 'AI 면접', href: '/ai-interview' },
    ];

    return (
        <nav className="bg-[#1A1B1E] sticky top-0 z-50 border-b border-white/5 w-full">
            <div className="flex justify-between items-center h-[70px] px-6"> 
                
                <div className="flex items-center gap-10"> 
                    <Link href="/" className="flex items-center">
                        <Image src="/logo.png" alt="DevRoad 로고" width={34} height={34} className="object-contain" />
                    </Link>

                    <div className="hidden md:flex items-center gap-10">
                        {navItems.map((item, index) => (
                            <div key={item.name} className="flex items-center">
                                <Link
                                    href={item.href}
                                    className={`text-[18px] transition-all duration-300 hover:text-white py-1 ${
                                        pathname === item.href ? 'text-white font-bold' : 'text-[#9FA0A8]'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                                {index === 2 && (
                                    <span className="text-[#3a3b3e] ml-5 -mr-5 text-[16px] select-none">|</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {session ? (
                        <Link href="/mypage">
                            <div className="w-[40px] h-[40px] overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer"
                                 style={{ borderRadius: '10px' }}>
                                <img
                                    src={session.user?.image || 'https://via.placeholder.com/40'}
                                    alt="프로필"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </Link>
                    ) : (
                        <button 
                            className="hidden md:block text-[#9FA0A8] hover:text-white transition-colors duration-300"
                            onClick={() => setIsLoginModalOpen(true)}
                        >
                            로그인
                        </button>
                    )}

                    <div className="md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-[#9FA0A8] hover:text-white p-2">
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

            {/* 모바일 메뉴 */}
            <div className={`${isOpen ? 'block' : 'hidden'} md:hidden bg-[#1A1B1E] border-t border-white/5 px-6 pb-6`}>
                <div className="pt-4 space-y-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`block text-[18px] transition-colors duration-300 hover:text-white ${
                                pathname === item.href ? 'text-white font-bold' : 'text-[#9FA0A8]'
                            }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <hr className="border-white/5 my-2" />
                    {!session ? (
                        <button 
                            onClick={() => { setIsLoginModalOpen(true); setIsOpen(false); }} 
                            className="text-[#9FA0A8] hover:text-white transition-colors duration-300"
                        >
                            로그인
                        </button>
                    ) : (
                        <button onClick={() => signOut()} className="text-[#9FA0A8] hover:text-white transition-colors duration-300">
                            로그아웃
                        </button>
                    )}
                </div>
            </div>

            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        </nav>
    );
}