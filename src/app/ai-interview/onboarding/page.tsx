'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Building2, PieChart, Sparkles, ClipboardCheck, Rocket } from 'lucide-react';
import LoginModal from '@/components/LoginModal';

const ONBOARDING_STEPS = [
    {
        id: 1,
        title: "내 이력서에 딱 맞는,\n맞춤형 채용 공고 추천",
        desc: "도영님의 이력서를 분석하여 현재 채용 중인\n가장 적합한 회사들을 AI가 직접 매칭해 드립니다.",
        icon: <Building2 size={80} className="text-blue-500" />,
        color: "from-blue-600/20 to-transparent"
    },
    {
        id: 2,
        title: "기술 스택 키워드 추출,\n적합도 정밀 분석",
        desc: "이력서 속 기술 스택을 파이 차트로 시각화하여\n목표 기업과의 직무 적합도를 한눈에 확인하세요.",
        icon: <PieChart size={80} className="text-red-500" />,
        color: "from-red-600/20 to-transparent"
    },
    {
        id: 3,
        title: "AI가 분석하는\n나의 강점과 보완점",
        desc: "면접 답변을 통해 나의 장단점과 필요 기술 스택을\nAI가 객관적으로 도출하여 성장 방향을 제시합니다.",
        icon: <Sparkles size={80} className="text-green-500" />,
        color: "from-green-600/20 to-transparent"
    },
    {
        id: 4,
        title: "한눈에 확인하는\nAI 분석 통합 리포트",
        desc: "모든 분석 결과를 하나로 통합한 리포트를 통해\n도영님의 완벽한 면접 전략을 완성해 보세요.",
        icon: <ClipboardCheck size={80} className="text-yellow-500" />,
        color: "from-yellow-600/20 to-transparent"
    }
];

export default function AIInterviewOnboarding() {
    const [[currentStep, direction], setStep] = useState([0, 0]);
    const router = useRouter();
    const { data: session, status } = useSession();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const variants = {
        initial: (direction: number) => ({
        x: direction > 0 ? 100 : -100,
        opacity: 0,
        }),
        animate: {
        x: 0,
        opacity: 1,
        },
        exit: (direction: number) => ({
        x: direction > 0 ? -100 : 100,
        opacity: 0,
        }),
    };

    const nextStep = () => {
        if (currentStep < ONBOARDING_STEPS.length - 1) {
        setStep([currentStep + 1, 1]);
        } else {
        // 마지막 단계: 로그인된 경우에만 체험 진입, 비로그인이면 로그인 모달 노출
        if (status !== 'authenticated' || !session) {
            setIsLoginModalOpen(true);
            return;
        }
        localStorage.setItem('seenAIOnboarding', 'true'); // 루프 방지 기록
        router.push('/ai-interview');
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
        setStep([currentStep - 1, -1]);
        }
    };

    return (
        <div className="relative h-[calc(100vh-70px)] w-full bg-[#1A1B1E] overflow-hidden flex flex-col items-center justify-center">
        <div className={`absolute inset-0 bg-gradient-to-b ${ONBOARDING_STEPS[currentStep].color} transition-colors duration-1000`} />

        <div className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center">
            <AnimatePresence mode="wait" custom={direction}>
            <motion.div
                key={currentStep}
                custom={direction}
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="flex flex-col items-center text-center"
            >
                <div className="mb-12 p-10 rounded-[40px] bg-white/5 border border-white/10 shadow-2xl backdrop-blur-md">
                {ONBOARDING_STEPS[currentStep].icon}
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight whitespace-pre-line tracking-tighter">
                {ONBOARDING_STEPS[currentStep].title}
                </h1>
                <p className="text-[#9FA0A8] text-lg md:text-xl leading-relaxed whitespace-pre-line mb-12 font-medium">
                {ONBOARDING_STEPS[currentStep].desc}
                </p>
            </motion.div>
            </AnimatePresence>

            {/* 인디케이터 및 버튼 구역 생략 (기존과 동일) */}
            <div className="flex gap-2 mb-10">
            {ONBOARDING_STEPS.map((_, idx) => (
                <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStep ? 'w-8 bg-white' : 'w-2 bg-white/20'
                }`}
                />
            ))}
            </div>

            <div className="flex items-center gap-4 w-full max-w-sm">
            {currentStep > 0 && (
                <button onClick={prevStep} className="p-5 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">
                <ChevronLeft size={24} />
                </button>
            )}
            <button onClick={nextStep} className="flex-1 py-5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-lg transition-all shadow-lg flex items-center justify-center gap-2">
                {currentStep === ONBOARDING_STEPS.length - 1 ? <>AI 면접 체험하기 <Rocket size={20} /></> : <>다음으로 <ChevronRight size={20} /></>}
            </button>
            </div>
        </div>
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        </div>
    );
}
