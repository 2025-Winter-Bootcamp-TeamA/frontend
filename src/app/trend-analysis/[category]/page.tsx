'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getTrendDataByCategory } from '@/services/trendService';
import { TrendData } from '@/types/trend';
import ForceGraph from '@/components/trend-analysis/ForceGraph';

export default function CategoryDetailPage() {
  const params = useParams();
  const category = params.category as string;

  const [data, setData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await getTrendDataByCategory(category);
        setData(result);
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [category]);

  if (loading) return <div className="text-white p-10">트렌드 데이터를 분석 중입니다...</div>;
  if (!data) return <div className="text-white p-10">데이터를 찾을 수 없습니다.</div>;

  return (
    <main className="min-h-screen bg-[#1A1B1E] text-white p-6">
       <h1 style={{ color: data.color }}>{data.name} 생태계 맵</h1>
       <div className="mt-8 bg-[#25262B] rounded-2xl overflow-hidden">
         <ForceGraph data={data} themeColor={data.color} />
       </div>
    </main>
  );
}