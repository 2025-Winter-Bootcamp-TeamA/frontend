'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import * as d3 from 'd3';
import { Star } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Tooltip 
} from 'recharts';
import { CATEGORY_INFO } from '@/constants/mockTrends';
import { TimeLineDropdown } from '@/components/trend-analysis/TimeLineDropdown';
import { useFavoritesStore, createTechStackFromNode } from '@/store/favoritesStore';

// --- [인터페이스] ---
interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  group: number;
  value?: number;
  desc: string;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

// 1. 커스텀 툴팁 컴포넌트 (함수 외부 또는 내부에 선언)
const CustomTooltip = ({ active, payload, label, color }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#2A2B30]/95 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl">
        <p className="text-[10px] text-white/30 font-bold uppercase mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <p className="text-sm font-black text-white">
            {payload[0].value.toLocaleString()} <span className="text-[10px] font-normal text-white/50">회 언급</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// --- [컴포넌트 1: 사이드바 차트 및 게이지] ---
function SidebarChartContent({ selectedNode, currentCategory, timeRange, setTimeRange, router, category }: any) {
  const [fillValue, setFillValue] = useState(0);
  const TARGET_PERCENT = 72; // 실제 데이터 연결 시 selectedNode.share 등으로 대체 가능

  // 타임라인 Mock Data
  const TIMELINE_DATA: any = {
    weekly: [{ name: 'W1', val: 1200 }, { name: 'W2', val: 2100 }, { name: 'W3', val: 1500 }, { name: 'W4', val: 2800 }],
    monthly: [{ name: 'Jan', val: 4000 }, { name: 'Feb', val: 3000 }, { name: 'Mar', val: 5500 }, { name: 'Apr', val: 4800 }],
    yearly: [{ name: '2023', val: 45000 }, { name: '2024', val: 52000 }, { name: '2025', val: 61000 }]
  };

  useEffect(() => {
    setFillValue(0);
    const controls = animate(0, TARGET_PERCENT, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (latest) => setFillValue(latest),
    });
    return () => controls.stop();
  }, [selectedNode.id]);

  return (
    <div className="space-y-6 pb-10">
      {/* 1. 타임라인 섹션 */}
      <section className="bg-white/5 rounded-3xl p-6 border border-white/5">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm uppercase tracking-widest text-white/40 font-semibold">타임라인</h3>
          <TimeLineDropdown value={timeRange} onChange={setTimeRange} />
        </div>
        <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart key={`${selectedNode.id}-${timeRange}`} data={TIMELINE_DATA[timeRange]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
            <XAxis dataKey="name" hide />
            <YAxis hide />
            
            {/* 호버 시 나타나는 정보창 */}
            <Tooltip 
              content={<CustomTooltip color={currentCategory.color} />} 
              cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1 }} 
            />
            
            <Line 
              type="monotone" 
              dataKey="val" 
              stroke={currentCategory.color} 
              strokeWidth={3} 
              dot={{ 
                r: 4, 
                fill: currentCategory.color, 
                strokeWidth: 0 
              }} 
              activeDot={{ 
                r: 6, 
                fill: '#fff', 
                stroke: currentCategory.color, 
                strokeWidth: 3,
                style: { filter: `drop-shadow(0 0 10px ${currentCategory.color})` } // 빛나는 효과
              }} 
              isAnimationActive={true} 
              animationDuration={1000} 
            />
          </LineChart>
        </ResponsiveContainer>
        </div>
      </section>

      {/* 2. 시장 점유율 섹션 (게이지 + 카운팅) */}
      <section className="bg-white/5 rounded-3xl p-6 border border-white/5 relative flex flex-col items-center">
        <h3 className="text-sm uppercase tracking-widest text-white/40 font-semibold self-start mb-2">시장 점유율</h3>
        <div className="h-44 w-full relative">
          <ResponsiveContainer>
            <PieChart>
              <Pie 
                data={[{ value: fillValue }, { value: 100 - fillValue }]} 
                startAngle={180} endAngle={0} innerRadius={70} outerRadius={90} 
                dataKey="value" stroke="none" isAnimationActive={false} cy="60%"
              >
                <Cell fill={currentCategory.color} /><Cell fill="#ffffff05" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-10">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black tracking-tighter text-white">
                {Math.round(fillValue)}<span className="text-xl font-bold text-white/40">%</span>
              </span>
            </div>
            <span className="text-[11px] text-white/20 uppercase font-medium mt-1">2025년 기준</span>
          </div>
        </div>
      </section>

      <button 
        onClick={() => router.push(`/trend-analysis/${category}/${selectedNode.id}`)}
        className="w-full py-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm uppercase tracking-tight transition-all shadow-xl flex items-center justify-center gap-2 group"
      >
        상세 분석 리포트 보기
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:translate-x-1 transition-transform"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </div>
  );
}

// --- [메인 페이지] ---
export default function CategoryDetailPage() {
  const { category } = useParams();
  const router = useRouter();
  
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [activeTab, setActiveTab] = useState<'company' | 'community'>('company');
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [isMobile, setIsMobile] = useState(false);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const currentCategory = CATEGORY_INFO[category as string];
  
  // 즐겨찾기 store
  const { isTechStackFavorite, toggleTechStack } = useFavoritesStore();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!svgRef.current || !currentCategory) return;
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const rawData = activeTab === 'company' ? currentCategory.company : currentCategory.community;
    const nodes: GraphNode[] = rawData.nodes.map(d => ({ ...d }));
    const links: GraphLink[] = rawData.links.map(d => ({ ...d }));

    const g = svg.append('g');
    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.5, 5]).on('zoom', (e) => g.attr('transform', e.transform));
    zoomRef.current = zoom;
    svg.call(zoom).call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2));

    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .velocityDecay(0.4)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links).id(d => d.id).strength(0.5).distance(isMobile ? 100 : 150))
      .force('charge', d3.forceManyBody().strength(isMobile ? -400 : -800))
      .force('center', d3.forceCenter(0, 0))
      .force('collision', d3.forceCollide<GraphNode>().radius(d => (d.value ? d.value / 2.5 : 20) + 10));

    const link = g.append('g').selectAll('line').data(links).enter().append('line')
      .attr('stroke', '#757373').attr('stroke-width', 5).attr('stroke-opacity', 0.15);

    const flowLink = g.append('g').selectAll('line.flow')
    .data(links).enter().append('line')
    .attr('class', 'flowing-line') // ✅ CSS 애니메이션 연결
    .attr('stroke', currentCategory.color)
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '4 12') // ✅ 점의 크기 4, 간격 12 (점처럼 보이게 설정)
    .attr('stroke-opacity', 0.6)
    .style('pointer-events', 'none'); // 클릭 방해 방지

    const nodeGroup = g.append('g').selectAll('g').data(nodes).enter().append('g')
      .style('cursor', 'pointer').on('click', (e, d) => { handleNodeFocus(d); e.stopPropagation(); });

    nodeGroup.append('circle').attr('class', 'node-circle')
      .attr('r', d => (d.value ? d.value / 2.5 : 20))
      .attr('fill', d => d.group === 1 ? currentCategory.color : '#212226')
      .attr('stroke', currentCategory.color).attr('stroke-width', 2);

    nodeGroup.append('text').text(d => d.id).attr('text-anchor', 'middle').attr('dy', '.35em').attr('fill', '#fff')
      .style('font-size', '11px').style('font-weight', 'bold').style('pointer-events', 'none');

    let ticking = false;

    simulation.on('tick', () => {
        if (!ticking) {
          /* ✅ 브라우저의 주사율에 맞춰 업데이트 예약 */
          window.requestAnimationFrame(() => {
            updateGraphics();
            ticking = false;
          });
          ticking = true;
        }
      });
      function updateGraphics() {
          link
            .attr('x1', d => Math.round((d.source as any).x))
            .attr('y1', d => Math.round((d.source as any).y))
            .attr('x2', d => Math.round((d.target as any).x))
            .attr('y2', d => Math.round((d.target as any).y));

          flowLink
            .attr('x1', d => Math.round((d.source as any).x))
            .attr('y1', d => Math.round((d.source as any).y))
            .attr('x2', d => Math.round((d.target as any).x))
            .attr('y2', d => Math.round((d.target as any).y));

          nodeGroup.attr('transform', d => `translate(${Math.round(d.x!)},${Math.round(d.y!)})`);
        }

        return () => { simulation.stop(); };
      }, [category, currentCategory, isMobile, activeTab]);

  const handleNodeFocus = (node: GraphNode) => {
    setSelectedNode(node);
    if (!svgRef.current || !zoomRef.current) return;
    const { clientWidth: w, clientHeight: h } = svgRef.current;
    const targetX = isMobile ? w / 2 : w * 0.375;
    const targetY = isMobile ? h * 0.3 : h / 2;

    d3.select(svgRef.current).transition().duration(750).ease(d3.easeCubicInOut)
      .call(zoomRef.current.transform, d3.zoomIdentity.translate(targetX, targetY).scale(2.2).translate(-(node.x || 0), -(node.y || 0)));

    d3.select(svgRef.current).selectAll('.node-circle').transition().duration(300)
      .attr('stroke-width', (d: any) => d.id === node.id ? 8 : 2)
      .attr('filter', (d: any) => d.id === node.id ? `drop-shadow(0 0 15px ${currentCategory.color})` : 'none');
  };

  const handleReset = () => {
    setSelectedNode(null);
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(750).call(zoomRef.current.transform, d3.zoomIdentity.translate(svgRef.current.clientWidth / 2, svgRef.current.clientHeight / 2).scale(1));
    d3.select(svgRef.current).selectAll('.node-circle').attr('stroke-width', 2).attr('filter', 'none');
  };

  if (!currentCategory) return null;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] w-full bg-[#1A1B1E] text-white overflow-hidden relative">
      <motion.div layout className={`relative h-full transition-all duration-500 ${selectedNode && !isMobile ? 'w-[75%]' : 'w-full'}`}>
        <div className="absolute top-8 left-8 z-10 flex items-center gap-6">
          <button onClick={() => router.back()} className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all shadow-xl backdrop-blur-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18L9 12L15 6" /></svg>
          </button>
          <h1 className="text-2xl font-black uppercase tracking-tight" style={{ color: currentCategory.color }}>{currentCategory.name}</h1>
        </div>
        <svg ref={svgRef} className="w-full h-full" onClick={handleReset} />
      </motion.div>

      <AnimatePresence mode="wait">
        {selectedNode && (
          <motion.aside
            key={selectedNode.id}
            initial={isMobile ? { y: '100%' } : { x: '100%' }} animate={isMobile ? { y: 0 } : { x: 0 }} exit={isMobile ? { y: '100%' } : { x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className={`fixed lg:relative z-20 bg-[#212226] border-white/10 overflow-y-auto shadow-2xl ${isMobile ? 'bottom-0 w-full h-[70%] rounded-t-[40px] p-8' : 'right-0 w-[25%] h-full border-l p-10'}`}
          >
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-3">
                  <img src={`/logos/${selectedNode.id.toLowerCase().replace('.', '')}.svg`} alt={selectedNode.id} className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${selectedNode.id}&background=random&color=fff`; }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold tracking-tighter">{selectedNode.id}</h2>
                    <button 
                      onClick={() => {
                        if (currentCategory && selectedNode) {
                          const techStack = createTechStackFromNode(
                            selectedNode.id,
                            selectedNode.desc,
                            currentCategory.name,
                            currentCategory.color
                          );
                          toggleTechStack(techStack);
                        }
                      }} 
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star 
                        size={22} 
                        className={
                          selectedNode && isTechStackFavorite(selectedNode.id)
                            ? 'fill-yellow-400 stroke-yellow-400' 
                            : 'stroke-white/20 hover:stroke-white/50'
                        } 
                      />
                    </button>
                  </div>
                  <p className="text-xs text-white/40 mt-1 font-light">{selectedNode.desc}</p>
                </div>
              </div>
              <button onClick={handleReset} className="text-white/20 hover:text-white transition-colors"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
            </div>

            <SidebarChartContent selectedNode={selectedNode} currentCategory={currentCategory} timeRange={timeRange} setTimeRange={setTimeRange} router={router} category={category} />
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}