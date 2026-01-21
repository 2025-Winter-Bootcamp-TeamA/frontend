"use client"; 

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import WithdrawalThanksModal from "@/components/home/WithdrawalThanksModal";
import Dashboard from "@/components/home/Dashboard";
import Onboarding from "@/components/home/OnBoarding";
// ✅ 인증 토큰 확인 함수 임포트
import { getAuthTokens } from "@/lib/auth";

export default function Home({
  searchParams,
}: {
  searchParams?: { withdrawal?: string };
}) {
  const showWithdrawalThanks = searchParams?.withdrawal === "ok";
  
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const { accessToken } = getAuthTokens();
    const hasVisited = localStorage.getItem("hasVisited");

    // ✅ 로그인 안 되어 있으면 무조건 온보딩 노출 (새로고침 시 계속)
    if (!accessToken) {
        setShowOnboarding(true);
    } else {
        // 로그인 상태라면 방문 기록에 따라 처리
        if (hasVisited) {
            setShowOnboarding(false);
        }
    }
    
    setIsInitialized(true); 
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem("hasVisited", "true");
    setShowOnboarding(false);
  };

  if (!isInitialized) return null;

  return (
    <>
      <AnimatePresence mode="wait">
        {showOnboarding ? (
          <Onboarding key="onboarding" onComplete={handleOnboardingComplete} />
        ) : (
          <motion.main
            key="dashboard"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-[#1A1B1E] overflow-y-auto lg:overflow-hidden pt-16 lg:fixed lg:inset-0 lg:pt-20"
          >
            <div className="w-full h-auto origin-top scale-100 lg:w-[125%] lg:h-[125%] lg:origin-top-left lg:scale-[0.8]">
              <div className="max-w-[2400px] mx-auto h-full px-4 pb-10 lg:px-12 lg:pt-6 lg:pb-20">
                 <Dashboard />
              </div>
            </div>

            <WithdrawalThanksModal isOpen={showWithdrawalThanks} />
          </motion.main>
        )}
      </AnimatePresence>
    </>
  );
}