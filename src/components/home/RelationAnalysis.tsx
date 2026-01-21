"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Info, ArrowRightCircle, Share2 } from "lucide-react";
import { RelatedTechStackRelation } from "@/services/trendService";

// ✅ 1. Props 타입 정의 (이게 있어야 부모에서 데이터를 넘겨줄 수 있어!)
interface StackRelationAnalysisProps {
  mainStackName: string;
  mainLogo: string;
  relatedStacks: RelatedTechStackRelation[]; // API에서 받은 관련 기술 스택 데이터
  onClose: () => void;
  onStackSelect?: (stackId: number) => void; // 기술 스택 선택 시 호출되는 콜백
}

// 2. 노드 상세 데이터
interface StackNode {
  name: string;
  role: string;
  relationReason: string;
  description: string;
  logo?: string | null;
}

// 이미지 에러 핸들러
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, name: string) => {
  const target = e.target as HTMLImageElement;
  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128&bold=true`;
};

export default function StackRelationAnalysis({ mainStackName, mainLogo, relatedStacks, onClose, onStackSelect }: StackRelationAnalysisProps) {
  const [focusedNode, setFocusedNode] = useState<RelatedTechStackRelation | null>(null);
  
  // relatedStacks가 변경되면 focusedNode 초기화
  useEffect(() => {
    setFocusedNode(null);
  }, [relatedStacks.length, mainStackName]);
  
  // 관련 기술 스택을 가중치 순으로 정렬 (이미 API에서 정렬되어 있지만, 혹시 모를 경우를 대비)
  // TODO: 언급량 순 정렬 (현재는 주석처리)
  // const sortedByMentionCount = [...relatedStacks].sort((a, b) => (b.tech_stack.count || 0) - (a.tech_stack.count || 0));
  const sortedByWeight = [...relatedStacks].sort((a, b) => b.weight - a.weight);
  
  const activeDetail = focusedNode ? {
    name: focusedNode.tech_stack.name,
    role: focusedNode.relationship_type_display,
    relationReason: `${mainStackName}와(과) ${focusedNode.relationship_type_display} 관계를 가지고 있습니다.`,
    description: focusedNode.tech_stack.description || "상세 설명이 없습니다.",
    logo: focusedNode.tech_stack.logo
  } : null;

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
                <div className="w-24 h-24 bg-gray-900 rounded-full border-4 border-blue-600 shadow-[0_0_40px_rgba(37,99,235,0.4)] flex items-center justify-center overflow-hidden p-2">
                    {mainLogo ? (
                        <img 
                            src={mainLogo} 
                            alt={mainStackName} 
                            className="w-full h-full object-contain"
                            onError={(e) => handleImageError(e, mainStackName)}
                        />
                    ) : (
                        <span className="text-white font-bold text-lg">{mainStackName.substring(0, 2).toUpperCase()}</span>
                    )}
                </div>
                <span className="mt-3 text-lg font-bold text-white tracking-wide">{mainStackName}</span>
            </motion.div>

            {sortedByWeight.map((relation, index) => {
                const angle = (index / sortedByWeight.length) * 2 * Math.PI;
                const radius = 180;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                const isSelected = focusedNode?.tech_stack.id === relation.tech_stack.id;
                const isDimmed = focusedNode !== null && !isSelected;
                const stack = relation.tech_stack;

                return (
                    <motion.div
                        key={stack.id}
                        className="absolute z-20"
                        initial={{ x: 0, y: 0, opacity: 0 }}
                        animate={{ x: isSelected ? 0 : x, y: isSelected ? 0 : y, scale: isSelected ? 1.4 : (isDimmed ? 0.8 : 1), opacity: isDimmed ? 0.2 : 1, zIndex: isSelected ? 50 : 20 }}
                        transition={{ type: "spring", stiffness: 100, damping: 15 }}
                        onClick={() => setFocusedNode(isSelected ? null : relation)}
                    >
                        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] pointer-events-none -z-10 overflow-visible">
                            <motion.line x1="200" y1="200" x2={200 - (isSelected ? 0 : x)} y2={200 - (isSelected ? 0 : y)} stroke="#3b82f6" strokeWidth="2" animate={{ strokeOpacity: isSelected ? 0 : (isDimmed ? 0.1 : 0.3) }} />
                        </svg>
                        <div className={`flex flex-col items-center gap-2 cursor-pointer group transition-all duration-300 ${isSelected ? 'scale-110' : ''}`}>
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-2 transition-colors duration-300 overflow-hidden p-1 ${isSelected ? 'bg-blue-600 border-white shadow-blue-500/50' : 'bg-[#2C2E33] border-gray-600 group-hover:border-blue-400 group-hover:bg-gray-800'}`}>
                                {stack.logo ? (
                                    <img 
                                        src={stack.logo} 
                                        alt={stack.name} 
                                        className="w-full h-full object-contain"
                                        onError={(e) => handleImageError(e, stack.name)}
                                    />
                                ) : (
                                    <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-300'}`}>{stack.name.substring(0, 2).toUpperCase()}</span>
                                )}
                            </div>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full border transition-all ${isSelected ? 'bg-white text-blue-900 border-white scale-110' : 'text-gray-400 bg-gray-900/80 border-gray-700 group-hover:text-white'}`}>{stack.name}</span>
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
                        <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/30 overflow-hidden p-1">
                            {activeDetail.logo ? (
                                <img 
                                    src={activeDetail.logo} 
                                    alt={activeDetail.name} 
                                    className="w-full h-full object-contain"
                                    onError={(e) => handleImageError(e, activeDetail.name)}
                                />
                            ) : (
                                <span className="text-blue-400 font-bold text-lg">{activeDetail.name.substring(0, 1)}</span>
                            )}
                        </div>
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
                    <button 
                        onClick={() => {
                            if (focusedNode && onStackSelect) {
                                onStackSelect(focusedNode.tech_stack.id);
                            }
                        }}
                        className="mt-auto w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                        <span>{activeDetail.name} 분석 화면으로 이동</span>
                        <ArrowRightCircle className="w-4 h-4" />
                    </button>
                </motion.div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4"><Share2 className="w-10 h-10 text-gray-400" /></div>
                    <p className="text-gray-300 font-medium text-sm">왼쪽 그래프에서 노드를 클릭하여<br/>상세 관계 정보를 확인하세요.</p>
                    {sortedByWeight.length === 0 && (
                        <p className="text-gray-500 text-xs mt-2">관련 기술 스택이 없습니다.</p>
                    )}
                </div>
            )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}