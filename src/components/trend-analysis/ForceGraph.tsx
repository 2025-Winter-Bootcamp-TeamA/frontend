'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function ForceGraph({ data, themeColor }: { data: any, themeColor: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const width = svgRef.current.clientWidth || 800;
    const height = 600;

    const svg = d3.select(svgRef.current)
      .attr('viewBox', [0, 0, width, height] as any);
    
    svg.selectAll('*').remove(); // 재렌더링 시 초기화

    const nodes = data.nodes.map((d: any) => ({ ...d }));
    const links = data.links.map((d: any) => ({ ...d }));

    // 1. 시뮬레이션 설정
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // 2. 연결선 그리기
    const link = svg.append('g')
      .attr('stroke', '#9FA0A8')
      .attr('stroke-opacity', 0.3)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 1.5);

    // 3. 노드 그룹 만들기 (원 + 텍스트)
    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(drag(simulation) as any);

    // 노드 원 (디자인 초안의 색감 적용)
    node.append('circle')
      .attr('r', (d: any) => (d.group === 1 ? 18 : 12))
      .attr('fill', (d: any) => (d.group === 1 ? themeColor : '#25262B'))
      .attr('stroke', themeColor)
      .attr('stroke-width', 2);

    // 노드 텍스트
    node.append('text')
      .text((d: any) => d.id)
      .attr('x', 0)
      .attr('y', (d: any) => (d.group === 1 ? 30 : 25))
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .attr('font-size', '12px')
      .style('pointer-events', 'none');

    // 4. 시뮬레이션 프레임 업데이트
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // 🛠️ Sticky Drag 기능 (레퍼런스 핵심 로직)
    function drag(sim: d3.Simulation<any, undefined>) {
      function dragstarted(event: any) {
        if (!event.active) sim.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event: any) {
        if (!event.active) sim.alphaTarget(0);
        // fx, fy를 null로 만들지 않음으로써 그 자리에 고정(Sticky) 시킵니다.
      }

      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }
  }, [data, themeColor]);

  return <svg ref={svgRef} className="w-full h-[600px] cursor-move" />;
}