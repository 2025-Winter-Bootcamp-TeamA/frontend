import * as d3 from 'd3';

// 1. 차트의 개별 데이터 포인트 (일, 월, 년 공통)
export interface ChartDataPoint {
  label: string;  // '1일', '1월', '2024년' 등
  mentions: number;
}

// 2. 일/월/년 데이터를 모두 포함하는 타임라인 구조
export interface TimelineData {
  daily: ChartDataPoint[];
  monthly: ChartDataPoint[];
  yearly: ChartDataPoint[];
}

// 3. D3 그래프용 노드 정의
export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  group: number;
  value: number;
  desc: string; // 기술 스택에 대한 설명 (예: 웹/앱 UI 라이브러리)
}

// 4. D3 그래프용 링크 정의
export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

// 5. 기업/커뮤니티 탭별 데이터 구조 (그래프 데이터 + 타임라인 데이터)
export interface TabData {
  nodes: GraphNode[];
  links: GraphLink[];
  timeline: TimelineData; // 이 부분이 핵심입니다.
}

// 6. 카테고리별 전체 상세 정보
export interface CategoryDetail {
  name: string;
  color: string;
  company: TabData;
  community: TabData;
}

// 7. 카테고리 맵 타입 (frontend, backend 등)
export type CategoryInfoMap = Record<string, CategoryDetail>;