import { CategoryInfoMap, TimelineData } from '@/types/trend';

// 1. 데이터 생성 헬퍼 함수 (일/월/년 데이터 자동 생성)
const genDaily = (base: number) => Array.from({ length: 31 }, (_, i) => ({ 
  label: `${i + 1}일`, 
  mentions: Math.floor(base + Math.random() * 5000) 
}));

const genMonthly = (base: number) => [
  { label: '1월', mentions: base + 2000 }, { label: '2월', mentions: base + 5000 }, 
  { label: '3월', mentions: base - 3000 }, { label: '4월', mentions: base + 8000 }, 
  { label: '5월', mentions: base + 15000 }, { label: '6월', mentions: base + 12000 },
  { label: '7월', mentions: base + 18432 }, { label: '8월', mentions: base + 10000 }, 
  { label: '9월', mentions: base - 5000 }, { label: '10월', mentions: base + 2000 },
  { label: '11월', mentions: base + 7000 }, { label: '12월', mentions: base + 13000 },
];

const genYearly = (base: number) => [
  { label: '2021년', mentions: Math.floor(base * 8) }, 
  { label: '2022년', mentions: Math.floor(base * 9.5) },
  { label: '2023년', mentions: Math.floor(base * 10) }, 
  { label: '2024년', mentions: Math.floor(base * 12) },
  { label: '2025년', mentions: Math.floor(base * 13.5) },
];

const createTimeline = (base: number): TimelineData => ({
  daily: genDaily(base / 30),
  monthly: genMonthly(base),
  yearly: genYearly(base),
});

// 2. 전체 카테고리 정보 (Frontend ~ Security 생략 없음)
export const CATEGORY_INFO: CategoryInfoMap = {
  frontend: {
    name: 'Frontend', color: '#1C89AD',
    company: {
      nodes: [
        { id: 'Frontend', group: 1, value: 120, desc: '사용자 인터페이스 개발' },
        { id: 'React', group: 2, value: 110, desc: '웹/앱 UI 라이브러리' },
        { id: 'Next.js', group: 2, value: 95, desc: 'SSR/SSG 프레임워크' },
        { id: 'TypeScript', group: 2, value: 90, desc: '정적 타이핑 언어' },
        { id: 'Redux', group: 3, value: 50, desc: '상태 관리 라이브러리' },
        { id: 'Tailwind', group: 3, value: 60, desc: 'Utility-First CSS' },
        { id: 'Recoil', group: 3, value: 40, desc: 'React 상태 관리' },
      ],
      links: [
        { source: 'Frontend', target: 'React' }, { source: 'Frontend', target: 'Next.js' },
        { source: 'React', target: 'TypeScript' }, { source: 'React', target: 'Redux' },
        { source: 'Next.js', target: 'Tailwind' }, { source: 'React', target: 'Recoil' },
      ],
      timeline: createTimeline(45000)
    },
    community: {
      nodes: [
        { id: 'Frontend', group: 1, value: 120, desc: '사용자 인터페이스 개발' },
        { id: 'Vue', group: 2, value: 85, desc: '프로그레시브 프레임워크' },
        { id: 'Svelte', group: 2, value: 80, desc: '컴파일러 기반 UI 도구' },
        { id: 'Zustand', group: 3, value: 70, desc: '경량 상태 관리' },
        { id: 'Tanstack Query', group: 3, value: 65, desc: '서버 상태 관리 도구' },
        { id: 'Vite', group: 3, value: 60, desc: '차세대 빌드 도구' },
        { id: 'Tailwind', group: 3, value: 55, desc: 'Utility-First CSS' },
      ],
      links: [
        { source: 'Frontend', target: 'Vue' }, { source: 'Frontend', target: 'Svelte' },
        { source: 'Vue', target: 'Zustand' }, { source: 'Svelte', target: 'Vite' },
        { source: 'Frontend', target: 'Tailwind' }, { source: 'Vue', target: 'Tanstack Query' },
      ],
      timeline: createTimeline(75000)
    }
  },
  backend: {
    name: 'Backend', color: '#4CAF50',
    company: {
      nodes: [
        { id: 'Backend', group: 1, value: 120, desc: '서버 측 로직 및 DB 관리' },
        { id: 'Spring Boot', group: 2, value: 115, desc: '자바 기반 엔터프라이즈 프레임워크' },
        { id: 'Java', group: 2, value: 95, desc: '객체 지향 프로그래밍 언어' },
        { id: 'PostgreSQL', group: 3, value: 75, desc: '오픈소스 관계형 DB' },
        { id: 'Redis', group: 3, value: 60, desc: '인메모리 데이터 구조 저장소' },
        { id: 'Docker', group: 3, value: 80, desc: '컨테이너화 플랫폼' },
      ],
      links: [
        { source: 'Backend', target: 'Spring Boot' }, { source: 'Spring Boot', target: 'Java' },
        { source: 'Spring Boot', target: 'PostgreSQL' }, { source: 'Backend', target: 'Docker' },
        { source: 'Docker', target: 'Redis' },
      ],
      timeline: createTimeline(50000)
    },
    community: {
      nodes: [
        { id: 'Backend', group: 1, value: 120, desc: '서버 측 로직 및 DB 관리' },
        { id: 'Node.js', group: 2, value: 90, desc: 'JS 런타임 환경' },
        { id: 'Go', group: 2, value: 95, desc: '구글 개발 시스템 언어' },
        { id: 'Rust', group: 2, value: 85, desc: '메모리 안전 시스템 언어' },
        { id: 'GraphQL', group: 3, value: 65, desc: 'API 쿼리 언어' },
        { id: 'gRPC', group: 3, value: 55, desc: '고성능 RPC 프레임워크' },
      ],
      links: [
        { source: 'Backend', target: 'Node.js' }, { source: 'Backend', target: 'Go' },
        { source: 'Go', target: 'Rust' }, { source: 'Node.js', target: 'GraphQL' },
        { source: 'Go', target: 'gRPC' },
      ],
      timeline: createTimeline(60000)
    }
  },
  'ai-data': {
    name: 'AI & Data', color: '#9C27B0',
    company: {
      nodes: [
        { id: 'AI & Data', group: 1, value: 120, desc: '인공지능 및 데이터 분석' },
        { id: 'PyTorch', group: 2, value: 100, desc: '딥러닝 연구 프레임워크' },
        { id: 'TensorFlow', group: 2, value: 85, desc: '엔터프라이즈 ML 플랫폼' },
        { id: 'MLOps', group: 2, value: 90, desc: '머신러닝 운영 자동화' },
        { id: 'Spark', group: 3, value: 65, desc: '분산 데이터 처리 엔진' },
        { id: 'Numpy', group: 3, value: 50, desc: '수치 계산 라이브러리' },
      ],
      links: [
        { source: 'AI & Data', target: 'PyTorch' }, { source: 'AI & Data', target: 'TensorFlow' },
        { source: 'PyTorch', target: 'MLOps' }, { source: 'AI & Data', target: 'Spark' },
        { source: 'PyTorch', target: 'Numpy' },
      ],
      timeline: createTimeline(90000)
    },
    community: {
      nodes: [
        { id: 'AI & Data', group: 1, value: 120, desc: '인공지능 및 데이터 분석' },
        { id: 'LLM', group: 2, value: 115, desc: '거대 언어 모델' },
        { id: 'LangChain', group: 2, value: 95, desc: 'LLM 애플리케이션 프레임워크' },
        { id: 'HuggingFace', group: 2, value: 95, desc: '오픈소스 AI 허브' },
        { id: 'Vector DB', group: 3, value: 75, desc: '임베딩 데이터 저장소' },
        { id: 'OpenAI', group: 3, value: 85, desc: '인공지능 연구 기업/API' },
      ],
      links: [
        { source: 'AI & Data', target: 'LLM' }, { source: 'LLM', target: 'LangChain' },
        { source: 'LLM', target: 'HuggingFace' }, { source: 'LLM', target: 'Vector DB' },
        { source: 'LLM', target: 'OpenAI' },
      ],
      timeline: createTimeline(120000)
    }
  },
  devops: {
    name: 'DevOps', color: '#FF9800',
    company: {
      nodes: [
        { id: 'DevOps', group: 1, value: 120, desc: '개발 및 운영 자동화' },
        { id: 'AWS', group: 2, value: 110, desc: '클라우드 컴퓨팅 플랫폼' },
        { id: 'Terraform', group: 2, value: 95, desc: '코드형 인프라(IaC) 도구' },
        { id: 'Jenkins', group: 3, value: 75, desc: 'CI/CD 자동화 서버' },
        { id: 'Ansible', group: 3, value: 55, desc: 'IT 자동화 구성 관리' },
      ],
      links: [
        { source: 'DevOps', target: 'AWS' }, { source: 'AWS', target: 'Terraform' },
        { source: 'DevOps', target: 'Jenkins' }, { source: 'Terraform', target: 'Ansible' },
      ],
      timeline: createTimeline(40000)
    },
    community: {
      nodes: [
        { id: 'DevOps', group: 1, value: 120, desc: '개발 및 운영 자동화' },
        { id: 'Kubernetes', group: 2, value: 110, desc: '컨테이너 오케스트레이션' },
        { id: 'GitHub Actions', group: 2, value: 100, desc: '워크플로우 자동화 도구' },
        { id: 'Prometheus', group: 3, value: 70, desc: '모니터링 및 알림 시스템' },
        { id: 'ArgoCD', group: 3, value: 75, desc: 'GitOps CD 도구' },
      ],
      links: [
        { source: 'DevOps', target: 'Kubernetes' }, { source: 'DevOps', target: 'GitHub Actions' },
        { source: 'Kubernetes', target: 'Prometheus' }, { source: 'Kubernetes', target: 'ArgoCD' },
      ],
      timeline: createTimeline(55000)
    }
  },
  embedding: {
    name: 'Embedded', color: '#E91E63',
    company: {
      nodes: [
        { id: 'Embedded', group: 1, value: 120, desc: '내장형 시스템 제어' },
        { id: 'C/C++', group: 2, value: 110, desc: '시스템 프로그래밍 언어' },
        { id: 'ARM', group: 2, value: 100, desc: '프로세서 아키텍처' },
        { id: 'Firmware', group: 3, value: 80, desc: '하드웨어 제어 소프트웨어' },
        { id: 'FreeRTOS', group: 3, value: 65, desc: '실시간 운영체제' },
      ],
      links: [
        { source: 'Embedded', target: 'C/C++' }, { source: 'C/C++', target: 'ARM' },
        { source: 'Embedded', target: 'Firmware' }, { source: 'Embedded', target: 'FreeRTOS' },
      ],
      timeline: createTimeline(30000)
    },
    community: {
      nodes: [
        { id: 'Embedded', group: 1, value: 120, desc: '내장형 시스템 제어' },
        { id: 'Raspberry Pi', group: 2, value: 95, desc: '싱글 보드 컴퓨터' },
        { id: 'Arduino', group: 2, value: 90, desc: '오픈소스 전자 플랫폼' },
        { id: 'Edge AI', group: 3, value: 80, desc: '온디바이스 인공지능' },
        { id: 'ESP32', group: 3, value: 70, desc: 'Wi-Fi/BT 내장 MCU' },
      ],
      links: [
        { source: 'Embedded', target: 'Raspberry Pi' }, { source: 'Embedded', target: 'Arduino' },
        { source: 'Raspberry Pi', target: 'Edge AI' }, { source: 'Arduino', target: 'ESP32' },
      ],
      timeline: createTimeline(35000)
    }
  },
  game: {
    name: 'Game Dev', color: '#84CC16',
    company: {
      nodes: [
        { id: 'Game Dev', group: 1, value: 120, desc: '멀티플랫폼 게임 개발' },
        { id: 'Unreal Engine', group: 2, value: 110, desc: '고성능 3D 게임 엔진' },
        { id: 'Unity', group: 2, value: 105, desc: '범용 게임 개발 엔진' },
        { id: 'C++', group: 3, value: 95, desc: '언리얼 엔진 주력 언어' },
        { id: 'C#', group: 3, value: 85, desc: '유니티 엔진 주력 언어' },
      ],
      links: [
        { source: 'Game Dev', target: 'Unreal Engine' }, { source: 'Game Dev', target: 'Unity' },
        { source: 'Unreal Engine', target: 'C++' }, { source: 'Unity', target: 'C#' },
      ],
      timeline: createTimeline(65000)
    },
    community: {
      nodes: [
        { id: 'Game Dev', group: 1, value: 120, desc: '멀티플랫폼 게임 개발' },
        { id: 'Godot', group: 2, value: 95, desc: '오픈소스 게임 엔진' },
        { id: 'Blender', group: 2, value: 90, desc: '3D 모델링 및 애니메이션 도구' },
        { id: 'Shaders', group: 3, value: 75, desc: '그래픽 렌더링 스크립트' },
        { id: 'Vulkan', group: 3, value: 60, desc: '차세대 그래픽 API' },
      ],
      links: [
        { source: 'Game Dev', target: 'Godot' }, { source: 'Game Dev', target: 'Blender' },
        { source: 'Godot', target: 'Shaders' }, { source: 'Shaders', target: 'Vulkan' },
      ],
      timeline: createTimeline(50000)
    }
  },
  security: {
    name: 'Security', color: '#94A3B8',
    company: {
      nodes: [
        { id: 'Security', group: 1, value: 120, desc: '사이버 보안 및 방어' },
        { id: 'Zero Trust', group: 2, value: 110, desc: '신뢰 기반 보안 모델' },
        { id: 'SIEM', group: 2, value: 95, desc: '보안 정보 및 이벤트 관리' },
        { id: 'Cryptography', group: 3, value: 85, desc: '데이터 암호화 기술' },
        { id: 'OAuth2', group: 3, value: 75, desc: '표준 권한 부여 프레임워크' },
      ],
      links: [
        { source: 'Security', target: 'Zero Trust' }, { source: 'Security', target: 'SIEM' },
        { source: 'Security', target: 'Cryptography' }, { source: 'Zero Trust', target: 'OAuth2' },
      ],
      timeline: createTimeline(35000)
    },
    community: {
      nodes: [
        { id: 'Security', group: 1, value: 120, desc: '사이버 보안 및 방어' },
        { id: 'Kali Linux', group: 2, value: 105, desc: '모의 해킹용 OS' },
        { id: 'Pentesting', group: 2, value: 100, desc: '침투 테스트 실무' },
        { id: 'Wireshark', group: 3, value: 75, desc: '네트워크 패킷 분석기' },
        { id: 'Metasploit', group: 3, value: 70, desc: '취약점 공격 프레임워크' },
      ],
      links: [
        { source: 'Security', target: 'Kali Linux' }, { source: 'Kali Linux', target: 'Pentesting' },
        { source: 'Pentesting', target: 'Wireshark' }, { source: 'Pentesting', target: 'Metasploit' },
      ],
      timeline: createTimeline(45000)
    }
  },
};