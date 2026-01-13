export type ResumeTag =
  | "React"
  | "Next.js"
  | "TypeScript"
  | "Node.js"
  | "Spring"
  | "Python";

export type Resume = {
  id: string;
  title: string;
  company?: string;
  createdAt: string; // yyyy-mm-dd
  tags: ResumeTag[];
};
