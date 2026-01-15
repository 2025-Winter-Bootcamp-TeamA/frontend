'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { GraphNode } from '@/types/trend';

interface Props {
    data: GraphNode[];
    categoryColor: string;
    activeId: string;
    }

    export default function MarketShareDonutChart({ data, categoryColor, activeId }: Props) {
    const decodedId = decodeURIComponent(activeId);
    const totalValue = data.reduce((acc, cur) => acc + cur.value, 0);
    const activeNode = data.find((n) => n.id.toLowerCase() === decodedId.toLowerCase());
    
    // 목표 퍼센트 수치
    const targetPercentage = activeNode ? Math.round((activeNode.value / totalValue) * 100) : 0;
    
    // 애니메이션을 위한 상태
    const [displayCount, setDisplayCount] = useState(0);
    const [hovered, setHovered] = useState<{ id: string; percentage: number } | null>(null);

    // 카운팅 애니메이션 로직
    useEffect(() => {
        let start = 0;
        const end = targetPercentage;
        if (start === end) return;

        let totalDuration = 1000; // 1초 동안 애니메이션
        let incrementTime = totalDuration / end;

        let timer = setInterval(() => {
        start += 1;
        setDisplayCount(start);
        if (start === end) clearInterval(timer);
        }, incrementTime);

        return () => clearInterval(timer);
    }, [targetPercentage]);

    const chartData = data.map(node => ({
        ...node,
        percentage: Math.round((node.value / totalValue) * 100)
    }));

    const centerLabel = hovered?.id ?? decodedId;
    const centerPercent = hovered?.percentage ?? targetPercentage;

    return (
        <div className="w-full bg-[#25262B] p-8 rounded-[24px] border border-white/10 shadow-2xl h-full flex flex-col">
        <h3 className="text-white text-lg font-bold mb-6 tracking-tight">시장 점유율</h3>
        
        <div className="relative flex-1 min-h-[300px]">
            {/* 중앙 정보창: 카운팅 애니메이션 적용 */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-10 pointer-events-none">
            <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 max-w-[220px] truncate">
                {centerLabel}
            </span>
            <span className="text-5xl font-black text-white tabular-nums leading-none">
                {hovered ? centerPercent : displayCount}%
            </span>
            </div>

            <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <defs>
                    <linearGradient id="activeSliceGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={categoryColor} stopOpacity={1} />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity={0.12} />
                    </linearGradient>
                    <linearGradient id="inactiveSliceGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#3a3f44" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#111315" stopOpacity={1} />
                    </linearGradient>
                </defs>
                <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={85}
                outerRadius={118}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
                animationDuration={1500}
                onMouseLeave={() => setHovered(null)}
                onMouseEnter={(payload: any) => {
                    setHovered({ id: payload?.id ?? '-', percentage: payload?.percentage ?? 0 });
                }}
                >
                {chartData.map((entry, index) => (
                    <Cell 
                    key={`cell-${index}`} 
                    fill={entry.id.toLowerCase() === decodedId.toLowerCase() ? 'url(#activeSliceGrad)' : 'url(#inactiveSliceGrad)'} 
                    style={{ outline: 'none' }}
                    />
                ))}
                </Pie>
                <Tooltip content={({ active, payload }: any) => {
                if (active && payload && payload.length) {
                    return (
                    <div className="bg-[#111315] p-3 rounded-xl border border-gray-700 shadow-xl">
                        <p className="text-white text-xs font-bold">{payload[0].payload.id}</p>
                        <p style={{ color: categoryColor }} className="text-sm font-mono font-bold">
                        {payload[0].payload.percentage}%
                        </p>
                    </div>
                    );
                }
                return null;
                }} />
            </PieChart>
            </ResponsiveContainer>
        </div>

        {/* 하단 범례 리스트 */}
        <div className="mt-8 space-y-4">
            {chartData
            .sort((a, b) => b.value - a.value)
            .slice(0, 4)
            .map((node) => {
                const isActive = node.id.toLowerCase() === decodedId.toLowerCase();
                return (
                <div key={node.id} className="flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                    <div 
                        className="w-2.5 h-2.5 rounded-full transition-transform group-hover:scale-125" 
                        style={{ backgroundColor: isActive ? categoryColor : '#374151' }} 
                    />
                    <span className={`text-sm transition-colors ${isActive ? 'text-white font-black' : 'text-gray-500 group-hover:text-gray-300'}`}>
                        {node.id}
                    </span>
                    </div>
                    <span className="text-sm font-mono text-gray-400 font-bold">{node.percentage}%</span>
                </div>
                );
            })}
        </div>
        </div>
    );
}