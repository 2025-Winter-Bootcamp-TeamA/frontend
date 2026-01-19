"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Info, ArrowRightCircle, Share2 } from "lucide-react";
import Image from "next/image";

// ✅ 1. Props 타입 정의 (이게 있어야 부모에서 데이터를 넘겨줄 수 있어!)
interface StackRelationAnalysisProps {
  mainStackName: string;
  mainLogo: string;
  relatedNodes: string[];
  onClose: () => void;
}

// 2. 노드 상세 데이터
interface StackNode {
  name: string;
  role: string;
  relationReason: string;
  description: string;
}

const NODE_DETAILS: Record<string, StackNode> = {
  "Redux": {
    name: "Redux",
    role: "State Management",
    relationReason: "React의 복잡한 상태 관리를 해결하기 위해 가장 널리 사용되는 라이브러리입니다.",
    description: "앱의 상태를 예측 가능한 단일 스토어에서 관리하게 해주는 JS 라이브러리입니다."
  },
  "Zustand": {
    name: "Zustand",
    role: "State Management",
    relationReason: "Redux보다 훨씬 가볍고 보일러플레이트가 적어 최근 React 생태계에서 급부상 중입니다.",
    description: "독일어로 '상태'를 뜻하며, 훅(Hook) 기반의 간결한 API를 제공합니다."
  },
  "Next.js": {
    name: "Next.js",
    role: "Web Framework",
    relationReason: "React를 기반으로 SSR, SSG 등 프로덕션 기능을 제공하는 필수 프레임워크입니다.",
    description: "Vercel이 개발한 풀스택 웹 프레임워크로, 성능 최적화가 자동화되어 있습니다."
  },
  "Vite": {
    name: "Vite",
    role: "Build Tool",
    relationReason: "CRA(Create React App)를 대체하는 차세대 초고속 빌드 도구입니다.",
    description: "ES 모듈을 사용하여 개발 서버 구동 속도가 매우 빠릅니다."
  },
  "React Query": {
    name: "React Query",
    role: "Data Fetching",
    relationReason: "서버 상태(Server State) 관리를 자동화하여 useEffect 사용을 획기적으로 줄여줍니다.",
    description: "비동기 데이터를 캐싱, 동기화, 업데이트하는 강력한 라이브러리입니다."
  },
  "Tailwind": {
    name: "Tailwind CSS",
    role: "Styling",
    relationReason: "React 컴포넌트 내부에서 클래스명만으로 빠르게 스타일링이 가능해 찰떡궁합입니다.",
    description: "유틸리티 퍼스트 CSS 프레임워크로, 디자인 시스템 구축에 유리합니다."
  },
  "DEFAULT": {
    name: "Unknown",
    role: "Technology",
    relationReason: "이 기술 스택과 함께 자주 언급되는 연관 기술입니다.",
    description: "해당 기술에 대한 상세 데이터가 준비 중입니다."
  }
};

export default function StackRelationAnalysis({ mainStackName, mainLogo, relatedNodes, onClose }: StackRelationAnalysisProps) {
  const [focusedNode, setFocusedNode] = useState<string | null>(null);
  const activeDetail = focusedNode ? (NODE_DETAILS[focusedNode] || { ...NODE_DETAILS["DEFAULT"], name: focusedNode }) : null;

  return (
    <div className="w-full h-full min-h-[500px] flex flex-col md:flex-row bg-[#25262B]/50 rounded-[32px] overflow-hidden border border-gray-800 relative">
      <button onClick={onClose} className="absolute top-4 right-4 z-50 text-gray-500 hover:text-white bg-gray-900/50 p-2 rounded-full">
        <X className="w-5 h-5" />
      </button>

      {/* LEFT: Graph */}
      <div className="flex-1 relative flex items-center justify-center bg-gradient-to-br from-[#1A1B1E] to-[#141517]">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative w-full h-full flex items-center justify-center p-10">
            <motion.div 
                className="absolute z-30 flex flex-col items-center justify-center"
                animate={{ scale: focusedNode ? 0.8 : 1.1, opacity: focusedNode ? 0.4 : 1, filter: focusedNode ? "grayscale(100%)" : "grayscale(0%)" }}
            >
                <div className="w-24 h-24 bg-gray-900 rounded-full border-4 border-blue-600 shadow-[0_0_40px_rgba(37,99,235,0.4)] flex items-center justify-center">
                    <Image src={mainLogo} alt={mainStackName} width={50} height={50} className="object-contain" unoptimized />
                </div>
                <span className="mt-3 text-lg font-bold text-white tracking-wide">{mainStackName}</span>
            </motion.div>

            {relatedNodes.map((node, index) => {
                const angle = (index / relatedNodes.length) * 2 * Math.PI;
                const radius = 180;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                const isSelected = focusedNode === node;
                const isDimmed = focusedNode !== null && !isSelected;

                return (
                    <motion.div
                        key={node}
                        className="absolute z-20"
                        initial={{ x: 0, y: 0, opacity: 0 }}
                        animate={{ x: isSelected ? 0 : x, y: isSelected ? 0 : y, scale: isSelected ? 1.4 : (isDimmed ? 0.8 : 1), opacity: isDimmed ? 0.2 : 1, zIndex: isSelected ? 50 : 20 }}
                        transition={{ type: "spring", stiffness: 100, damping: 15 }}
                        onClick={() => setFocusedNode(isSelected ? null : node)}
                    >
                        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] pointer-events-none -z-10 overflow-visible">
                            <motion.line x1="200" y1="200" x2={200 - (isSelected ? 0 : x)} y2={200 - (isSelected ? 0 : y)} stroke="#3b82f6" strokeWidth="2" animate={{ strokeOpacity: isSelected ? 0 : (isDimmed ? 0.1 : 0.3) }} />
                        </svg>
                        <div className={`flex flex-col items-center gap-2 cursor-pointer group transition-all duration-300 ${isSelected ? 'scale-110' : ''}`}>
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-2 transition-colors duration-300 ${isSelected ? 'bg-blue-600 border-white shadow-blue-500/50' : 'bg-[#2C2E33] border-gray-600 group-hover:border-blue-400 group-hover:bg-gray-800'}`}>
                                <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-300'}`}>{node.substring(0, 2).toUpperCase()}</span>
                            </div>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full border transition-all ${isSelected ? 'bg-white text-blue-900 border-white scale-110' : 'text-gray-400 bg-gray-900/80 border-gray-700 group-hover:text-white'}`}>{node}</span>
                        </div>
                    </motion.div>
                );
            })}
        </div>
      </div>

      {/* RIGHT: Detail */}
      <AnimatePresence mode="wait">
        <motion.div className="w-full md:w-[320px] bg-[#1A1B1E] border-l border-gray-800 p-6 flex flex-col overflow-y-auto custom-scrollbar" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            {activeDetail ? (
                <motion.div key={activeDetail.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/30 text-blue-400 font-bold text-lg">{activeDetail.name.substring(0, 1)}</div>
                        <div>
                            <h3 className="text-xl font-bold text-white">{activeDetail.name}</h3>
                            <span className="text-xs text-blue-400 font-medium px-2 py-0.5 bg-blue-900/30 rounded-md">{activeDetail.role}</span>
                        </div>
                    </div>
                    <div className="mb-6">
                        <h4 className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider mb-2"><Info className="w-3.5 h-3.5" /> What is it?</h4>
                        <p className="text-sm text-gray-300 leading-relaxed bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">{activeDetail.description}</p>
                    </div>
                    <div className="mb-6 flex-1">
                        <h4 className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider mb-2"><Share2 className="w-3.5 h-3.5" /> Relation with {mainStackName}</h4>
                        <div className="bg-gradient-to-b from-blue-900/10 to-transparent p-4 rounded-xl border border-blue-500/20">
                            <p className="text-sm text-gray-200 leading-relaxed font-medium">"{activeDetail.relationReason}"</p>
                        </div>
                    </div>
                    <button className="mt-auto w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm">
                        <span>{activeDetail.name} 분석 화면으로 이동</span>
                        <ArrowRightCircle className="w-4 h-4" />
                    </button>
                </motion.div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4"><Share2 className="w-10 h-10 text-gray-400" /></div>
                    <p className="text-gray-300 font-medium text-sm">왼쪽 그래프에서 노드를 클릭하여<br/>상세 관계 정보를 확인하세요.</p>
                </div>
            )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}