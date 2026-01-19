"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, TrendingUp, Map, FileSearch } from "lucide-react";

interface OnboardingProps {
  onComplete: () => void;
}

const STEPS = [
  {
    id: 1,
    title: "IT 트렌드, 데이터로 한눈에",
    desc: "최신 기술 스택의 성장세와 기업 선호도를\n직관적인 그래프로 비교 분석하세요.",
    image: "", 
    icon: <TrendingUp className="w-24 h-24 text-white drop-shadow-2xl" />,
    color: "from-blue-600 to-cyan-400",
    shadow: "shadow-blue-500/40",
  },
  {
    id: 2,
    title: "내 주변 채용 공고 지도",
    desc: "관심 있는 기술 스택을 사용하는 기업의\n위치와 채용 정보를 지도 위에서 탐색하세요.",
    image: "", 
    icon: <Map className="w-24 h-24 text-white drop-shadow-2xl" />,
    color: "from-purple-600 to-pink-400",
    shadow: "shadow-purple-500/40",
  },
  {
    id: 3,
    title: "AI 맞춤형 이력서 진단",
    desc: "내 이력서와 기업 요구사항의 매칭률을 분석하고,\n합격 가능성을 높이는 피드백을 받아보세요.",
    // ✅ 이미지가 public 폴더에 있는지 확인해주세요.
    image: "/onboarding3.png", 
    icon: <FileSearch className="w-24 h-24 text-white drop-shadow-2xl" />,
    color: "from-orange-500 to-yellow-400",
    shadow: "shadow-orange-500/40",
  },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      if (onComplete) onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0F1012] text-white overflow-hidden relative flex flex-col items-center justify-center perspective-[2000px]">
      
      {/* 배경 그라데이션 */}
      <motion.div
        animate={{
          background: `radial-gradient(circle at 30% 50%, ${
            currentStep === 0 ? "#1d4ed8" : currentStep === 1 ? "#7e22ce" : "#c2410c"
          } 0%, transparent 60%)`,
        }}
        className="absolute inset-0 opacity-20 blur-[120px] transition-colors duration-1000 pointer-events-none"
      />

      <div className="w-full max-w-[1600px] relative z-10 flex flex-col lg:flex-row items-center justify-center p-6 lg:p-12 gap-10">
        
        {/* [왼쪽: 그래픽 영역] */}
        <div className="relative w-full lg:w-1/2 h-[400px] lg:h-[600px] flex items-center justify-center perspective-[2000px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, rotateY: 20, rotateX: 10, y: 50, scale: 0.9 }}
              animate={{ 
                opacity: 1, 
                rotateY: 15, 
                rotateX: 5,
                y: [0, -15, 0], 
                scale: 1 
              }}
              exit={{ opacity: 0, rotateY: -20, rotateX: -10, y: 50, scale: 0.9 }}
              transition={{ 
                opacity: { duration: 0.5 },
                scale: { duration: 0.5 },
                rotateY: { duration: 0.8, ease: "easeOut" },
                y: { repeat: Infinity, duration: 6, ease: "easeInOut" } 
              }}
              // ✅ 이미지가 깨져도 영역이 보이도록 배경색을 조금 밝게 설정 (bg-[#1A1B1E] -> bg-gray-800)
              className={`w-full max-w-[600px] aspect-square rounded-[48px] overflow-hidden shadow-2xl ${STEPS[currentStep].shadow} bg-gray-800 border border-white/10 relative group`}
            >
                {STEPS[currentStep].image ? (
                    // ✅ 이미지 모드 (Step 3)
                    <div className="relative w-full h-full flex items-center justify-center bg-black">
                        <img 
                            src={STEPS[currentStep].image} 
                            alt={STEPS[currentStep].title} 
                            // ✅ object-contain으로 변경하여 이미지가 잘리지 않고 전체가 보이도록 함
                            className="w-full h-full object-contain" 
                        />
                        {/* 이미지 로딩 실패 시 텍스트 표시 (디버깅용) */}
                        <div className="absolute inset-0 flex items-center justify-center -z-10 text-gray-500 text-sm">
                            이미지를 불러오는 중...<br/>
                            (public 폴더를 확인하세요)
                        </div>
                    </div>
                ) : (
                    // ✅ 아이콘 모드 (Step 1, 2)
                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#1A1B1E]">
                        <div className={`absolute inset-0 bg-gradient-to-br ${STEPS[currentStep].color} opacity-20 blur-[80px] group-hover:opacity-30 transition-opacity duration-700`} />
                        
                        <div className="relative z-10 flex flex-col items-center gap-8">
                            <div className={`
                                w-48 h-48 rounded-[40px] 
                                bg-gradient-to-br ${STEPS[currentStep].color} 
                                flex items-center justify-center 
                                shadow-[0_20px_50px_rgba(0,0,0,0.5)] 
                                border border-white/20 
                                backdrop-blur-md
                                transform group-hover:scale-110 transition-transform duration-500
                            `}>
                                {STEPS[currentStep].icon}
                            </div>
                            <div className="text-center space-y-2">
                                <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md shadow-lg">
                                    <span className="text-sm font-semibold text-white/90">Preview Feature</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* [오른쪽: 텍스트 영역] */}
        <div className="relative w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left z-20">
          <div className="bg-[#1A1B1E]/80 backdrop-blur-xl border border-white/10 p-8 lg:p-12 rounded-[32px] shadow-2xl w-full max-w-lg">
            
            <div className="flex justify-center lg:justify-start mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5">
                <span className="text-xs font-bold text-white">Step {currentStep + 1}</span>
                <span className="text-xs text-gray-500">/</span>
                <span className="text-xs text-gray-500">{STEPS.length}</span>
                </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="mb-8 min-h-[120px]"
              >
                <h1 className="text-3xl lg:text-4xl font-black mb-4 leading-tight whitespace-pre-wrap text-white">
                  {STEPS[currentStep].title}
                </h1>
                <p className="text-base lg:text-lg text-gray-400 leading-relaxed whitespace-pre-wrap">
                  {STEPS[currentStep].desc}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="w-full h-1.5 bg-gray-700/30 rounded-full mb-8 overflow-hidden">
              <motion.div 
                className={`h-full bg-gradient-to-r ${STEPS[currentStep].color}`}
                initial={{ width: "0%" }}
                animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            <div className="flex w-full gap-3">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="w-14 h-14 flex items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-white"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
              )}
              
              <button
                onClick={handleNext}
                className={`flex-1 h-14 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98]
                  ${currentStep === STEPS.length - 1 
                    ? `bg-gradient-to-r ${STEPS[currentStep].color} text-white` 
                    : "bg-white text-black hover:bg-gray-200"
                  }`}
              >
                {currentStep === STEPS.length - 1 ? "시작하기" : "다음"}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {currentStep < STEPS.length - 1 && (
              <button 
                  onClick={onComplete} 
                  className="mt-4 w-full text-center text-xs text-gray-500 hover:text-white transition-colors py-2"
              >
                건너뛰기
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}