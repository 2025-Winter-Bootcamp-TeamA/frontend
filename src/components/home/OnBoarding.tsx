"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, TrendingUp, Map, FileSearch } from "lucide-react"; // ArrowLeft 추가

interface OnboardingProps {
  onComplete: () => void;
}

const STEPS = [
  {
    id: 1,
    title: "기술 스택 트렌드 분석 및 비교",
    desc: "최신 개발 트렌드와 기술 스택의 성장세를\n데이터로 분석하고 꼼꼼하게 비교해보세요.",
    icon: <TrendingUp className="w-12 h-12 text-blue-400" />,
  },
  {
    id: 2,
    title: "맞춤형 채용 지도",
    desc: "내가 관심 있는 기술 스택을 사용하는\n기업들의 위치와 채용 공고를 지도에서 확인하세요.",
    icon: <Map className="w-12 h-12 text-purple-400" />,
  },
  {
    id: 3,
    title: "AI 이력서 분석",
    desc: "내 이력서를 등록하여 기업 요구사항과의\n매칭률을 분석하고 부족한 점을 진단받으세요.",
    icon: <FileSearch className="w-12 h-12 text-yellow-400" />,
  },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // ✅ 다음 단계 로직
  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  // ✅ [추가됨] 이전 단계 로직
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1B1E] text-white"
    >
      <div className="w-full max-w-md px-6 text-center">
        {/* 아이콘 및 텍스트 슬라이드 */}
        <div className="mb-12 h-[240px] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col items-center"
            >
              <div className="w-24 h-24 bg-gray-800 rounded-3xl flex items-center justify-center mb-8 shadow-2xl border border-gray-700">
                {STEPS[currentStep].icon}
              </div>
              <h2 className="text-3xl font-bold mb-4 whitespace-pre-wrap">
                {STEPS[currentStep].title}
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed whitespace-pre-wrap">
                {STEPS[currentStep].desc}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 하단 컨트롤 */}
        <div className="flex flex-col items-center gap-8">
          {/* 인디케이터 */}
          <div className="flex gap-2">
            {STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep ? "w-8 bg-blue-500" : "w-2 bg-gray-700"
                }`}
              />
            ))}
          </div>

          {/* ✅ 버튼 그룹 (이전 / 다음) */}
          <div className="w-full flex gap-3">
            {/* 첫 번째 단계가 아닐 때만 '이전' 버튼 표시 */}
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-6 py-4 bg-gray-800 text-gray-300 rounded-xl font-bold text-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}

            {/* 다음 / 시작하기 버튼 (남은 공간 꽉 채움 flex-1) */}
            <button
              onClick={handleNext}
              className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
            >
              {currentStep === STEPS.length - 1 ? "시작하기" : "다음"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          
          {/* 건너뛰기 버튼 */}
          {currentStep < STEPS.length - 1 && (
             <button onClick={onComplete} className="text-gray-500 text-sm hover:text-white transition-colors">
                건너뛰기
             </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}