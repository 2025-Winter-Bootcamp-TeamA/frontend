import type { FavoriteCompany, FavoriteTechStack } from "./favorites.types";

export const mockFavoriteTechStacks: FavoriteTechStack[] = [
  {
    id: "t1",
    name: "React",
    category: "frontend",
    level: "junior",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
    docsUrl: "https://react.dev/",
    createdAt: "2025-10-10T09:00:00Z",
    isFavorite: true,
  },
  {
    id: "t2",
    name: "Next.js",
    category: "frontend",
    level: "junior",
    logoUrl: "https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_dark_background.png",
    docsUrl: "https://nextjs.org/docs",
    createdAt: "2025-10-11T09:00:00Z",
    isFavorite: true,
  },
  {
    id: "t3",
    name: "TypeScript",
    category: "frontend",
    level: "junior",
    logoUrl:
      "https://raw.githubusercontent.com/remojansen/logo.ts/master/ts.png",
    docsUrl: "https://www.typescriptlang.org/docs/",
    createdAt: "2025-10-12T09:00:00Z",
    isFavorite: true,
  },
  {
    id: "t4",
    name: "Node.js",
    category: "backend",
    level: "senior",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg",
    docsUrl: "https://nodejs.org/en/docs",
    createdAt: "2025-10-13T09:00:00Z",
    isFavorite: true,
  },
  {
    id: "t5",
    name: "Spring Boot",
    category: "backend",
    level: "senior",
    logoUrl:
      "https://spring.io/images/spring-logo-2018-9146c38e52c2d67b0c3059a3e9f83fb5.svg",
    docsUrl: "https://docs.spring.io/spring-boot/index.html",
    createdAt: "2025-10-14T09:00:00Z",
    isFavorite: true,
  },
  {
    id: "t6",
    name: "Docker",
    category: "devops",
    level: "junior",
    logoUrl:
      "https://www.docker.com/wp-content/uploads/2022/03/vertical-logo-monochromatic.png",
    docsUrl: "https://docs.docker.com/",
    createdAt: "2025-10-15T09:00:00Z",
    isFavorite: true,
  },
];

export const mockFavoriteCompanies: FavoriteCompany[] = [
  {
    id: "c1",
    name: "Naver",
    description: "검색과 클라우드를 중심으로 다양한 서비스를 운영하는 테크 기업",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/2/22/Naver_Logotype.svg",
    siteUrl: "https://recruit.navercorp.com/",
    techStacks: ["Java", "Spring", "React"],
    createdAt: "2025-10-10T09:00:00Z",
    isFavorite: true,
  },
  {
    id: "c2",
    name: "Kakao",
    description: "메신저를 기반으로 생활 전반의 서비스를 확장하고 있는 플랫폼 기업",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/e/e3/Kakao_logo.svg",
    siteUrl: "https://careers.kakao.com/jobs",
    techStacks: ["Spring", "Kotlin", "React"],
    createdAt: "2025-10-12T09:00:00Z",
    isFavorite: true,
  },
  {
    id: "c3",
    name: "Coupang",
    description: "로켓배송을 중심으로 대규모 물류·데이터 시스템을 운영하는 커머스 기업",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/06/Coupang_logo.svg",
    siteUrl: "https://rocketyourcareer.coupang.com/",
    techStacks: ["Java", "Spring", "AWS"],
    createdAt: "2025-10-13T09:00:00Z",
    isFavorite: true,
  },
];

