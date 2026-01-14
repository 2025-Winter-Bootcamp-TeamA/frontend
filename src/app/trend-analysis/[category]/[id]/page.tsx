'use client';

import { useParams } from 'next/navigation';
import { CATEGORY_INFO } from '@/constants/mockTrends';
import TrendLineChart from '@/components/trend-analysis/report-detail/TrendChart';
import MarketShareDonutChart from '@/components/trend-analysis/report-detail/MarketShareDonutChart';
import { useFavoritesStore, createTechStackFromNode } from '@/store/favoritesStore';

export default function ReportDetailPage() {
    const { category, id } = useParams();
    const { isTechStackFavorite, toggleTechStack } = useFavoritesStore();

    // 1. URL 인코딩 해결 (%20 -> 공백)
    const decodedId = decodeURIComponent(id as string);
    const categoryData = CATEGORY_INFO[category as string];

    // 2. 현재 기술의 상세 정보(종류/설명) 찾기
    const techInfo = categoryData?.company.nodes.find(n => n.id === decodedId) || 
                    categoryData?.community.nodes.find(n => n.id === decodedId);

    if (!categoryData || !techInfo) return <div className="p-10 text-white">데이터를 찾을 수 없습니다.</div>;

    return (
        <main className="min-h-screen bg-[#111315] p-6 lg:p-12 text-white">
        <div className="max-w-7xl mx-auto">
            
            {/* 뒤로가기 버튼 */}
            <button 
            onClick={() => window.history.back()}
            className="text-gray-500 hover:text-white mb-6 flex items-center gap-2 transition"
            >
            <span>←</span> 뒤로가기
            </button>

            {/* --- 헤더 카드 섹션 --- */}
            <section className="mb-10 p-8 bg-[#1e2125] rounded-3xl border border-gray-800 flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-8">
                {/* 기술 로고 아이콘 */}
                <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center border border-gray-700 shadow-inner"
                style={{ backgroundColor: `${categoryData.color}15` }} // 카테고리 색상에 투명도 15% 적용
                >
                <div className="w-10 h-10 rounded-full" style={{ backgroundColor: categoryData.color }} />
                </div>

                {/* 기술 정보 텍스트 */}
                <div className="flex flex-col gap-1">
                <span className="text-blue-400 text-xs font-bold uppercase tracking-widest" style={{color:categoryData.color}}>
                    {categoryData.name}
                </span>
                <h1 className="text-4xl font-black text-white leading-tight">
                    {decodedId} {/* %20이 제거된 이름 */}
                </h1>
                <div className="flex items-center gap-4 mt-1">
                    <p className="text-gray-400 text-sm">{techInfo.desc}</p> {/* 기술 종류 */}
                    <div className="w-[1px] h-3 bg-gray-700" />
                    {/* 공식 사이트 링크 (임시로 구글 검색 연결, 실제 데이터에 URL 추가 권장) */}
                    <a 
                    href={`https://www.google.com/search?q=${decodedId}+official+site`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-gray-500 hover:text-blue-400 text-xs underline underline-offset-4 transition"
                    >
                    공식 사이트 방문하기 ↗
                    </a>
                </div>
                </div>
            </div>

            {/* 우측 즐겨찾기 버튼 */}
            <button 
                onClick={() => {
                  if (categoryData && techInfo) {
                    const techStack = createTechStackFromNode(
                      decodedId,
                      techInfo.desc,
                      categoryData.name,
                      categoryData.color
                    );
                    toggleTechStack(techStack);
                  }
                }}
                className={`w-14 h-14 rounded-2xl border transition-all flex items-center justify-center group ${
                isTechStackFavorite(decodedId)
                    ? 'bg-yellow-500/10 border-yellow-500/50' 
                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-500'
                }`}
            >
                <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill={isTechStackFavorite(decodedId) ? "#EAB308" : "none"} 
                stroke={isTechStackFavorite(decodedId) ? "#EAB308" : "#6B7280"} 
                className={`w-6 h-6 transition-transform group-active:scale-90 ${!isTechStackFavorite(decodedId) && 'group-hover:stroke-gray-300'}`}
                strokeWidth="2"
                >
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
            </button>
            </section>

            {/* 차트 그리드 섹션 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <TrendLineChart 
                categoryColor={categoryData.color}
                companyTimeline={categoryData.company.timeline}
                communityTimeline={categoryData.community.timeline}
                />
            </div>
            <div className="h-full">
                <MarketShareDonutChart 
                data={categoryData.company.nodes}
                categoryColor={categoryData.color}
                activeId={decodedId}
                />
            </div>
            </div>
        </div>
        </main>
    );
}