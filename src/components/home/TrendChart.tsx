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

export type ChartPeriod = 7 | 30 | 90;

export interface TrendChartDataItem {
  date: string;
  job_mention_count: number;
  job_change_rate: number;
}

interface TrendChartProps {
  color: string;
  data: TrendChartDataItem[];
  period: ChartPeriod;
  onPeriodChange: (p: ChartPeriod) => void;
  isLoading?: boolean;
}

/** reference_date(YYYY-MM-DD) → X축/툴팁용 라벨 (MM.DD 또는 YYYY.MM.DD) */
function formatDateLabel(ref: string, period: ChartPeriod): string {
  if (!ref || ref.length < 10) return ref;
  const [y, m, d] = ref.split('-');
  if (period === 90) return `${y}.${m}.${d}`;
  return `${m}.${d}`;
}

export default function TrendChart({ color, data, period, onPeriodChange, isLoading }: TrendChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    dateLabel: formatDateLabel(d.date, period),
  }));

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ payload?: { date: string; dateLabel: string; job_mention_count: number } }>; label?: string }) => {
    if (!active || !payload?.length) return null;
    const row = payload[0]?.payload;
    const lbl = row?.dateLabel ?? label ?? row?.date ?? '';
    return (
      <div className="bg-[#1A1B1E] border border-white/10 p-3 rounded-xl shadow-xl text-xs">
        <p className="text-gray-400 mb-2">{lbl} 언급량</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-white font-bold">채용 언급: {(row?.job_mention_count ?? 0).toLocaleString()}</span>
        </div>
      </div>
    );
  };

  // X축 틱 간격: 7일=전체, 30일=3일 간격, 90일=9일 간격 (Recharts: interval = 표시 틱 사이에 건너뛸 개수)
  const xAxisInterval = period === 7 ? 0 : period === 30 ? 2 : 8;

  // Y축 domain: 데이터 범위 위·아래에 동일한 여백을 두어 값들이 세로 중앙에 오도록 조정
  const values = chartData.map((d) => d.job_mention_count).filter((v) => typeof v === 'number');
  const dataMin = values.length ? Math.min(...values) : 0;
  const dataMax = values.length ? Math.max(...values) : 100;
  const range = dataMax - dataMin || 1;
  const pad = Math.max(range * 0.2, 5);
  const yMin = Math.max(0, dataMin - pad);
  const yMax = dataMax + pad;
  // Y축 10 단위: domain과 ticks를 10 단위로 맞춤
  const yDomainMin = Math.max(0, Math.floor(yMin / 10) * 10);
  const yDomainMax = Math.ceil(yMax / 10) * 10;
  const yDomain: [number, number] = [yDomainMin, yDomainMax];
  const yTicks: number[] = [];
  for (let t = yDomainMin; t <= yDomainMax; t += 10) yTicks.push(t);

  return (
    <div className="w-full h-full min-h-[300px] flex flex-col">
      {/* 기간 선택: 7일 / 30일 / 90일 */}
      <div className="flex gap-2 mb-2">
        {([7, 30, 90] as const).map((d) => (
          <button
            key={d}
            onClick={() => onPeriodChange(d)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              period === d
                ? 'bg-white/10 text-white'
                : 'bg-white/5 text-white/50 hover:text-white/80'
            }`}
          >
            {d}일
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-white/40">로딩 중...</div>
      ) : (
        <div className="flex-1 min-h-[260px] min-w-0 overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
              <XAxis
                dataKey="dateLabel"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                dy={10}
                interval={xAxisInterval}
                padding={{ left: 0, right: 0 }}
                allowDuplicatedCategory={false}
              />
              <YAxis
                yAxisId="left"
                orientation="left"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v))}
                domain={yDomain}
                ticks={yTicks}
              />
              <Tooltip
                content={<CustomTooltip />}
                isAnimationActive={false}
                cursor={false}
                allowEscapeViewBox={{ x: false, y: true }}
              />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '12px', paddingBottom: '10px' }} />

              <Line
                name="채용 언급"
                yAxisId="left"
                type="monotone"
                dataKey="job_mention_count"
                stroke={color}
                strokeWidth={3}
                dot={{ r: 4, fill: '#25262B', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: color }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}