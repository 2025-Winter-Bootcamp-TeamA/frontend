'use client';

import Link from 'next/link';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import HeroBackground from '@/components/trend-analysis/HeroBackground';
import { useEffect, useMemo, useState, useRef } from 'react';
import { Search, ArrowRight, Star, Box } from 'lucide-react';
import { CATEGORY_INFO } from '@/constants/mockTrends';
import { useRouter } from 'next/navigation';

// --- [1. 데이터 및 애니메이션 설정] ---
const CATEGORIES = [
  { id: 'frontend', name: 'Frontend', description: 'React, Next.js 등 현대 웹 기술 스택', color: '#1C89AD' },
  { id: 'backend', name: 'Backend', description: 'Node.js, Go, DB 아키텍처 및 서버 기술', color: '#4CAF50' },
  { id: 'ai-data', name: 'AI & Data', description: 'LLM, MLOps, 빅데이터 및 AI 모델링', color: '#9C27B0' },
  { id: 'devops', name: 'DevOps', description: '클라우드 인프라, 컨테이너 및 CI/CD', color: '#FF9800' },
  { id: 'app-mobile', name: 'App & Mobile', description: 'iOS, Android 및 크로스플랫폼 개발', color: '#2E51B3' },
  { id: 'embedding', name: 'Embedded', description: '펌웨어, RTOS 및 하드웨어 최적화', color: '#E91E63' },
  { id: 'game', name: 'Game Dev', description: '게임 엔진, 그래픽스 및 인터랙션', color: '#84CC16' },
  { id: 'security', name: 'Security', description: '보안, 취약점 분석 및 암호학', color: '#94A3B8' },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function TrendAnalysisMain() {
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // ✅ 상태 관리 변수
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearched, setIsSearched] = useState(false);

  // ✅ 디바운싱 로직 (하단 검색 결과 업데이트 최적화)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // ✅ MockData 평탄화 (모든 카테고리의 노드 수집)
  const allStacks = useMemo(() => {
    const stacks: any[] = [];
    const seen = new Set();
    Object.entries(CATEGORY_INFO).forEach(([catKey, category]: [string, any]) => {
      const combinedNodes = [...category.company.nodes, ...category.community.nodes];
      combinedNodes.forEach(node => {
        if (!seen.has(node.id)) {
          stacks.push({ 
            ...node, 
            catKey, 
            catName: category.name, 
            color: category.color 
          });
          seen.add(node.id);
        }
      });
    });
    return stacks;
  }, []);

  // ✅ 검색 필터링 로직
  const filteredResults = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    return allStacks.filter(stack => 
      stack.id.toLowerCase().includes(debouncedQuery.toLowerCase())
    );
  }, [debouncedQuery, allStacks]);

  const handleSearchClick = () => {
    setIsSearched(true);
  };

  return (
    <main className="min-h-screen bg-[#1A1B1E] text-white overflow-x-hidden">
      {/* --- 1. Hero Section (검색창 없음) --- */}
      <section className="relative h-[90dvh] flex flex-col items-center justify-center px-6">
        <HeroBackground />
        <div className="relative z-10 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-5xl md:text-7xl font-black mb-8 tracking-tighter bg-gradient-to-b from-white via-white to-white/30 bg-clip-text text-transparent">기술의 모든 길, 하나의 지도로</motion.h1>
          <div className="space-y-4">
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-2xl md:text-3xl font-bold text-[#1C89AD] tracking-wide">데이터로 연결된 무한한 기술 생태계</motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="text-[#9FA0A8] max-w-2xl mx-auto leading-relaxed text-lg">기술 노드와 실시간 트렌드 분석 데이터를 통해 <br />복잡한 IT 생태계의 연결 고리를 한눈에 파악하세요.</motion.p>
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1 }} className="mt-20 flex flex-col items-center gap-3">
            <p className="text-sm text-white/30 font-medium tracking-widest uppercase">아래로 스크롤하여 탐색하세요</p>
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="mt-2"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 13L12 18L17 13M7 6L12 11L17 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40" /></svg></motion.div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#1A1B1E] to-transparent z-10" />
      </section>

      {/* --- 2. Category Grid Section (8개 전체) --- */}
      <section className="max-w-[1440px] mx-auto py-24 px-6 relative z-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
          <h2 className="text-4xl font-bold mb-4">기술 생태계 탐색</h2>
          <p className="text-[#9FA0A8]">원하는 카테고리를 선택하여 연관 기술 맵을 확인하세요.</p>
        </motion.div>

        {/* 4x2 그리드 배치 */}
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((cat) => (
            <motion.div key={cat.id} variants={itemVariants}><CategoryCard cat={cat} /></motion.div>
          ))}
        </motion.div>
      </section>

      {/* --- 3. 하단 기술 스택 검색 섹션 (유일한 검색창) --- */}
      <section className="max-w-[1200px] mx-auto pb-40 px-6 relative z-20">
        <motion.div ref={searchRef} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-[#212226] border border-white/5 rounded-[40px] p-12 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 opacity-10 -translate-y-1/2 translate-x-1/4 group-hover:scale-110 transition-transform duration-1000">
            <NodeGraphic id="ai-data" color="#1C89AD" />
          </div>

          <h3 className="text-3xl font-bold mb-4 text-center">찾으시는 기술이 없나요?</h3>
          <p className="text-[#9FA0A8] mb-10 text-center">목데이터에 등록된 {allStacks.length}개의 기술 스택을 자유롭게 검색해보세요.</p>

          <div className="relative max-w-2xl mx-auto mb-12">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20"><Search size={24} /></div>
            <input 
              type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
              placeholder="React, Django, AWS 등 기술명을 입력하세요..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-16 text-lg focus:outline-none focus:border-blue-500 focus:bg-white/[0.08] transition-all placeholder:text-white/20"
            />
            <button onClick={handleSearchClick} className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 group/btn active:scale-95">
              검색 <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>

          <AnimatePresence>
            {isSearched && filteredResults.length > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
                {filteredResults.map((stack) => <TechStackCard key={stack.id} stack={stack} />)}
              </motion.div>
            )}
          </AnimatePresence>

          {isSearched && debouncedQuery && filteredResults.length === 0 && (
            <p className="text-white/20 mt-10 text-center">해당 기술에 대한 데이터가 존재하지 않습니다.</p>
          )}
        </motion.div>
      </section>
    </main>
  );
}

// --- [Sub Components: NodeGraphic - 8개 전체 로직 포함] ---

function NodeGraphic({ id, color }: { id: string; color: string }) {
  const s = { stroke: color, strokeWidth: "2", opacity: "0.4" };
  const f = { fill: color };

  switch (id) {
    case 'frontend': // 수평 확장 구조
      return (
        <svg width="120" height="100" viewBox="0 0 120 100" className="mb-4 overflow-visible">
          <line x1="20" y1="50" x2="100" y2="50" {...s} />
          <line x1="60" y1="50" x2="60" y2="20" {...s} />
          <circle cx="20" cy="50" r="10" {...f} />
          <circle cx="60" cy="50" r="14" {...f} />
          <circle cx="100" cy="50" r="10" {...f} />
          <circle cx="60" cy="20" r="7" {...f} />
        </svg>
      );
    case 'backend': // 수직 계층 구조
      return (
        <svg width="120" height="100" viewBox="0 0 120 100" className="mb-4 overflow-visible">
          <line x1="60" y1="20" x2="60" y2="80" {...s} />
          <line x1="60" y1="50" x2="90" y2="50" {...s} />
          <circle cx="60" cy="20" r="9" {...f} />
          <circle cx="60" cy="50" r="15" {...f} />
          <circle cx="60" cy="80" r="9" {...f} />
          <circle cx="90" cy="50" r="6" {...f} />
        </svg>
      );
    case 'ai-data': // 신경망 밀집 구조
      return (
        <svg width="120" height="100" viewBox="0 0 120 100" className="mb-4 overflow-visible">
          <line x1="60" y1="50" x2="30" y2="25" {...s} />
          <line x1="60" y1="50" x2="30" y2="75" {...s} />
          <line x1="60" y1="50" x2="90" y2="25" {...s} />
          <line x1="60" y1="50" x2="90" y2="75" {...s} />
          <circle cx="60" cy="50" r="16" {...f} />
          <circle cx="30" cy="25" r="7" {...f} opacity="0.6" />
          <circle cx="30" cy="75" r="7" {...f} opacity="0.6" />
          <circle cx="90" cy="25" r="7" {...f} opacity="0.6" />
          <circle cx="90" cy="75" r="7" {...f} opacity="0.6" />
        </svg>
      );
    case 'devops': // 순환 루프 구조
      return (
        <svg width="120" height="100" viewBox="0 0 120 100" className="mb-4 overflow-visible">
          <path d="M40 30 L80 30 L80 70 L40 70 Z" {...s} fill="none" strokeDasharray="4 2" />
          <circle cx="40" cy="30" r="8" {...f} />
          <circle cx="80" cy="30" r="8" {...f} />
          <circle cx="80" cy="70" r="8" {...f} />
          <circle cx="40" cy="70" r="8" {...f} />
        </svg>
      );
    case 'app-mobile': // 중앙 집중형 구조
      return (
        <svg width="120" height="100" viewBox="0 0 120 100" className="mb-4 overflow-visible">
          <line x1="60" y1="50" x2="40" y2="20" {...s} />
          <line x1="60" y1="50" x2="80" y2="20" {...s} />
          <circle cx="60" cy="50" r="18" {...f} />
          <circle cx="40" cy="20" r="6" {...f} />
          <circle cx="80" cy="20" r="6" {...f} />
        </svg>
      );
    case 'embedding': // 격자 하드웨어 회로
      return (
        <svg width="120" height="100" viewBox="0 0 120 100" className="mb-4 overflow-visible">
          <line x1="30" y1="30" x2="90" y2="30" {...s} />
          <line x1="30" y1="70" x2="90" y2="70" {...s} />
          <line x1="30" y1="30" x2="30" y2="70" {...s} />
          <circle cx="30" cy="30" r="8" {...f} />
          <circle cx="90" cy="30" r="8" {...f} />
          <circle cx="30" cy="70" r="8" {...f} />
          <circle cx="90" cy="70" r="14" {...f} />
        </svg>
      );
    case 'game': // 사방 폭발형 다이나믹
      return (
        <svg width="120" height="100" viewBox="0 0 120 100" className="mb-4 overflow-visible">
          <line x1="60" y1="50" x2="20" y2="20" {...s} />
          <line x1="60" y1="50" x2="100" y2="80" {...s} />
          <line x1="60" y1="50" x2="100" y2="20" {...s} />
          <circle cx="60" cy="50" r="13" {...f} />
          <circle cx="20" cy="20" r="10" {...f} />
          <circle cx="100" cy="80" r="5" {...f} />
          <circle cx="100" cy="20" r="8" {...f} />
        </svg>
      );
    case 'security': // 육각형 폐쇄 보안 구조
      return (
        <svg width="120" height="100" viewBox="0 0 120 100" className="mb-4 overflow-visible">
          <path d="M60 20 L90 40 L90 70 L60 90 L30 70 L30 40 Z" {...s} fill="none" />
          <circle cx="60" cy="55" r="12" {...f} />
          <circle cx="60" cy="20" r="5" {...f} opacity="0.5" />
          <circle cx="90" cy="70" r="5" {...f} opacity="0.5" />
          <circle cx="30" cy="70" r="5" {...f} opacity="0.5" />
        </svg>
      );
    default: return <svg width="120" height="100" viewBox="0 0 120 100"><circle cx="60" cy="50" r="14" {...f} /></svg>;
  }
}

function CategoryCard({ cat }: { cat: any }) {
  return (
    <Link href={`/trend-analysis/${cat.id}`} className="group h-full block">
      <div className="h-full rounded-[32px] bg-[#212226] border border-white/5 hover:border-white/10 hover:bg-[#28292E] transition-all duration-500 flex flex-col items-center text-center shadow-xl p-10">
        <div className="relative mb-4 transition-all filter grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110">
          <div className="absolute inset-0 blur-[30px] opacity-0 group-hover:opacity-40 transition-opacity duration-700" style={{ backgroundColor: cat.color }} />
          <NodeGraphic id={cat.id} color={cat.color} />
        </div>
        <div className="mt-auto">
          <h3 className="font-bold mb-3 text-2xl transition-colors text-white opacity-40 group-hover:opacity-100">
            <span className="group-hover:hidden">{cat.name}</span>
            <span className="hidden group-hover:inline" style={{ color: cat.color }}>{cat.name}</span>
          </h3>
          <p className="text-[#9FA0A8] text-sm leading-relaxed opacity-40 group-hover:opacity-100 transition-opacity duration-500">{cat.description}</p>
        </div>
      </div>
    </Link>
  );
}

/** ✅ 즐겨찾기 상태 및 호버 '불켜짐' 효과가 적용된 기술 카드 */
function TechStackCard({ stack }: { stack: any }) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.02, boxShadow: `0 0 25px ${stack.color}33` }}
      onClick={() => router.push(`/trend-analysis/${stack.catKey}/${stack.id}`)}
      className="bg-white/5 border border-white/5 p-6 rounded-3xl flex items-center justify-between group transition-all duration-300 cursor-pointer hover:bg-white/[0.08] hover:border-white/20"
    >
      <div className="flex items-center gap-5 text-left">
        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center border border-white/5 p-3 shadow-inner">
        {imgError ? (
            <Box size={24} className="text-[#212226] opacity-20" />
          ) : (
            <img 
              src={`/logos/${stack.id.toLowerCase().replace('.', '')}.svg`} 
              alt=""
              className="w-full h-full object-contain"
              onError={() => setImgError(true)} // 에러 나면 즉시 아이콘으로 교체
            />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className={`font-bold text-lg transition-colors ${isFavorite ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>{stack.id}</h4>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 uppercase tracking-widest font-black">{stack.catName}</span>
          </div>
          <p className="text-sm text-[#9FA0A8] line-clamp-1 opacity-60 group-hover:opacity-100 transition-opacity">{stack.desc}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <button onClick={handleFavoriteClick} className="relative p-2 rounded-full hover:bg-white/5 transition-colors group/star">
          <Star size={22} fill={isFavorite ? "#EAB308" : "none"} className={`transition-all duration-300 transform ${isFavorite ? 'text-yellow-500 scale-110' : 'text-white/20 group-hover/star:text-yellow-500/60 group-hover/star:scale-125'}`} />
          {isFavorite && <motion.div layoutId="glow" className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full" />}
        </button>
        <span className={`text-[10px] font-bold transition-colors ${isFavorite ? 'text-yellow-500' : 'text-white/10'}`}>{isFavorite ? 'SAVED' : 'MATCH'}</span>
      </div>
    </motion.div>
  );
}