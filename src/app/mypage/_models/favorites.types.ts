export type TechCategory =
  | "frontend"
  | "backend"
  | "ai-data"
  | "mobile"
  | "devops"
  | "etc";

export type FavoriteTechStack = {
  id: string;
  name: string;
  category: TechCategory;
  level: "junior" | "senior";
  logoUrl: string;
  docsUrl: string;
  createdAt: string; // ISO string
  isFavorite: boolean;
};

export type FavoriteCompany = {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  siteUrl: string;
  techStacks: string[];
  createdAt: string;
  isFavorite: boolean;
};

