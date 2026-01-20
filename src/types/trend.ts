import * as d3 from 'd3';

export interface ChartDataPoint {
  label: string;
  mentions: number;
}

export interface TimelineData {
  daily: ChartDataPoint[];
  monthly: ChartDataPoint[];
  yearly: ChartDataPoint[];
}

export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  group: number;
  value: number;
  desc: string;
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

export interface TabData {
  nodes: GraphNode[];
  links: GraphLink[];
  timeline: TimelineData;
}

export interface CategoryDetail {
  name: string;
  color: string;
  company: TabData;
  community: TabData;
}

// 백엔드 TechStackSerializer 응답 구조에 맞춘 인터페이스
export interface TechStackData {
  id: number;
  name: string;
  logo: string | null;
  docs_url: string | null;
  created_at: string;
}

// 기존 프론트엔드 컴포넌트(TechStackCard)에서 사용하는 UI용 인터페이스 (변환용)
export interface TechStackUI extends TechStackData {
  catName?: string; // 백엔드 기본 시리얼라이저에는 없으므로 선택적 속성으로 처리
  desc?: string;    // 백엔드 데이터에 설명이 없으므로 선택적 처리
}


export type CategoryInfoMap = Record<string, CategoryDetail>;
