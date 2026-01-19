"use client"; // useState, useEffect 사용을 위해 필수

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import JobSection from "@/components/home/JobSection";
import WithdrawalThanksModal from "@/components/home/WithdrawalThanksModal";
import Dashboard from "@/components/home/Dashboard";
import Onboarding from "@/components/home/OnBoarding"; // ✅ 새로 만든 컴포넌트 import

export default function Home({
  searchParams,
}: {
  searchParams?: { withdrawal?: string };
}) {
  const showWithdrawalThanks = searchParams?.withdrawal === "ok";
  
  // ✅ 온보딩 상태 관리
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // ✅ 첫 방문 여부 체크 (Client Side에서만 실행)
  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited");
    if (hasVisited) {
      setShowOnboarding(false);
    }
    setIsInitialized(true); // 로딩 완료
  }, []);

  // ✅ 온보딩 완료 핸들러
  const handleOnboardingComplete = () => {
    localStorage.setItem("hasVisited", "true"); // 방문 기록 저장
    setShowOnboarding(false);
  };

  // 초기화 전에는 깜빡임 방지를 위해 아무것도 보여주지 않거나 로딩 스피너
  if (!isInitialized) return null;

  return (
    <>
      <AnimatePresence mode="wait">
        {/* 1. 온보딩 화면 */}
        {showOnboarding ? (
          <Onboarding key="onboarding" onComplete={handleOnboardingComplete} />
        ) : (
          /* 2. 메인 대시보드 화면 (기존 코드) */
          <motion.main
            key="dashboard"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-[#1A1B1E] overflow-y-auto lg:overflow-hidden pt-16 lg:fixed lg:inset-0 lg:pt-20"
          >
            {/* 기존 80% 축소 및 반응형 래퍼 */}
            <div className="w-full h-auto origin-top scale-100 lg:w-[125%] lg:h-[125%] lg:origin-top-left lg:scale-[0.8]">
              
              <div className="max-w-[2400px] mx-auto h-full px-4 pb-10 lg:px-12 lg:pt-6 lg:pb-20">
                
                {/* 기존 그리드 (75:25) */}
                <div className="grid grid-cols-1 gap-6 h-full lg:grid-cols-12">
                  
                  {/* 대시보드 */}
                  <div className="h-[600px] lg:col-span-9 lg:h-full lg:min-h-0">
                    <Dashboard/>
                  </div>

                  {/* 채용 공고 */}
                  <aside className="h-[600px] lg:col-span-3 lg:h-full lg:min-h-0">
                     <JobSection />
                  </aside>

                </div>
              </div>
            </div>

            <WithdrawalThanksModal isOpen={showWithdrawalThanks} />
          </motion.main>
        )}
      </AnimatePresence>
    </>
  );
}