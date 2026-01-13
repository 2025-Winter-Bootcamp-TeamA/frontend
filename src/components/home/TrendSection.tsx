'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 1. 15개의 목업 데이터 (컴퓨터공학 전공생 관심사 위주)
const TREND_DATA = [
    { id: 1, title: '2026년 AI 트렌드: LLM에서 LMM으로', date: '2026.01.07', desc: '멀티모달 모델의 발전이 가져올 개발 환경의 변화를 분석합니다.', img: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200' },
    { id: 2, title: 'Next.js 15 기반 서버 컴포넌트 최적화', date: '2026.01.08', desc: '더 빠른 렌더링을 위한 RSC 설계 패턴과 캐싱 전략 가이드.', img: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=200' },
    { id: 3, title: '대규모 데이터 시스템 설계를 위한 기초', date: '2026.01.09', desc: '확장성 있는 데이터베이스 아키텍처를 구축하는 핵심 원리.', img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc51?w=200' },
    { id: 4, title: 'Git Workflow: 팀 프로젝트 효율 극대화', date: '2026.01.10', desc: '커밋 메시지 규칙부터 브랜치 관리 전략까지 실무 팁 공유.', img: 'https://images.unsplash.com/photo-1556075798-4825dfafd992?w=200' },
    { id: 5, title: 'TypeScript 5.x 신기능 마스터하기', date: '2026.01.11', desc: '데코레이터와 튜플 타입 최적화 등 최신 문법 활용법.', img: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=200' },
    { id: 6, title: '웹 성능 최적화: Lighthouse 100점 도전', date: '2026.01.12', desc: '이미지 최적화 및 폰트 로딩 개선으로 사용자 경험 높이기.', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200' },
    { id: 7, title: 'React 테스팅 전략: Vitest와 RTL', date: '2026.01.13', desc: '신뢰할 수 있는 코드를 위한 효율적인 테스트 코드 작성법.', img: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=200' },
    { id: 8, title: '클라우드 네이티브와 Docker 컨테이너', date: '2026.01.14', desc: '개발 환경의 일관성을 위한 도커라이징 기초와 심화.', img: 'https://images.unsplash.com/photo-1605745341112-85968b193ef5?w=200' },
    { id: 9, title: '신입 개발자를 위한 기술 면접 완벽 대비', date: '2026.01.15', desc: 'CS 지식부터 라이브 코딩까지 흔히 나오는 질문 리스트.', img: 'https://images.unsplash.com/photo-1521791136364-798a7bc0d262?w=200' },
    { id: 10, title: 'Rust 언어가 시스템 프로그래밍의 미래일까?', date: '2026.01.16', desc: 'C++를 대체하고 있는 Rust의 메모리 안전성과 성능 분석.', img: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200' },
    { id: 11, title: 'Micro-frontend 아키텍처 실무 적용기', date: '2026.01.17', desc: '거대한 모놀리스 서비스를 독립적인 모듈로 분리하는 과정.', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200' },
    { id: 12, title: 'Tailwind CSS v4 미리보기', date: '2026.01.18', desc: '더 강력해진 커스터마이징 기능과 성능 향상 소식.', img: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=200' },
    { id: 13, title: '오픈소스 기여, 어디서부터 시작할까?', date: '2026.01.19', desc: '문서화 수정부터 첫 PR까지 단계별 가이드라인.', img: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=200' },
    { id: 14, title: '데이터 시각화: D3.js vs Chart.js', date: '2026.01.20', desc: '상황에 맞는 최적의 라이브러리 선택을 위한 비교 분석.', img: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=200' },
    { id: 15, title: '코딩 공부를 위한 최적의 데스크셋업', date: '2026.01.21', desc: '개발 생산성을 높여주는 장비와 공간 구성 노하우.', img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200' },
];

    // 2. 방향에 따른 애니메이션 Variants 설정
    const variants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 100 : -100, // 오른쪽 버튼(+)이면 오른쪽에서 오고, 왼쪽 버튼(-)이면 왼쪽에서 옴
        opacity: 0
    }),
    center: {
        x: 0,
        opacity: 1
    },
    exit: (direction: number) => ({
        x: direction > 0 ? -100 : 100, // 나갈 때도 반대 방향으로 사라짐
        opacity: 0
    })
    };

export default function TrendSection() {
    const [[page, direction], setPage] = useState([0, 0]);
    const totalPages = Math.ceil(TREND_DATA.length / 3);

    const paginate = (newDirection: number) => {
        // 무한 루프 계산
        let nextPage = page + newDirection;
        if (nextPage < 0) nextPage = totalPages - 1;
        if (nextPage >= totalPages) nextPage = 0;
        
        setPage([nextPage, newDirection]);
    };

    return (
        <section className="w-full">
            <h3 className="text-white text-xl font-bold mb-8">위클리 트렌드 리포트</h3>
            
            <div className="relative overflow-hidden w-full min-h-[480px]">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                    key={page}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                    }}
                    className="flex flex-col gap-4 w-full"
                >
                    {TREND_DATA.slice(page * 3, (page + 1) * 3).map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-[#25262B] p-5 rounded-[20px] border border-[#9FA0A8]/30 hover:border-[#9FA0A8] transition-all cursor-pointer group w-full shadow-sm">
                        <div className="flex-1 pr-4 min-w-0">
                        <span className="text-[#9FA0A8] text-[11px]">에디터 | {item.date}</span>
                        <h4 className="text-white text-lg font-bold mt-1 mb-2 truncate">{item.title}</h4>
                        <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">{item.desc}</p>
                        </div>
                        <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-[#1A1B1E] border border-white/5">
                        <img src={item.img} alt="Trend" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                    </div>
                    ))}
                </motion.div>
                </AnimatePresence>
            </div>

            {/* 내비게이션 화살표 */}
            <div className="flex justify-center gap-4 mt-8">
                <button 
                onClick={() => paginate(-1)}
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/5 transition-all active:scale-90"
                >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                </button>
                <button 
                onClick={() => paginate(1)}
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/5 transition-all active:scale-90"
                >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                </button>
            </div>
        </section>
    );
}