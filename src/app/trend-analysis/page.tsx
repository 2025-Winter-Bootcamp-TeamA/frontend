'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion'; // Variants 타입 추가
import HeroBackground from '@/components/trend-analysis/HeroBackground';

// 카테고리 데이터
const CATEGORIES = [
  { id: 'frontend', name: 'Frontend', description: 'React, Next.js 등 현대 웹 기술 스택', color: '#277FA9' },
  { id: 'backend', name: 'Backend', description: 'Node.js, Go, DB 아키텍처 및 서버 기술', color: '#4CAF50' },
  { id: 'ai-data', name: 'AI & Data', description: 'LLM, MLOps, 빅데이터 및 AI 모델링', color: '#9C27B0' },
  { id: 'devops', name: 'DevOps', description: '클라우드 인프라, 컨테이너 및 CI/CD', color: '#FF9800' },
  { id: 'embedding', name: 'Embedded', description: '펌웨어, RTOS 및 하드웨어 최적화', color: '#E91E63' },
  { id: 'game', name: 'Game Dev', description: '게임 엔진, 그래픽스 및 인터랙션', color: '#84CC16' },
  { id: 'security', name: 'Security', description: '보안, 취약점 분석 및 암호학', color: '#94A3B8' },
];

// 1. 애니메이션 설정 (컴포넌트 외부에서 정의하여 재랜더링 성능 최적화)
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut" } 
  },
};

export default function TrendAnalysisMain() {
  return (
    <main className="min-h-screen bg-[#1A1B1E] text-white overflow-x-hidden">
      {/* --- Hero Section --- */}
      <section className="relative h-screen flex flex-col items-center justify-center px-6">
        <HeroBackground />
        <div className="relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-black mb-8 tracking-tighter bg-gradient-to-b from-white via-white to-white/30 bg-clip-text text-transparent"
          >
            기술의 모든 길, 하나의 지도로
          </motion.h1>
          <div className="space-y-4">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-2xl md:text-3xl font-bold text-[#277FA9] tracking-wide"
            >
              데이터로 연결된 무한한 기술 생태계
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-[#9FA0A8] max-w-2xl mx-auto leading-relaxed text-lg"
            >
              기술 노드와 실시간 트렌드 분석 데이터를 통해 <br />
              복잡한 IT 생태계의 연결 고리를 한눈에 파악하세요.
            </motion.p>
          </div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-20 flex flex-col items-center gap-3"
          >
            <p className="text-sm text-white/30 font-medium tracking-widest uppercase">아래로 스크롤해보세요</p>
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="mt-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 13L12 18L17 13M7 6L12 11L17 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40" />
              </svg>
            </motion.div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#1A1B1E] to-transparent z-10" />
      </section>

      {/* --- Category Grid Section --- */}
      <section className="max-w-6xl mx-auto py-24 px-6 relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl font-bold mb-4">기술 생태계 탐색</h2>
          <p className="text-[#9FA0A8]">원하는 카테고리를 선택하여 연관 기술 맵을 확인하세요.</p>
        </motion.div>

        {/* 상단 3개 그리드 */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8"
        >
          {CATEGORIES.slice(0, 3).map((cat) => (
            <motion.div key={cat.id} variants={itemVariants}>
              <CategoryCard cat={cat} />
            </motion.div>
          ))}
        </motion.div>

        {/* 하단 4개 그리드 */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {CATEGORIES.slice(3).map((cat) => (
            <motion.div key={cat.id} variants={itemVariants}>
              <CategoryCard cat={cat} isSmall />
            </motion.div>
          ))}
        </motion.div>
      </section>
    </main>
  );
}

// 개별 노드 아이콘 그래픽 및 CategoryCard는 그대로 유지 (타입 안정성 확보됨)
function NodeGraphic({ color }: { color: string }) {
  return (
    <svg width="120" height="100" viewBox="0 0 120 100" fill="none" className="mb-6 overflow-visible">
      <line x1="60" y1="50" x2="90" y2="20" stroke={color} strokeWidth="2" opacity="0.4" />
      <line x1="60" y1="50" x2="30" y2="40" stroke={color} strokeWidth="2" opacity="0.4" />
      <line x1="60" y1="50" x2="40" y2="80" stroke={color} strokeWidth="2" opacity="0.4" />
      <line x1="60" y1="50" x2="85" y2="75" stroke={color} strokeWidth="2" opacity="0.4" />
      <circle cx="60" cy="50" r="14" fill={color} />
      <circle cx="90" cy="20" r="8" fill={color} />
      <circle cx="30" cy="40" r="10" fill={color} />
      <circle cx="40" cy="80" r="7" fill={color} />
      <circle cx="85" cy="75" r="9" fill={color} />
    </svg>
  );
}

function CategoryCard({ cat, isSmall = false }: { cat: any; isSmall?: boolean }) {
  return (
    <Link href={`/trend-analysis/${cat.id}`} className="group h-full block">
      <div className={`
        h-full rounded-[32px] bg-[#212226] border border-white/5 
        hover:border-white/10 hover:bg-[#28292E] 
        transition-all duration-500 ease-out flex flex-col items-center text-center 
        cursor-pointer shadow-xl
        ${isSmall ? 'p-8' : 'p-10'}
      `}>
        <div className="relative mb-4 transition-all duration-700 ease-in-out filter grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110">
          <div className="absolute inset-0 blur-[30px] opacity-0 group-hover:opacity-40 transition-opacity duration-700" style={{ backgroundColor: cat.color }} />
          <NodeGraphic color={cat.color} />
        </div>
        <div className="mt-auto">
          <h3 className={`font-bold mb-3 transition-colors duration-500 text-white opacity-40 group-hover:opacity-100 ${isSmall ? 'text-xl' : 'text-2xl'}`}>
            <span className="group-hover:hidden">{cat.name}</span>
            <span className="hidden group-hover:inline" style={{ color: cat.color }}>{cat.name}</span>
          </h3>
          <p className="text-[#9FA0A8] text-sm leading-relaxed opacity-40 group-hover:opacity-100 transition-opacity duration-500">{cat.description}</p>
        </div>
      </div>
    </Link>
  );
}