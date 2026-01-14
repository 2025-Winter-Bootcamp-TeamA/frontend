'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import LoginModal from './LoginModal';
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false); // 모바일 메뉴 상태
    const { data: session } = useSession();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); 
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); // 로그아웃 모달 상태
    const pathname = usePathname();

    const navItems = [
        { name: '홈 피드', href: '/' },
        { name: '트렌드 분석', href: '/trend-analysis' },
        { name: '채용 지도', href: '/map' },
        { name: 'AI 면접', href: '/ai-interview' },
    ];

    // 로그아웃 확인 후 실행될 함수
    const handleLogout = () => {
        signOut({ callbackUrl: '/' });
    };

    return (
        <nav className="bg-[#1A1B1E] sticky top-0 z-50 border-b border-white/5 w-full">
            <div className="flex justify-between items-center h-[70px] px-6"> 
                
                {/* 로고 및 메인 메뉴 */}
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

                {/* 우측 액션 버튼 (로그인/로그아웃/프로필) */}
                <div className="flex items-center gap-4">
                    {session ? (
                        <div className="flex items-center gap-6">
                            {/* 데스크톱 로그아웃 버튼 */}
                            <button 
                                className="hidden md:block text-[#9FA0A8] hover:text-red-400 transition-colors duration-300 text-[16px] font-medium"
                                onClick={() => setIsLogoutModalOpen(true)}
                            >
                                로그아웃
                            </button>
                            <Link href="/mypage">
                                <div className="w-[40px] h-[40px] overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer shadow-lg"
                                     style={{ borderRadius: '10px' }}>
                                    <img
                                        src={session.user?.image || 'https://via.placeholder.com/40'}
                                        alt="프로필"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </Link>
                        </div>
                    ) : (
                        <button 
                            className="hidden md:block text-[#9FA0A8] hover:text-white transition-colors duration-300"
                            onClick={() => setIsLoginModalOpen(true)}
                        >
                            로그인
                        </button>
                    )}

                    {/* 모바일 햄버거 버튼 */}
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

            {/* 모바일 슬라이드 메뉴 */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden bg-[#1A1B1E] border-t border-white/5 px-6 pb-6"
                    >
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
                                    className="text-[#9FA0A8] hover:text-white"
                                >
                                    로그인
                                </button>
                            ) : (
                                <button 
                                    onClick={() => { setIsLogoutModalOpen(true); setIsOpen(false); }} 
                                    className="text-red-400 hover:text-red-300 transition-colors"
                                >
                                    로그아웃
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 로그인 모달 */}
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />

            {/* 로그아웃 확인 커스텀 모달 */}
            <AnimatePresence>
                {isLogoutModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        {/* 배경 오버레이 */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsLogoutModalOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        
                        {/* 모달 콘텐츠 */}
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative bg-[#1A1B1E] border border-white/10 p-8 rounded-[24px] text-center shadow-2xl max-w-sm w-full"
                        >
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                            </div>
                            <h3 className="text-white text-xl font-bold mb-2">로그아웃 하시겠습니까?</h3>
                            <p className="text-[#9FA0A8] text-sm mb-8 leading-relaxed">
                                로그아웃 하시면 나중에 다시 로그인하여<br/>트렌드 데이터를 확인할 수 있습니다.
                            </p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setIsLogoutModalOpen(false)}
                                    className="flex-1 px-6 py-3 rounded-xl bg-white/5 text-white font-semibold hover:bg-white/10 transition-all"
                                >
                                    취소
                                </button>
                                <button 
                                    onClick={handleLogout}
                                    className="flex-1 px-6 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                                >
                                    확인
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </nav>
    );
}