// src/data/mockData.ts
import { Corp, TechStack, Resume } from "@/types";

export const MOCK_CORPS: Corp[] = [
  {
    id: 1,
    name: "Toss",
    logoUrl: "https://static.toss.im/assets/toss-logo/blue.png",
    address: "서울 강남구 테헤란로 131",
    industry: "금융/핀테크",
    siteUrl: "https://toss.im",
    latitude: 37.5000287,
    longitude: 127.0329141,
  },
  {
    id: 2,
    name: "Kakao",
    logoUrl: "https://t1.kakaocdn.net/kakaocorp/kakaocorp/admin/1b904e28017800001.png",
    address: "경기 성남시 분당구 판교역로 166",
    industry: "모바일/플랫폼",
    siteUrl: "https://www.kakaocorp.com",
    latitude: 37.3957122,
    longitude: 127.1105181,
  },
  {
    id: 3,
    name: "Line",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg",
    address: "경기 성남시 분당구 황새울로 360번길 42",
    industry: "메신저/플랫폼",
    siteUrl: "https://linepluscorp.com",
    latitude: 37.3853198,
    longitude: 127.1231789,
  },
  {
    id: 4,
    name: "Danggeun",
    logoUrl: "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/8d/62/16/8d621644-8397-69c5-63aa-2f92b724497a/AppIcon-0-0-1x_U007emarketing-0-7-0-sRGB-85-220.png/512x512bb.jpg",
    address: "서울 서초구 강남대로 465",
    industry: "지역/커뮤니티",
    siteUrl: "https://about.daangn.com",
    latitude: 37.5037754,
    longitude: 127.0240711,
  },
];

export const MOCK_TECH_STACKS: TechStack[] = [
  {
    id: 101,
    name: "React",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
    docsUrl: "https://react.dev",
    createdAt: "2025-01-10",
    category: "frontend",
  },
  {
    id: 102,
    name: "Next.js",
    logo: "https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_light_background.png",
    docsUrl: "https://nextjs.org",
    createdAt: "2025-01-12",
    category: "frontend",
  },
  {
    id: 103,
    name: "Spring Boot",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Spring_Framework_Logo_2018.svg",
    docsUrl: "https://spring.io",
    createdAt: "2025-01-15",
    category: "backend",
  },
  {
    id: 104,
    name: "Python",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg",
    docsUrl: "https://www.python.org",
    createdAt: "2025-01-18",
    category: "ai-data",
  },
];

export const MOCK_RESUMES: Resume[] = [
  {
    id: 1001,
    title: "2025 Toss 하반기 | 프론트엔드 개발자 지원서",
    url: null,
    techStacks: [{ techStack: MOCK_TECH_STACKS[0] }, { techStack: MOCK_TECH_STACKS[1] }],
    createdAt: "2025-10-21",
    updatedAt: "2025-10-21",
  },
  {
    id: 1002,
    title: "카카오 | 프론트엔드 개발자 지원서",
    url: null,
    techStacks: [{ techStack: MOCK_TECH_STACKS[0] }],
    createdAt: "2025-09-10",
    updatedAt: "2025-09-10",
  },
];