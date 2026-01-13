// app/trend-analysis/page.tsx
import Link from 'next/link';

const CATEGORIES = [
  { 
    id: 'frontend', 
    name: 'Frontend', 
    description: 'React, Next.js 등 현대 웹 인터페이스 및 클라이언트 기술', 
    color: '#1C89AD' 
  },
  { 
    id: 'backend', 
    name: 'Backend', 
    description: '서버 아키텍처, 분산 시스템 및 데이터베이스 설계', 
    color: '#4CAF50' 
  },
  { 
    id: 'ai-data', 
    name: 'AI & Data', 
    description: 'LLM, MLOps, 빅데이터 처리 및 인공지능 모델링', 
    color: '#FF9800' 
  },
  { 
    id: 'devops', 
    name: 'DevOps', 
    description: '클라우드 인프라, 컨테이너화 및 CI/CD 자동화', 
    color: '#2496ED' 
  },
  { 
    id: 'embedding', 
    name: 'Embedded', 
    description: '펌웨어 개발, RTOS 및 하드웨어 최적화 제어', 
    color: '#FFEB3B' 
  },
  { 
    id: 'game', 
    name: 'Game Dev', 
    description: '게임 엔진, 실시간 그래픽스 및 인터랙티브 콘텐츠', 
    color: '#E91E63' 
  },
  { 
    id: 'security', 
    name: 'Security', 
    description: '네트워크 보안, 취약점 분석 및 암호학 시스템', 
    color: '#9C27B0' 
  },
];

export default function TrendAnalysisMain() {
  return (
    <main className="min-h-screen bg-[#1A1B1E] text-white py-20 px-6">
      <div className="max-w-5xl mx-auto text-center">
        {/* 히어로 섹션 */}
        <h1 className="text-5xl font-extrabold mb-6">IT 트렌드 분석 시스템</h1>
        <p className="text-[#9FA0A8] text-xl mb-12">
          최신 기술 생태계의 연관 관계를 한눈에 파악하세요. <br/>
          탐색하고 싶은 카테고리를 아래에서 선택하십시오.
        </p>

        {/* 카테고리 선택 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          {CATEGORIES.map((cat) => (
            <Link key={cat.id} href={`/trend-analysis/${cat.id}`}>
              <div className="p-8 rounded-2xl bg-[#25262B] border border-white/10 hover:border-white/30 transition-all cursor-pointer group text-left">
                <h3 className="text-2xl font-bold mb-2" style={{ color: cat.color }}>{cat.name}</h3>
                <p className="text-[#9FA0A8]">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}