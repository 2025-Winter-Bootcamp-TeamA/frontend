'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Zap, MessageSquare, Target, ClipboardCheck } from 'lucide-react';

interface AnalysisSummaryProps {
    onOpenModal: () => void;
}

    export default function AnalysisSummary({ onOpenModal }: AnalysisSummaryProps) {
    const [expanded, setExpanded] = useState({
        prosCons: false,
        techStack: false,
        questions: false
    });

    const toggle = (key: keyof typeof expanded) => {
        setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="lg:col-span-4 flex flex-col gap-6 h-[600px]">
        {/* 배경 컨테이너: overflow-hidden으로 내부 요소가 밖으로 나가지 않게 설정 */}
        <div className="bg-[#212226] border border-white/10 rounded-[32px] flex-1 flex flex-col overflow-hidden">
            
            <div className="p-8 pb-4">
            <h3 className="text-white/40 text-[11px] font-bold uppercase tracking-widest">
                AI 분석 요약 리포트
            </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar px-8 pb-8">
            <div className="space-y-6">
                {/* 1. 장단점 분석 */}
                <SummaryItem 
                icon={<Zap size={16} className="text-blue-400" />}
                title="장단점 분석"
                content="도영님은 SW 우수상을 통해 증명된 실무 역량과 DevRoad 프로젝트에서의 데이터 시스템 설계 능력이 매우 뛰어납니다. 다만, 대규모 분산 환경에서의 트러블슈팅 경험을 보완한다면 더욱 완벽한 엔지니어로 성장할 수 있습니다."
                isExpanded={expanded.prosCons}
                onToggle={() => toggle('prosCons')}
                />

                {/* 2. 필요 기술 스택 */}
                <SummaryItem 
                icon={<Target size={16} className="text-purple-400" />}
                title="필요 기술 스택"
                content="현재 보유한 React, Next.js 숙련도는 훌륭하나, 지원하시는 회사의 인프라 환경인 Kubernetes와 테라폼을 통한 IaC(Infrastructure as Code) 경험이 추가된다면 기술적 적합도가 비약적으로 상승할 것입니다."
                isExpanded={expanded.techStack}
                onToggle={() => toggle('techStack')}
                />

                {/* 3. 예상 면접 질문 */}
                <SummaryItem 
                icon={<MessageSquare size={16} className="text-green-400" />}
                title="예상 면접 질문"
                content="1. DevRoad 프로젝트에서 데이터 흐름을 최적화하기 위해 어떤 설계를 도입했나요? / 2. TypeScript를 사용하면서 발생했던 가장 까다로운 타입 에러와 해결 과정은? / 3. 팀 프로젝트에서 기술적 견해 차이가 발생했을 때 본인만의 설득 전략은 무엇인가요?"
                isExpanded={expanded.questions}
                onToggle={() => toggle('questions')}
                />
            </div>
            </div>
        </div>

        {/* 하단 버튼 영역: 컨테이너 밖에 위치하여 항상 고정 */}
        <button 
            onClick={onOpenModal}
            className="w-full py-6 rounded-[24px] bg-blue-600 hover:bg-blue-500 text-white font-black text-lg uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all group font-bold"
        >
            <ClipboardCheck size={20} className="group-hover:rotate-12 transition-transform" />
            전체 결과 통합 리포트 확인
        </button>
        </div>
    );
    }

    /**
     * 개별 요약 항목 컴포넌트
     */
    function SummaryItem({ icon, title, content, isExpanded, onToggle }: any) {
    return (
        <div className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden transition-colors hover:border-white/10 group">
        <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
            {icon} 
            <p className="font-bold text-sm text-white/90">{title}</p>
            </div>
            
            <div className="relative">
            <motion.p 
                initial={false}
                animate={{ height: isExpanded ? 'auto' : '44px' }}
                className={`text-sm leading-relaxed text-white/60 overflow-hidden ${!isExpanded && 'line-clamp-2'}`}
            >
                {content}
            </motion.p>
            </div>

            <button 
            onClick={onToggle} 
            className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-white/30 hover:text-white transition-colors uppercase tracking-tighter"
            >
            {isExpanded ? (
                <>접기 <ChevronUp size={14} /></>
            ) : (
                <>자세히 보기 <ChevronDown size={14} /></>
            )}
            </button>
        </div>
        </div>
    );
}