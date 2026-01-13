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

export type CategoryInfoMap = Record<string, CategoryDetail>;
