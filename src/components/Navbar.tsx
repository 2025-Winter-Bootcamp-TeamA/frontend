'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import LoginModal from './LoginModal';
import { getAuthTokens, clearAuthTokens } from '@/lib/auth';
import api from '@/lib/api'; 

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); 
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    // ✅ 로그인 체크 및 이미지 로드 (프론트엔드 전용 로직)
    useEffect(() => {
        const checkAuth = async () => {
            const { accessToken } = getAuthTokens();
            
            if (accessToken) {
                setIsLoggedIn(true);
                
                // 1. LocalStorage에서 저장된 구글 이미지 먼저 확인
                const savedImage = localStorage.getItem('user_profile_image');
                if (savedImage) {
                    setProfileImage(savedImage);
                } 

                // 2. 최신 정보를 위해 API 호출 (이름 기반 생성 로직은 삭제하고 순수 구글 이미지만 사용)
                try {
                    const response = await api.get('/auth/me/');
                    const userData = response.data;
                    
                    // 백엔드(구글 로그인)에서 받은 이미지가 있다면 덮어쓰기
                    if (userData.profile_image) {
                        setProfileImage(userData.profile_image);
                        localStorage.setItem('user_profile_image', userData.profile_image);
                    }
                    // 임의 아바타 생성 로직(ui-avatars) 삭제함: 구글 이미지가 없으면 기본값 유지
                } catch (error) {
                    console.error("정보 로딩 실패", error);
                }
            } else {
                setIsLoggedIn(false);
                setProfileImage(null);
            }
        };

        checkAuth();
    }, []);

    const navItems = [
        { name: '대시보드', href: '/' },
        { name: '채용 지도', href: '/map' },
        { name: 'AI 면접', href: '/ai-interview' },
    ];

    const handleLogout = () => {
        clearAuthTokens();
        // ✅ 로그아웃 시 저장된 이미지도 삭제
        localStorage.removeItem('user_profile_image');
        
        setIsLoggedIn(false);
        setProfileImage(null);
        setIsLogoutModalOpen(false);
        router.push('/');
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
                                        pathname === item.href 
                                            ? 'text-white font-bold' 
                                            : 'text-[#9FA0A8]'
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

                {/* 우측 액션 버튼 */}
                <div className="flex items-center gap-4">
                    {isLoggedIn ? (
                        <div className="flex items-center gap-6">
                            <button 
                                className="hidden md:block text-[#9FA0A8] hover:text-red-400 transition-colors duration-300 text-[16px] font-medium"
                                onClick={() => setIsLogoutModalOpen(true)}
                            >
                                로그아웃
                            </button>
                            <Link href="/mypage">
                                <div className="w-[40px] h-[40px] overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer shadow-lg bg-gray-700 flex items-center justify-center"
                                     style={{ borderRadius: '10px' }}>
                                    {/* ✅ 이미지 태그 */}
                                    {profileImage ? (
                                        <img
                                            src={profileImage}
                                            alt="프로필"
                                            className="w-full h-full object-cover"
                                            referrerPolicy="no-referrer"
                                            onError={(e) => {
                                                // 이미지 로드 실패 시 기본 아바타로 대체
                                                const target = e.target as HTMLImageElement;
                                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent('User')}&background=3b82f6&color=fff&size=40&bold=true`;
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white font-bold text-sm">
                                            U
                                        </div>
                                    )}
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

            {/* 모바일 메뉴 (생략 없이 포함) */}
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
                            {!isLoggedIn ? (
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

            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />

            <AnimatePresence>
                {isLogoutModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsLogoutModalOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
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