"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface TimelineItem {
  year: number | string;
  count: number;
}

interface TrendChartProps {
  color: string; // 메인 스택 색상 (React면 파랑, Next.js면 검정 등)
  data: {
    year: string;
    company: number;
    community: number;
  }[];
}

export default function TrendChart({ color, data }: TrendChartProps) {
  
  // 툴팁 커스텀 (다크모드)
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1A1B1E] border border-white/10 p-3 rounded-xl shadow-xl text-xs">
          <p className="text-gray-400 mb-2">{label}년 언급량</p>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-white font-bold">기업: {payload[0].value.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-500" />
              <span className="text-gray-300">커뮤니티: {payload[1].value.toLocaleString()}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
          <XAxis 
            dataKey="year" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6B7280', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6B7280', fontSize: 12 }} 
            tickFormatter={(value) => `${value/1000}k`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff20' }} />
          <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '12px', paddingBottom: '10px' }} />
          
          {/* 기업 데이터 (메인 색상) */}
          <Line
            name="기업 공고"
            type="monotone"
            dataKey="company"
            stroke={color}
            strokeWidth={3}
            dot={{ r: 4, fill: '#25262B', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: color }}
          />
          
          {/* 커뮤니티 데이터 (회색) */}
          <Line
            name="커뮤니티"
            type="monotone"
            dataKey="community"
            stroke="#6B7280"
            strokeWidth={3}
            strokeDasharray="5 5"
            dot={{ r: 4, fill: '#25262B', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: '#6B7280' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}