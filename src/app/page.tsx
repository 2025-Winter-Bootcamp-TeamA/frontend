"use client"; 

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import JobSection from "@/components/home/JobSection";
import WithdrawalThanksModal from "@/components/home/WithdrawalThanksModal";
import Dashboard from "@/components/home/Dashboard";
import Onboarding from "@/components/home/OnBoarding";

export default function Home({
  searchParams,
}: {
  searchParams?: { withdrawal?: string };
}) {
  const showWithdrawalThanks = searchParams?.withdrawal === "ok";
  
  // 온보딩 상태 관리
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // 첫 방문 여부 체크
  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited");
    if (hasVisited) {
      setShowOnboarding(false);
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
                <div className="grid grid-cols-1 gap-6 h-full lg:grid-cols-12">
                  
                  {/* 대시보드 영역 (검색 로직은 이 안에 포함됨) */}
                  <div className="h-[600px] lg:col-span-9 lg:h-full lg:min-h-0">
                    <Dashboard/>
                  </div>

                  {/* 채용 공고 영역 */}
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