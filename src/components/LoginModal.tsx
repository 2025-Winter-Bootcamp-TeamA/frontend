'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { login, signup } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLoginMode) {
        await login(email, password);
        onClose();
        router.push('/');
      } else {
        if (password !== passwordConfirm) {
          setError('비밀번호가 일치하지 않습니다.');
          setIsLoading(false);
          return;
        }
        await signup(email, username, name, password, passwordConfirm);
        // 회원가입 후 자동 로그인
        await login(email, password);
        onClose();
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setUsername('');
    setName('');
    setPassword('');
    setPasswordConfirm('');
    setError('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 250 }}
            className="relative w-full max-w-[480px] bg-[#1A1B1E] rounded-[32px] shadow-2xl overflow-hidden flex flex-col items-center pt-16 pb-36 px-10 text-center"
          >
            <button onClick={onClose} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-3xl font-bold text-white mb-6">
              {isLoginMode ? '로그인' : '회원가입'}
            </h2>
            <p className="text-[#9FA0A8] text-[15px] leading-relaxed mb-10 whitespace-pre-wrap">
              {isLoginMode 
                ? '지금 로그인하고 맞춤 채용 콘텐츠로 하루를 시작하세요.'
                : '새 계정을 만들어 시작하세요.'}
            </p>

            <form onSubmit={handleSubmit} className="w-full space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {!isLoginMode && (
                <>
                  <input
                    type="text"
                    placeholder="아이디"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-[#2A2B2E] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="이름"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-[#2A2B2E] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </>
              )}

              <input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#2A2B2E] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 bg-[#2A2B2E] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {!isLoginMode && (
                <input
                  type="password"
                  placeholder="비밀번호 확인"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 bg-[#2A2B2E] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 text-white font-bold py-4 rounded-full hover:bg-blue-600 transition-all active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '처리 중...' : (isLoginMode ? '로그인' : '회원가입')}
              </button>
            </form>

            <button
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                resetForm();
              }}
              className="mt-4 text-blue-400 hover:text-blue-300 text-sm"
            >
              {isLoginMode ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
            </button>

            {/* ========== Google 로그인 버튼 (주석 처리) ========== */}
            {/* 
            const GOOGLE_LOGO_URL = "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg";
            <button
              onClick={startGoogleLogin}
              className="flex items-center justify-center gap-3 w-full bg-white text-gray-900 font-bold py-4 rounded-full hover:bg-gray-100 transition-all active:scale-95 shadow-lg"
            >
              <img src={GOOGLE_LOGO_URL} alt="Google" className="w-6 h-6" />
              <span className="text-lg">Google로 로그인</span>
            </button>
            */}

            <p className="mt-8 text-[12px] text-gray-500 leading-normal">
              로그인은 <span className="underline underline-offset-2 cursor-pointer">개인 정보 보호 정책</span> 및 
              <span className="underline underline-offset-2 cursor-pointer"> 서비스 약관</span>에 동의하는 것을 의미합니다.
            </p>

            {/* 하단 파도 부분 유지 */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
              <svg className="relative block w-full h-[120px]" viewBox="0 24 150 28" preserveAspectRatio="none">
                <defs>
                  <path id="wave-path" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
                </defs>
                <g>
                  <use href="#wave-path" x="48" y="0" fill="rgba(59, 130, 246, 0.2)" className="animate-wave-mid" />
                  <use href="#wave-path" x="48" y="3" fill="rgba(59, 130, 246, 0.4)" className="animate-wave-fast" />
                  <use href="#wave-path" x="48" y="5" fill="#3B82F6" className="animate-wave-slow" />
                </g>
              </svg>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
