// src/types/trend.ts

export interface TechNode {
  id: string;    // 노드 이름 (예: 'React')
  group: number; // 그룹 번호 (중심부, 주변부 구분 등)
  value?: number; // (선택) 노드의 중요도나 크기
}

export interface TechLink {
  source: string; // 시작 노드 ID
  target: string; // 끝 노드 ID
  value?: number; // (선택) 선의 두께나 관계의 강도
}

export interface TrendData {
  name: string;
  color: string;
  nodes: TechNode[];
  links: TechLink[];
}

// 카테고리 전체 목록 타입
export type CategoryInfoMap = Record<string, TrendData>;