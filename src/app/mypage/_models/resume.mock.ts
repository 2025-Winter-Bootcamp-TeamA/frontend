import type { Resume } from "./resume.types";

export const mockResumes: Resume[] = [
  {
    id: "r1",
    title: "2025 Toss 하반기 | 프론트엔드 개발자 지원서",
    company: "Toss",
    createdAt: "2025-10-21",
    tags: ["React", "Next.js", "TypeScript"],
  },
  {
    id: "r2",
    title: "카카오 | 프론트엔드 개발자 지원서",
    company: "Kakao",
    createdAt: "2025-09-10",
    tags: ["React", "TypeScript"],
  },
  {
    id: "r3",
    title: "네이버 | 백엔드 개발자 지원서",
    company: "Naver",
    createdAt: "2025-08-03",
    tags: ["Node.js", "TypeScript"],
  },
];
