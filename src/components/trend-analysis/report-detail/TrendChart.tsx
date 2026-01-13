'use client';

import { useState, useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    } from 'recharts';
    import { TimelineData } from '@/types/trend';

    interface Props {
    categoryColor: string;
    companyTimeline: TimelineData;
    communityTimeline: TimelineData;
    }

    export default function TrendLineChart({ categoryColor, companyTimeline, communityTimeline }: Props) {
    const [activeSegment, setActiveSegment] = useState<'company' | 'community'>('community');
    const [viewMode, setViewMode] = useState<'daily' | 'monthly' | 'yearly'>('monthly');

    // 1. 기업과 커뮤니티 데이터를 하나의 차트용 데이터로 병합
    const mergedData = useMemo(() => {
        const company = companyTimeline[viewMode];
        const community = communityTimeline[viewMode];

        return company.map((item, index) => ({
        label: item.label,
        company: item.mentions,
        community: community[index]?.mentions || 0,
        }));
    }, [viewMode, companyTimeline, communityTimeline]);

    // 2. 커스텀 툴팁 (두 데이터의 수치와 각각의 증감률 표시)
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
        return (
            <div className="bg-[#111315] p-4 rounded-xl border border-gray-700 shadow-2xl min-w-[150px]">
            <p className="text-gray-400 text-xs mb-2">{payload[0].payload.label}</p>
            {payload.map((entry: any) => (
                <div key={entry.name} className="mb-1 last:mb-0">
                <p className="text-[10px] uppercase font-bold" style={{ color: entry.color }}>
                    {entry.name === 'company' ? '기업' : '커뮤니티'}
                </p>
                <p className="text-white font-bold text-sm">
                    {entry.value.toLocaleString()} <span className="text-[10px] font-normal text-gray-400">건</span>
                </p>
                </div>
            ))}
            </div>
        );
        }
        return null;
    };

    return (
        <div className="w-full bg-[#1e2125] p-8 rounded-3xl border border-gray-800 shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <h3 className="text-white text-xl font-bold tracking-tight">언급량 추이</h3>
            
            <div className="flex items-center gap-4">
            {/* 일/월/년 필터 */}
            <div className="flex bg-[#111315] p-1.5 rounded-xl border border-gray-700">
                {(['daily', 'monthly', 'yearly'] as const).map((mode) => (
                <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    viewMode === mode ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                    {mode === 'daily' ? '일' : mode === 'monthly' ? '월' : '년'}
                </button>
                ))}
            </div>

            {/* 기업/커뮤니티 토글 (강조할 라인 선택) */}
            <div className="flex bg-[#111315] p-1.5 rounded-xl border border-gray-700">
                <button 
                onClick={() => setActiveSegment('company')}
                className="px-5 py-1.5 text-xs font-bold rounded-lg transition-all"
                style={{
                    backgroundColor: activeSegment === 'company' ? categoryColor : 'transparent',
                    color: activeSegment === 'company' ? '#fff' : '#6b7280'
                }}
                >
                기업
                </button>
                <button 
                onClick={() => setActiveSegment('community')}
                className="px-5 py-1.5 text-xs font-bold rounded-lg transition-all"
                style={{
                    backgroundColor: activeSegment === 'community' ? categoryColor : 'transparent',
                    color: activeSegment === 'community' ? '#fff' : '#6b7280'
                }}
                >
                커뮤니티
                </button>
            </div>
            </div>
        </div>
        
        <div className="h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mergedData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#2d3135" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(val) => `${(val / 10000).toFixed(0)}만`} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#374151', strokeWidth: 2 }} />
                
                {/* 기업 라인 */}
                <Line
                name="company"
                type="monotone"
                dataKey="company"
                stroke={activeSegment === 'company' ? categoryColor : '#4b5563'} // 선택 안되면 회색
                strokeOpacity={activeSegment === 'company' ? 1 : 0.4} // 비활성 시 희미하게
                strokeWidth={activeSegment === 'company' ? 4 : 2}
                dot={false}
                activeDot={{ r: 6, fill: categoryColor, stroke: '#fff', strokeWidth: 2 }}
                />

                {/* 커뮤니티 라인 */}
                <Line
                name="community"
                type="monotone"
                dataKey="community"
                stroke={activeSegment === 'community' ? categoryColor : '#4b5563'} // 선택 안되면 회색
                strokeOpacity={activeSegment === 'community' ? 1 : 0.4} // 비활성 시 희미하게
                strokeWidth={activeSegment === 'community' ? 4 : 2}
                dot={false}
                activeDot={{ r: 6, fill: categoryColor, stroke: '#fff', strokeWidth: 2 }}
                />
            </LineChart>
            </ResponsiveContainer>
        </div>
        </div>
    );
}