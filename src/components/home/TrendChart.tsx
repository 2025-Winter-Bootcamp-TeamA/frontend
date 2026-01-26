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
  article_mention_count: number;
  article_change_rate: number;
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
  // job_change_rate와 article_change_rate를 직접 사용
  // 이상한 값(음수 또는 100% 초과) 클리핑
  const chartData = data.map((d) => ({
    ...d,
    dateLabel: formatDateLabel(d.date, period),
    job_change_rate: Math.max(0, Math.min(d.job_change_rate ?? 0, 100)),
    article_change_rate: Math.max(0, Math.min(d.article_change_rate ?? 0, 100)),
  }));

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ payload?: { date: string; dateLabel: string; job_change_rate: number; article_change_rate: number; job_mention_count: number; article_mention_count: number }; dataKey?: string; value?: number; color?: string }>; label?: string }) => {
    if (!active || !payload?.length) return null;
    const row = payload[0]?.payload;
    const lbl = row?.dateLabel ?? label ?? row?.date ?? '';
    const jobRate = row?.job_change_rate ?? 0;
    const articleRate = row?.article_change_rate ?? 0;
    const jobCount = row?.job_mention_count ?? 0;
    const articleCount = row?.article_mention_count ?? 0;
    
    // 비율을 % 형식으로 표시
    const formatRate = (rate: number) => {
      return `${rate.toFixed(2)}%`;
    };
    
    return (
      <div className="bg-[#1A1B1E] border border-white/10 p-3 rounded-xl shadow-xl text-xs">
        <p className="text-gray-400 mb-2">{lbl} 언급량</p>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-white font-bold">채용 언급: {formatRate(jobRate)} ({jobCount.toLocaleString()})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-white font-bold">게시글 언급: {formatRate(articleRate)} ({articleCount.toLocaleString()})</span>
          </div>
        </div>
      </div>
    );
  };

  // X축 틱 간격: 7일=전체, 30일=3일 간격, 90일=9일 간격 (Recharts: interval = 표시 틱 사이에 건너뛸 개수)
  const xAxisInterval = period === 7 ? 0 : period === 30 ? 2 : 8;

  // Y축 domain: job_change_rate와 article_change_rate의 최소/최대값을 고려
  // 이상한 값(100% 초과) 필터링 및 합리적인 범위로 제한
  const jobRates = chartData
    .map((d) => d.job_change_rate ?? 0)
    .filter((v) => typeof v === 'number' && v >= 0 && v <= 100);
  const articleRates = chartData
    .map((d) => d.article_change_rate ?? 0)
    .filter((v) => typeof v === 'number' && v >= 0 && v <= 100);
  const allRates = [...jobRates, ...articleRates];
  
  const dataMin = allRates.length ? Math.min(...allRates) : 0;
  const dataMax = allRates.length ? Math.min(Math.max(...allRates), 100) : 100; // 최대값을 100%로 제한
  const range = dataMax - dataMin || 1;
  const pad = Math.max(range * 0.2, 1);
  const yMin = Math.max(0, dataMin - pad);
  const yMax = Math.min(dataMax + pad, 100); // 최대값을 100%로 제한
  const yDomain: [number, number] = [yMin, yMax];

  // Y축 tick을 일정한 간격으로 생성 (최대값 기준)
  // 최대값에 따라 적절한 간격 계산 (4-6개의 tick이 적당하도록)
  const calculateTickInterval = (max: number): number => {
    if (max <= 5) return 1;      // 0-5%: 1% 간격
    if (max <= 10) return 2;     // 0-10%: 2% 간격
    if (max <= 20) return 4;     // 0-20%: 4% 간격
    if (max <= 50) return 10;    // 0-50%: 10% 간격
    return 20;                   // 0-100%: 20% 간격
  };

  const tickInterval = calculateTickInterval(yMax);
  const yTicks: number[] = [];
  for (let t = 0; t <= yMax; t += tickInterval) {
    yTicks.push(t);
  }
  // 최대값이 정확히 포함되도록 마지막 tick 추가 (간격으로 나누어떨어지지 않는 경우)
  if (yTicks[yTicks.length - 1] < yMax) {
    yTicks.push(yMax);
  }

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
                tickFormatter={(v) => {
                  // 이상한 값 처리: 100보다 큰 값은 표시하지 않음
                  if (typeof v !== 'number' || v < 0 || v > 100) {
                    return '';
                  }
                  // 정수값으로 반올림
                  return `${Math.round(v)}%`;
                }}
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

              {/* 채용공고 비율 라인 (파란색) */}
              <Line
                name="채용 언급"
                yAxisId="left"
                type="monotone"
                dataKey="job_change_rate"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ r: 4, fill: '#25262B', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#3B82F6' }}
                isAnimationActive={false}
              />

              {/* 게시글 비율 라인 (노란색) */}
              <Line
                name="게시글 언급"
                yAxisId="left"
                type="monotone"
                dataKey="article_change_rate"
                stroke="#EAB308"
                strokeWidth={3}
                dot={{ r: 4, fill: '#25262B', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#EAB308' }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}