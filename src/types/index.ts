// 사용자 타입
export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// 기술 스택 타입
export interface TechStack {
  id: number;
  name: string;
  logo: string | null;
  docsUrl: string | null;
  createdAt: string;
}

// 기술 트렌드 타입
export interface TechTrend {
  id: number;
  techStack: TechStack;
  trendFrom: string;
  mentionCount: number;
  changeRate: number;
  referenceDate: string;
}

// 카테고리 타입
export interface Category {
  id: number;
  name: string;
}

// 기업 타입
export interface Corp {
  id: number;
  name: string;
  logoUrl: string | null;
  address: string | null;
  latitude?: number;
  longitude?: number;
}

// 채용 공고 타입
export interface JobPosting {
  id: number;
  corp: Corp;
  url: string;
  title: string | null;
  description?: string | null;
  stackCount: number;
  techStacks?: { techStack: TechStack }[];
  createdAt: string;
}

// 이력서 타입
export interface Resume {
  id: number;
  title: string;
  url: string | null;
  techStacks?: { techStack: TechStack }[];
  createdAt: string;
  updatedAt: string;
}

// 이력서 매칭 결과 타입
export interface MatchingResult {
  resumeId: number;
  jobPostingId: number;
  matchingRate: number;
  matchedSkills: string[];
  missingSkills: string[];
  feedback: string;
}

// 면접 질문 타입
export interface InterviewQuestion {
  id: number;
  techStack: TechStack | null;
  question: string;
  answerGuide: string | null;
  questionType: 'tech' | 'experience' | 'behavioral' | 'situational';
  difficulty: 'easy' | 'medium' | 'hard';
}

// 면접 답변 타입
export interface InterviewAnswer {
  id: number;
  question: InterviewQuestion;
  userAnswer: string;
  aiFeedback: string | null;
  score: number | null;
  createdAt: string;
}

// API 응답 타입
export interface ApiResponse<T> {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
  data?: T;
}

// 인증 응답 타입
export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}


// src/types/trend.ts
export * from './trend';